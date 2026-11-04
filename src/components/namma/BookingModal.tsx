import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Provider } from '../../types/nammaservices';
import { useNammaAuth } from '../../context/NammaAuthContext';
import { nammaApi } from '../../services/api';

interface BookingModalProps {
  provider: Provider;
  onClose: () => void;
  onBookingSuccess: (bookingId: string) => void;
}

const TIME_SLOTS = [
  '09:00 AM - 10:30 AM',
  '10:30 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const BookingModal: React.FC<BookingModalProps> = ({ provider, onClose, onBookingSuccess }) => {
  const { user } = useNammaAuth();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [serviceDescription, setServiceDescription] = useState(
    `Standard ${provider.service_category} inspection and repair service`
  );
  const [serviceLocation, setServiceLocation] = useState(
    (user as any)?.address || ''
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !time || !serviceDescription.trim() || !serviceLocation.trim()) {
      setError('Please fill in all booking requirement fields.');
      return;
    }

    if (!user) {
      setError('Please sign in to your customer account before booking a service.');
      return;
    }

    const customerId = user.id;

    setLoading(true);
    try {
      const res = await nammaApi.createBooking({
        customer_id: customerId,
        provider_id: provider.id,
        service_description: serviceDescription.trim(),
        service_location: serviceLocation.trim(),
        preferred_date: date,
        preferred_time: time,
        customer_notes: customerNotes.trim(),
        indicative_price: provider.hourly_rate,
      });

      if (res.success && res.booking) {
        onBookingSuccess(res.booking.id);
      } else {
        setError(res.message || 'Unable to schedule booking.');
      }
    } catch {
      setError('Network communication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <img
            src={provider.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80'}
            alt={provider.business_name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {provider.service_category}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mt-1">
              {provider.business_name}
            </h3>
            <p className="text-xs text-slate-500">
              Provider: {provider.full_name} • Base Rate: ₹{provider.hourly_rate}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Service / Work Scope <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="e.g. Switchboard repair, tap fixing, water tank cleaning"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Preferred Date <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Available Time Slot <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Location / Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Service Address / Locality in {provider.service_area} <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              rows={2}
              value={serviceLocation}
              onChange={(e) => setServiceLocation(e.target.value)}
              placeholder="House/Flat No., Street, Landmark, Locality"
              required
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
            />
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Problem Notes & Details (Optional)
            </label>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Please bring 16A modular switch and test pen"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Price Transparency Callout */}
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-blue-950">Indicative Base Service Charge</p>
              <p className="text-[11px] text-blue-700">Actual cost may vary based on spare parts</p>
            </div>
            <span className="text-lg font-black text-blue-700">₹{provider.hourly_rate}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Request to {provider.full_name}...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Confirm & Send Booking Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
