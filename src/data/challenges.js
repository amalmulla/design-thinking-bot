// src/data/challenges.js
// Mock dictionary of administrator design targets and student project metrics

export const ACTIVE_CHALLENGES = [
  { id: 1, title: "Campus Food Waste Reduction", teamCount: 8, status: "Active" },
  { id: 2, title: "Library App Redesign", teamCount: 12, status: "Active" },
  { id: 3, title: "Student Onboarding UX", teamCount: 4, status: "Closing Soon" },
];

export const STUDENT_PROJECTS = [
  {
    id: 1,
    studentOrTeamName: "Team Alpha",
    title: "Smart Bin Sorting System",
    currentPhase: "ideate",
    progressPercentage: 60,
    lastUpdated: "2 hours ago",
    creativityScore: "High",
    teamworkStatus: "Excellent",
    challengeId: 1,
    isRecent: true,
    canvasData: {
      empathize: { says: [], thinks: [], does: [], feels: [] },
      define: { user: "", needs: "", insight: "" },
      ideate: [],
      prototype: [],
      test: { worked: "", improved: "", questions: "", ideas: "" }
    },
    messages: []
  },
  {
    id: 2,
    studentOrTeamName: "Sarah Jenkins",
    title: "AR Study Room Finder",
    currentPhase: "prototype",
    progressPercentage: 80,
    lastUpdated: "1 day ago",
    creativityScore: "Medium",
    teamworkStatus: "Solo",
    challengeId: 2,
    isRecent: false,
    canvasData: {
      empathize: { says: [], thinks: [], does: [], feels: [] },
      define: { user: "", needs: "", insight: "" },
      ideate: [],
      prototype: [],
      test: { worked: "", improved: "", questions: "", ideas: "" }
    },
    messages: []
  },
  {
    id: 3,
    studentOrTeamName: "Team Beta",
    title: "Compost Gamification",
    currentPhase: "empathize",
    progressPercentage: 20,
    lastUpdated: "3 days ago",
    creativityScore: "Needs Focus",
    teamworkStatus: "Needs Work",
    challengeId: 1,
    isRecent: false,
    canvasData: {
      empathize: { says: [], thinks: [], does: [], feels: [] },
      define: { user: "", needs: "", insight: "" },
      ideate: [],
      prototype: [],
      test: { worked: "", improved: "", questions: "", ideas: "" }
    },
    messages: []
  },
  {
    id: 4,
    studentOrTeamName: "Marcus Wei",
    title: "Digital Orientation Map",
    currentPhase: "test",
    progressPercentage: 100,
    lastUpdated: "4 hours ago",
    creativityScore: "High",
    teamworkStatus: "Solo",
    challengeId: 3,
    isRecent: false,
    canvasData: {
      empathize: { says: [], thinks: [], does: [], feels: [] },
      define: { user: "", needs: "", insight: "" },
      ideate: [],
      prototype: [],
      test: { worked: "", improved: "", questions: "", ideas: "" }
    },
    messages: []
  },
  {
    id: 5,
    studentOrTeamName: "Team Delta",
    title: "Book Reservation Flow",
    currentPhase: "define",
    progressPercentage: 40,
    lastUpdated: "2 days ago",
    creativityScore: "Medium",
    teamworkStatus: "Good",
    challengeId: 2,
    isRecent: false,
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

export const PROJECT_DATA = STUDENT_PROJECTS;

