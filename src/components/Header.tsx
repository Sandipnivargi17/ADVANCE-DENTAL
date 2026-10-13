import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { CLINIC_CONFIG } from '../data/clinicData';
import { Phone, CalendarCheck, ShieldCheck, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { openBooking, openLookup, openAdmin } = useBooking();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Emergency / Contact Hotline strip (subtle, clean, unboxed) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              Vijayanagar, Bengaluru · Mon–Sat 9:30 AM – 8:30 PM · Sun 10:30 AM – 3:00 PM
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${CLINIC_CONFIG.phone}`}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-medium">{CLINIC_CONFIG.phoneFormatted}</span>
            </a>
            <button
              onClick={openLookup}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Find My Booking</span>
            </button>
            <button
              onClick={openAdmin}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Clinic Staff Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Staff Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Navigation: Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Wordmark */}
          <a
            href="#"
            className="text-2xl font-bold tracking-tight text-slate-900 hover:text-teal-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5"
          >
            <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              +
            </span>
            <span>Advance Dental</span>
          </a>

          {/* Zone 2: 4–5 single-line clean navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a
              href="#treatments"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Treatments
            </a>
            <a
              href="#doctor"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Dr. Prasad
            </a>
            <a
              href="#technology"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Technology & Care
            </a>
            <a
              href="#reviews"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Reviews
            </a>
            <a
              href="#location"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Location & Hours
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openBooking()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-98"
            >
              Book Appointment
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-3 text-base font-medium text-slate-700">
              <a
                href="#treatments"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-teal-700 transition-colors"
              >
                Treatments & Pricing
              </a>
              <a
                href="#doctor"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-teal-700 transition-colors"
              >
                About Dr. Prasad Kulkarni
              </a>
              <a
                href="#technology"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-teal-700 transition-colors"
              >
                Technology & Sterilization
              </a>
              <a
                href="#reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-teal-700 transition-colors"
              >
                Patient Reviews ({CLINIC_CONFIG.totalReviewCount}+)
              </a>
              <a
                href="#location"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-teal-700 transition-colors"
              >
                Location & Timings
              </a>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openBooking();
                }}
                className="w-full py-3 text-center font-semibold text-white bg-teal-700 rounded-lg shadow-sm"
              >
                Book Appointment
              </button>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLookup();
                  }}
                  className="hover:text-slate-900 underline"
                >
                  Manage My Booking
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAdmin();
                  }}
                  className="hover:text-slate-900 underline"
                >
                  Staff Portal
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
