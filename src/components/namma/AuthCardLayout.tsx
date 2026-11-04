import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

interface AuthCardLayoutProps {
  title: string;
  subtitle: string;
  roleBadge?: {
    label: string;
    color: 'blue' | 'emerald' | 'indigo' | 'amber';
  };
  showBackToRoles?: boolean;
  children: React.ReactNode;
}

export const AuthCardLayout: React.FC<AuthCardLayoutProps> = ({
  title,
  subtitle,
  roleBadge,
  showBackToRoles = true,
  children,
}) => {
  const badgeColors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header / Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        {showBackToRoles && (
          <Link
            to="/roles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Select Role</span>
          </Link>
        )}
      </div>

      {/* Main Centered Card Container */}
      <div className="flex-1 flex items-center justify-center my-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl shadow-blue-900/5 p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* Header */}
          <div className="text-center mb-6">
            {roleBadge && (
              <span
                className={`inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border mb-3 ${
                  badgeColors[roleBadge.color]
                }`}
              >
                {roleBadge.label}
              </span>
            )}
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">{subtitle}</p>
          </div>

          {/* Form and Content */}
          {children}
        </div>
      </div>

      {/* Footer info & Security note */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-400 pt-6">
        <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PostgreSQL Relational DB • Bcrypt Hashed Passwords</span>
        </div>
        <p>© {new Date().getFullYear()} LocalFix. Ungal Area, Ungal Services.</p>
      </div>
    </div>
  );
};
