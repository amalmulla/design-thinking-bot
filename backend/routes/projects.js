const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

const router = express.Router();

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

    const enriched = projects.map((p) => {
      const challenge = challengeMap[p.challengeId];
      const ownerTeacherId = challenge ? challenge.createdByTeacherId : null;
      return {
        ...p,
        challengeTitle: challenge ? challenge.title : null,
        teacherId: ownerTeacherId,
        teacherName: ownerTeacherId ? (teacherMap[ownerTeacherId] || null) : null,
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

    res.status(200).json(project);
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
      currentPhase: 'Empathize',
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
    const { name, currentPhase, progressPercentage, canvasData, message, messages } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(400).json({ message: 'Project not found.' });
    }

    if (name !== undefined) project.name = name;
    if (currentPhase !== undefined) project.currentPhase = currentPhase;
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

module.exports = router;
