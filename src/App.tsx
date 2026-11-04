/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NammaAuthProvider } from './context/NammaAuthContext';
import { HomePage } from './pages/HomePage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { CustomerRegisterPage } from './pages/CustomerRegisterPage';
import { ProviderLoginPage } from './pages/ProviderLoginPage';
import { ProviderRegisterPage } from './pages/ProviderRegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProtectedRoute } from './components/namma/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <NammaAuthProvider>
        <Routes>
          {/* 1. Flagship Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* 2. Role Selection Gateway */}
          <Route path="/roles" element={<RoleSelectionPage />} />

          {/* 3. Customer Authentication */}
          <Route path="/login/customer" element={<CustomerLoginPage />} />
          <Route path="/register/customer" element={<CustomerRegisterPage />} />

          {/* 4. Service Provider Authentication */}
          <Route path="/login/provider" element={<ProviderLoginPage />} />
          <Route path="/register/provider" element={<ProviderRegisterPage />} />

          {/* 5. Administrator Authentication (Strict: No public registration) */}
          <Route path="/login/admin" element={<AdminLoginPage />} />

          {/* 6. Password Recovery */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* 7. Role-Protected Dashboards */}
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/provider"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NammaAuthProvider>
    </BrowserRouter>
  );
}
