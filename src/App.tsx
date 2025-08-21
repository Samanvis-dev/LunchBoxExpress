import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import RegistrationPage from './pages/RegistrationPage';
import ParentDashboard from './pages/dashboards/ParentDashboard';
import DeliveryDashboard from './pages/dashboards/DeliveryDashboard';
import SchoolDashboard from './pages/dashboards/SchoolDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import CatererDashboard from './pages/dashboards/CatererDashboard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function DashboardRoute() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'parent':
      return <ParentDashboard />;
    case 'delivery_staff':
      return <DeliveryDashboard />;
    case 'school_admin':
      return <SchoolDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'caterer':
      return <CatererDashboard />;
    default:
      return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RoleSelectionPage />} />
            <Route path="/register/:role" element={<RegistrationPage />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardRoute />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;