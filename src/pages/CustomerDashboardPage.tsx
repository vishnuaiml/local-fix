import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  Search,
  Filter,
  Wrench,
  ShieldCheck,
  User,
  Phone,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useNammaAuth } from '../context/NammaAuthContext';
import { nammaApi } from '../services/api';
import { Booking, Provider, Customer, ALL_CATEGORIES, POPULAR_LOCALITIES } from '../types/nammaservices';
import { Logo } from '../components/namma/Logo';
import { BookingModal } from '../components/namma/BookingModal';
import { ReviewModal } from '../components/namma/ReviewModal';
import { ComplaintModal } from '../components/namma/ComplaintModal';

export const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useNammaAuth();
  const customer = user as Customer;

  const [activeTab, setActiveTab] = useState<'bookings' | 'explore' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [complaintBooking, setComplaintBooking] = useState<Booking | null>(null);

  // Filters for explore
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocality, setSelectedLocality] = useState('All Areas');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const customerId = customer?.id || 'cust_seed_1';
      const [bookingsRes, providersRes] = await Promise.all([
        nammaApi.getCustomerBookings(customerId),
        nammaApi.getProviders({
          category: selectedCategory,
          area: selectedLocality,
          search: searchQuery,
        }),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (providersRes.success) setProviders(providersRes.providers);
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to refresh customer workspace records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedLocality]);

  const handleCancel = async (bookingId: string) => {
    const reason = prompt('Please specify reason for cancellation:');
    if (!reason) return;

    try {
      const res = await nammaApi.cancelBooking(bookingId, reason);
      if (res.success) {
        setActionAlert({ type: 'success', text: 'Booking successfully cancelled.' });
        loadData();
      } else {
        setActionAlert({ type: 'error', text: res.message });
      }
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to cancel booking.' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login/customer');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{customer?.full_name || 'Priya Sharma'}</p>
              <p className="text-[11px] text-slate-500">{customer?.email || 'customer@nammaservices.in'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>{customer?.address || 'T. Nagar, Chennai'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vanakkam, {customer?.full_name || 'Customer'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1">
              Track your service bookings, compare neighborhood providers, and schedule repairs with verified local pros.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('explore')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book New Service</span>
            </button>
          </div>
        </div>

        {actionAlert && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
              actionAlert.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{actionAlert.text}</span>
            <button
              onClick={() => setActionAlert(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Explore & Book Services
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* TAB 1: My Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">You haven&apos;t booked any services yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Find an electrician, plumber, cleaner, or repair specialist in your locality and schedule an appointment in minutes.
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl"
                >
                  Explore Neighborhood Providers
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-slate-500">#{b.id}</span>
                        <h3 className="font-bold text-slate-900 text-sm">{b.service_description}</h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            b.booking_status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.booking_status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : b.booking_status === 'Accepted'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : b.booking_status === 'Cancelled'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {b.booking_status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Provider: <span className="font-semibold text-slate-900">{b.provider_business_name}</span> ({b.provider_name}) • {b.provider_phone}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {b.preferred_date} at {b.preferred_time}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {b.service_location}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">₹{b.indicative_price}</span>
                      </div>

                      {b.provider_response && (
                        <div className="mt-2.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                          <span className="font-bold text-slate-900">Provider Note:</span> {b.provider_response}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {b.booking_status === 'Completed' && (
                        <button
                          onClick={() => setReviewBooking(b)}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-600" />
                          <span>Submit Review</span>
                        </button>
                      )}

                      {(b.booking_status === 'Pending' || b.booking_status === 'Accepted') && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition"
                        >
                          Cancel Booking
                        </button>
                      )}

                      <button
                        onClick={() => setComplaintBooking(b)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs transition flex items-center gap-1"
                        title="File an issue"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                        <span>Raise Complaint</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Explore & Book Services */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Trade Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-xl"
                >
                  <option value="All">All 12 Categories</option>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Locality</label>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-xl"
                >
                  {POPULAR_LOCALITIES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search Keywords</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Wiring, tank wash, screen repair..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-xl"
                />
              </div>
            </div>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <img
                        src={p.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
                        alt={p.business_name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{p.business_name}</h3>
                    <p className="text-xs text-slate-500">{p.full_name} • {p.experience_years} Yrs Exp</p>

                    <div className="flex items-center gap-2 mt-2 mb-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700">
                        {p.service_category}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {p.service_area}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {p.service_description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Indicative Rate</span>
                      <span className="font-bold text-blue-700 text-sm">₹{p.hourly_rate}</span>
                    </div>
                    <button
                      onClick={() => setBookingProvider(p)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingProvider && (
        <BookingModal
          provider={bookingProvider}
          onClose={() => setBookingProvider(null)}
          onBookingSuccess={(id) => {
            setBookingProvider(null);
            setActionAlert({ type: 'success', text: `Booking #${id} requested successfully!` });
            loadData();
          }}
        />
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            setActionAlert({ type: 'success', text: 'Thank you for your genuine review!' });
            loadData();
          }}
        />
      )}

      {/* Complaint Modal */}
      {complaintBooking && (
        <ComplaintModal
          booking={complaintBooking}
          onClose={() => setComplaintBooking(null)}
          onSuccess={() => {
            setComplaintBooking(null);
            setActionAlert({ type: 'success', text: 'Grievance submitted. Operations desk will review.' });
            loadData();
          }}
        />
      )}
    </div>
  );
};
