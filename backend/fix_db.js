const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config({ path: './.env' });

async function fixDB() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/design-thinking-bot');
  const projects = await Project.find();
  for (let p of projects) {
    if (p.currentPhase && p.currentPhase !== p.currentPhase.toLowerCase()) {
      p.currentPhase = p.currentPhase.toLowerCase();
      await p.save();
      console.log('Fixed project:', p._id);
    }
  }
  console.log('Done');
  process.exit(0);
}

fixDB();
