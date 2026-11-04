import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { calculateBookingBreakdown, formatCurrency } from '../lib/currency';
import { CustomerAddress } from '../types';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';

export const BookingCheckoutView: React.FC = () => {
  const {
    bookingDraft,
    currentUser,
    customerAddress,
    setCustomerAddress,
    navigate,
    setConfirmedBookingId,
    showToast,
  } = useApp();

  const [address, setAddress] = useState<CustomerAddress>({ ...customerAddress });
  const [problemDescription, setProblemDescription] = useState<string>(
    'Please inspect and resolve the issue. The main switchboard or pipe requires immediate check.'
  );
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'upi' | 'card'>('cash_on_delivery');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!bookingDraft) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">No Service Selected</h2>
        <p className="text-xs text-slate-500">
          Please select a service provider and time slot before heading to checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate('search')}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors"
        >
          Browse Specialists
        </button>
      </div>
    );
  }

  const { provider, service, date, timeSlot } = bookingDraft;
  const breakdown = calculateBookingBreakdown(
    service.pricePaise,
    0,
    provider.commissionRatePercent || 12
  );

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!problemDescription.trim()) {
      setErrorMessage('Please describe the issue or service requirements.');
      return;
    }

    if (!address.street.trim() || !address.area.trim()) {
      setErrorMessage('Please provide a complete service address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createBooking({
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        providerId: provider.id,
        serviceId: service.id,
        date,
        timeSlot,
        address,
        problemDescription,
        paymentMethod,
        addOnsPricePaise: 0,
      });

      // Save updated address
      setCustomerAddress(address);
      setConfirmedBookingId(res.booking.id);
      showToast('Booking successfully confirmed!', 'success');
      navigate('booking-confirmed', { bookingId: res.booking.id });
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setErrorMessage(
        err.message || 'Failed to place booking. Please check availability and try again.'
      );
      showToast(err.message || 'Booking submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('provider-detail', { providerId: provider.id })}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to {provider.name}'s Profile</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Review & Confirm Booking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verify appointment details, address, and select your payment preference.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Address Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Service & Provider Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Selected Service & Professional
            </div>
            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Assigned Pro: <span className="font-semibold text-slate-800">{provider.name}</span> ({provider.businessName})
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {formatCurrency(service.pricePaise)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Date: <strong className="font-semibold">{date}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Slot: <strong className="font-semibold">{timeSlot}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Service Address */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Service Address</span>
              </div>
              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                {address.label}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Flat / House / Street Address
                </label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="e.g. Flat 4B, Emerald Heights, 2nd Avenue"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Neighborhood / Area
                  </label>
                  <input
                    type="text"
                    value={address.area}
                    onChange={(e) => setAddress({ ...address, area: e.target.value })}
                    placeholder="e.g. Anna Nagar"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Describe the Problem or Instructions for Technician
            </label>
            <p className="text-[11px] text-slate-500">
              Mention specific symptoms, brand of appliance or equipment, or parts needed.
            </p>
            <textarea
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="e.g. The AC blower isn't circulating cold air and makes a slight vibrating hum..."
              required
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 leading-relaxed"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Payment Method
            </div>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-teal-600 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="mt-0.5 accent-teal-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-teal-600" />
                    <span>Pay After Job Completion (Cash / UPI QR)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Inspect the work first. Pay the technician via cash or UPI directly once satisfied.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  paymentMethod === 'upi'
                    ? 'border-teal-600 bg-teal-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="mt-0.5 accent-teal-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span>Instant Digital Payment (Simulated UPI / Cards)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Fast checkout with simulated gateway approval. Fully refundable under 30-day warranty.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Price Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Price Details & Invoice Breakdown
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Base Service Labor</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(breakdown.baseServicePaise)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>Platform Trust & Safety Fee</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(breakdown.platformFeePaise)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Taxes (18% GST on platform fee)</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(breakdown.taxesPaise)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="font-extrabold text-teal-700 text-lg tabular-nums">
                  {formatCurrency(breakdown.totalAmountPaise)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>LocalFix Buyer Assurance</span>
              </div>
              <p>
                Money stays protected until you verify service completion. Includes 30-day rework warranty.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Confirming Appointment...' : 'Confirm Service Booking'}</span>
            </button>

            <div className="text-[10px] text-slate-400 text-center leading-normal">
              By confirming, you agree to LocalFix Terms of Service and Cancellation Policy.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
