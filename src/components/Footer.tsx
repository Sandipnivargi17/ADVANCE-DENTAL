import React from 'react';
import { useBooking } from '../context/BookingContext';
import { CLINIC_CONFIG } from '../data/clinicData';
import { Phone, MapPin, CalendarCheck, ShieldCheck, Mail, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openBooking, openLookup, openAdmin, openPolicy } = useBooking();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Address (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="w-6 h-6 rounded bg-teal-600 text-white flex items-center justify-center text-sm font-bold">
                +
              </span>
              <span>Advance Dental</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {CLINIC_CONFIG.legalName} has provided specialized dental implants, laser root canals, and prosthodontics to patients across Vijayanagar and Bengaluru since 1995.
            </p>
            <div className="space-y-1.5 text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  {CLINIC_CONFIG.address}, {CLINIC_CONFIG.city}, Karnataka {CLINIC_CONFIG.pincode}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`tel:${CLINIC_CONFIG.phone}`} className="hover:text-white transition-colors">
                  {CLINIC_CONFIG.phoneFormatted}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">
              Treatments & Care
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Single-Visit Laser Root Canal
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Teeth-in-a-Day Dental Implants
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  CAD/CAM Zirconia Crowns & Bridges
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Painless Wisdom Tooth Extractions
                </a>
              </li>
              <li>
                <a href="#treatments" className="hover:text-white transition-colors">
                  Clear Aligners & Cosmetic Veneers
                </a>
              </li>
            </ul>
          </div>

          {/* Patient Portal & Hours (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">
              Appointments & Desk
            </div>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => openBooking()}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-left"
                >
                  Book New Appointment (Online)
                </button>
              </li>
              <li>
                <button
                  onClick={openLookup}
                  className="hover:text-teal-400 transition-colors cursor-pointer text-left"
                >
                  Manage / Reschedule Existing Booking
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicy('cancellation')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cancellation Policy (2-Hour Window)
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicy('charter')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sterilization Standards & Charter
                </button>
              </li>
              <li>
                <button
                  onClick={openAdmin}
                  className="hover:text-slate-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Reception Staff Login (PIN 1328)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Operating Hours Summary (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-white font-semibold text-xs uppercase tracking-wider">
              Clinic Hours
            </div>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <div className="text-slate-300 font-medium">Monday – Saturday:</div>
              <div>9:30 AM – 2:30 PM</div>
              <div>3:00 PM – 8:30 PM</div>
              <div className="text-slate-300 font-medium pt-1">Sunday:</div>
              <div>10:30 AM – 3:00 PM</div>
            </div>
            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-[11px]"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Back to top</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {CLINIC_CONFIG.legalName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => openPolicy('privacy')}
              className="hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => openPolicy('cancellation')}
              className="hover:text-slate-400 transition-colors"
            >
              Booking Terms
            </button>
            <span aria-hidden="true">·</span>
            <a
              href={CLINIC_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              Google Maps Listing
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
