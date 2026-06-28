const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config({ path: './.env' });

async function testSave() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/design-thinking-bot');
  const project = await Project.findOne().sort({ lastUpdated: -1 });
  
  if (!project) {
    console.log('No project found');
    process.exit(0);
  }

  console.log('Before update:', project.canvasData.prototypeData);
  
  const canvasData = project.canvasData || {};
  canvasData.prototypeData = [
    { id: '123', name: 'Test Prototype', description: 'Testing backend save', url: 'http://test.com' }
  ];
  
  project.canvasData = canvasData;
  project.markModified('canvasData');
  await project.save();
  
  const fetched = await Project.findById(project._id);
  console.log('After update:', fetched.canvasData.prototypeData);
  
  process.exit(0);
}

testSave();
