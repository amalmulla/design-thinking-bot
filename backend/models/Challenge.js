const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdByTeacherId: { type: String },
  // Optional teacher-authored guidance injected into the AI mentor's system prompt for
  // projects based on this challenge. Steers what the bot focuses on; does not replace
  // the Socratic methodology. Empty = default bot behavior.
  aiGuidance: { type: String, default: '' },
  status: { type: String, default: 'Active' }
});

module.exports = mongoose.model('Challenge', challengeSchema);
