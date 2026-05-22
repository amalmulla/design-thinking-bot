// usersService.js
// Service to manage users state persisted in sessionStorage

const INITIAL_USERS = [
  {
    id: "1",
    name: "Jane Student",
    email: "student@example.com",
    password: "password",
    role: "student",
    blocked: false
  },
  {
    id: "2",
    name: "Dr. Sarah Teacher",
    email: "teacher@example.com",
    password: "password",
    role: "teacher",
    blocked: false
  }
];

// Helper to load users from sessionStorage
function loadUsers() {
  const stored = sessionStorage.getItem("users");
  if (!stored) {
    sessionStorage.setItem("users", JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing users from sessionStorage:", e);
    return INITIAL_USERS;
  }
}

// Helper to save users to sessionStorage
function saveUsers(users) {
  sessionStorage.setItem("users", JSON.stringify(users));
}

// Initialize users database on file load
loadUsers();

export const usersService = {
  // Get all users (sensitive fields like password should be omitted or masked in views, not service)
  getAllUsers() {
    return loadUsers();
  },

  // Get currently logged-in user
  getCurrentUser() {
    const userJson = sessionStorage.getItem("currentUser");
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },

  // Perform login check
  login(email, password) {
    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (user.password !== password) {
      throw new Error("Invalid email or password.");
    }

    if (user.blocked) {
      throw new Error("Your account has been blocked by an administrator.");
    }

    // Set current user session (do not store plaintext password in active session state for safety)
    const sessionUser = { ...user };
    delete sessionUser.password;
    sessionStorage.setItem("currentUser", JSON.stringify(sessionUser));
    return sessionUser;
  },

  // Register a new user
  register({ name, email, password, role }) {
    if (!name || !email || !password || !role) {
      throw new Error("All fields are required.");
    }

    const users = loadUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      throw new Error("An account with this email already exists.");
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
      blocked: false
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
  },

  // Update details of a user
  updateUser(email, updatedData) {
    const users = loadUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (index === -1) {
      throw new Error("User not found.");
    }

    // Update in database
    users[index] = { ...users[index], ...updatedData };
    saveUsers(users);

    // If updating the active user session, update sessionStorage "currentUser"
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      const updatedSessionUser = { ...currentUser, ...updatedData };
      delete updatedSessionUser.password;
      sessionStorage.setItem("currentUser", JSON.stringify(updatedSessionUser));
      
      // Dispatch a storage event or custom event so App components know state changed
      window.dispatchEvent(new Event("currentUserUpdated"));
    }

    return users[index];
  },

  // Toggle user blocked state
  toggleBlockUser(email) {
    const users = loadUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (index === -1) {
      throw new Error("User not found.");
    }

    const isBlocked = !users[index].blocked;
    users[index].blocked = isBlocked;
    saveUsers(users);

    // If currently logged-in user is blocked, force log them out!
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase() && isBlocked) {
      this.logout();
      window.dispatchEvent(new Event("currentUserBlocked"));
    }

    return users[index];
  },

  // Change user role
  changeUserRole(email, newRole) {
    const users = loadUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (index === -1) {
      throw new Error("User not found.");
    }

    users[index].role = newRole;
    saveUsers(users);

    // If updating active user role, sync
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      const updatedSessionUser = { ...currentUser, role: newRole };
      sessionStorage.setItem("currentUser", JSON.stringify(updatedSessionUser));
      window.dispatchEvent(new Event("currentUserUpdated"));
    }

    return users[index];
  },

  // Clear current login session
  logout() {
    sessionStorage.removeItem("currentUser");
  }
};
