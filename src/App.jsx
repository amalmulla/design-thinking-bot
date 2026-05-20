// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Assuming standard shadcn/ui Vite path aliases (@)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/student/DashboardPage';
import WorkspacePage from './pages/workspace/WorkspacePage';
import TeacherDashboard from './pages/teacher/TeacherDashboard'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Student Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/workspace/new" element={<WorkspacePage />} />
        <Route path="/workspace/:projectId" element={<WorkspacePage />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} /> 
        <Route path="/teacher/review/:projectId" element={<WorkspacePage />} />
        
        {/* Catch-all route for 404s redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}