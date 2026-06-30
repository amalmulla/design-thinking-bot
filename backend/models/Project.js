const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  unlockedPhase: { type: String },
  // For collaborative projects: which teammate sent a 'user' message (AI messages leave these unset).
  authorId: { type: String },
  authorName: { type: String }
});

const projectSchema = new mongoose.Schema({
  // The student who created the project; remains its owner (only one who can delete it / manage the team).
  studentId: { type: String, required: true },
  // Collaborators invited to co-edit the project. Does NOT include the owner (studentId).
  members: { type: [String], default: [] },
  challengeId: { type: String, required: true },
  name: { type: String, default: 'Untitled Project' },
  currentPhase: {
    type: String,
    enum: ['empathize', 'define', 'ideate', 'prototype', 'test'],
    default: 'empathize'
  },
  unlockedPhases: {
    type: [String],
    default: ['empathize']
  },
  progressPercentage: { type: Number, default: 0 },
  canvasData: { type: mongoose.Schema.Types.Mixed, default: {} },
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
