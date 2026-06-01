// src/data/challenges.js
// Mock dictionary of administrator design targets and student project metrics

export const ACTIVE_CHALLENGES = [
  { id: 1, title: "Campus Food Waste Reduction", teamCount: 8, status: "Active" },
  { id: 2, title: "Library App Redesign", teamCount: 12, status: "Active" },
  { id: 3, title: "Student Onboarding UX", teamCount: 4, status: "Closing Soon" },
];

export const STUDENT_PROJECTS = [
  { id: 1, studentOrTeamName: "Team Alpha", projectTitle: "Smart Bin Sorting System", currentPhase: "ideate", creativityScore: "High", teamworkStatus: "Excellent", lastActiveDate: "2 hours ago", challengeId: 1 },
  { id: 2, studentOrTeamName: "Sarah Jenkins", projectTitle: "AR Study Room Finder", currentPhase: "prototype", creativityScore: "Medium", teamworkStatus: "Solo", lastActiveDate: "1 day ago", challengeId: 2 },
  { id: 3, studentOrTeamName: "Team Beta", projectTitle: "Compost Gamification", currentPhase: "empathize", creativityScore: "Needs Focus", teamworkStatus: "Needs Work", lastActiveDate: "3 days ago", challengeId: 1 },
  { id: 4, studentOrTeamName: "Marcus Wei", projectTitle: "Digital Orientation Map", currentPhase: "test", creativityScore: "High", teamworkStatus: "Solo", lastActiveDate: "4 hours ago", challengeId: 3 },
  { id: 5, studentOrTeamName: "Team Delta", projectTitle: "Book Reservation Flow", currentPhase: "define", creativityScore: "Medium", teamworkStatus: "Good", lastActiveDate: "2 days ago", challengeId: 2 }
];

export const PROJECT_DATA = [
  {
    id: 1,
    title: "Eco-Packaging Solution",
    currentPhase: "ideate",
    progressPercentage: 60,
    lastUpdated: "2 hours ago",
    isRecent: true,
  },
  {
    id: 2,
    title: "Library App Redesign",
    currentPhase: "define",
    progressPercentage: 40,
    lastUpdated: "1 day ago",
    isRecent: false,
  },
  {
    id: 3,
    title: "Student Onboarding Experience",
    currentPhase: "empathize",
    progressPercentage: 20,
    lastUpdated: "3 days ago",
    isRecent: false,
  },
  {
    id: 4,
    title: "Campus Navigation AR",
    currentPhase: "test",
    progressPercentage: 90,
    lastUpdated: "1 week ago",
    isRecent: false,
  }
];
