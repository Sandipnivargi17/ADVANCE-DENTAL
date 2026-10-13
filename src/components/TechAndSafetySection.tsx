import React from 'react';
import { ShieldCheck, Sparkles, Zap, Layers, Microscope, Clock } from 'lucide-react';

export const TechAndSafetySection: React.FC = () => {
  return (
    <section id="technology" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-800 mb-2">
            Clinical Standards & Technology
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
            Precision dental engineering with hospital-grade sterilization.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            We invest in advanced clinical technology to reduce treatment time, eliminate post-operative discomfort, and guarantee flawless biological safety.
          </p>
        </div>

        {/* 2-Column Feature Showcase 1: Implants & Lab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Advanced Prosthodontics Lab
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Titanium Implantology & CAD/CAM Zirconia Craftsmanship
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Every crown, bridge, and implant abutment is designed with micron-level digital scanning and monolithic zirconia milling. This eliminates porous micro-gaps, guarantees biocompatibility with gum tissue, and prevents unnatural dark margins around the gumline.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <Microscope className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">Immediate Bone-Lock Implants:</strong> High initial stability threads allowing Teeth-in-a-Day temporization for qualifying cases.
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <Layers className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900">1200+ MPa Flexural Strength:</strong> German and Japanese certified zirconia blocks engineered to withstand natural molar chewing forces for decades.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-50">
              <img
                src="/src/assets/images/dental_implants_lab_1791873386134.jpg"
                alt="Precision dental implants and zirconia crowns on clinical surgical tray at Advance Dental"
                className="w-full h-[360px] sm:h-[400px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Feature Showcase 2: Reception & Sterilization Protocol */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-5">
            <div className="text-xs font-semibold text-teal-800 uppercase tracking-wide">
              Patient Safety & Comfort
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              4-Tier Autoclaving & Uncompromising Hygiene Protocol
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Our clinical operatory follows international infection control protocols. All instruments undergo ultrasonic enzymatic cleaning, medical pouch sealing, Class-B fractional vacuum autoclaving at 134°C, and storage in positive-pressure UV cabinets until opened in front of you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-teal-600 mb-2" />
                <h4 className="font-semibold text-slate-900 text-sm">Individual Pouched Kits</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Single-use disposable bibs, suction tips, and autoclaved instrument pouches opened chairside.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <Zap className="w-5 h-5 text-teal-600 mb-2" />
                <h4 className="font-semibold text-slate-900 text-sm">Diode Soft-Tissue Laser</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Painless, suture-free gum recontouring and deep microbial decontamination in root canals.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-50">
              <img
                src="/src/assets/images/clinic_reception_interior_1791873384493.jpg"
                alt="Contemporary, spotless dental clinic waiting lounge and reception at Advance Dental"
                className="w-full h-[360px] sm:h-[400px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
