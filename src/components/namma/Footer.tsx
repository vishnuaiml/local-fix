import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, MapPin, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="bg-white/10 p-3 rounded-2xl inline-block">
              <Logo className="text-white" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tamil Nadu&apos;s trusted local services booking marketplace. Connecting residents with background-verified plumbers, electricians, technicians, and cleaners.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>PostgreSQL Relational DB • Verified Identity</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#explore-services" className="hover:text-blue-400 transition-colors">
                  Electrician & Wiring
                </a>
              </li>
              <li>
                <a href="#explore-services" className="hover:text-blue-400 transition-colors">
                  Plumbing & Leak Repairs
                </a>
              </li>
              <li>
                <a href="#explore-services" className="hover:text-blue-400 transition-colors">
                  Deep Home Cleaning
                </a>
              </li>
              <li>
                <a href="#explore-services" className="hover:text-blue-400 transition-colors">
                  Laptop & Computer Repair
                </a>
              </li>
              <li>
                <a href="#explore-services" className="hover:text-blue-400 transition-colors">
                  Washing Machine & Appliance Hub
                </a>
              </li>
              <li>
                <a href="#explore-services" className="hover:text-blue-400 transition-colors">
                  Painting & Carpentry
                </a>
              </li>
            </ul>
          </div>

          {/* Localities Served */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Localities Served
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
              {['T. Nagar', 'Velachery', 'Anna Nagar', 'Adyar', 'Mylapore', 'Tambaram', 'OMR / Perungudi', 'Porur', 'Thiruvanmiyur', 'Chromepet', 'Guindy'].map((loc) => (
                <span key={loc} className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300">
                  {loc}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Expanding rapidly across Tamil Nadu urban neighborhoods.
            </p>
          </div>

          {/* Support & Governance */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 mb-4">
              <li>
                <Link to="/roles" className="hover:text-blue-400 transition-colors">
                  Role Selection Gateway
                </Link>
              </li>
              <li>
                <Link to="/register/provider" className="hover:text-emerald-400 transition-colors">
                  Provider Onboarding & Verification
                </Link>
              </li>
              <li>
                <Link to="/login/admin" className="hover:text-amber-400 transition-colors">
                  Administrator Portal
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setModalType('privacy')}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Privacy Policy & Data Security
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalType('terms')}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Terms of Service & Rules
                </button>
              </li>
            </ul>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] space-y-1">
              <p className="font-semibold text-slate-200">Support Desk</p>
              <p className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-blue-400" /> support@localfix.in
              </p>
              <p className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-emerald-400" /> +91 44 2811 0099
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LocalFix. Ungal Area, Ungal Services. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setModalType('privacy')} className="hover:text-slate-300">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => setModalType('terms')} className="hover:text-slate-300">
              Terms
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Zero Fake Testimonials Policy
            </span>
          </div>
        </div>
      </div>

      {/* Privacy / Terms Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white text-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {modalType === 'privacy' ? 'LocalFix Privacy Policy' : 'LocalFix Terms of Service'}
            </h3>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              {modalType === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Information Collection:</strong> LocalFix collects customer contact details and service requirements strictly to dispatch local service providers. Passwords are never saved in plain text and are hashed using salted bcrypt.
                  </p>
                  <p>
                    <strong>2. Provider Data:</strong> Service providers submit verifiable business names, categories, experience, and trade identification to maintain platform safety and trust.
                  </p>
                  <p>
                    <strong>3. Data Protection:</strong> We do not sell or monetize personal telephone numbers or residential addresses. Communications are restricted to confirmed service orders.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Indicative Pricing:</strong> Displayed service rates are indicative base estimates. Final work charges depend on required spare parts and agreed job scope.
                  </p>
                  <p>
                    <strong>2. Provider Verification:</strong> All providers undergo administrative scrutiny before approval. Unverified and suspended accounts are barred from taking bookings.
                  </p>
                  <p>
                    <strong>3. Cancellation:</strong> Bookings can be freely rescheduled or cancelled prior to provider arrival. Completed jobs are non-cancellable and eligible for review.
                  </p>
                </>
              )}
            </div>
            <button
              onClick={() => setModalType(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
