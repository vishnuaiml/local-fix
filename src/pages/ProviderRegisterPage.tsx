import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Mail,
  Phone,
  Layers,
  MapPin,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Wrench,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { AuthCardLayout } from '../components/namma/AuthCardLayout';
import { useNammaAuth } from '../context/NammaAuthContext';
import { ALL_CATEGORIES, POPULAR_LOCALITIES, ServiceCategory } from '../types/nammaservices';

const SAMPLE_AVATARS = [
  { label: 'Technician', url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80' },
  { label: 'Plumber', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { label: 'Cleaning Pro', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { label: 'Computer Tech', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
];

export const ProviderRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerProvider } = useNammaAuth();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Electrician');
  const [serviceArea, setServiceArea] = useState('T. Nagar');
  const [experienceYears, setExperienceYears] = useState(4);
  const [serviceDescription, setServiceDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(SAMPLE_AVATARS[0].url);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fillSampleProvider = () => {
    const id = Math.floor(Math.random() * 900) + 100;
    setFullName('Senthil Murugan');
    setBusinessName('Murugan Washing Machine & Cooling Experts');
    setEmail(`senthil.tech${id}@nammaservices.in`);
    setPhone('+91 98405 77889');
    setServiceCategory('Washing Machine and Appliance Repair');
    setServiceArea('Adyar');
    setExperienceYears(6);
    setServiceDescription('Specialist in front-load washing machine drum bearing, PCB, and water inlet valve replacements.');
    setPassword('Senthil@123');
    setConfirmPassword('Senthil@123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || !businessName.trim() || !email.trim() || !phone.trim() || !serviceDescription.trim() || !password) {
      setError('Please provide all mandatory provider registration details.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerProvider({
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        serviceCategory,
        serviceArea,
        experienceYears: Number(experienceYears) || 1,
        serviceDescription: serviceDescription.trim(),
        password,
        confirmPassword,
        avatarUrl,
      });

      if (res.success) {
        setSuccess('Application registered! Status is strictly PENDING admin verification. Redirecting to Provider Dashboard...');
        setTimeout(() => {
          navigate('/dashboard/provider');
        }, 700);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch {
      setError('Communication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      title="Register as Service Provider"
      subtitle="Join LocalFix neighborhood trade network"
      roleBadge={{ label: 'Provider Onboarding', color: 'emerald' }}
    >
      {/* Critical Verification Notice Banner */}
      <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-amber-800">Verification Policy: </span>
          Newly registered providers remain <span className="underline font-semibold">Pending</span> until approved by the platform administrator to ensure consumer safety and high work standards.
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
        <span className="text-emerald-950 font-medium">Quick sample technician data?</span>
        <button
          type="button"
          onClick={fillSampleProvider}
          className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition text-[11px]"
        >
          Auto-fill Sample
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1 font-medium">{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Full Name & Business Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rajesh Kumar"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business / Service Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="SparkWave Electricals"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="provider@gmail.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98402 33445"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 12 Service Categories Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Service Category <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Locality & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Service Locality <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <select
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              >
                {POPULAR_LOCALITIES.filter((l) => l !== 'All Areas').map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experience (Years) <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <input
                type="number"
                min="0"
                max="40"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Service Description & Specialty Scope <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            placeholder="Describe the specific services you provide, tools used, and safety practices followed."
            required
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900 resize-none"
          />
        </div>

        {/* Avatar selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Profile Photo / Avatar</span>
            <span className="text-[10px] text-slate-400">Pick image preview</span>
          </label>
          <div className="flex items-center gap-2">
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500 shrink-0 shadow-xs"
            />
            <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1">
              {SAMPLE_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(av.url)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition whitespace-nowrap ${
                    avatarUrl === av.url
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  {av.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 pr-8 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition text-xs disabled:opacity-60"
        >
          {loading ? 'Submitting Application...' : 'Submit Provider Application'}
        </button>
      </form>

      <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
        Already registered as a Service Provider?{' '}
        <Link to="/login/provider" className="font-semibold text-emerald-700 hover:underline">
          Sign In Here
        </Link>
      </div>
    </AuthCardLayout>
  );
};
