import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, CheckCircle2, Phone, Mail, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate, setSelectedCategorySlug, setSelectedCity } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Trust Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-slate-800 text-slate-300">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-semibold mb-1">Police & Identity Verified Pros</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every service professional undergoes multi-step KYC, Aadhaar validation, and trade skill assessment before activation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-semibold mb-1">Upfront Honest Pricing</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear rate cards in Indian Rupees (₹). No hidden surcharges, no surprise extra labor fees upon arrival.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-semibold mb-1">30-Day Service Guarantee</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Not fully satisfied with the repair? We arrange free re-service or process a complete refund under our buyer protection.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <span className="w-7 h-7 rounded bg-teal-600 flex items-center justify-center text-white font-black text-sm">
                L
              </span>
              <span>LocalFix</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              LocalFix connects homeowners and apartment residents with verified, background-checked neighborhood technicians for plumbing, electrical, AC repair, carpentry, and home maintenance.
            </p>
            <div className="flex flex-col gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Helpline: 1800-420-FIX (9 AM - 8 PM IST)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>support@localfix.in</span>
              </div>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Home Services
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug('electrician');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Electrician & Wiring
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug('plumbing');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Plumbing & Leakages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug('ac-repair');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  AC Deep Clean & Gas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug('house-cleaning');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Deep House Sanitization
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug('appliance-repair');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Washing Machine & Fridge
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Cities */}
          <div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Cities Covered
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('Chennai');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Chennai (Anna Nagar, Adyar...)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('Bengaluru');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bengaluru (Indiranagar, HSR...)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('Mumbai');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mumbai (Bandra, Powai...)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('Hyderabad');
                    navigate('search');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hyderabad (Banjara, Hitec...)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div>
            <div className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Company & Legal
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('provider-register')}
                  className="hover:text-white transition-colors cursor-pointer font-medium text-teal-300"
                >
                  Partner With Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service & Refund
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 LocalFix Technologies India Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Prices inclusive of 18% GST</span>
            <span>·</span>
            <span>ISO 9001:2015 Quality Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
