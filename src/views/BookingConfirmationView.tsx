import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { TIME_SLOTS } from '../lib/constants';
import { formatCurrency } from '../lib/currency';
import { Booking } from '../types';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Printer,
  CalendarClock,
  XCircle,
  ShieldCheck,
  ChevronRight,
  FileText,
} from 'lucide-react';

export const BookingConfirmationView: React.FC = () => {
  const { confirmedBookingId, navigate, showToast } = useApp();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Reschedule Modal
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState('2026-10-28');
  const [newSlot, setNewSlot] = useState('02:00 PM - 04:00 PM');
  const [rescheduleReason, setRescheduleReason] = useState('Change of personal schedule');

  // Cancel Modal
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Problem already solved');

  useEffect(() => {
    async function loadBooking() {
      if (!confirmedBookingId) return;
      try {
        setLoading(true);
        const data = await api.getBookingById(confirmedBookingId);
        setBooking(data.booking);
        setHistory(data.history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [confirmedBookingId]);

  if (loading || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Retrieving booking receipt...
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.rescheduleBooking(booking.id, newDate, newSlot, rescheduleReason);
      setBooking(res.booking);
      setIsRescheduleOpen(false);
      showToast('Booking successfully rescheduled!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Reschedule failed', 'error');
    }
  };

  const handleCancelBooking = async () => {
    try {
      const res = await api.updateBookingStatus(
        booking.id,
        'cancelled',
        `Cancelled by customer. Reason: ${cancelReason}`,
        'Customer'
      );
      setBooking(res.booking);
      setIsCancelOpen(false);
      showToast('Booking has been cancelled.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Booking Placed Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Order #{booking.orderNumber}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Your appointment request has been scheduled. The technician will verify and arrive at your location.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
          <span>Current Status:</span>
          <strong className="capitalize text-teal-800 font-bold">{booking.status}</strong>
        </div>
      </div>

      {/* Appointment & Technician Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheduled Slot & Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Schedule & Destination
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Appointment Date: <strong className="font-semibold text-slate-900">{booking.date}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Time Window: <strong className="font-semibold text-slate-900">{booking.timeSlot}</strong>
              </span>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-900">
                  {booking.address.street}, {booking.address.area}
                </div>
                <div className="text-slate-500">
                  {booking.address.city} - {booking.address.pincode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Contact */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Assigned Service Specialist
          </h3>

          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-900 text-sm">{booking.providerName}</div>
            <div className="text-slate-500">Category: {booking.categoryName}</div>

            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Direct Mobile: {booking.providerPhone}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-teal-700 bg-teal-50 p-2 rounded-lg">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Identity & background verified technician</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Printable Invoice */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-teal-600 text-white font-black text-xs flex items-center justify-center">
                L
              </span>
              <span className="font-bold text-base text-slate-900">LocalFix Tax Invoice</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Invoice ID: INV-{booking.orderNumber} · GSTIN: 33AAAAA0000A1Z5
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Duration</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-semibold text-slate-900">
                  {booking.serviceName}
                  <div className="text-[11px] text-slate-400 font-normal">
                    {booking.problemDescription}
                  </div>
                </td>
                <td className="py-3 text-right text-slate-500">~60 mins</td>
                <td className="py-3 text-right font-medium text-slate-900 tabular-nums">
                  {formatCurrency(booking.servicePricePaise)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-600">Platform Trust & Convenience Fee</td>
                <td className="py-2 text-right text-slate-400">-</td>
                <td className="py-2 text-right text-slate-700 tabular-nums">
                  {formatCurrency(booking.platformFeePaise)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-slate-600">Integrated GST (18%)</td>
                <td className="py-2 text-right text-slate-400">-</td>
                <td className="py-2 text-right text-slate-700 tabular-nums">
                  {formatCurrency(booking.taxesPaise)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                <td className="py-3" colSpan={2}>
                  Total Paid / Payable ({booking.paymentMethod.replace(/_/g, ' ').toUpperCase()})
                </td>
                <td className="py-3 text-right text-teal-700 tabular-nums">
                  {formatCurrency(booking.totalAmountPaise)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Bar (Reschedule, Cancel, Customer Dashboard) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <div className="flex items-center gap-3">
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <>
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <CalendarClock className="w-3.5 h-3.5 text-teal-600" />
                <span>Reschedule Slot</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCancelOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Booking</span>
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('customer-dashboard')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          View in My Customer Dashboard
        </button>
      </div>

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reschedule Appointment #{booking.orderNumber}
            </h3>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Choose New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Choose New Time Slot
                </label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Need to step out, reschedule to evening"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-rose-700">
              Cancel Appointment #{booking.orderNumber}?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this booking? If you paid online, 100% of the amount will be reversed to your original payment method.
            </p>

            <div className="text-xs space-y-2">
              <label className="block font-semibold text-slate-700">Cancellation Reason</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsCancelOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
