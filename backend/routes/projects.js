const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Project data is per-student work; require a valid session for every project route
// so it can't be read or mutated by anonymous traffic once the app is public.
router.use(requireAuth);

// Keep only strings that are valid Mongo ObjectIds, so $in queries never throw on
// legacy/seed values like "teacher_seed_id".
const onlyValidIds = (ids) => ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

const isTeacher = (user) => user?.role?.toLowerCase() === 'teacher';

// The project owner is its creator. Used to gate destructive/team-management actions.
const isOwner = (project, user) => user && project.studentId?.toString() === user.id?.toString();

// A user may open/edit a project if they own it, are an invited collaborator, or are a teacher
// (teachers review any project). Anonymous traffic is already blocked by requireAuth above.
const canAccessProject = (project, user) =>
  isOwner(project, user) ||
  (project.members || []).map(String).includes(user?.id?.toString()) ||
  isTeacher(user);

// Resolve owner + collaborator display names for a project so the UI can show the team
// without extra round-trips. Accepts a plain object and returns it enriched.
const withTeamNames = async (projectObj) => {
  const ids = onlyValidIds([projectObj.studentId, ...(projectObj.members || [])].filter(Boolean));
  const users = await User.find({ _id: { $in: ids } }).select('name email').lean();
  const nameById = {};
  users.forEach((u) => { nameById[u._id.toString()] = u.name; });
  return {
    ...projectObj,
    studentName: projectObj.studentId ? (nameById[projectObj.studentId] || null) : null,
    memberNames: (projectObj.members || []).map((id) => nameById[id]).filter(Boolean),
    // id+name pairs so the team panel can render a removable row per collaborator.
    memberList: (projectObj.members || []).map((id) => ({ id, name: nameById[id] || 'Unknown' })),
  };
};

router.get('/', async (req, res) => {
  try {
    const { studentId, teacherId } = req.query;
    let query = {};

    // A student sees projects they created OR were invited to collaborate on.
    if (studentId) {
      query.$or = [{ studentId }, { members: studentId }];
    }

    // Filter to projects whose challenge was created by this teacher (challenge -> project join).
    if (teacherId) {
      const ownedChallengeIds = await Challenge.find({ createdByTeacherId: teacherId }).distinct('_id');
      query.challengeId = { $in: ownedChallengeIds.map((id) => id.toString()) };
    }

    const projects = await Project.find(query).lean();

    // Enrich each project with its challenge title and owning teacher's name so the
    // student portfolio and teacher table can display them without extra lookups.
    const challengeIds = onlyValidIds([...new Set(projects.map((p) => p.challengeId).filter(Boolean))]);
    const challenges = await Challenge.find({ _id: { $in: challengeIds } }).lean();
    const challengeMap = {};
    challenges.forEach((c) => { challengeMap[c._id.toString()] = c; });

    const teacherIds = onlyValidIds([...new Set(challenges.map((c) => c.createdByTeacherId).filter(Boolean))]);
    const teachers = await User.find({ _id: { $in: teacherIds } }).select('name').lean();
    const teacherMap = {};
    teachers.forEach((t) => { teacherMap[t._id.toString()] = t.name; });

    // Collect owners AND collaborators so each project can show its full team.
    const studentIds = onlyValidIds([
      ...new Set(projects.flatMap((p) => [p.studentId, ...(p.members || [])]).filter(Boolean)),
    ]);
    const students = await User.find({ _id: { $in: studentIds } }).select('name').lean();
    const studentMap = {};
    students.forEach((s) => { studentMap[s._id.toString()] = s.name; });

    const enriched = projects.map((p) => {
      const challenge = challengeMap[p.challengeId];
      const ownerTeacherId = challenge ? challenge.createdByTeacherId : null;
      return {
        ...p,
        challengeTitle: challenge ? challenge.title : null,
        teacherId: ownerTeacherId,
        teacherName: ownerTeacherId ? (teacherMap[ownerTeacherId] || null) : null,
        studentName: p.studentId ? (studentMap[p.studentId] || null) : null,
        memberNames: (p.members || []).map((id) => studentMap[id]).filter(Boolean),
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(400).json({ message: 'Project not found.' });
    }

    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'You do not have access to this project.' });
    }

    const projectObj = project.toObject ? project.toObject() : project;
    res.status(200).json(await withTeamNames(projectObj));
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { studentId, challengeId, name } = req.body;

    const newProject = new Project({
      studentId,
      challengeId,
      name: name || 'Untitled Project',
      currentPhase: 'empathize',
      unlockedPhases: ['empathize'],
      progressPercentage: 0,
      canvasData: {},
      messages: []
    });

    await newProject.save();
    res.status(200).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, currentPhase, unlockedPhases, progressPercentage, canvasData, message, messages, needsTeacherReview } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(400).json({ message: 'Project not found.' });
    }

    // Only the owner, an invited collaborator, or a teacher may edit project content.
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'You do not have access to this project.' });
    }

    if (name !== undefined) project.name = name;
    if (currentPhase !== undefined) project.currentPhase = currentPhase.toLowerCase();
    if (unlockedPhases !== undefined) project.unlockedPhases = unlockedPhases;
    if (progressPercentage !== undefined) project.progressPercentage = progressPercentage;
    // Direct assignment (not spread) to ensure full canvasData is always saved cleanly
    if (canvasData !== undefined) {
      console.log('Saving canvasData:', JSON.stringify(canvasData).substring(0, 200));
      project.canvasData = canvasData;
      project.markModified('canvasData');
    }
    
    if (messages) {
      project.messages = messages;
    } else if (message) {
      project.messages.push(message);
    }

    if (needsTeacherReview !== undefined) {
      project.needsTeacherReview = needsTeacherReview;
    } else if (!isTeacher(req.user)) {
      project.needsTeacherReview = true;
    }
    
    project.lastUpdated = Date.now();

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Attempting to delete project:', id);
    const project = await Project.findById(id);
    if (!project) {
      console.log('Project not found for id:', id);
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Deleting a shared project is destructive for the whole team, so restrict it to the
    // owner (creator) — collaborators can only leave (see DELETE /:id/members/:userId).
    if (!isOwner(project, req.user) && !isTeacher(req.user)) {
      return res.status(403).json({ message: 'Only the project owner can delete this project.' });
    }

    const deleted = await Project.findByIdAndDelete(id);
    console.log('Project deleted successfully:', deleted?._id);
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

// Invite a collaborator by email. Owner-only. The invitee must be an existing student
// account and not already on the team.
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const email = (req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'An email address is required.' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (!isOwner(project, req.user)) {
      return res.status(403).json({ message: 'Only the project owner can invite collaborators.' });
    }

    const invitee = await User.findOne({ email });
    if (!invitee) {
      return res.status(404).json({ message: 'No user found with that email address.' });
    }
    if (invitee.role !== 'Student') {
      return res.status(400).json({ message: 'Only students can be added as collaborators.' });
    }

    const inviteeId = invitee._id.toString();
    if (inviteeId === project.studentId.toString()) {
      return res.status(400).json({ message: 'That student is already the project owner.' });
    }
    if ((project.members || []).map(String).includes(inviteeId)) {
      return res.status(400).json({ message: 'That student is already a collaborator.' });
    }

    project.members.push(inviteeId);
    await project.save();

    const projectObj = project.toObject ? project.toObject() : project;
    res.status(200).json(await withTeamNames(projectObj));
  } catch (error) {
    console.error('Error adding project member:', error);
    res.status(500).json({ message: 'Server error adding collaborator' });
  }
});

// Remove a collaborator. The owner can remove anyone; a collaborator may remove themselves (leave).
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const removingSelf = req.user?.id?.toString() === userId.toString();
    if (!isOwner(project, req.user) && !removingSelf) {
      return res.status(403).json({ message: 'You cannot remove this collaborator.' });
    }

    project.members = (project.members || []).filter((m) => m.toString() !== userId.toString());
    await project.save();

    const projectObj = project.toObject ? project.toObject() : project;
    res.status(200).json(await withTeamNames(projectObj));
  } catch (error) {
    console.error('Error removing project member:', error);
    res.status(500).json({ message: 'Server error removing collaborator' });
  }
});

// --- Team chat (human-to-human messages between collaborators) ---

// Fetch the team chat history. Polled by the client while the chat drawer is open.
router.get('/:id/team-messages', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const project = await Project.findById(id).select('studentId members teamMessages');
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'You do not have access to this project.' });
    }
    res.status(200).json(project.teamMessages || []);
  } catch (error) {
    console.error('Error fetching team messages:', error);
    res.status(500).json({ message: 'Server error fetching team messages' });
  }
});

// Post a team chat message. Author is taken from the auth token (not the client) to prevent spoofing.
router.post('/:id/team-messages', async (req, res) => {
  try {
    const { id } = req.params;
    const content = (req.body.content || '').trim().slice(0, 2000);
    if (!content) {
      return res.status(400).json({ message: 'Message content is required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'You do not have access to this project.' });
    }

    project.teamMessages.push({
      authorId: req.user.id?.toString(),
      authorName: req.user.name || 'Unknown',
      content,
    });
    await project.save();

    // Broadcast the updated team chat messages to all connected clients in the project room
    if (req.io) {
      req.io.to(id).emit('teamChatUpdated', project.teamMessages);
    }

    res.status(201).json(project.teamMessages);
  } catch (error) {
    console.error('Error sending team message:', error);
    res.status(500).json({ message: 'Server error sending team message' });
  }
});

module.exports = router;
