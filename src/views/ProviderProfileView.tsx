import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { TIME_SLOTS } from '../lib/constants';
import { formatCurrency } from '../lib/currency';
import { ProviderProfile, Review, ServiceItem } from '../types';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Heart,
  ChevronRight,
  Phone,
  Mail,
  AlertCircle,
} from 'lucide-react';

export const ProviderProfileView: React.FC = () => {
  const {
    selectedProviderId,
    navigate,
    setBookingDraft,
    favorites,
    toggleFavorite,
    showToast,
  } = useApp();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Booking picker state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-27');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [checkingSlots, setCheckingSlots] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfile() {
      if (!selectedProviderId) return;
      try {
        setLoading(true);
        const data = await api.getProviderById(selectedProviderId);
        setProvider(data.provider);
        setServices(data.services);
        setReviews(data.reviews);
        if (data.services.length > 0) {
          setSelectedServiceId(data.services[0].id);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [selectedProviderId]);

  // Check booked slots whenever date or provider changes
  useEffect(() => {
    async function checkSlots() {
      if (!selectedProviderId || !selectedDate) return;
      try {
        setCheckingSlots(true);
        const res = await api.checkAvailability(selectedProviderId, selectedDate);
        setBookedSlots(res.bookedSlots || []);
      } catch (err) {
        console.error('Availability check failed:', err);
      } finally {
        setCheckingSlots(false);
      }
    }
    checkSlots();
  }, [selectedProviderId, selectedDate]);

  if (loading || !provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading provider profile...
      </div>
    );
  }

  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleStartBooking = () => {
    if (!activeService) {
      showToast('Please select a service from the catalog', 'error');
      return;
    }
    if (bookedSlots.includes(selectedSlot)) {
      showToast('This time slot is already booked for this provider. Please select another slot.', 'error');
      return;
    }

    setBookingDraft({
      provider,
      service: activeService,
      date: selectedDate,
      timeSlot: selectedSlot,
    });
    navigate('booking-checkout');
  };

  // Next 7 days helper
  const dateOptions = [
    { label: 'Tomorrow, Oct 26', value: '2026-10-26' },
    { label: 'Tue, Oct 27', value: '2026-10-27' },
    { label: 'Wed, Oct 28', value: '2026-10-28' },
    { label: 'Thu, Oct 29', value: '2026-10-29' },
    { label: 'Fri, Oct 30', value: '2026-10-30' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => navigate('search')}
          className="hover:text-slate-800 cursor-pointer"
        >
          Specialists
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-medium">{provider.name}</span>
      </div>

      {/* Hero Banner / Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row gap-8 justify-between">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {provider.name}
              </h1>
              {provider.verificationStatus === 'verified' && (
                <span className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Verified Professional</span>
                </span>
              )}
            </div>

            <div className="text-sm font-semibold text-slate-700">
              {provider.businessName} · {provider.primaryCategory}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1 text-amber-600 font-bold tabular-nums">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{provider.rating.toFixed(2)}</span>
                <span className="text-slate-400 font-normal">
                  ({provider.reviewCount} verified reviews)
                </span>
              </div>
              <span>·</span>
              <span className="font-medium text-slate-700">
                {provider.experienceYears} Years Experience
              </span>
              <span>·</span>
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {provider.workingHours.start} - {provider.workingHours.end} (
                  {provider.workingHours.days.join(', ')})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Service Areas: {provider.serviceAreas.join(', ')} ({provider.city})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl pt-1">
              {provider.bio}
            </p>
          </div>
        </div>

        {/* Favorite & Direct Contact */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
          <button
            type="button"
            onClick={() => toggleFavorite(provider.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                favorites.has(provider.id) ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>{favorites.has(provider.id) ? 'Saved' : 'Save Pro'}</span>
          </button>

          <div className="text-right">
            <div className="text-[11px] text-slate-400">Starting from</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(provider.startingPricePaise)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Catalog Left, Interactive Booking Schedule Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Services & Reviews */}
        <div className="lg:col-span-7 space-y-10">
          {/* Service Price Catalog */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Services Offered & Pricing
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select a service to configure your booking slot on the right.
              </p>
            </div>

            <div className="space-y-3">
              {services.map((item) => {
                const isSelected = item.id === selectedServiceId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedServiceId(item.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {item.name}
                        </span>
                        {item.popular && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Approx. {item.durationMinutes} minutes</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-slate-900 tabular-nums">
                        {formatCurrency(item.pricePaise)}
                      </div>
                      <div
                        className={`text-xs font-semibold mt-1 ${
                          isSelected ? 'text-teal-700' : 'text-slate-400'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certifications & Badges */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Licenses & Validated Certifications</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {provider.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Customer Reviews ({reviews.length})
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1 text-amber-600 font-bold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{provider.rating.toFixed(2)} rating</span>
                  </span>
                  <span>·</span>
                  <span>100% Verified Completed Bookings</span>
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No reviews yet for this professional.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">{rev.customerName}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    <div className="text-slate-500 text-[11px]">{rev.serviceName}</div>

                    <p className="text-slate-700 leading-relaxed pt-1">{rev.comment}</p>

                    {rev.providerReply && (
                      <div className="mt-2 pl-3 border-l-2 border-teal-500 text-slate-600 text-[11px]">
                        <span className="font-semibold text-slate-800">
                          Response from {provider.name}:
                        </span>{' '}
                        {rev.providerReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Booking Box */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Schedule Service with {provider.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred date & time slot. Double-booking check runs instantly.
              </p>
            </div>

            {/* Selected Service Card */}
            {activeService && (
              <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs space-y-1">
                <div className="text-slate-500">Selected Service:</div>
                <div className="font-bold text-slate-900 text-sm">{activeService.name}</div>
                <div className="flex items-center justify-between text-teal-800 font-semibold pt-1">
                  <span>Price: {formatCurrency(activeService.pricePaise)}</span>
                  <span>~{activeService.durationMinutes} mins</span>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Select Appointment Date</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedDate(opt.value)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedDate === opt.value
                        ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Select Available Time Slot</span>
                {checkingSlots && (
                  <span className="text-[11px] text-teal-600 animate-pulse ml-auto">
                    Checking...
                  </span>
                )}
              </label>

              <div className="grid grid-cols-1 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedSlot === slot && !isBooked;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors ${
                        isBooked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white cursor-pointer'
                      }`}
                    >
                      <span>{slot}</span>
                      <span className="text-[10px]">
                        {isBooked ? 'Slot Booked' : isSelected ? 'Selected' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {bookedSlots.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Strikethrough slots are occupied to prevent double-booking.
                  </span>
                </div>
              )}
            </div>

            {/* Proceed CTA */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={handleStartBooking}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Proceed to Booking & Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Zero cancellation fee up to 2 hours prior</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
