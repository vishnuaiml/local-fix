import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  MapPin,
  Briefcase,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Logo } from './Logo';
import { useNammaAuth } from '../../context/NammaAuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useNammaAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <a href="#explore-services" className="hover:text-blue-600 transition-colors">
            Explore Services
          </a>
          <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
            How It Works
          </a>
          <Link
            to="/register/provider"
            className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-all text-xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Become a Provider</span>
          </Link>
        </div>

        {/* Right Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={`/dashboard/${role}`}
                className="flex items-center gap-2.5 bg-blue-50 border border-blue-200/90 text-blue-900 px-3.5 py-1.5 rounded-xl hover:bg-blue-100 transition shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">{user.full_name}</p>
                  <p className="text-[10px] text-blue-600 font-semibold uppercase">{user.role}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 relative">
              {/* Login Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {loginDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-fadeIn">
                    <p className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Portal
                    </p>
                    <Link
                      to="/login/customer"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                    >
                      Customer Sign In
                    </Link>
                    <Link
                      to="/login/provider"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                    >
                      Service Provider Sign In
                    </Link>
                    <Link
                      to="/login/admin"
                      onClick={() => setLoginDropdownOpen(false)}
                      className="block px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium border-t border-slate-100"
                    >
                      Administrator Sign In
                    </Link>
                  </div>
                )}
              </div>

              {/* Register Button */}
              <Link
                to="/register/customer"
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              to={`/dashboard/${role}`}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
            >
              Dashboard
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800"
          >
            Home
          </Link>
          <a
            href="#explore-services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800"
          >
            Explore Services
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800"
          >
            How It Works
          </a>
          <Link
            to="/register/provider"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-emerald-700"
          >
            Become a Service Provider
          </Link>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-sm font-semibold text-rose-600"
              >
                Sign Out ({user.full_name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login/customer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800"
                >
                  Customer Sign In
                </Link>
                <Link
                  to="/register/customer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
