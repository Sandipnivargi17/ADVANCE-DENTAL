import React from 'react';
import { useBooking } from '../context/BookingContext';
import { CLINIC_CONFIG } from '../data/clinicData';
import { Calendar, Phone } from 'lucide-react';

export const MobileStickyBar: React.FC = () => {
  const { openBooking } = useBooking();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg">
      <div className="flex items-center gap-3 max-w-md mx-auto">
        <a
          href={`tel:${CLINIC_CONFIG.phone}`}
          className="p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors shrink-0"
          aria-label="Call clinic directly"
        >
          <Phone className="w-5 h-5 text-teal-700" />
        </a>

        <button
          onClick={() => openBooking()}
          className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>
    </div>
  );
};
