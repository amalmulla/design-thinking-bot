// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Assuming standard shadcn/ui Vite path aliases (@)
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import WorkspacePage from '@/pages/WorkspacePage';
import TeacherDashboard from '@/pages/TeacherDashboard';

export default function App() {
  return (
    <Routes>
      {/* Default redirect to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Route definitions */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      
      {/* Catch-all route for 404s (optional but recommended for scalability) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}