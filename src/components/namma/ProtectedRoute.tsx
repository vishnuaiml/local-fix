import React from 'react';
import { Navigate } from 'react-router-dom';
import { useNammaAuth } from '../../context/NammaAuthContext';
import { UserRole } from '../../types/nammaservices';

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { user, role, isLoading } = useNammaAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Authenticating LocalFix session...</p>
        </div>
      </div>
    );
  }

  // If not logged in or role mismatch, redirect to that role's login portal
  if (!user || role !== requiredRole) {
    return <Navigate to={`/login/${requiredRole}`} replace />;
  }

  return <>{children}</>;
};
