import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useBooking } from '../context/BookingContext';
import { DentalService, Doctor, Appointment } from '../types/dental';
import { CLINIC_CONFIG } from '../data/clinicData';
import {
  generateAvailableSlots,
  isDateInPast,
  createGoogleCalendarUrl,
  downloadIcsFile,
  createWhatsAppConfirmationLink,
  TimeSlotOption,
} from '../utils/bookingUtils';
import {
  X,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Phone,
  Mail,
  FileText,
  Download,
  ExternalLink,
  Printer,
  Sparkles,
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const {
    isBookingOpen,
    closeBooking,
    preselectedServiceId,
    services,
    doctors,
    appointments,
    bookAppointment,
  } = useBooking();

  // Booking state across the 7 steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('dr-prasad'); // default to lead doctor
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Patient details state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [notes, setNotes] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  // Submitting / Confirmation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Calendar navigation state for step 3
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  // Initialize service & date when modal opens
  useEffect(() => {
    if (isBookingOpen) {
      setCurrentStep(1);
      setBookingError(null);
      setConfirmedAppointment(null);

      // Set default tomorrow date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDateStr = tomorrow.toISOString().split('T')[0];
      setSelectedDate(defaultDateStr);

      if (preselectedServiceId) {
        const found = services.find(s => s.id === preselectedServiceId);
        if (found) {
          setSelectedService(found);
          setCurrentStep(2); // advance to doctor selection if preselected
        }
      } else if (!selectedService) {
        setSelectedService(services[0]); // default to first
      }
    }
  }, [isBookingOpen, preselectedServiceId]);

  if (!isBookingOpen) return null;

  // Selected doctor details helper
  const getSelectedDoctor = (): Doctor | { id: string; name: string; role: string } => {
    if (selectedDoctorId === 'any') {
      return {
        id: 'any',
        name: 'Any Available Specialist',
        role: 'Assigned on arrival based on consultation schedule',
      };
    }
    return doctors.find(d => d.id === selectedDoctorId) || doctors[0];
  };

  // Generate slots for step 4
  const availableSlots: TimeSlotOption[] = selectedDate
    ? generateAvailableSlots(
        selectedDate,
        selectedDoctorId,
        appointments,
        doctors.map(d => d.id)
      )
    : [];

  // Handle final submission in Step 6
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) return;

    if (!patientName.trim()) {
      setBookingError('Please provide your full name.');
      return;
    }

    if (!patientPhone.trim() || patientPhone.replace(/[^0-9]/g, '').length < 10) {
      setBookingError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!privacyConsent) {
      setBookingError('Please accept the clinic privacy & cancellation consent.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    const doc = getSelectedDoctor();

    const result = await bookAppointment({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceCategory: selectedService.category,
      doctorId: doc.id,
      doctorName: doc.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      durationMinutes: selectedService.durationMinutes,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || 'walkin@advancedental.in',
      patientAge: patientAge.trim() || undefined,
      patientGender,
      notes: notes.trim() || undefined,
      isFirstVisit,
      feeEstimated: selectedService.priceInr,
    });

    setIsSubmitting(false);

    if (result.success && result.appointment) {
      setConfirmedAppointment(result.appointment);
      setCurrentStep(7); // Advance to confirmed screen
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    } else {
      setBookingError(result.error || 'Failed to reserve appointment slot. Please try another time.');
    }
  };

  // Calendar generation for Step 3
  const renderCalendar = () => {
    const today = new Date();
    const targetMonthDate = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
    const monthYearLabel = targetMonthDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const firstDayIndex = targetMonthDate.getDay(); // 0 = Sun
    const daysInMonth = new Date(
      targetMonthDate.getFullYear(),
      targetMonthDate.getMonth() + 1,
      0
    ).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`pad-${i}`} className="h-10 sm:h-12" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const currentYear = targetMonthDate.getFullYear();
      const currentMonth = String(targetMonthDate.getMonth() + 1).padStart(2, '0');
      const currentDay = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${currentMonth}-${currentDay}`;
      const isPast = isDateInPast(dateStr);
      const isSelected = selectedDate === dateStr;
      const isSun = new Date(currentYear, targetMonthDate.getMonth(), d).getDay() === 0;

      days.push(
        <button
          key={dateStr}
          type="button"
          disabled={isPast}
          onClick={() => {
            setSelectedDate(dateStr);
            setSelectedTimeSlot(''); // reset slot when date changes
          }}
          className={`h-10 sm:h-12 w-full rounded-lg font-medium text-xs sm:text-sm flex flex-col items-center justify-center transition-all ${
            isSelected
              ? 'bg-teal-700 text-white font-bold shadow-md'
              : isPast
              ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
              : 'text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer'
          }`}
        >
          <span>{d}</span>
          {isSun && !isPast && (
            <span className={`text-[9px] ${isSelected ? 'text-teal-200' : 'text-amber-600'}`}>
              Sun
            </span>
          )}
        </button>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm">{monthYearLabel}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={calendarMonthOffset <= 0}
              onClick={() => setCalendarMonthOffset(prev => prev - 1)}
              className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={calendarMonthOffset >= 2}
              onClick={() => setCalendarMonthOffset(prev => prev + 1)}
              className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 pb-1">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>

        <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>* Mon–Sat: 9:30 AM–8:30 PM (lunch break 2:30–3:00 PM)</span>
          <span className="text-amber-700 font-medium">Sunday: 10:30 AM–3:00 PM</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Online Appointment Portal
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {currentStep === 7
                ? 'Booking Confirmed!'
                : `Step ${currentStep} of 6: ${
                    currentStep === 1
                      ? 'Select Treatment'
                      : currentStep === 2
                      ? 'Select Specialist'
                      : currentStep === 3
                      ? 'Select Date'
                      : currentStep === 4
                      ? 'Select Time Slot'
                      : currentStep === 5
                      ? 'Patient Information'
                      : 'Review & Confirm'
                  }`}
            </h3>
          </div>

          <button
            onClick={closeBooking}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1 to 6) */}
        {currentStep < 7 && (
          <div className="w-full bg-slate-100 h-1 shrink-0">
            <div
              className="bg-teal-700 h-1 transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        )}

        {/* Error notification banner */}
        {bookingError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Booking Notice:</span> {bookingError}
            </div>
            <button
              onClick={() => setBookingError(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Select Service */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose the dental service or consultation you require. Treatment plans and costs are always finalized after clinical assessment.
              </p>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {services.map(svc => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      selectedService?.id === svc.id
                        ? 'border-teal-700 bg-teal-50/60 ring-1 ring-teal-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{svc.name}</span>
                        {svc.popular && (
                          <span className="text-[10px] text-teal-800 font-semibold uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {svc.shortDescription}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{svc.durationMinutes} mins</span>
                        <span aria-hidden="true">·</span>
                        <span>{svc.priceLabel}</span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedService?.id === svc.id
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedService?.id === svc.id && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Specialist */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Select your preferred doctor or choose any available specialist for fastest availability.
              </p>

              <div className="space-y-3">
                {doctors.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      selectedDoctorId === doc.id
                        ? 'border-teal-700 bg-teal-50/60 ring-1 ring-teal-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{doc.name}</span>
                        <span className="text-xs text-slate-500 font-normal">
                          ({doc.experienceYears} yrs exp)
                        </span>
                      </div>
                      <div className="text-xs text-teal-800 font-medium">{doc.role}</div>
                      <div className="text-xs text-slate-600">{doc.specialization}</div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                        selectedDoctorId === doc.id
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedDoctorId === doc.id && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}

                {/* Option for Any Doctor */}
                <div
                  onClick={() => setSelectedDoctorId('any')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    selectedDoctorId === 'any'
                      ? 'border-teal-700 bg-teal-50/60 ring-1 ring-teal-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900">
                      Any Available Specialist
                    </div>
                    <div className="text-xs text-slate-500">
                      Best option if you need an urgent or flexible appointment slot.
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                      selectedDoctorId === 'any'
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedDoctorId === 'any' && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Select Date */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Choose an appointment date. Past dates are automatically disabled.
              </p>
              {renderCalendar()}
              {selectedDate && (
                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-lg text-xs text-teal-900 flex items-center justify-between">
                  <span>Selected Date:</span>
                  <span className="font-bold">{selectedDate}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Select Time Slot */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  Date: <strong>{selectedDate}</strong>
                </span>
                <span>
                  Doctor: <strong>{getSelectedDoctor().name}</strong>
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">
                    No time slots available for this date.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    The clinic may be closed or all slots are booked. Please pick another date.
                  </p>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="mt-3 text-xs text-teal-700 font-semibold underline"
                  >
                    Go back to choose another date
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Morning & Mid-Day Slots
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots
                        .filter(s => s.session === 'morning')
                        .map(slot => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedTimeSlot(slot.time)}
                            className={`py-2.5 px-2 rounded-lg text-xs font-semibold tabular-nums transition-all ${
                              selectedTimeSlot === slot.time
                                ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-700'
                                : slot.available
                                ? 'bg-white border border-slate-200 text-slate-800 hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer'
                                : 'bg-slate-100 border border-slate-200/60 text-slate-400 cursor-not-allowed line-through'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Evening Slots */}
                  {availableSlots.some(s => s.session === 'evening') && (
                    <div>
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Evening Slots
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots
                          .filter(s => s.session === 'evening')
                          .map(slot => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTimeSlot(slot.time)}
                              className={`py-2.5 px-2 rounded-lg text-xs font-semibold tabular-nums transition-all ${
                                selectedTimeSlot === slot.time
                                  ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-700'
                                  : slot.available
                                  ? 'bg-white border border-slate-200 text-slate-800 hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer'
                                  : 'bg-slate-100 border border-slate-200/60 text-slate-400 cursor-not-allowed line-through'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {selectedTimeSlot && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center justify-between">
                      <span>Selected Slot:</span>
                      <span className="font-bold text-sm">{selectedTimeSlot}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Patient Information */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Please enter the patient’s details. We will send appointment confirmations and reminders.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      placeholder="patient@gmail.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="110"
                      value={patientAge}
                      onChange={e => setPatientAge(e.target.value)}
                      placeholder="e.g. 34"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={patientGender}
                      onChange={e => setPatientGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Visit Type */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Visit Status
                  </label>
                  <div className="flex items-center gap-6 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={isFirstVisit}
                        onChange={() => setIsFirstVisit(true)}
                        className="text-teal-700 focus:ring-teal-700"
                      />
                      <span>First-time patient at Advance Dental</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!isFirstVisit}
                        onChange={() => setIsFirstVisit(false)}
                        className="text-teal-700 focus:ring-teal-700"
                      />
                      <span>Returning / Existing patient</span>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chief Complaint or Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Tooth sensitivity on cold food, pain in lower left molar..."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900"
                  />
                </div>

                {/* Consent */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyConsent}
                      onChange={e => setPrivacyConsent(e.target.checked)}
                      className="mt-0.5 rounded text-teal-700 focus:ring-teal-700"
                    />
                    <span>
                      I consent to appointment SMS/WhatsApp reminders and agree to the 2-hour free cancellation policy.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Confirm */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Please review your appointment summary before submitting.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5 text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Service</span>
                  <span className="font-bold text-slate-900 text-right">
                    {selectedService?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Doctor</span>
                  <span className="font-semibold text-slate-800">
                    {getSelectedDoctor().name}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Date & Time</span>
                  <span className="font-bold text-teal-800">
                    {selectedDate} · {selectedTimeSlot}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Patient</span>
                  <span className="text-slate-800">
                    {patientName} ({patientPhone})
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Estimated Fee</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      {selectedService?.priceLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Payable at clinic desk after consultation
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between text-xs text-slate-600">
                  <span className="text-slate-500 uppercase font-semibold">Location</span>
                  <span className="text-right max-w-xs">
                    {CLINIC_CONFIG.address}, Vijayanagar, Bengaluru
                  </span>
                </div>
              </div>

              {/* Patient preparation reminder */}
              {selectedService?.preparationAdvice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>Preparation Note:</strong> {selectedService.preparationAdvice}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Booking Confirmed Screen */}
          {currentStep === 7 && confirmedAppointment && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-2xl font-bold text-slate-900">
                  Appointment Confirmed!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  We look forward to welcoming you at Advance Dental.
                </p>
              </div>

              {/* Booking Reference Card */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Booking Reference</span>
                  <span className="font-mono text-base font-bold text-teal-800">
                    {confirmedAppointment.referenceCode}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {confirmedAppointment.serviceName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedAppointment.doctorName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Slot:</span>
                  <span className="font-bold text-teal-800">
                    {confirmedAppointment.date} at {confirmedAppointment.timeSlot}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Patient:</span>
                  <span className="text-slate-800">
                    {confirmedAppointment.patientName}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Backend Record:</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Logged to Supabase Database</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons for Confirmed State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                <a
                  href={createGoogleCalendarUrl(confirmedAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Add to Google Calendar</span>
                </a>

                <button
                  type="button"
                  onClick={() => downloadIcsFile(confirmedAppointment)}
                  className="py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download iCal (.ics)</span>
                </button>

                <a
                  href={createWhatsAppConfirmationLink(confirmedAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:col-span-2 py-2.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send Confirmation to WhatsApp</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={closeBooking}
                  className="px-6 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer"
                >
                  Done & Return to Website
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1 to 6) */}
        {currentStep < 7 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setBookingError(null);
                  setCurrentStep(prev => prev - 1);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => {
                  setBookingError(null);
                  // Validation before next step
                  if (currentStep === 1 && !selectedService) {
                    setBookingError('Please choose a treatment.');
                    return;
                  }
                  if (currentStep === 3 && !selectedDate) {
                    setBookingError('Please select a date.');
                    return;
                  }
                  if (currentStep === 4 && !selectedTimeSlot) {
                    setBookingError('Please choose an available appointment time.');
                    return;
                  }
                  if (currentStep === 5) {
                    if (!patientName.trim()) {
                      setBookingError('Please enter the patient’s full name.');
                      return;
                    }
                    if (!patientPhone.trim() || patientPhone.replace(/[^0-9]/g, '').length < 10) {
                      setBookingError('Please enter a valid 10-digit phone number.');
                      return;
                    }
                    if (!privacyConsent) {
                      setBookingError('Please accept the clinic cancellation & privacy policy.');
                      return;
                    }
                  }
                  setCurrentStep(prev => prev + 1);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Checking Availability...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
