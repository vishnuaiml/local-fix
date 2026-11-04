import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/currency';
import { Booking, ProviderProfile } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Heart,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Phone,
  ThumbsUp,
} from 'lucide-react';

export const CustomerDashboardView: React.FC = () => {
  const {
    currentUser,
    navigate,
    setConfirmedBookingId,
    customerAddress,
    favorites,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'favorites' | 'profile'>('active');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favoritePros, setFavoritePros] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    async function loadCustomerData() {
      try {
        setLoading(true);
        const [bks, pros] = await Promise.all([
          api.getBookings({ customerId: currentUser.id }),
          api.getProviders({}),
        ]);
        setBookings(bks);

        const favs = pros.filter((p) => favorites.has(p.id));
        setFavoritePros(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerData();
  }, [currentUser.id, favorites]);

  const activeBookings = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const handleOpenReview = (b: Booking) => {
    setReviewBooking(b);
    setRating(5);
    setComment('Excellent work. Very professional, polite and arrived on time.');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    try {
      setSubmittingReview(true);
      await api.submitReview({
        bookingId: reviewBooking.id,
        rating,
        comment,
        customerName: currentUser.name,
        customerCity: `${reviewBooking.address.city} (${reviewBooking.address.area})`,
      });

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === reviewBooking.id ? { ...b, ratingSubmitted: true } : b))
      );
      setReviewBooking(null);
      showToast('Thank you! Your verified rating and review has been published.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleConfirmCompletion = async (bookingId: string) => {
    try {
      const res = await api.updateBookingStatus(
        bookingId,
        'completed',
        'Customer confirmed service satisfaction and job completion.',
        'Customer'
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? res.booking : b))
      );
      showToast('Service marked as completed! You can now rate your experience.', 'success');
      handleOpenReview(res.booking);
    } catch (err: any) {
      showToast(err.message || 'Completion confirmation failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-50 border-2 border-teal-600 shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
              Customer Account
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{currentUser.name}</h1>
            <div className="text-xs text-slate-500 mt-0.5">
              {currentUser.email} · {currentUser.phone} · {currentUser.city}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('search')}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm whitespace-nowrap"
        >
          Book New Service
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'active'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Active Bookings ({activeBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Booking History & Invoices ({pastBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'favorites'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Saved Specialists ({favoritePros.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Saved Addresses & Details
        </button>
      </div>

      {/* Tab 1: Active Bookings */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No active bookings right now</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need a plumber, electrician, or AC cleaner? Explore top verified professionals in your neighborhood.
              </p>
              <button
                type="button"
                onClick={() => navigate('search')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
              >
                Find Specialists
              </button>
            </div>
          ) : (
            activeBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">
                        Order #{b.orderNumber}
                      </span>
                      <span className="text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full capitalize">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {b.serviceName} · Booked with {b.providerName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatCurrency(b.totalAmountPaise)}
                    </div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {b.paymentMethod.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>

                {/* Status Stepper */}
                <div className="py-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Live Booking Journey
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div
                      className={`p-2 rounded-lg font-medium ${
                        ['pending', 'accepted', 'on_the_way', 'in_progress', 'completed'].includes(b.status)
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      1. Requested
                    </div>
                    <div
                      className={`p-2 rounded-lg font-medium ${
                        ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(b.status)
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      2. Confirmed
                    </div>
                    <div
                      className={`p-2 rounded-lg font-medium ${
                        ['on_the_way', 'in_progress', 'completed'].includes(b.status)
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      3. On The Way
                    </div>
                    <div
                      className={`p-2 rounded-lg font-medium ${
                        ['in_progress', 'completed'].includes(b.status)
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      4. In Progress
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      Date: <strong className="text-slate-900">{b.date}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      Slot: <strong className="text-slate-900">{b.timeSlot}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      Pro Mobile: <strong className="text-slate-900">{b.providerPhone}</strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedBookingId(b.id);
                      navigate('booking-confirmed', { bookingId: b.id });
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-teal-600 flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Full Invoice & Manage Slot</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {b.status === 'in_progress' || b.status === 'accepted' || b.status === 'on_the_way' ? (
                      <button
                        type="button"
                        onClick={() => handleConfirmCompletion(b.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                      >
                        Confirm Job Completed
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Past Bookings & Invoices */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {pastBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              No completed or past bookings found.
            </div>
          ) : (
            pastBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      #{b.orderNumber} · {b.serviceName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        b.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Technician: {b.providerName} · Date: {b.date} ({b.timeSlot})
                  </div>
                  <div className="text-xs text-slate-600">
                    Location: {b.address.street}, {b.address.area}, {b.address.city}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatCurrency(b.totalAmountPaise)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      Payment Settled
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'completed' && !b.ratingSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleOpenReview(b)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    {b.ratingSubmitted && (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reviewed</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedBookingId(b.id);
                        navigate('booking-confirmed', { bookingId: b.id });
                      }}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Invoice Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Favorites */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favoritePros.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              You haven't saved any service professionals yet. Click the heart icon on any pro profile to save them here.
            </div>
          ) : (
            favoritePros.map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={pro.avatarUrl}
                    alt={pro.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{pro.name}</h4>
                    <div className="text-xs text-slate-500">{pro.businessName} · {pro.primaryCategory}</div>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{pro.rating.toFixed(2)} ({pro.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('provider-detail', { providerId: pro.id })}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Book Pro
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Profile & Addresses */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Saved Default Service Address
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{customerAddress.label} Address</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                Default
              </span>
            </div>
            <div className="text-slate-700 leading-relaxed">
              {customerAddress.street}, {customerAddress.area}
            </div>
            <div className="text-slate-500">
              {customerAddress.city} - {customerAddress.pincode}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Service Completion Review
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Rate {reviewBooking.providerName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                For {reviewBooking.serviceName} on {reviewBooking.date}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star rating selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Overall Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-slate-800">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Written feedback */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Comments
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the technician's punctuality, work quality, cleanliness, and fairness of price..."
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
