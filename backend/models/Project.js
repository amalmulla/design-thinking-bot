const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  unlockedPhase: { type: String }
});

const projectSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
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
