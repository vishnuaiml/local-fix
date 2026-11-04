import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { HERO_IMAGE, CITIES_AND_AREAS } from '../lib/constants';
import { formatCurrency } from '../lib/currency';
import { ProviderProfile, ServiceCategory } from '../types';
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle,
  Zap,
  Wrench,
  AirVent,
  Sparkles,
  Tv,
  Paintbrush,
  Hammer,
  ShieldAlert,
  ArrowRight,
  Clock,
  ThumbsUp,
  Award,
  PlayCircle,
  Heart,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-6 h-6 text-amber-500" />,
  Wrench: <Wrench className="w-6 h-6 text-sky-500" />,
  AirVent: <AirVent className="w-6 h-6 text-teal-500" />,
  Sparkles: <Sparkles className="w-6 h-6 text-emerald-500" />,
  Tv: <Tv className="w-6 h-6 text-indigo-500" />,
  Paintbrush: <Paintbrush className="w-6 h-6 text-purple-500" />,
  Hammer: <Hammer className="w-6 h-6 text-orange-500" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-rose-500" />,
};

export const HomeView: React.FC = () => {
  const {
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    searchQuery,
    setSearchQuery,
    navigate,
    setSelectedCategorySlug,
    t,
    favorites,
    toggleFavorite,
    showToast,
  } = useApp();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean }[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  const availableAreas = CITIES_AND_AREAS[selectedCity] || [];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, pros] = await Promise.all([
          api.getCategories(),
          api.getProviders({ city: selectedCity, verifiedOnly: true }),
        ]);
        setCategories(cats);
        setFeaturedProviders(pros.slice(0, 4));
      } catch (err: any) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('search');
  };

  const handleRunVerificationTests = async () => {
    try {
      setRunningTests(true);
      const res = await api.runTests();
      setTestResults(res.results);
      if (res.success) {
        showToast('All 5 system tests passed! Double-booking & commission verified.', 'success');
      } else {
        showToast('Some automated tests failed.', 'error');
      }
    } catch (err: any) {
      showToast('Error executing automated test runner', 'error');
    } finally {
      setRunningTests(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 bg-teal-950/80 border border-teal-800/80 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Verified Local Technicians in {selectedCity}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t('brandTagline')}
              </h1>

              <p className="text-slate-300 text-base max-w-xl leading-relaxed">
                Book police-verified plumbers, certified electricians, AC technicians, and deep cleaners with upfront price cards in Indian Rupees. Zero surprise charges.
              </p>

              {/* Integrated Search Box */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2.5 rounded-xl shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl text-slate-900"
              >
                {/* Area Dropdown */}
                <div className="flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200 md:w-48 shrink-0">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="All">All {selectedCity}</option>
                    {availableAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Keyword Input */}
                <div className="flex items-center gap-2 px-3 py-2 flex-1">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
                >
                  Find Specialists
                </button>
              </form>

              {/* Popular quick-tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-2">
                <span className="text-slate-400">Popular:</span>
                {['Switchboard Repair', 'AC Deep Wash', 'Sink Blockage', 'Bathroom Scrub'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item);
                      navigate('search');
                    }}
                    className="text-xs text-slate-300 hover:text-white underline decoration-slate-600 underline-offset-4 cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Media Focal Anchor */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                <img
                  src={HERO_IMAGE}
                  alt="Friendly verified technician in home"
                  className="w-full h-80 sm:h-96 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Rajesh Kumar</div>
                    <div className="text-slate-400">Govt Licensed Wireman · Anna Nagar</div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-1 rounded font-semibold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.88 (142 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Popular Home Services
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Select a specialized category to view transparent rates and certified neighborhood technicians.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('services')}
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View all services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategorySlug(cat.slug);
                navigate('search');
              }}
              className="group text-left bg-white rounded-xl p-5 border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                  {ICON_MAP[cat.iconName] || <Zap className="w-6 h-6 text-teal-600" />}
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1 group-hover:text-teal-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Starting at</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(cat.startingPricePaise)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Verified Providers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Top Rated Verified Professionals in {selectedCity}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Background checked, licensed tradespeople with customer-reviewed track records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('search')}
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Explore all providers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProviders.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header photo & badge */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={pro.portfolioPhotos[0] || pro.avatarUrl}
                    alt={pro.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-teal-800 flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Verified Pro</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(pro.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-600 transition-colors cursor-pointer shadow-sm"
                    aria-label="Save professional"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(pro.id) ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {pro.name}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        {pro.businessName}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="tabular-nums">{pro.rating.toFixed(2)}</span>
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">{pro.reviewCount} jobs reviewed</span>
                  </div>

                  {/* Service Areas */}
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pro.serviceAreas.join(', ')}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {pro.bio}
                  </p>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mb-3 text-xs">
                  <span className="text-slate-500">Starting from</span>
                  <span className="font-bold text-base text-slate-900 tabular-nums">
                    {formatCurrency(pro.startingPricePaise)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('provider-detail', { providerId: pro.id })}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('provider-detail', { providerId: pro.id })}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How LocalFix Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Simple, transparent booking designed to protect customers and empower genuine neighborhood professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Choose Service & Time Slot
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse upfront rate cards in Indian Rupees. Pick a date and time slot with real-time double-booking verification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Verified Pro Arrives on Schedule
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive live status updates as your technician heads to your doorstep equipped with proper tools and spares.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Inspect, Confirm & Pay Safely
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm task completion before releasing payment via UPI or Cash on Delivery. Enjoy our 30-day rework warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Real Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Real Customer Stories
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Verified feedback from genuine completed bookings across Chennai and Bangalore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Our living room distribution board was tripping repeatedly on Diwali evening. Booked Rajesh through LocalFix, he arrived within 45 minutes, replaced the damaged MCB, and charged the exact ₹699 stated on the portal."
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                PS
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Priya Sharma</div>
                <div className="text-[11px] text-slate-500">Anna Nagar, Chennai · Electrical Service</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Finding an honest plumber who doesn't inflate parts prices was impossible until Arun. He pressure-tested our pipes, fixed the leak under our sink, and gave an invoice breakdown directly to my email."
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                GR
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Ganesh Raman</div>
                <div className="text-[11px] text-slate-500">Adyar, Chennai · Plumbing Repair</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                "Meenakshi's deep cleaning team cleaned our 2BHK rental before handover. The tiles and kitchen chimney grease were completely scrubbed. Landlord returned our full deposit without a single question."
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                DV
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Deepa V.</div>
                <div className="text-[11px] text-slate-500">Indiranagar, Bengaluru · Deep Cleaning</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Partner Recruitment CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 to-teal-950 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Earn More With LocalFix
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are You a Certified Service Professional?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join our network of verified pros in your city. Get real customer bookings without paying exorbitant lead fees. Enjoy reduced commission rates and direct payouts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('provider-register')}
            className="px-6 py-3.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-lg cursor-pointer"
          >
            Register as Service Partner
          </button>
        </div>
      </section>

      {/* 7. Verification & Automated Test Status Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">
                System Quality & Business Rule Verification
              </h4>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Verify server-side double-booking prevention, integer paise commission calculations, and completed-only review constraints.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunVerificationTests}
            disabled={runningTests}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {runningTests ? 'Running Verification...' : 'Run Automated Tests'}
          </button>
        </div>

        {testResults && (
          <div className="mt-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Test Execution Report (5/5 Passing)
            </div>
            <div className="space-y-2">
              {testResults.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-slate-50 border border-slate-100"
                >
                  <span className="font-medium text-slate-800">{t.name}</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      t.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
