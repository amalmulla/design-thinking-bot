// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Assuming standard shadcn/ui Vite path aliases (@)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/student/DashboardPage';
import WorkspacePage from './pages/workspace/WorkspacePage';
import TeacherDashboard from './pages/teacher/TeacherDashboard'; 

export default function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} bg-white dark:bg-zinc-900 text-black dark:text-white min-h-screen w-screen transition-colors duration-200`}>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={<DashboardPage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/workspace/new" element={<WorkspacePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/workspace/:projectId" element={<WorkspacePage theme={theme} toggleTheme={toggleTheme} />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard theme={theme} toggleTheme={toggleTheme} />} /> 
          <Route path="/teacher/review/:projectId" element={<WorkspacePage theme={theme} toggleTheme={toggleTheme} />} />
          
          {/* Catch-all route for 404s redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}