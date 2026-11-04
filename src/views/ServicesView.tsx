import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/currency';
import { ServiceCategory, ServiceItem } from '../types';
import { Zap, Wrench, AirVent, Sparkles, Tv, Paintbrush, Hammer, ShieldAlert, Clock, ArrowRight, Check } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5 text-amber-500" />,
  Wrench: <Wrench className="w-5 h-5 text-sky-500" />,
  AirVent: <AirVent className="w-5 h-5 text-teal-500" />,
  Sparkles: <Sparkles className="w-5 h-5 text-emerald-500" />,
  Tv: <Tv className="w-5 h-5 text-indigo-500" />,
  Paintbrush: <Paintbrush className="w-5 h-5 text-purple-500" />,
  Hammer: <Hammer className="w-5 h-5 text-orange-500" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-rose-500" />,
};

export const ServicesView: React.FC = () => {
  const { navigate, setSelectedCategorySlug, selectedCity } = useApp();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const [cats, srvs] = await Promise.all([api.getCategories(), api.getServices()]);
        setCategories(cats);
        setServices(srvs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const filteredServices =
    activeTab === 'all'
      ? services
      : services.filter((s) => s.categoryId === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
          Service Catalog
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Transparent Upfront Rate Cards in {selectedCity}
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Standardized pricing with zero surprise charges. All home repairs include our 30-day warranty and verified technician background checks.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Categories ({services.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === cat.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {ICON_MAP[cat.iconName]}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const category = categories.find((c) => c.id === service.categoryId);
          return (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-teal-700">{category?.name}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{service.durationMinutes} mins</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {service.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.description}
                </p>

                <div className="pt-2 flex flex-col gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Standardized labor & diagnostic check included</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>30-Day service rework warranty</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Fixed Service Charge</div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">
                    {formatCurrency(service.pricePaise)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (category) {
                      setSelectedCategorySlug(category.slug);
                    }
                    navigate('search');
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>Select Provider</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
