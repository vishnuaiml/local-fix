import React from 'react';
import { MapPin, Home, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showTagline = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon: Location pin merged with house & sparkle */}
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
        <MapPin className="w-5 h-5 text-white" />
        <Home className="w-2.5 h-2.5 text-emerald-200 absolute top-2.5" />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Local<span className="text-blue-600">Fix</span>
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            TN
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] font-medium text-slate-500 tracking-normal -mt-0.5">
            Ungal Area, Ungal Services.
          </p>
        )}
      </div>
    </div>
  );
};
