import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Securing connection...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save current location for redirection back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
