const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdByTeacherId: { type: String },
  status: { type: String, default: 'Active' }
});

module.exports = mongoose.model('Challenge', challengeSchema);
