const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config({ path: './backend/.env' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/design-thinking-bot');
  const project = await Project.findOne();
  if (project) {
    project.canvasData = {
      ...project.canvasData,
      prototype: [{ id: '1', name: 'Test Prototype', description: 'desc', url: '#' }]
    };
    project.markModified('canvasData');
    await project.save();
    console.log('Saved prototype:', project.canvasData.prototype);
    
    // fetch again
    const p2 = await Project.findById(project._id);
    console.log('Fetched prototype:', p2.canvasData.prototype);
  }
  process.exit(0);
}

test();
