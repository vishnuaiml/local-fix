import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 via-white to-blue-100/40 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header / Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <span>CampusConnect</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Marketplace
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Verified Local Campus Services & Trusted Providers
            </p>
          </div>
        </Link>

        {showBackToRoles && (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white/80 hover:bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Select Role</span>
          </Link>
        )}
      </div>

      {/* Main Centered Card Container */}
      <div className="flex-1 flex items-center justify-center my-4">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-blue-900/5 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle top ambient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400" />

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
            <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
          </div>

          {/* Form and Content */}
          {children}
        </div>
      </div>

      {/* Footer info & Security note */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-400 pt-6">
        <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted with SHA-256 & bcrypt hashing • Secure Session Protection</span>
        </div>
        <p>© {new Date().getFullYear()} CampusConnect Technologies Inc. All rights reserved.</p>
      </div>
    </div>
  );
};
