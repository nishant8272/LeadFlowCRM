import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { ForgotPassword } from '../pages/ForgotPassword';
import { PublicLeadForm } from '../pages/PublicLeadForm';
import { Dashboard } from '../pages/Dashboard';
import { LeadList } from '../pages/LeadList';
import { LeadDetails } from '../pages/LeadDetails';
import { UserManagement } from '../pages/UserManagement';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/submit-lead" element={<PublicLeadForm />} />

      {/* Protected CRM Pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<LeadList />} />
          <Route path="/leads/:id" element={<LeadDetails />} />

          {/* Admin-only user management */}
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
