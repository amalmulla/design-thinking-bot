const express = require('express');
const Project = require('../models/Project');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    let query = {};
    if (studentId) {
      query.studentId = studentId;
    }

    const projects = await Project.find(query);
    res.status(200).json(projects);
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
