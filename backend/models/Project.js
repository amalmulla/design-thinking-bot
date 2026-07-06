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

// Team chat: human-to-human messages between the project's collaborators.
// Separate from `messages` (the AI Socratic conversation).
const teamMessageSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  authorName: { type: String },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// A user persona the student researches before entering the 5 Design Thinking phases.
// A project can hold several; together they form shared context for the Socratic bot.
const personaSchema = new mongoose.Schema({
  id: { type: String, required: true },        // client-generated stable id (React keys + edit/delete targeting)
  name: { type: String, required: true },
  age: { type: String },                       // string so ranges like "25-34" are allowed
  role: { type: String },                      // occupation / role / context
  bio: { type: String },                       // short background narrative
  goals: { type: [String], default: [] },
  frustrations: { type: [String], default: [] },
  needs: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

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
  // Personas must be created before the 5 phases unlock; also fed to the AI as shared context.
  personas: { type: [personaSchema], default: [] },
  canvasData: { type: mongoose.Schema.Types.Mixed, default: {} },
  messages: [messageSchema],
  teamMessages: [teamMessageSchema],
  lastUpdated: { type: Date, default: Date.now },
  needsTeacherReview: { type: Boolean, default: false }
});

module.exports = mongoose.model('Project', projectSchema);
