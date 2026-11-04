import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CITIES_AND_AREAS } from '../lib/constants';
import {
  MapPin,
  ShieldCheck,
  User,
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  CheckCircle2,
  LogIn,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    navigate,
    role,
    setRole,
    currentUser,
    selectedCity,
    setSelectedCity,
    language,
    setLanguage,
    openAuthModal,
    logout,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const cities = Object.keys(CITIES_AND_AREAS);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Utility Bar for City & Role Switching */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* City Selector */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 text-white font-medium hover:text-teal-300 transition-colors cursor-pointer"
                aria-expanded={isCityDropdownOpen}
              >
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select City
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${
                        selectedCity === city ? 'font-semibold text-teal-600 bg-teal-50' : ''
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>100% Background Verified Pros · 30-Day Guarantee</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Tamil / English Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-slate-300"
              title="Toggle Language (English / தமிழ்)"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{language === 'en' ? 'தமிழ் (TA)' : 'English (EN)'}</span>
            </button>

            <span className="text-slate-600">|</span>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer font-medium"
              >
                <span>Role: {role.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Role Workspace
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRole('customer');
                      navigate('customer-dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 ${
                      role === 'customer' ? 'bg-teal-50 text-teal-700 font-semibold' : ''
                    }`}
                  >
                    <User className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-medium">Customer (Priya)</div>
                      <div className="text-[11px] text-slate-500">Bookings, history, reviews</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('provider');
                      navigate('provider-dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 ${
                      role === 'provider' ? 'bg-teal-50 text-teal-700 font-semibold' : ''
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-medium">Provider (Rajesh Pro)</div>
                      <div className="text-[11px] text-slate-500">Incoming jobs, earnings, status</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('admin');
                      navigate('admin-dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 ${
                      role === 'admin' ? 'bg-teal-50 text-teal-700 font-semibold' : ''
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-medium">Admin (Anand Ops)</div>
                      <div className="text-[11px] text-slate-500">Approvals, commission, disputes</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Top Bar (Standard 3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              L
            </span>
            <span>LocalFix</span>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => navigate('services')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'services' ? 'text-teal-600 font-semibold' : ''
              }`}
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => navigate('search')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'search' ? 'text-teal-600 font-semibold' : ''
              }`}
            >
              Find Specialists
            </button>
            <button
              type="button"
              onClick={() => navigate('provider-register')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'provider-register' ? 'text-teal-600 font-semibold' : ''
              }`}
            >
              Join as Professional
            </button>
            <button
              type="button"
              onClick={() => navigate('reviews')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'reviews' ? 'text-teal-600 font-semibold' : ''
              }`}
            >
              Verified Reviews
            </button>
            <button
              type="button"
              onClick={() => navigate('faq')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'faq' ? 'text-teal-600 font-semibold' : ''
              }`}
            >
              Help & FAQ
            </button>
          </nav>

          {/* Zone 3: 1 primary action & Account controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {role === 'customer' ? (
              <button
                type="button"
                onClick={() => navigate('customer-dashboard')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Customer Dashboard
              </button>
            ) : role === 'provider' ? (
              <button
                type="button"
                onClick={() => navigate('provider-dashboard')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Provider Job Center
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('admin-dashboard')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-700 rounded-lg hover:bg-purple-800 shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Admin Control Room
              </button>
            )}

            {/* User Profile / Auth Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                title={`${currentUser.name} (${role})`}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500 mr-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded w-fit">
                      Role: {role}
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal('login');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-500" />
                      <span>Switch Account / Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal('register');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Create New Account</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
