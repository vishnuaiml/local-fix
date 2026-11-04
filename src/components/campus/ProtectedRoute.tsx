import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCampusAuth } from '../../context/CampusAuthContext';
import { UserRole } from '../../types/campusConnect';

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { user, role, isLoading } = useCampusAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying CampusConnect Credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to the specific login page for that role
  if (!user || role !== requiredRole) {
    return <Navigate to={`/login/${requiredRole}`} replace />;
  }

  return <>{children}</>;
};
