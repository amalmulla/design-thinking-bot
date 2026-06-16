// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usersService } from './UsersManager/usersService';

import LoginPage from './UsersManager/LoginPage';
import Dashboard from './UsersManager/Dashboard';
import WorkspacePage from './UsersManager/WorkspacePage';

// New User Manager Components
import Register from './UsersManager/Register';
import Profile from './UsersManager/profile';
import ManageUsers from './UsersManager/ManageUsers';

// Helper component to guard private routes based on login session and role clearance
function ProtectedRoute({ children, allowedRoles }) {
  const currentUser = usersService.getCurrentUser();

  if (!currentUser) {
    // If not authenticated, force back to login screen
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Role not authorized (e.g., student attempting to view admin panel)
    return <Navigate to={currentUser.role === 'teacher' ? '/teacher' : '/dashboard'} replace />;
  }

  return children;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Force re-evaluation of current user state across components on custom events
  const [, forceUpdate] = useState(0);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    const handleUserUpdate = () => {
      forceUpdate(prev => prev + 1);
    };

    const handleBlocked = () => {
      forceUpdate(prev => prev + 1);
      // Let standard route checks redirect them automatically
    };

    window.addEventListener('currentUserUpdated', handleUserUpdate);
    window.addEventListener('currentUserBlocked', handleBlocked);
    return () => {
      window.removeEventListener('currentUserUpdated', handleUserUpdate);
      window.removeEventListener('currentUserBlocked', handleBlocked);
    };
  }, []);

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} bg-white dark:bg-zinc-950 text-black dark:text-white min-h-screen w-screen transition-colors duration-200`}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Profile View (Any authenticated user can access) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          />

          {/* Student Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Dashboard theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/new" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <WorkspacePage theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace/:projectId" 
            element={
              <ProtectedRoute>
                <WorkspacePage theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Dashboard theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          /> 
          <Route 
            path="/teacher/review/:projectId" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <WorkspacePage theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          />
          
          {/* Teacher User Control Dashboard */}
          <Route 
            path="/manage-users" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ManageUsers theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route redirects back to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}