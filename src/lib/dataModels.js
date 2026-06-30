// src/lib/dataModels.js
// Javascript factory models and JSDoc schemas for structured data objects

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} name - User's full name
 * @property {string} email - Registered email address
 * @property {string} password - Registered password
 * @property {string} role - System role ('student' or 'teacher')
 * @property {boolean} blocked - Access block authorization state
 */

/**
 * @typedef {Object} DesignChallenge
 * @property {string} id - Unique design challenge identifier
 * @property {string} title - Actionable challenge title
 * @property {string} description - Brief summary and objectives of the challenge
 * @property {number} teamCount - Active student groups working on this target
 * @property {string} status - Current state ('Active' or 'Closing Soon' or 'Inactive')
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique chat message identifier
 * @property {string} role - Message sender ('user' or 'ai')
 * @property {string} content - Message dialogue text content
 * @property {string} timestamp - Timestamp details
 */

/**
 * @typedef {Object} StudentProject
 * @property {string} id - Unique student project identifier
 * @property {string} title - Dynamic project title
 * @property {string} studentOrTeamName - Name of the active group or creator
 * @property {string} challengeId - Link to the active DesignChallenge ID
 * @property {string} currentPhase - Current active phase ('empathize', 'define', 'ideate', 'prototype', 'test')
 * @property {number} progressPercentage - Stage completion percentage gauge
 * @property {string} lastUpdated - Last active activity indicator
 * @property {string} creativityScore - AI creativity evaluation grade ('High' or 'Medium' or 'Needs Focus' or 'Not Evaluated')
 * @property {string} teamworkStatus - Teamwork evaluation rating ('Excellent' or 'Good' or 'Needs Work' or 'Solo')
 * @property {Object} canvasData - Stage-specific visual card datasets
 * @property {Array<string>} canvasData.empathize - Empathy observations Says/Thinks/Does/Feels cards
 * @property {Object} canvasData.define - Problem statement POV structure
 * @property {string} canvasData.define.user - POV User description
 * @property {string} canvasData.define.needs - POV Needs description
 * @property {string} canvasData.define.insight - POV Insight explanation
 * @property {Array<string>} canvasData.ideate - Brainstorming notes array
 * @property {Array<Object>} canvasData.prototype - Attachment references list
 * @property {Object} canvasData.test - Feedback responses list
 * @property {Array<ChatMessage>} messages - Persistent dialogue history
 */

/**
 * Creates a new User object.
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @param {string} role 
 * @returns {User}
 */
export function createUser(name, email, password, role = "student") {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    name,
    email,
    password,
    role,
    blocked: false
  };
}

/**
 * Creates a new DesignChallenge object.
 * @param {string} title 
 * @param {string} description 
 * @param {string} status 
 * @returns {DesignChallenge}
 */
export function createDesignChallenge(title, description = "", status = "Active") {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    title,
    description,
    teamCount: 0,
    status
  };
}

/**
 * Creates a new ChatMessage object.
 * @param {string} role
 * @param {string} content
 * @param {{id?: string, name?: string}} [author] - The teammate who sent a 'user' message (omit for AI).
 * @returns {ChatMessage}
 */
export function createChatMessage(role, content, author = null) {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    role,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    // Stamp authorship on user messages so collaborators can see who said what.
    ...(author ? { authorId: author.id, authorName: author.name } : {})
  };
}

/**
 * Creates a new StudentProject object.
 * @param {string} title 
 * @param {string} studentOrTeamName 
 * @param {string} challengeId 
 * @returns {StudentProject}
 */
export function createStudentProject(title, studentOrTeamName, challengeId) {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    title,
    studentOrTeamName,
    challengeId: challengeId ? challengeId.toString() : "",
    currentPhase: "empathize",
    progressPercentage: 20,
    lastUpdated: "Just now",
    creativityScore: "Not Evaluated",
    teamworkStatus: "Solo",
    canvasData: {
      empathize: [],
      define: { user: "", needs: "", insight: "" },
      ideate: [],
      prototype: [],
      test: { worked: "", improved: "", questions: "", ideas: "" }
    },
    messages: []
  };
}
