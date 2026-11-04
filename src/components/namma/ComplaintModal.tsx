import React, { useState } from 'react';
import { X, AlertCircle, ShieldAlert } from 'lucide-react';
import { Booking } from '../../types/nammaservices';
import { nammaApi } from '../../services/api';

interface ComplaintModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ booking, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your issue or grievance in detail.');
      return;
    }

    setLoading(true);
    try {
      const res = await nammaApi.createComplaint({
        booking_id: booking.id,
        customer_id: booking.customer_id,
        provider_id: booking.provider_id,
        complaint_description: description.trim(),
        customer_name: booking.customer_name,
        provider_business_name: booking.provider_business_name,
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to file grievance.');
      }
    } catch {
      setError('Network communication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h3 className="text-lg font-bold text-slate-900">Raise Grievance / Complaint</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Order #{booking.id} • Provider: {booking.provider_business_name}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Description & Grievance Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what went wrong (e.g. billing dispute, delay, incomplete service, or missing receipts). Admin operations staff inspect every complaint."
              required
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60"
          >
            {loading ? 'Filing Complaint...' : 'Submit Grievance to Platform Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};
