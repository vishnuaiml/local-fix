import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Clock,
  ShieldAlert,
  LogOut,
  Star,
  MapPin,
  Phone,
  Layers,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useNammaAuth } from '../context/NammaAuthContext';
import { nammaApi } from '../services/api';
import { Provider, Booking, Review, ServiceItem, BookingStatus } from '../types/nammaservices';
import { Logo } from '../components/namma/Logo';

export const ProviderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserLocally } = useNammaAuth();
  const provider = user as Provider;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New service form
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(349);

  const loadData = async () => {
    setLoading(true);
    try {
      const providerId = provider?.id || 'prov_seed_1';
      const [bookingsRes, providerRes] = await Promise.all([
        nammaApi.getProviderBookings(providerId),
        nammaApi.getProviderById(providerId),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (providerRes.success && providerRes.reviews) setReviews(providerRes.reviews);
      if (providerRes.success && providerRes.provider) {
        updateUserLocally(providerRes.provider);
      }
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to refresh provider orders.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    bookingId: string,
    status: BookingStatus,
    responseNote?: string
  ) => {
    try {
      const res = await nammaApi.updateBookingStatus(bookingId, status, responseNote);
      if (res.success) {
        setActionAlert({ type: 'success', text: `Order #${bookingId} status changed to ${status}.` });
        loadData();
      } else {
        setActionAlert({ type: 'error', text: res.message });
      }
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to update order status.' });
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: provider.id,
          service_name: newServiceName.trim(),
          category: provider.service_category,
          indicative_price: newServicePrice,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionAlert({ type: 'success', text: 'Service listing added!' });
        setShowAddService(false);
        setNewServiceName('');
      }
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to save service listing.' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login/provider');
  };

  const isPending = provider?.verification_status === 'pending';
  const isApproved = provider?.verification_status === 'approved';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <span className="text-slate-600">Availability:</span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-2.5 py-0.5 rounded-lg transition ${
                  isAvailable
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {isAvailable ? 'Online (Accepting Jobs)' : 'Offline'}
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Verification Status Banner */}
        {isPending ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 text-amber-950 shadow-sm flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-sm sm:text-base">
                  Account Verification Status: PENDING ADMINISTRATOR AUDIT
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Your trade credentials and business identity are actively queued for verification by LocalFix Operations Administration.
                Until verified, your listings are hidden from public search to ensure customer safety.
              </p>
              {provider?.verification_notes && (
                <div className="mt-2 text-xs bg-white/70 p-2.5 rounded-xl border border-amber-200 font-medium">
                  <strong>Admin Note:</strong> &quot;{provider.verification_notes}&quot;
                </div>
              )}
            </div>
          </div>
        ) : isApproved ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-emerald-950 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-emerald-950">
                    Official Verified Partner: {provider?.business_name}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                    Active on Marketplace
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {provider?.verification_notes || 'All identity credentials and safety standards verified by Dr. Anand Raman.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-950 shadow-xs flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Account Status: Suspended / Verification Rejected</p>
              <p className="text-xs text-rose-700 mt-0.5">{provider?.verification_notes || 'Please contact administration.'}</p>
            </div>
          </div>
        )}

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

        {/* Provider Profile Summary & Key Metrics */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={provider?.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
              alt={provider?.business_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-300 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">
                  {provider?.business_name || 'SparkWave Electrical Works'}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {provider?.service_category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Owner: {provider?.full_name} • {provider?.experience_years} Years Experience • Base: ₹{provider?.hourly_rate}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {provider?.phone_number}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {provider?.service_area}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center">
            <div className="p-2">
              <p className="text-2xl font-black text-slate-900">{provider?.completed_jobs || 0}</p>
              <p className="text-[11px] text-slate-500 font-semibold">Jobs Completed</p>
            </div>
            <div className="p-2">
              <p className="text-2xl font-black text-amber-500">
                ★ {provider?.rating > 0 ? provider.rating : '4.9'}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">Genuine Rating</p>
            </div>
            <div className="p-2">
              <p className="text-2xl font-black text-emerald-600">
                ₹{((provider?.completed_jobs || 142) * provider?.hourly_rate).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold">Gross Value</p>
            </div>
          </div>
        </div>

        {/* Incoming Orders & Job Status Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Incoming & Active Service Bookings
              </h2>
              <p className="text-xs text-slate-500">
                Respond to customer requests and keep dispatch status updated.
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No bookings scheduled currently</p>
              <p className="text-xs text-slate-400 mt-1">
                When residents in {provider?.service_area} submit bookings, they will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-500">#{job.id}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{job.service_description}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          job.booking_status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : job.booking_status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : job.booking_status === 'Accepted'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : job.booking_status === 'Rejected' || job.booking_status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}
                      >
                        {job.booking_status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Customer: <span className="font-semibold text-slate-900">{job.customer_name}</span> ({job.customer_phone})
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {job.preferred_date} at {job.preferred_time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.service_location}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">₹{job.indicative_price}</span>
                    </div>

                    {job.customer_notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Customer Note:</span> {job.customer_notes}
                      </p>
                    )}
                  </div>

                  {/* Provider Actions based on current status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {job.booking_status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'Accepted', 'Order accepted. Will arrive on time.')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(job.id, 'Rejected', 'Currently unavailable for selected hour.')}
                          className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {job.booking_status === 'Accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'In Progress', 'Technician on the way with repair kit.')}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                      >
                        Start Job (In Progress)
                      </button>
                    )}

                    {job.booking_status === 'In Progress' && (
                      <button
                        onClick={() => handleUpdateStatus(job.id, 'Completed', 'Work completed and customer verified.')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Job Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Genuine Customer Reviews ({reviews.length})
            </h3>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{r.customer_name}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">&quot;{r.review_text}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
