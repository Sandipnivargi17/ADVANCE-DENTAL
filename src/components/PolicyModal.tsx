import React from 'react';
import { useBooking } from '../context/BookingContext';
import { CLINIC_CONFIG } from '../data/clinicData';
import { X, ShieldCheck, Clock, FileText, CheckCircle } from 'lucide-react';

export const PolicyModal: React.FC = () => {
  const { policyModal, closePolicy } = useBooking();

  if (!policyModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-slate-900">
              {policyModal.type === 'cancellation'
                ? 'Appointment & Cancellation Policy'
                : policyModal.type === 'privacy'
                ? 'Patient Privacy & Confidentiality'
                : 'Patient Care & Clinical Charter'}
            </h3>
          </div>
          <button
            onClick={closePolicy}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
          {policyModal.type === 'cancellation' && (
            <>
              <p>
                At <strong>{CLINIC_CONFIG.name} ({CLINIC_CONFIG.legalName})</strong>, we value both our patients’ schedules and our clinical surgical preparation time.
              </p>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 font-medium">
                <strong>Free Rescheduling & Cancellation:</strong> Appointments can be rescheduled or cancelled at zero penalty up to 2 hours before the scheduled time slot.
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong>Punctuality:</strong> Please arrive 10 minutes prior to your scheduled slot to allow for initial intraoral registration and sanitation checks.
                </li>
                <li>
                  <strong>Late Arrivals:</strong> If you arrive more than 15 minutes past your booked time, your slot may be accommodated after scheduled patients to ensure clinical workflow.
                </li>
                <li>
                  <strong>Emergencies:</strong> If you suffer acute dental pain or facial trauma, contact our desk at {CLINIC_CONFIG.phoneFormatted} for prioritized emergency triage.
                </li>
              </ul>
            </>
          )}

          {policyModal.type === 'privacy' && (
            <>
              <p>
                We hold your medical history and personal contact information to the highest standards of healthcare confidentiality.
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong>Data Utilization:</strong> Your phone number and email are exclusively used for automated appointment confirmations, reminders, and digital treatment follow-ups.
                </li>
                <li>
                  <strong>No Commercial Disclosures:</strong> We never sell, lease, or share patient data with any third-party advertisers or external marketing networks.
                </li>
                <li>
                  <strong>Diagnostic Imaging:</strong> Digital dental x-rays and intraoral photographs are stored in compliant, encrypted medical drives solely accessible to your attending clinicians.
                </li>
              </ul>
            </>
          )}

          {policyModal.type === 'charter' && (
            <>
              <p>
                Founded by Dr. Prasad Kulkarni (31+ years experience), our clinic adheres strictly to ethical, conservative dental practice:
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Informed Consent:</strong> Every diagnostic finding is shown on high-definition chairside screens with full treatment options and transparent fees before any procedure begins.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Hospital Sterilization:</strong> All diagnostic and surgical instruments undergo 4-tier Class-B vacuum autoclaving and UV sterilization.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Conservative Philosophy:</strong> We prioritize saving your biological teeth through minimally invasive restorative techniques whenever clinically viable.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={closePolicy}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
