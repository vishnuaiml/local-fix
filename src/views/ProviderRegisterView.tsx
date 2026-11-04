import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { CITIES_AND_AREAS } from '../lib/constants';
import { ShieldCheck, CheckCircle2, UploadCloud, ArrowRight } from 'lucide-react';

export const ProviderRegisterView: React.FC = () => {
  const { navigate, selectedCity, showToast, setRole } = useApp();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('+91 98405 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(selectedCity);
  const [selectedArea, setSelectedArea] = useState('Anna Nagar');
  const [primaryCategory, setPrimaryCategory] = useState('Electrician');
  const [experienceYears, setExperienceYears] = useState(5);
  const [startingPricePaise, setStartingPricePaise] = useState(29900);
  const [idProofNumber, setIdProofNumber] = useState('AADHAAR-8941-2291');
  const [tradeLicense, setTradeLicense] = useState('Govt Wireman License TN-8910');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availableAreas = CITIES_AND_AREAS[city] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !businessName || !phone) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.registerProvider({
        name,
        businessName,
        phone,
        email: email || `${phone.replace(/\s+/g, '')}@localfix.in`,
        city,
        serviceAreas: [selectedArea],
        primaryCategory,
        experienceYears,
        startingPricePaise,
        idProofNumber,
        certifications: [tradeLicense],
      });

      setSubmitted(true);
      showToast('Application submitted! Our operations team will verify your KYC.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Application Received!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Thank you for applying to join LocalFix as a verified service partner. Our operations team will review your ID and trade certificate within 24–48 hours.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
          Partner Onboarding
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Join LocalFix as a Verified Service Partner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Get real customer bookings in your neighborhood. Keep up to 95% of your earnings with low platform commission.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            1. Personal & Business Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kannan"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business / Firm Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Kannan Electrical Works"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@kannanworks.in"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            2. Trade Specialty & Service Coverage
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Category *
              </label>
              <select
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Electrician">Electrician</option>
                <option value="Plumbing">Plumbing</option>
                <option value="AC Repair & Service">AC Repair & Service</option>
                <option value="House Cleaning">House Cleaning</option>
                <option value="Appliance Repair">Appliance Repair</option>
                <option value="Painting & Waterproofing">Painting</option>
                <option value="Carpentry">Carpentry</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Base City *
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const newAreas = CITIES_AND_AREAS[e.target.value] || [];
                  if (newAreas.length > 0) setSelectedArea(newAreas[0]);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                {Object.keys(CITIES_AND_AREAS).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Neighborhood *
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                {availableAreas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Years of Hands-on Experience
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Inspection Fee (₹)
              </label>
              <input
                type="number"
                step="50"
                value={startingPricePaise / 100}
                onChange={(e) => setStartingPricePaise(Number(e.target.value) * 100)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
            3. Verification & Identity Proof
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aadhaar / National ID Number *
              </label>
              <input
                type="text"
                value={idProofNumber}
                onChange={(e) => setIdProofNumber(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trade Certificate or License Number
              </label>
              <input
                type="text"
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                placeholder="e.g. State Wireman Council TN-1920"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-1">
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs font-semibold text-slate-700">
              ID Proof & Trade License Attached
            </div>
            <div className="text-[11px] text-slate-400">
              Government ID and trade credential simulation ready for admin KYC check
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
        >
          <span>{submitting ? 'Submitting Application...' : 'Submit Application for Verification'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
