import React from 'react';
import { useBooking } from '../context/BookingContext';
import { DOCTORS } from '../data/clinicData';
import { Award, GraduationCap, Clock, CheckCircle2, Calendar } from 'lucide-react';

export const DoctorSection: React.FC = () => {
  const { openBooking } = useBooking();
  const leadDoctor = DOCTORS[0]; // Dr. Prasad Kulkarni
  const associateDoctor = DOCTORS[1]; // Dr. Ananya Rao

  return (
    <section id="doctor" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-800 mb-2">
            Clinical Leadership & Heritage
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
            Meet our senior dental surgeons and specialists.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Backed by academic credentials, international fellowship training, and over three decades of trusted patient relationships in West Bengaluru.
          </p>
        </div>

        {/* Lead Doctor Spotlight: 2-Column Split */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10 mb-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
                <img
                  src="/src/assets/images/doctor_consultation_1791873385712.jpg"
                  alt="Dr. Prasad Kulkarni consulting with a patient at Advance Dental"
                  className="w-full h-[380px] sm:h-[420px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Profile & Credentials */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="text-xs font-semibold text-teal-800 tracking-wide uppercase">
                  Founder & Chief Prosthodontist
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {leadDoctor.name}
                </h3>
                {/* Unboxed qualifications */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-600 font-medium">
                  {leadDoctor.qualifications.map((q, idx) => (
                    <React.Fragment key={q}>
                      <span>{q}</span>
                      {idx < leadDoctor.qualifications.length - 1 && (
                        <span className="text-slate-400" aria-hidden="true">·</span>
                      )}
                    </React.Fragment>
                  ))}
                  <span className="text-slate-400" aria-hidden="true">·</span>
                  <span className="text-teal-700 font-semibold">{leadDoctor.experienceYears} Years Practice</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                {leadDoctor.bio}
              </p>

              {/* Verified Clinical Focus Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 pt-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                  <span>Immediate-load dental implants and bone augmentation</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                  <span>Full-mouth rehabilitation & TMJ occlusal therapy</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                  <span>CAD/CAM zirconia crowns and aesthetic veneers</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                  <span>Strict zero-overtreatment, conservative treatment ethics</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => openBooking('consultation-checkup')}
                  className="px-6 py-3 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Consultation with Dr. Prasad</span>
                </button>
                <span className="text-xs text-slate-500">
                  Direct in-person consultation · Approx. ₹200 fee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Associate Specialist Card */}
        <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Root Canal & Cosmetic Specialist
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              {associateDoctor.name}
            </h4>
            <div className="text-xs text-slate-500 font-medium">
              BDS · MDS (Conservative Dentistry & Endodontics) · 9 Years Clinical Experience
            </div>
            <p className="text-sm text-slate-600">
              {associateDoctor.bio}
            </p>
          </div>
          <button
            onClick={() => openBooking('laser-rct')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book Root Canal Assessment
          </button>
        </div>
      </div>
    </section>
  );
};
