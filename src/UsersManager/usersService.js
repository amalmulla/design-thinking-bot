// usersService.js
// Service to manage users state and API delegation
import { apiService } from "../lib/apiService";

export const usersService = {
  // Get all users
  async getAllUsers() {
    try {
      return await apiService.getAllUsers();
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  },

  // Get currently logged-in user from the stored JWT
  getCurrentUser() {
    const token = sessionStorage.getItem("token");
    if (!token) return null;
    try {
      // Safely decode the JWT payload
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding JWT token:", e);
      return null;
    }
  },

  // Perform login check
  async login(email, password) {
    try {
      const response = await apiService.login(email, password);
      // Strip the returned JWT token and save ONLY the token string to browser memory
      sessionStorage.setItem("token", response.token);
      
      window.dispatchEvent(new Event("currentUserUpdated"));
      
      return this.getCurrentUser();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  // Register a new user
  async register(userData) {
    try {
      const response = await apiService.register(userData);
      return response.user;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  // Toggle user blocked state
  async toggleBlockUser(id) {
    try {
      const response = await apiService.toggleBlockUser(id);
      
      // If currently logged-in user is blocked, force log them out
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id && response.user.blocked) {
        this.logout();
        window.dispatchEvent(new Event("currentUserBlocked"));
      }
      
      return response.user;
    } catch (error) {
      console.error("Error toggling block user:", error);
      throw error;
    }
  },

  // Change user role
  async changeUserRole(id, newRole) {
    try {
      const response = await apiService.updateUserRole(id, newRole);
      
      // If updating active user role, they may need to re-login to get a new JWT,
      // but we signal an update event just in case.
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        window.dispatchEvent(new Event("currentUserUpdated"));
      }

      return response.user;
    } catch (error) {
      console.error("Error changing user role:", error);
      throw error;
    }
  },

  // Update user profile (name, password)
  async updateUser(id, updatePayload) {
    try {
      const response = await apiService.updateUserProfile(id, updatePayload);
      
      // Update the local token so the header and profile page reflect the new name
      if (response.token) {
        sessionStorage.setItem("token", response.token);
        window.dispatchEvent(new Event("currentUserUpdated"));
      }

      return response.user;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Clear current login session
  logout() {
    sessionStorage.removeItem("token");
    window.dispatchEvent(new Event("currentUserUpdated"));
  }
};
