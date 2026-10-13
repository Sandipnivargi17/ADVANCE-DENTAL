import React from 'react';
import { useBooking } from '../context/BookingContext';
import { CLINIC_CONFIG } from '../data/clinicData';
import { ShieldCheck, Calendar, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const { openBooking } = useBooking();

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean unboxed editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide uppercase">
              <span>Vijayanagar, Bengaluru</span>
              <span aria-hidden="true">·</span>
              <span>Dr. Prasad Kulkarni (MDS, MS)</span>
              <span aria-hidden="true">·</span>
              <span>Est. 1995</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.12]" style={{ textWrap: 'balance' }}>
              Modern, gentle dental care built on three decades of clinical mastery.
            </h1>

            {/* Value Proposition Prose */}
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              At <strong className="text-slate-800 font-semibold">{CLINIC_CONFIG.legalName}</strong>, we combine painless laser dentistry, computer-guided dental implants, and specialized prosthodontics with an empathetic, unhurried patient approach.
            </p>

            {/* Verified Trust Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Single-sitting laser root canal therapy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Teeth-in-a-Day immediate dental implants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Hospital-grade 4-step autoclaving</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Transparent ₹200 initial consultation fee</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => openBooking()}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md"
              >
                <Calendar className="w-5 h-5" />
                <span>Book an Appointment</span>
              </button>
              <a
                href="#treatments"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-all"
              >
                <span>Explore Treatments</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Real patient proof snippet (claim-to-proof adjacency) */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
              <div className="flex text-amber-500">
                {'★'.repeat(5)}
              </div>
              <span>
                Rated <strong>4.9 / 5.0</strong> based on 830+ verified patient experiences on Practo & Justdial
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-100">
              <img
                src="/src/assets/images/hero_dental_clinic_1791873384219.jpg"
                alt="State-of-the-art dental operatory room at Advance Dental, Vijayanagar"
                className="w-full h-[440px] sm:h-[480px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Photo Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-semibold tracking-wider uppercase text-teal-300">
                  Advanced Operatory Suite
                </p>
                <p className="text-sm font-medium text-slate-100">
                  Digital low-dose radiovisiography & ultrasonic sterilization theatre
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Metric Strip below the Hero Split */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <div className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              31+
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-teal-800 mt-1">
              Years Clinical Experience
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Continuously serving Vijayanagar since 1995
            </div>
          </div>

          <div>
            <div className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              830+
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-teal-800 mt-1">
              Patient Testimonials
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              97% positive satisfaction on Practo & Justdial
            </div>
          </div>

          <div>
            <div className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              1-Visit
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-teal-800 mt-1">
              Laser Root Canal
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Minimally invasive, painless preservation
            </div>
          </div>

          <div>
            <div className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
              ₹200
            </div>
            <div className="text-xs uppercase tracking-wider font-semibold text-teal-800 mt-1">
              Consultation Fee
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Transparent assessment & digital scan
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
