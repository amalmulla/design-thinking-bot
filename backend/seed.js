const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Project = require('./models/Project');

const ACTIVE_CHALLENGES = [
  { title: "Campus Food Waste Reduction", description: "Design a solution to reduce food waste on campus.", status: "Active" },
  { title: "Library App Redesign", description: "Improve the UX of the university library app.", status: "Active" },
  { title: "Student Onboarding UX", description: "Make the freshman orientation process smoother.", status: "Closing Soon" },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clean reset for Challenges and Projects (Preserving Users)
    await Challenge.deleteMany({});
    await Project.deleteMany({});
    console.log("Cleared existing Challenges and Projects.");

    // Insert Challenges
    const insertedChallenges = [];
    for (const cData of ACTIVE_CHALLENGES) {
      const challenge = new Challenge({
        ...cData,
        createdByTeacherId: "teacher_seed_id"
      });
      await challenge.save();
      insertedChallenges.push(challenge);
    }
    console.log("Inserted Design Challenges.");

    // Insert Student Projects
    const STUDENT_PROJECTS = [
      {
        studentId: "student_seed_id",
        challengeId: insertedChallenges[0]._id.toString(),
        currentPhase: "Ideate",
        progressPercentage: 60,
        canvasData: {
          empathize: { says: ["Where does this go?"], thinks: ["Too confusing"], does: ["Mixes recycling"], feels: ["Rushed"] },
          define: { user: "Busy Student", needs: "Clear visual cues", insight: "People want to recycle but lack time" },
          ideate: ["Color coded bins", "App scanner", "Gamified leaderboard"],
          prototype: [],
          test: { worked: "", improved: "", questions: "", ideas: "" }
        },
        messages: []
      },
      {
        studentId: "student_seed_id_2",
        challengeId: insertedChallenges[1]._id.toString(),
        currentPhase: "Prototype",
        progressPercentage: 80,
        canvasData: {
          empathize: { says: [], thinks: [], does: [], feels: [] },
          define: { user: "", needs: "", insight: "" },
          ideate: [],
          prototype: [],
          test: { worked: "", improved: "", questions: "", ideas: "" }
        },
        messages: []
      }
    ];

    for (const pData of STUDENT_PROJECTS) {
      const project = new Project(pData);
      await project.save();
    }
    console.log("Inserted Student Projects.");

    console.log("🎉 DATABASE SEEDING SUCCESSFUL!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
