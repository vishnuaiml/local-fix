import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authService, AVAILABLE_GOOGLE_ACCOUNTS, GoogleAccount } from '../lib/auth';
import { CITIES_AND_AREAS } from '../lib/constants';
import { UserRole } from '../types';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Check,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { setRole, setCurrentUser, navigate, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [registerRole, setRegisterRole] = useState<'customer' | 'provider'>('customer');
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState<boolean>(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState<string>('');
  const [googleRoleSelection, setGoogleRoleSelection] = useState<'customer' | 'provider'>('customer');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [city, setCity] = useState('Chennai');
  const [businessName, setBusinessName] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('Electrician');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoverySent, setRecoverySent] = useState(false);

  if (!isOpen) return null;

  // Google Sign-In Handler
  const handleGoogleSignIn = async (account: GoogleAccount) => {
    setErrorMessage(null);
    try {
      setLoading(true);
      const { user, redirectTo } = await authService.signInWithGoogle({
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
        rolePreference: googleRoleSelection,
        city,
      });

      setRole(user.role);
      setCurrentUser(user);
      showToast(`Signed in with Google as ${user.name} (${user.role.toUpperCase()})`, 'success');
      setIsGoogleChooserOpen(false);
      onClose();
      // Role-based automatic redirect
      navigate(redirectTo as any);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const acct: GoogleAccount = {
      email: customGoogleEmail.trim().toLowerCase(),
      name: customGoogleEmail.split('@')[0],
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
    handleGoogleSignIn(acct);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setLoading(true);
      const { user, redirectTo } = await authService.login(email, password);
      setRole(user.role);
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name}!`, 'success');
      onClose();
      navigate(redirectTo as any);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { user, redirectTo } = await authService.register({
        name,
        email,
        phone,
        password,
        city,
        role: registerRole, // Strictly customer or provider
        businessName: registerRole === 'provider' ? businessName : undefined,
        primaryCategory: registerRole === 'provider' ? primaryCategory : undefined,
      });

      setRole(user.role);
      setCurrentUser(user);
      showToast(`Account created! Welcome, ${user.name}`, 'success');
      onClose();
      navigate(redirectTo as any);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.requestPasswordRecovery(email);
      setRecoverySent(true);
      showToast(res.message, 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded bg-teal-600 flex items-center justify-center text-white font-black text-sm">
              L
            </span>
            <span className="font-bold text-lg text-slate-900">LocalFix</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' && 'Sign in to LocalFix'}
            {mode === 'register' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Continue with your Google account or email'}
            {mode === 'register' && 'Join verified customers and local specialists'}
            {mode === 'forgot' && 'Receive recovery instructions via email'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* GOOGLE ACCOUNT CHOOSER OVERLAY / MODAL VIEW */}
        {isGoogleChooserOpen ? (
          <div className="space-y-4">
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-teal-900">Choose Google Account</div>
              <p className="text-teal-700">
                Select your Google profile to sign in or create your LocalFix account.
              </p>
            </div>

            {/* Role Selection for new accounts */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Role (if creating a new account)
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setGoogleRoleSelection('customer')}
                  className={`py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                    googleRoleSelection === 'customer'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleRoleSelection('provider')}
                  className={`py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                    googleRoleSelection === 'provider'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  Service Provider
                </button>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                * Note: Admin accounts are protected and recognized via administrative credentials.
              </div>
            </div>

            {/* List of Google Accounts */}
            <div className="space-y-2">
              {AVAILABLE_GOOGLE_ACCOUNTS.map((acct) => (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => handleGoogleSignIn(acct)}
                  disabled={loading}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-slate-50 transition-all flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acct.avatarUrl}
                      alt={acct.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{acct.name}</div>
                      <div className="text-[11px] text-slate-500">{acct.email}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            {/* Custom Google Email input */}
            <form onSubmit={handleCustomGoogleSubmit} className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Or enter another Google Email:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  disabled={loading || !customGoogleEmail.trim()}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={() => setIsGoogleChooserOpen(false)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-2 cursor-pointer"
            >
              Cancel Google Sign-In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. PRIMARY: CONTINUE WITH GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() => setIsGoogleChooserOpen(true)}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-3 shadow-xs transition-colors cursor-pointer"
            >
              {/* Google 4-color SVG Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider">
                or sign in with email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setRecoverySent(false);
                      }}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-500">
                  New to LocalFix?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-teal-600 font-bold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                {/* Account Type Selector (ADMIN CANNOT BE CHOSEN HERE!) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRegisterRole('customer')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        registerRole === 'customer'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Customer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegisterRole('provider')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        registerRole === 'provider'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                      <span>Service Provider</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-1 italic">
                    * Admin roles are protected and cannot be self-selected during registration.
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kannan"
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    >
                      {Object.keys(CITIES_AND_AREAS).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2 text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-teal-600 font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <div className="space-y-4 text-xs">
                {recoverySent ? (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recovery Instructions Sent
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      If an account exists for <strong>{email}</strong>, password reset instructions have been dispatched. You can also sign in directly using Google.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-3.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Your Registered Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>{loading ? 'Sending...' : 'Send Password Reset Link'}</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
