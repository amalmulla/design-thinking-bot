const API_URL = import.meta.env.VITE_API_URL;

// Helper to get auth headers
const getHeaders = () => {
  const token = sessionStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper for generic fetch request
const fetchApi = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return data;
};

export const apiService = {
  // Auth
  login: (email, password) => fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (userData) => fetchApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Projects
  getProjects: (studentId) => fetchApi(studentId ? `/api/projects?studentId=${studentId}` : '/api/projects'),
  getProjectsByTeacher: (teacherId) => fetchApi(`/api/projects?teacherId=${teacherId}`),
  getProjectById: (id) => fetchApi(`/api/projects/${id}`),
  createProject: (projectData) => fetchApi('/api/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),
  updateProject: (id, updatePayload) => fetchApi(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatePayload),
  }),
  deleteProject: (id) => fetchApi(`/api/projects/${id}`, {
    method: 'DELETE',
  }),
  // Collaboration: invite a teammate by email / remove a teammate (or leave) from a project
  addProjectMember: (id, email) => fetchApi(`/api/projects/${id}/members`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  removeProjectMember: (id, userId) => fetchApi(`/api/projects/${id}/members/${userId}`, {
    method: 'DELETE',
  }),
  // Team chat: fetch history (polled) / post a message between collaborators
  getTeamMessages: (id) => fetchApi(`/api/projects/${id}/team-messages`),
  sendTeamMessage: (id, content) => fetchApi(`/api/projects/${id}/team-messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // Challenges
  getChallenges: (teacherId) => fetchApi(teacherId ? `/api/challenges?teacherId=${teacherId}` : '/api/challenges'),
  createChallenge: (challengeData) => fetchApi('/api/challenges', {
    method: 'POST',
    body: JSON.stringify(challengeData),
  }),
  updateChallenge: (id, challengePayload) => fetchApi(`/api/challenges/${id}`, {
    method: 'PUT',
    body: JSON.stringify(challengePayload),
  }),

  // Users Management
  getAllUsers: () => fetchApi('/api/users'),
  getTeachers: () => fetchApi('/api/users/teachers'),
  toggleBlockUser: (id, isBlocked) => fetchApi(`/api/users/${id}/block`, {
    method: 'PUT',
    body: JSON.stringify({ isBlocked }),
  }),
  updateUserRole: (id, role) => fetchApi(`/api/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  updateUserProfile: (id, updatePayload) => fetchApi(`/api/users/${id}/profile`, {
    method: 'PUT',
    body: JSON.stringify(updatePayload),
  }),
};
