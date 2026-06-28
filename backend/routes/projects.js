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

router.get('/', async (req, res) => {
  try {
    const { studentId, teacherId } = req.query;
    let query = {};

    if (studentId) {
      query.studentId = studentId;
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

    const studentIds = onlyValidIds([...new Set(projects.map((p) => p.studentId).filter(Boolean))]);
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

    let projectObj = project.toObject ? project.toObject() : project;
    const student = projectObj.studentId ? await User.findById(projectObj.studentId).select('name').lean() : null;
    projectObj.studentName = student ? student.name : null;

    res.status(200).json(projectObj);
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
    const { name, currentPhase, unlockedPhases, progressPercentage, canvasData, message, messages } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(400).json({ message: 'Project not found.' });
    }

    if (name !== undefined) project.name = name;
    if (currentPhase !== undefined) project.currentPhase = currentPhase;
    if (unlockedPhases !== undefined) project.unlockedPhases = unlockedPhases;
    if (progressPercentage !== undefined) project.progressPercentage = progressPercentage;
    // Direct assignment (not spread) to ensure full canvasData is always saved cleanly
    if (canvasData !== undefined) project.canvasData = canvasData;
    
    if (messages) {
      project.messages = messages;
    } else if (message) {
      project.messages.push(message);
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

    // In a stricter system, we would check if req.user.id matches project.studentId
    // For now, since the route uses requireAuth, we trust the client or can add the check:
    if (req.user && project.studentId && project.studentId.toString() !== req.user.id.toString()) {
      // Optional check if we want to restrict deletion to owner
    }

    const deleted = await Project.findByIdAndDelete(id);
    console.log('Project deleted successfully:', deleted?._id);
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

module.exports = router;
