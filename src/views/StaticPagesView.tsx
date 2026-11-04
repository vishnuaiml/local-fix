import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, HelpCircle, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export const StaticPagesView: React.FC = () => {
  const { currentView, navigate } = useApp();

  if (currentView === 'faq') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
            Support Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Everything you need to know about booking, technician background checks, pricing, and warranties.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">
              How does LocalFix verify service technicians?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every provider must undergo a strict multi-tier verification process: identity KYC (Aadhaar / National ID validation), trade license/diploma verification (e.g. State Wireman Council for electricians), and a clean background record before being approved on the platform.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">
              How does the 30-Day Service Guarantee work?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an issue recurs within 30 days of service completion, simply click "Report Issue" from your Customer Dashboard. We dispatch a technician for a complimentary rework or issue a refund under our buyer protection program.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Can two customers book the same technician at the same time?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No. LocalFix enforces server-side concurrency locks that validate provider availability and reject overlapping bookings with an immediate conflict error, preventing double bookings.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">
              What is the cancellation policy?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You can reschedule or cancel any appointment free of charge up to 2 hours before the scheduled time slot directly from your dashboard or booking confirmation receipt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
            Get In Touch
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Contact LocalFix Support
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Our customer delight and partner support teams are active 7 days a week, 8:00 AM to 8:00 PM IST.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <Phone className="w-6 h-6 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-base">Customer Helpline</h3>
            <p className="text-xs text-slate-500">For active booking inquiries, emergency breakdowns, or rescheduling:</p>
            <div className="font-bold text-base text-teal-800">1800-420-FIX (Toll Free)</div>
            <div className="text-xs text-slate-600">+91 98400 12345 (Direct WhatsApp Support)</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <Mail className="w-6 h-6 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-base">Email & Grievances</h3>
            <p className="text-xs text-slate-500">For feedback, disputes, and partner registrations:</p>
            <div className="font-bold text-base text-teal-800">support@localfix.in</div>
            <div className="text-xs text-slate-600">grievance-officer@localfix.in</div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3 text-xs text-slate-600">
          <div className="font-bold text-slate-900 text-sm">Regional Hub Offices</div>
          <p>
            <strong>Chennai Hub:</strong> 4th Floor, Olympia Tech Park, Guindy, Chennai, Tamil Nadu 600032.
          </p>
          <p>
            <strong>Bengaluru Hub:</strong> 2nd Floor, Enzyme Tech Park, Koramangala 4th Block, Bengaluru, Karnataka 560034.
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-slate-500 text-xs">Last updated: October 2026</p>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Data Collection & Role Separation</h2>
          <p>
            LocalFix collects only necessary personal data required to dispatch and complete local service bookings. Customer phone numbers and addresses are strictly protected with role-based access control and are never publicly displayed or sold to third-party telemarketers.
          </p>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Provider KYC Confidentiality</h2>
          <p>
            Identity verification documents such as Aadhaar cards, PAN cards, and government trade licenses submitted by service providers are stored securely and accessible only by authorized operations staff during verification checks.
          </p>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Payment & Transaction Security</h2>
          <p>
            All monetary figures are calculated and recorded on the server in integer paise to ensure zero floating-point calculation errors. No credit card or CVV details are ever stored on platform servers.
          </p>
        </section>
      </div>
    );
  }

  // Terms of Service
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service & Warranty Rules</h1>
      <p className="text-slate-500 text-xs">Effective date: October 2026</p>

      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">1. Fair Marketplace Contract</h2>
        <p>
          LocalFix operates as an on-demand marketplace connecting customers with independent, verified service professionals. Technicians agree to fulfill accepted bookings promptly at the published price cards in Indian Rupees (₹).
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">2. 30-Day Workmanship Warranty</h2>
        <p>
          Completed services are covered by our 30-day rework warranty. If an issue resolved during a booked job re-occurs due to faulty workmanship within 30 days, the platform will arrange a free inspection and rectification.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">3. Cancellation & Refund Policy</h2>
        <p>
          Bookings cancelled at least 2 hours before the scheduled window are eligible for full automatic refunds. Cancellations after a technician has arrived on-site may incur a minimal standard inspection fee of ₹150 to compensate travel time.
        </p>
      </section>
    </div>
  );
};
