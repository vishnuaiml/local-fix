import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Review } from '../types';
import { Star, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';

export const ReviewsView: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const data = await api.getReviews();
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const filtered =
    filterRating === 0
      ? reviews
      : reviews.filter((r) => r.rating === filterRating);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Authentic Feedback</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Verified Customer Ratings & Reviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Every rating on LocalFix is strictly submitted by authenticated customers after job completion. Zero fake or incentivized reviews.
        </p>
      </div>

      {/* Filter by star rating */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs text-slate-500 font-semibold mr-2">Filter by:</span>
        {[
          { label: 'All Reviews', val: 0 },
          { label: '5 Stars Only', val: 5 },
          { label: '4 Stars', val: 4 },
        ].map((item) => (
          <button
            key={item.val}
            type="button"
            onClick={() => setFilterRating(item.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterRating === item.val
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading reviews...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No reviews match this star rating.
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {rev.customerName}
                    </span>
                    <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      <span>Verified Booking</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {rev.customerCity} · Service: {rev.serviceName}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                "{rev.comment}"
              </p>

              {rev.providerReply && (
                <div className="bg-slate-50 rounded-lg p-3 border-l-2 border-teal-500 text-xs text-slate-600 mt-2">
                  <div className="font-bold text-slate-800 text-[11px] mb-0.5">
                    Response from Specialist:
                  </div>
                  <p>{rev.providerReply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
