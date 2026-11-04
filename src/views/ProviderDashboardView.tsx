import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/currency';
import { Booking, BookingStatus, ProviderProfile, SubscriptionPlan } from '../types';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
  XCircle,
  Truck,
  Wrench,
  Check,
  Crown,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from 'lucide-react';

export const ProviderDashboardView: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAcceptingJobs, setIsAcceptingJobs] = useState<boolean>(true);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'jobs' | 'earnings' | 'plans' | 'profile'>('jobs');

  const providerId = 'prov_rajesh_elec'; // Rajesh Demo Provider

  useEffect(() => {
    async function loadProviderData() {
      try {
        setLoading(true);
        const [provData, bks, subPlans] = await Promise.all([
          api.getProviderById(providerId),
          api.getBookings({ providerId }),
          api.getSubscriptionPlans(),
        ]);
        setProvider(provData.provider);
        setBookings(bks);
        setPlans(subPlans);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProviderData();
  }, [providerId]);

  const handleUpdateStatus = async (bookingId: string, nextStatus: BookingStatus, note?: string) => {
    try {
      const res = await api.updateBookingStatus(
        bookingId,
        nextStatus,
        note || `Provider updated status to ${nextStatus}`,
        'Provider'
      );
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? res.booking : b))
      );
      showToast(`Job status updated to ${nextStatus.replace(/_/g, ' ')}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      const res = await api.subscribePlan(providerId, planId);
      setProvider(res.provider);
      showToast(`Subscription plan upgraded! Commission now ${res.provider.commissionRatePercent}%`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Subscription failed', 'error');
    }
  };

  if (loading || !provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Loading provider operations console...
      </div>
    );
  }

  // Earnings calculations
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const grossEarningsPaise = completedBookings.reduce((sum, b) => sum + b.servicePricePaise, 0);
  const commissionDeductedPaise = completedBookings.reduce((sum, b) => sum + b.commissionAmountPaise, 0);
  const netPayoutPaise = grossEarningsPaise - commissionDeductedPaise;

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeJobs = bookings.filter(
    (b) => ['accepted', 'on_the_way', 'in_progress'].includes(b.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Profile & Operations Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border-2 border-teal-600 shrink-0">
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                Certified Service Partner
              </span>
              <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Tier: {provider.subscriptionTier.toUpperCase()} ({provider.commissionRatePercent}% Commission)
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              {provider.name} ({provider.businessName})
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{provider.primaryCategory}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-600 font-bold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{provider.rating.toFixed(2)} rating</span>
              </span>
              <span>·</span>
              <span>Lead Credits: {provider.leadCredits} balance</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">
              {isAcceptingJobs ? 'Accepting Jobs' : 'On Break'}
            </div>
            <div className="text-[11px] text-slate-500">Live booking dispatch</div>
          </div>

          <button
            type="button"
            onClick={() => setIsAcceptingJobs(!isAcceptingJobs)}
            className="text-teal-600 cursor-pointer"
            aria-label="Toggle availability"
          >
            {isAcceptingJobs ? (
              <ToggleRight className="w-8 h-8 text-teal-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Gross Bookings</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(grossEarningsPaise)}
          </div>
          <div className="text-[11px] text-slate-400">Total service charges billed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Platform Commission</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            -{formatCurrency(commissionDeductedPaise)}
          </div>
          <div className="text-[11px] text-slate-400">
            Deducted at {provider.commissionRatePercent}% partner rate
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Net Payout to Bank</div>
          <div className="text-2xl font-bold text-teal-700 tabular-nums">
            {formatCurrency(netPayoutPaise)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            Direct 24-hr NEFT settlement
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Completed Jobs</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {completedBookings.length}
          </div>
          <div className="text-[11px] text-slate-400">
            {provider.reviewCount} customer reviews
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Job Dispatch & Active ({pendingRequests.length + activeJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Subscription & Commission Tier ({provider.subscriptionTier.toUpperCase()})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'earnings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Earnings & Completed Ledger ({completedBookings.length})
        </button>
      </div>

      {/* Tab: Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-8">
          {/* Incoming Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-base font-bold text-slate-900">
                  New Customer Requests Awaiting Acceptance ({pendingRequests.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl border-2 border-amber-300 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Order #{b.orderNumber}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {b.serviceName}
                        </h4>
                        <div className="text-xs text-slate-500">
                          Customer: {b.customerName}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-slate-900 tabular-nums">
                          {formatCurrency(b.servicePricePaise)}
                        </div>
                        <div className="text-[10px] text-slate-400">Service Fee</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Date: <strong>{b.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Slot: <strong>{b.timeSlot}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Area: <strong>{b.address.area}, {b.address.city}</strong></span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-amber-50/50 p-2.5 rounded border border-amber-100">
                      <strong>Problem Notes:</strong> {b.problemDescription}
                    </div>

                    {/* Accept / Reject CTAs */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(
                            b.id,
                            'cancelled',
                            'Declined by provider due to scheduling overlap'
                          )
                        }
                        className="py-2 px-3 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer text-center"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateStatus(
                            b.id,
                            'accepted',
                            'Accepted by provider. Preparing tools.'
                          )
                        }
                        className="py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer text-center shadow-sm"
                      >
                        Accept Booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Work In Progress */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Active Confirmed Jobs ({activeJobs.length})
            </h3>

            {activeJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                No active jobs currently in progress.
              </div>
            ) : (
              activeJobs.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          Order #{b.orderNumber}
                        </span>
                        <span className="text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full capitalize">
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {b.serviceName} · Customer: {b.customerName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-teal-700 tabular-nums">
                        {formatCurrency(b.servicePricePaise)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Commission: -{formatCurrency(b.commissionAmountPaise)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Contact & Address (Unmasked for active jobs) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="space-y-2">
                      <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                        Customer & Contact
                      </div>
                      <div className="font-semibold text-slate-800">{b.customerName}</div>
                      <div className="flex items-center gap-1.5 text-teal-800 font-bold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{b.customerPhone}</span>
                      </div>
                      <div className="text-slate-600">
                        Notes: {b.problemDescription}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                        Scheduled Destination
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {b.address.street}, {b.address.area}
                          </div>
                          <div className="text-slate-500">
                            {b.address.city} - {b.address.pincode}
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-600">
                        Slot: {b.date} ({b.timeSlot})
                      </div>
                    </div>
                  </div>

                  {/* Progressive Status Stepper Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-500">
                      Update live status for customer tracking:
                    </span>

                    <div className="flex items-center gap-2">
                      {b.status === 'accepted' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              b.id,
                              'on_the_way',
                              'Technician is on the way to your address.'
                            )
                          }
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Mark On The Way</span>
                        </button>
                      )}

                      {b.status === 'on_the_way' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              b.id,
                              'in_progress',
                              'Technician has arrived and begun the inspection/work.'
                            )
                          }
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Mark In Progress / Arrived</span>
                        </button>
                      )}

                      {b.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(
                              b.id,
                              'completed',
                              'Work completed successfully. Customer inspection satisfied.'
                            )
                          }
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Job Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Plans & Commission */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Provider Subscription Tiers & Lower Commission Rates
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose a monthly partner plan to reduce platform commission from 15% down to 5% and unlock featured placement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isCurrent = provider.subscriptionTier === p.tier;
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative ${
                    isCurrent
                      ? 'border-2 border-teal-600 bg-teal-50/20 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-6 bg-teal-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Current Active Plan
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">{p.name}</h4>
                      {p.tier === 'enterprise' && (
                        <Crown className="w-5 h-5 text-amber-500" />
                      )}
                    </div>

                    <div>
                      <div className="text-2xl font-black text-slate-900 tabular-nums">
                        {p.priceMonthlyPaise === 0
                          ? 'Free'
                          : `${formatCurrency(p.priceMonthlyPaise)} / mo`}
                      </div>
                      <div className="text-xs font-semibold text-teal-700 mt-1">
                        Commission: {p.commissionRatePercent}% per booking
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      {p.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    {isCurrent ? (
                      <div className="w-full py-2.5 bg-teal-100 text-teal-800 font-bold text-xs rounded-xl text-center">
                        Active Membership
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpgradePlan(p.id)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                      >
                        Switch to {p.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Earnings Ledger */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Completed Service Settlement Ledger
          </h3>

          {completedBookings.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center">
              No completed services yet to settle.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5">Order</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Service</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5 text-right">Gross (₹)</th>
                    <th className="py-2.5 text-right">Commission ({provider.commissionRatePercent}%)</th>
                    <th className="py-2.5 text-right">Net Payout (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-900">#{b.orderNumber}</td>
                      <td className="py-3 text-slate-500">{b.date}</td>
                      <td className="py-3 text-slate-800">{b.serviceName}</td>
                      <td className="py-3 text-slate-600">{b.customerName}</td>
                      <td className="py-3 text-right tabular-nums text-slate-900">
                        {formatCurrency(b.servicePricePaise)}
                      </td>
                      <td className="py-3 text-right tabular-nums text-rose-600">
                        -{formatCurrency(b.commissionAmountPaise)}
                      </td>
                      <td className="py-3 text-right tabular-nums font-bold text-teal-700">
                        {formatCurrency(b.servicePricePaise - b.commissionAmountPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
