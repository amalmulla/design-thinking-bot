const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Teacher'], default: 'Student' },
  blocked: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
