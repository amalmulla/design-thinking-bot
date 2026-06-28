const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config({ path: './.env' });

async function checkDB() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/design-thinking-bot');
  const project = await Project.findOne().sort({ lastUpdated: -1 });
  console.log('Most recently updated project:', project._id, 'CanvasData:', JSON.stringify(project.canvasData));
  process.exit(0);
}

checkDB();
