import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
  Search,
  Star,
  MapPin,
} from 'lucide-react';
import { Logo } from '../components/namma/Logo';
import { useNammaAuth } from '../context/NammaAuthContext';

export const RoleSelectionPage: React.FC = () => {
  const { user } = useNammaAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-white to-emerald-50/60 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-8">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        {user ? (
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">Logged in as</p>
              <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
            </div>
            <Link
              to={`/dashboard/${user.role}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <Link
            to="/"
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition shadow-xs"
          >
            ← Back to Home
          </Link>
        )}
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center my-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-4">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Role-Based Authentication Gateway • Ungal Area, Ungal Services</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Select Your Portal on <span className="text-blue-600">Local</span><span className="text-emerald-600">Fix</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Choose your account type to proceed. Each role is protected with dedicated authentication, parameterized database validation, and a customized workspace.
        </p>
      </div>

      {/* 3 Main Role Selection Cards */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {/* Role 1: Customer */}
        <div className="group relative bg-white border border-slate-200 rounded-3xl p-7 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-b" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Customer Portal
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              Customer Sign In
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Find, compare indicative prices, book, track job progress, and review verified local service providers in your neighborhood.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Locality-based search across 12 trades</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Select preferred date & time slot</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Track booking status & submit genuine reviews</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <Link
              to="/login/customer"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm group-hover:shadow-lg"
            >
              <span>Customer Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
              <span>New resident?</span>
              <Link to="/register/customer" className="font-semibold text-blue-600 hover:underline">
                Create Customer Account
              </Link>
            </div>
          </div>
        </div>

        {/* Role 2: Service Provider */}
        <div className="group relative bg-white border border-slate-200 rounded-3xl p-7 shadow-lg shadow-emerald-900/5 hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-b" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <Wrench className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Provider Portal
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
              Service Provider
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Register your business, receive local booking requests, accept/reject jobs, update status, and manage services.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>12 trade categories & local coverage areas</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Pending Admin approval verification pipeline</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Live status tracking: Accepted → In Progress → Done</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <Link
              to="/login/provider"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition-all text-sm group-hover:shadow-lg"
            >
              <span>Provider Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
              <span>Want to offer services?</span>
              <Link to="/register/provider" className="font-semibold text-emerald-600 hover:underline">
                Register as Provider
              </Link>
            </div>
          </div>
        </div>

        {/* Role 3: Admin */}
        <div className="group relative bg-white border border-slate-200 rounded-3xl p-7 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:border-slate-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-slate-700 to-indigo-700 rounded-b" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-xs">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                Staff Only
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
              Platform Admin
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Protected operations control room. Verify provider trade licenses, resolve customer complaints, and audit PostgreSQL metrics.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
              <li className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Strictly restricted: No public registration</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1-Click Provider Verification queue</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Complaints desk & PostgreSQL pgAdmin tools</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <Link
              to="/login/admin"
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-slate-900/20 transition-all text-sm group-hover:shadow-lg"
            >
              <span>Admin Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-center text-xs text-slate-400 py-1">
              <span>Public registration strictly disabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Architecture Banner */}
      <footer className="max-w-4xl mx-auto w-full pt-8 text-center text-xs text-slate-500 border-t border-slate-200/80">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            PostgreSQL Relational Storage
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <KeyRound className="w-4 h-4 text-blue-600" />
            Bcrypt Hashed Passwords
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Clock className="w-4 h-4 text-amber-600" />
            Rate Limiting Active
          </span>
        </div>
        <p>© {new Date().getFullYear()} LocalFix. Ungal Area, Ungal Services.</p>
      </footer>
    </div>
  );
};
