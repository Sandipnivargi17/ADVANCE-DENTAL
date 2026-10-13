import React from 'react';
import { useBooking } from '../context/BookingContext';
import { REVIEWS_DATA, CLINIC_CONFIG } from '../data/clinicData';
import { Star, CheckCircle, Calendar, ExternalLink } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { openBooking } = useBooking();

  return (
    <section id="reviews" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Aggregate Score Banner */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-800 mb-2">
              Verified Patient Experiences
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
              Trusted by generations of families in Vijayanagar.
            </h2>
            <p className="mt-2 text-slate-600 text-base">
              Real feedback from patients treated for root canals, dental implants, smile makeovers, and family dentistry.
            </p>
          </div>

          {/* Social Proof Aggregate Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-6 shrink-0">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {CLINIC_CONFIG.ratingScore}
                <span className="text-sm font-normal text-slate-400"> / 5.0</span>
              </div>
              <div className="flex text-amber-500 text-sm mt-0.5">
                {'★'.repeat(5)}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-xs text-slate-600 space-y-0.5">
              <div className="font-semibold text-slate-900">
                {CLINIC_CONFIG.totalReviewCount}+ Patient Reviews
              </div>
              <div>97% Recommended on Practo</div>
              <div>5.0 Star Rating on Justdial</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS_DATA.map(review => (
            <div
              key={review.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header: Rating & Source */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <div className="flex text-amber-500 text-sm">
                    {'★'.repeat(review.rating)}
                  </div>
                  <span className="text-slate-400 font-medium">
                    via {review.source}
                  </span>
                </div>

                {/* Treatment Treated Tag (Unboxed metadata) */}
                <div className="text-xs font-semibold text-teal-800 mb-2">
                  Treatment: {review.treatment}
                </div>

                {/* Patient Quote */}
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Author & Verification Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {review.author}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <span>{review.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified Patient
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Callout Card */}
          <div className="bg-gradient-to-br from-teal-800 to-slate-900 rounded-xl p-6 text-white flex flex-col justify-between shadow-md">
            <div>
              <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-2">
                Pain-Free Guarantee
              </div>
              <h3 className="text-xl font-bold mb-3">
                Experience dental care without fear or hesitation.
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Whether you need urgent tooth pain relief or a long-overdue dental checkup, Dr. Prasad and our team ensure your comfort is the first priority.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={() => openBooking()}
                className="w-full py-3 px-4 text-center font-semibold text-sm bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Schedule Your Visit Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
