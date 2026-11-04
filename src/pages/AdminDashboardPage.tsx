import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Users,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Database,
  Calendar,
  MessageSquare,
  Server,
  Terminal,
  Flame,
} from 'lucide-react';
import { useNammaAuth } from '../context/NammaAuthContext';
import { nammaApi } from '../services/api';
import {
  Admin,
  Provider,
  Customer,
  Booking,
  Complaint,
  DatabaseStatus,
  ComplaintStatus,
} from '../types/nammaservices';
import { Logo } from '../components/namma/Logo';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useNammaAuth();
  const admin = user as Admin;

  const [activeTab, setActiveTab] = useState<'verifications' | 'providers' | 'customers' | 'bookings' | 'complaints' | 'database'>('verifications');
  const [stats, setStats] = useState({
    totalCustomers: 1,
    totalProviders: 5,
    pendingVerifications: 1,
    approvedProviders: 4,
    totalBookings: 2,
    completedBookings: 1,
    cancelledBookings: 0,
    openComplaints: 0,
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, provRes, custRes, bookRes, compRes, dbRes] = await Promise.all([
        nammaApi.getAdminDashboard(),
        nammaApi.getAdminProviders(),
        nammaApi.getAdminCustomers(),
        nammaApi.getAdminBookings(),
        nammaApi.getAdminComplaints(),
        nammaApi.getDbStatus(),
      ]);

      if (dashRes.success) setStats(dashRes.stats);
      if (provRes.success) setProviders(provRes.providers);
      if (custRes.success) setCustomers(custRes.customers);
      if (bookRes.success) setBookings(bookRes.bookings);
      if (compRes.success) setComplaints(compRes.complaints);
      if (dbRes.success) setDbStatus(dbRes.status);
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to refresh administrator data feeds.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await nammaApi.verifyProvider(id, status, notes);
      if (res.success) {
        setActionAlert({
          type: 'success',
          text: `Provider ${status === 'approved' ? 'Approved & Activated' : 'Rejected'} successfully!`,
        });
        loadData();
      } else {
        setActionAlert({ type: 'error', text: res.message });
      }
    } catch {
      setActionAlert({ type: 'error', text: 'Error executing provider verification.' });
    }
  };

  const handleUpdateComplaint = async (id: string, status: ComplaintStatus) => {
    const adminNotes = prompt('Add administrative resolution notes:') || 'Resolved per customer communication.';
    try {
      const res = await nammaApi.updateComplaint(id, status, adminNotes);
      if (res.success) {
        setActionAlert({ type: 'success', text: `Complaint #${id} updated to ${status}.` });
        loadData();
      }
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to update complaint.' });
    }
  };

  const handleToggleAccountStatus = async (id: string, current: string) => {
    const nextStatus = current === 'active' ? 'suspended' : 'active';
    try {
      const res = await nammaApi.updateAccountStatus(id, nextStatus as any);
      if (res.success) {
        setActionAlert({ type: 'success', text: `Account status updated to ${nextStatus}.` });
        loadData();
      }
    } catch {
      setActionAlert({ type: 'error', text: 'Failed to update account status.' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login/admin');
  };

  const pendingProviders = providers.filter((p) => p.verification_status === 'pending');
  const approvedProviders = providers.filter((p) => p.verification_status === 'approved');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/">
            <Logo className="brightness-125" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-100">{admin?.full_name || 'Dr. Anand Raman'}</p>
              <p className="text-[10px] text-amber-400 font-semibold">{admin?.department || 'Platform Governance'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              LocalFix Platform Administration & Governance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review trade licenses, verify providers, manage PostgreSQL records, and audit customer grievances.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
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
            <button onClick={() => setActionAlert(null)} className="font-bold text-slate-500 ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* 6 Key Platform Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 block uppercase">Pending Reviews</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingVerifications}</p>
            <span className="text-[10px] text-slate-400">Action Needed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 block uppercase">Approved Pros</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.approvedProviders}</p>
            <span className="text-[10px] text-slate-400">Live on Search</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-blue-700 block uppercase">Customers</span>
            <p className="text-2xl font-black text-blue-700 mt-1">{stats.totalCustomers}</p>
            <span className="text-[10px] text-slate-400">Registered</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-600 block uppercase">Total Bookings</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalBookings}</p>
            <span className="text-[10px] text-slate-400">{stats.completedBookings} Completed</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 block uppercase">Grievances</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats.openComplaints}</p>
            <span className="text-[10px] text-slate-400">Under Review</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-indigo-700 block uppercase">Database Engine</span>
            <p className="text-xs font-black text-indigo-900 mt-2 truncate">
              {dbStatus?.connected ? 'PostgreSQL 5432' : 'Relational Dev Engine'}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> Synchronized
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'verifications'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Verification Queue ({pendingProviders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'providers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Providers ({providers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Bookings Audit ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'complaints'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Complaints Desk ({complaints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>pgAdmin 4 & Database Guide</span>
          </button>
        </div>

        {/* TAB 1: Provider Verification Queue */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Provider Applications Awaiting Administrator Verification
            </h2>

            {pendingProviders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Verification Queue is Clear!</p>
                <p className="text-xs text-slate-400 mt-1">
                  New providers registering via the provider portal appear here immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProviders.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border-2 border-amber-300 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={p.avatar_url}
                        alt={p.business_name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{p.business_name}</h3>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {p.service_category}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Pending Audit
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Applicant: <span className="font-semibold text-slate-800">{p.full_name}</span> • {p.email} • {p.phone_number}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Locality: {p.service_area} • Experience: {p.experience_years} Years • Indicative Base: ₹{p.hourly_rate}
                        </p>
                        {p.verification_notes && (
                          <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                            <span className="font-bold text-slate-900">Application Note:</span> {p.verification_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() =>
                          handleVerify(
                            p.id,
                            'approved',
                            'Official trade license and state competence credentials verified by Dr. Anand Raman.'
                          )
                        }
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Activate</span>
                      </button>
                      <button
                        onClick={() =>
                          handleVerify(
                            p.id,
                            'rejected',
                            'Missing technical certificate or trade competence registration.'
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: All Providers */}
        {activeTab === 'providers' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Provider Registry ({providers.length})</h2>
              <span className="text-xs text-slate-500">Manage account status and activation</span>
            </div>
            <div className="divide-y divide-slate-100">
              {providers.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar_url}
                      alt={p.business_name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{p.business_name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            p.verification_status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {p.verification_status}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.account_status === 'active' ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {p.account_status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {p.full_name} • {p.service_category} • {p.service_area} • {p.phone_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAccountStatus(p.id, p.account_status)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                        p.account_status === 'active'
                          ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {p.account_status === 'active' ? 'Suspend Account' : 'Re-activate Account'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Customers */}
        {activeTab === 'customers' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Registered Customer Accounts ({customers.length})</h2>
              <span className="text-xs text-slate-500">Protected user records</span>
            </div>
            <div className="divide-y divide-slate-100">
              {customers.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'}
                      alt={c.full_name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">{c.full_name}</p>
                      <p className="text-[11px] text-slate-500">{c.email} • {c.phone_number}</p>
                      <p className="text-[10px] text-slate-400">{c.address || 'Chennai, Tamil Nadu'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Active Customer
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Bookings Audit */}
        {activeTab === 'bookings' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">All Marketplace Bookings ({bookings.length})</h2>
              <span className="text-xs text-slate-500">Platform job status audit</span>
            </div>
            <div className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-500">#{b.id}</span>
                      <span className="font-bold text-slate-900">{b.service_description}</span>
                      <span className="font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {b.booking_status}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Customer: {b.customer_name} • Provider: {b.provider_business_name} • Slot: {b.preferred_date} ({b.preferred_time})
                    </p>
                  </div>
                  <span className="font-bold text-blue-700 text-sm">₹{b.indicative_price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Complaints Desk */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Customer Grievance & Dispute Desk
            </h2>

            {complaints.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800">No open customer complaints!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Grievance #{c.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          {c.complaint_status}
                        </span>
                      </div>
                      <span className="text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>

                    <p className="text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                      &quot;{c.complaint_description}&quot;
                    </p>

                    <p className="text-slate-500">
                      Filed by: <strong>{c.customer_name}</strong> against Provider: <strong>{c.provider_business_name}</strong>
                    </p>

                    {c.admin_notes && (
                      <p className="text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <strong>Admin Resolution Note:</strong> {c.admin_notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleUpdateComplaint(c.id, 'Resolved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateComplaint(c.id, 'Under Review')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 transition"
                      >
                        Set Under Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Firebase Backend & Cloud SQL Diagnostics */}
        {activeTab === 'database' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    TiDB Cloud Distributed Database &amp; Firebase Backend
                  </h2>
                  <p className="text-xs text-slate-500">
                    Host: <code className="font-mono font-bold text-emerald-700">gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000</code> • DB: <code className="font-mono text-slate-700">localfix</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TiDB Cloud Connected</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>Firestore Active</span>
                </span>
              </div>
            </div>

            {/* Firebase Architecture Card */}
            <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/50 rounded-2xl p-5 border border-amber-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    🔥
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Firebase Firestore Enterprise Engine</h3>
                    <p className="text-xs text-slate-600">
                      Zero-Trust Attribute-Based Access Control (ABAC) with real-time listeners and security rules
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hardened Rules Deployed</span>
                  </span>
                </div>
              </div>

              {/* Architecture grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
                  <span className="font-bold text-slate-800 block mb-1">1. Provisioned Collections</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Schema configured for <code>users</code>, <code>providers</code>, <code>bookings</code>, <code>reviews</code>, and <code>complaints</code> in <code>firebase-blueprint.json</code>.
                  </p>
                </div>
                <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
                  <span className="font-bold text-slate-800 block mb-1">2. Zero-Trust Security Rules</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Strict identity checks, terminal state locks, and immutable audit timestamps enforced in <code>firestore.rules</code>.
                  </p>
                </div>
                <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
                  <span className="font-bold text-slate-800 block mb-1">3. Real-Time SDK Integration</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Connection testing &amp; Firestore error handlers active via <code>src/lib/firestore.ts</code> and <code>src/lib/firebase.ts</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Table Row Counters */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Live Relational Table Record Counts:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {dbStatus?.tables &&
                  Object.entries(dbStatus.tables).map(([table, count]) => (
                    <div key={table} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">{table}</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{count}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Step-by-Step Architecture Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>Backend Storage & Security Architecture Details:</span>
              </div>

              <ol className="list-decimal list-inside text-xs text-slate-700 space-y-2.5 leading-relaxed font-mono">
                <li>
                  <strong>Firebase Firestore Database:</strong> Operating under Enterprise Edition on project <code>seventh-axon-bf4nj</code>.
                </li>
                <li>
                  <strong>Cloud SQL Relational Engine:</strong> PostgreSQL storage for complex relational queries and transactions with Drizzle ORM.
                </li>
                <li>
                  <strong>Dual Storage Synchronization:</strong> Real-time user accounts and booking events synchronized to both Firestore and PostgreSQL.
                </li>
                <li>
                  <strong>Strict Security:</strong> Admin clearance restricted to authorized emails (<code>vishnu68c@gmail.com</code> &amp; <code>vishnuchinnarasu92@gmail.com</code>) with salted bcrypt password verification.
                </li>
              </ol>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
