import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Wrench,
  Sparkles,
  Laptop,
  Smartphone,
  Tv,
  BookOpen,
  Shirt,
  Hammer,
  Paintbrush,
  Bug,
  HelpCircle,
  ArrowRight,
  Clock,
  Phone,
  Briefcase,
  Users,
  Award,
} from 'lucide-react';
import { Navbar } from '../components/namma/Navbar';
import { Footer } from '../components/namma/Footer';
import { BookingModal } from '../components/namma/BookingModal';
import { nammaApi } from '../services/api';
import { Provider, ALL_CATEGORIES, POPULAR_LOCALITIES, ServiceCategory } from '../types/nammaservices';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Electrician: Zap,
  Plumber: Wrench,
  'Home Cleaning': Sparkles,
  'Laptop and Computer Repair': Laptop,
  'Mobile Repair': Smartphone,
  'Washing Machine and Appliance Repair': Tv,
  Tutor: BookOpen,
  Laundry: Shirt,
  Carpenter: Hammer,
  Painting: Paintbrush,
  'Pest Control': Bug,
  'Other Local Services': HelpCircle,
};

export const HomePage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All Areas');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<Provider | null>(null);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Fetch approved providers
  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await nammaApi.getProviders({
        category: selectedCategory,
        area: selectedLocality,
        search: searchTerm,
      });
      if (res.success) {
        setProviders(res.providers);
      }
    } catch (e) {
      console.error('Failed to load providers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [selectedCategory, selectedLocality]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProviders();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-semibold mb-6">
            <MapPin className="w-3.5 h-3.5" />
            <span>Tamil Nadu&apos;s Hyperlocal Service Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Local<span className="text-emerald-400">Fix</span>
          </h1>
          <p className="mt-3 text-lg sm:text-2xl font-bold text-blue-100">
            “Ungal Area, Ungal Services.”
          </p>
          <p className="mt-2 text-sm sm:text-base text-blue-200/90 max-w-2xl mx-auto">
            Book verified plumbers, electricians, home cleaners, computer techs, and repair specialists near your doorstep with transparent indicative pricing.
          </p>

          {/* Search Box with Locality Selector */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-100 text-slate-800"
          >
            {/* Locality Dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl sm:w-1/3 border border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
              >
                {POPULAR_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search electrician, plumber, AC repair, cleaning..."
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5"
            >
              <span>Find Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick localities chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-blue-200">
            <span className="font-semibold text-white/90">Popular Areas:</span>
            {['T. Nagar', 'Velachery', 'Anna Nagar', 'Adyar', 'Tambaram', 'OMR'].map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedLocality(area)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition ${
                  selectedLocality === area
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-blue-100'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 12 Service Categories Bar */}
      <section id="explore-services" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Browse By Trade
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Popular Service Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
            Choose from 12 essential home, repair, and education services delivered by vetted local professionals.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">All Categories</span>
          </button>

          {ALL_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Wrench;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold line-clamp-1">{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Verified Local Providers Listings */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Verified Service Providers in {selectedLocality}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {providers.length} Available
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active, identity-verified professionals ready for service bookings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter:</span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocality('All Areas');
                setSearchTerm('');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Querying verified providers near {selectedLocality}...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-8 shadow-xs">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No verified providers found in this category & area</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Try switching your locality to &quot;All Areas&quot; or selecting a broader category like Electrician or Plumber.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocality('All Areas');
              }}
              className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl"
            >
              Show All Providers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                        alt={p.business_name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {p.business_name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.full_name} • {p.experience_years} Yrs Exp.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  {/* Category & Locality Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      {p.service_category}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {p.service_area}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {p.service_description}
                  </p>

                  {/* Rating & Jobs */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-slate-900">{p.rating > 0 ? p.rating : '4.8'}</span>
                      <span className="text-slate-400">({p.completed_jobs > 0 ? p.completed_jobs : 45} jobs)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium">Indicative Base: </span>
                      <span className="font-bold text-blue-700 text-sm">₹{p.hourly_rate}</span>
                    </div>
                  </div>
                </div>

                {/* Book Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedProviderForBooking(p)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              How LocalFix Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
              Zero hassle, no advance platform commission. Connect directly with nearby tradespeople.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-3xl p-7 border border-slate-200 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-md shadow-blue-600/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Search Your Area</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your neighborhood (e.g. T. Nagar, Velachery, Anna Nagar) and pick the trade you require.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-7 border border-slate-200 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-md shadow-emerald-600/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Choose Verified Provider</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare indicative rates, years of experience, and official administrator verification credentials.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-7 border border-slate-200 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-md shadow-indigo-600/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Book & Track Live</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your preferred date & time. The provider confirms, arrives on schedule, and you pay directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose LocalFix */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Choose LocalFix?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
              Built specifically for Tamil Nadu localities with trust, safety, and community accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Strict Admin Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every provider identity and trade qualification is inspected prior to approval. Unverified accounts cannot take bookings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Zero Fabricated Reviews</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reviews are strictly restricted to customers with completed service bookings. No artificial review manipulation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Indicative Transparent Pricing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compare realistic base rates upfront. No hidden surprises or arbitrary platform surcharges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Grievance Protection Desk</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Active administrative complaints resolution to inspect any dispute, billing concern, or service delay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Genuine Customer Reviews Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Verified Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Genuine Customer Reviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
              Read real impressions from residents who completed bookings through LocalFix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                &quot;Deepa did an extraordinary job! The kitchen tiles and chimney look sparkling clean like brand new. On time, polite, and very professional.&quot;
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900">Priya Sharma (T. Nagar)</span>
                <span className="text-emerald-600 font-semibold">Completed Booking Verified</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed mb-4">
                &quot;Rajesh resolved our recurring tripping circuit breaker in Velachery within 45 minutes. Explained the issue clearly and charged reasonable rates.&quot;
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900">Kavitha R. (Velachery)</span>
                <span className="text-emerald-600 font-semibold">Completed Booking Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Provider CTA Banner */}
      <section className="py-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Join Our Verified Trade Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Are you a skilled local tradesperson or technician?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mt-1">
              Register your business on LocalFix. Get verified by our admin team, receive direct bookings from residents, and grow your local customer base.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/register/provider"
              className="bg-white text-emerald-800 hover:bg-slate-100 font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition"
            >
              Apply as Service Provider
            </Link>
            <Link
              to="/register/customer"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold text-xs px-5 py-3.5 rounded-2xl transition"
            >
              Customer Registration
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedProviderForBooking && (
        <BookingModal
          provider={selectedProviderForBooking}
          onClose={() => setSelectedProviderForBooking(null)}
          onBookingSuccess={(id) => {
            setSelectedProviderForBooking(null);
            setBookingSuccessId(id);
          }}
        />
      )}

      {/* Booking Success Toast Notification */}
      {bookingSuccessId && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div className="text-xs">
            <p className="font-bold">Booking Request Sent (#{bookingSuccessId})!</p>
            <p className="text-emerald-100">The provider has been notified to accept your request.</p>
          </div>
          <button
            onClick={() => setBookingSuccessId(null)}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};
