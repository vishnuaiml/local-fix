import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/currency';
import { AdminMetrics, Booking, PlatformComplaint, ProviderProfile } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  Sliders,
  DollarSign,
  Search,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { role, openAuthModal, navigate, showToast } = useApp();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<PlatformComplaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Commission rate edit
  const [commissionRate, setCommissionRate] = useState<number>(12);
  const [savingRate, setSavingRate] = useState<boolean>(false);

  // Active admin tab
  const [adminTab, setAdminTab] = useState<'verification' | 'complaints' | 'bookings' | 'settings'>('verification');

  // Verify modal state
  const [selectedApplicant, setSelectedApplicant] = useState<ProviderProfile | null>(null);
  const [verificationNote, setVerificationNote] = useState<string>('Documents validated against state trade registry.');

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [met, pros, bks, comps] = await Promise.all([
          api.getAdminMetrics(),
          api.getProviders({}),
          api.getBookings({}),
          api.getComplaints(),
        ]);
        setMetrics(met);
        setCommissionRate(met.defaultCommissionPercent);
        setProviders(pros);
        setBookings(bks);
        setComplaints(comps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingRate(true);
      const res = await api.updateCommissionRate(commissionRate);
      showToast(res.message, 'success');
      if (metrics) {
        setMetrics({ ...metrics, defaultCommissionPercent: res.defaultCommissionRatePercent });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update commission rate', 'error');
    } finally {
      setSavingRate(false);
    }
  };

  const handleVerifyProvider = async (providerId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await api.verifyProvider(providerId, status, verificationNote);
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? res.provider : p))
      );
      setSelectedApplicant(null);
      showToast(`Provider application status updated to ${status}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Verification update failed', 'error');
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    try {
      const res = await api.resolveComplaint(
        complaintId,
        'Investigation completed by platform operations. Resolution confirmed with customer.'
      );
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? res.complaint : c))
      );
      showToast('Complaint marked as resolved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve complaint', 'error');
    }
  };

  // Strict Protected Admin Access Gate
  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Protected Admin Console</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Access to this dashboard is strictly restricted to platform operations personnel.
          Customer registration accounts cannot choose or access administrator privileges.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
          >
            Sign In with Administrator Credentials
          </button>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Return to Marketplace Home
          </button>
        </div>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Loading administrator dashboard...
      </div>
    );
  }

  const pendingApplicants = providers.filter((p) => p.verificationStatus === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Operations & Trust Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            LocalFix Admin Control Room
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform health, provider verification approvals, financial commission rates, and dispute resolution.
          </p>
        </div>

        <div className="bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Platform Administrator Level Access</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Gross Merchandise Value (GMV)</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {formatCurrency(metrics.gmvPaise)}
          </div>
          <div className="text-[11px] text-slate-400">Total customer spend billed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Platform Net Revenue</div>
          <div className="text-2xl font-black text-teal-700 tabular-nums">
            {formatCurrency(metrics.platformRevenuePaise)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            Commissions + platform fees
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Total Bookings</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {metrics.totalBookings}
          </div>
          <div className="text-[11px] text-slate-400">
            {metrics.completedBookings} completed · {metrics.activeBookings} active
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Pending Verifications</div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {pendingApplicants.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            Requires document KYC check
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setAdminTab('verification')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            adminTab === 'verification'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Provider Verification Queue ({pendingApplicants.length})
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('complaints')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            adminTab === 'complaints'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Disputes & Complaints ({complaints.length})
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('bookings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            adminTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Marketplace Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            adminTab === 'settings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Platform Commission Settings ({metrics.defaultCommissionPercent}%)
        </button>
      </div>

      {/* Tab: Provider Verification */}
      {adminTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Provider Application & Identity Approval Queue
            </h3>
            <span className="text-xs text-slate-500">
              Only verified professionals can be booked by customers
            </span>
          </div>

          {pendingApplicants.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              All provider verification requests have been reviewed and processed.
            </div>
          ) : (
            pendingApplicants.map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={pro.avatarUrl}
                      alt={pro.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{pro.name}</h4>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          PENDING APPROVAL
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {pro.businessName} · {pro.primaryCategory} · {pro.experienceYears} Years Exp
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        Phone: {pro.phone} · City: {pro.city} ({pro.serviceAreas.join(', ')})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleVerifyProvider(pro.id, 'rejected')}
                      className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyProvider(pro.id, 'verified')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      Verify & Activate Pro
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800">Submitted Documents:</div>
                  <div>Certificates: {pro.certifications.join(', ') || 'ITI Trade Certificate'}</div>
                  <div>Bio Statement: "{pro.bio}"</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Complaints & Disputes */}
      {adminTab === 'complaints' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Customer Complaints & Warranty Resolution
          </h3>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                      Order #{c.orderNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{c.subject}</h4>
                    <div className="text-xs text-slate-500">
                      Filed by: {c.customerName} against {c.providerName}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded capitalize ${
                      c.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
                  {c.description}
                </p>

                {c.resolutionNotes && (
                  <div className="text-xs text-slate-600 bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg">
                    <span className="font-bold text-emerald-800">Resolution:</span> {c.resolutionNotes}
                  </div>
                )}

                {c.status !== 'resolved' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleResolveComplaint(c.id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Investigate & Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: All Bookings Monitor */}
      {adminTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Marketplace Booking Ledger Across All Cities
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Provider</th>
                  <th className="py-2.5">Service</th>
                  <th className="py-2.5">Date & Slot</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Total (₹)</th>
                  <th className="py-2.5 text-right">Commission (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-900">#{b.orderNumber}</td>
                    <td className="py-3 text-slate-700">{b.customerName}</td>
                    <td className="py-3 text-slate-700">{b.providerName}</td>
                    <td className="py-3 text-slate-700">{b.serviceName}</td>
                    <td className="py-3 text-slate-500">
                      {b.date} ({b.timeSlot})
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(b.totalAmountPaise)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-teal-700">
                      {formatCurrency(b.commissionAmountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Commission Settings */}
      {adminTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Platform Default Commission Rate
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure the baseline percentage earned by the platform on standard completed service bookings.
            </p>
          </div>

          <form onSubmit={handleUpdateCommission} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Commission Percentage (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  required
                  className="w-32 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-bold tabular-nums"
                />
                <span className="text-sm font-bold text-slate-600">%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Standard industry range: 10% - 15%.
              </div>
            </div>

            <button
              type="submit"
              disabled={savingRate}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingRate ? 'Updating Rate...' : 'Save New Commission Rate'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
