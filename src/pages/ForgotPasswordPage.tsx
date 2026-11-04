import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthCardLayout } from '../components/namma/AuthCardLayout';
import { useNammaAuth } from '../context/NammaAuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useNammaAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter the email address linked to your LocalFix account.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        setSuccessMessage(res.message);
      } else {
        setError(res.message || 'Unable to process reset request.');
      }
    } catch {
      setError('Communication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      title="Reset Your Password"
      subtitle="Enter your account email to receive a secure recovery token"
      roleBadge={{ label: 'Password Recovery', color: 'blue' }}
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <div className="flex items-start gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Registered Account Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@gmail.com"
              required
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition text-xs disabled:opacity-60"
        >
          {loading ? 'Generating Token...' : 'Send Password Reset Link'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
        <p className="font-medium text-slate-700 text-center">Return to Login:</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/login/customer" className="text-blue-600 hover:underline font-medium">
            Customer
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/login/provider" className="text-emerald-700 hover:underline font-medium">
            Provider
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/login/admin" className="text-slate-700 hover:underline font-medium">
            Admin
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
};
