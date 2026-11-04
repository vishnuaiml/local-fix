import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { CITIES_AND_AREAS } from '../lib/constants';
import { formatCurrency } from '../lib/currency';
import { ProviderProfile, ServiceCategory } from '../types';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Filter,
  RotateCcw,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';

export const SearchAndFilterView: React.FC = () => {
  const {
    selectedCity,
    setSelectedCity,
    selectedArea,
    setSelectedArea,
    searchQuery,
    setSearchQuery,
    selectedCategorySlug,
    setSelectedCategorySlug,
    navigate,
    favorites,
    toggleFavorite,
  } = useApp();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'experience'>('rating');

  const availableAreas = CITIES_AND_AREAS[selectedCity] || [];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, pros] = await Promise.all([
          api.getCategories(),
          api.getProviders({
            city: selectedCity,
            area: selectedArea,
            category: selectedCategorySlug,
            minRating: minRating > 0 ? minRating : undefined,
            maxPrice: maxPrice > 0 ? maxPrice : undefined,
            search: searchQuery,
            verifiedOnly,
          }),
        ]);
        setCategories(cats);

        // Client-side sorting
        let sorted = [...pros];
        if (sortBy === 'rating') {
          sorted.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'price_low') {
          sorted.sort((a, b) => a.startingPricePaise - b.startingPricePaise);
        } else if (sortBy === 'experience') {
          sorted.sort((a, b) => b.experienceYears - a.experienceYears);
        }

        setProviders(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCity, selectedArea, selectedCategorySlug, minRating, maxPrice, verifiedOnly, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedArea('All');
    setSelectedCategorySlug('All');
    setSearchQuery('');
    setMinRating(0);
    setMaxPrice(0);
    setVerifiedOnly(false);
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Local Service Professionals in {selectedCity}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {providers.length} verified technicians available for booking in {selectedCity}
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="rating">Top Rated (Highest First)</option>
            <option value="price_low">Starting Price (Lowest First)</option>
            <option value="experience">Years of Experience</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6 bg-white p-5 rounded-xl border border-slate-200 h-fit shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-teal-600" />
              <span>Filters</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, skill, AC, wiring..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* City & Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Neighborhood / Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All {selectedCity} Neighborhoods</option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Service Category
            </label>
            <select
              value={selectedCategorySlug}
              onChange={(e) => setSelectedCategorySlug(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Minimum Rating
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'Any Rating', val: 0 },
                { label: '4.5 Stars & Above', val: 4.5 },
                { label: '4.0 Stars & Above', val: 4.0 },
              ].map((item) => (
                <label
                  key={item.val}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === item.val}
                    onChange={() => setMinRating(item.val)}
                    className="accent-teal-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Cap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Maximum Starting Price
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'Any Budget', val: 0 },
                { label: 'Under ₹400', val: 40000 },
                { label: 'Under ₹600', val: 60000 },
                { label: 'Under ₹1,000', val: 100000 },
              ].map((item) => (
                <label
                  key={item.val}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="maxPrice"
                    checked={maxPrice === item.val}
                    onChange={() => setMaxPrice(item.val)}
                    className="accent-teal-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verified Only */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
              />
              <span>Verified Professionals Only</span>
            </label>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              Loading available professionals...
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                No service providers matched your filters
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your neighborhood, budget, or clearing the search keyword.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            providers.map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 justify-between"
              >
                {/* Left Photo & Info */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative w-full sm:w-36 h-36 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={pro.portfolioPhotos[0] || pro.avatarUrl}
                      alt={pro.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {pro.verificationStatus === 'verified' && (
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-teal-800 flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-teal-600" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {pro.name}
                          </h3>
                          {pro.subscriptionTier === 'enterprise' && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2 py-0.5 rounded">
                              Featured Partner
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {pro.businessName} · {pro.primaryCategory}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(pro.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        aria-label="Save provider"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(pro.id) ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1 text-amber-600 font-bold tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{pro.rating.toFixed(2)}</span>
                        <span className="text-slate-400 font-normal">
                          ({pro.reviewCount} reviews)
                        </span>
                      </div>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">{pro.experienceYears} Years Exp</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-teal-700 font-medium">Govt Licensed</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Serves: {pro.serviceAreas.join(', ')} ({pro.city})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                      {pro.bio}
                    </p>
                  </div>
                </div>

                {/* Right Action & Pricing */}
                <div className="md:w-48 flex md:flex-col justify-between items-end md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-[11px] text-slate-400">Starting price</div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatCurrency(pro.startingPricePaise)}
                    </div>
                    <div className="text-[10px] text-slate-400">Includes inspection</div>
                  </div>

                  <div className="flex md:flex-col gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate('provider-detail', { providerId: pro.id })}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      Profile & Rates
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('provider-detail', { providerId: pro.id })}
                      className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer text-center whitespace-nowrap shadow-sm"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
