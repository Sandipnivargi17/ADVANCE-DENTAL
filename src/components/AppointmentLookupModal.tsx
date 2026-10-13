import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Appointment } from '../types/dental';
import { generateAvailableSlots, isDateInPast, createGoogleCalendarUrl, downloadIcsFile } from '../utils/bookingUtils';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarDays,
  Download,
  RotateCcw,
} from 'lucide-react';

export const AppointmentLookupModal: React.FC = () => {
  const {
    isLookupOpen,
    closeLookup,
    findAppointmentByRef,
    findAppointmentsByPhone,
    cancelAppointment,
    rescheduleAppointment,
    doctors,
    appointments,
  } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Rescheduling modal state
  const [reschedulingApp, setReschedulingApp] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  if (!isLookupOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    setHasSearched(true);
    // Check if matching reference code
    const byRef = findAppointmentByRef(q);
    if (byRef) {
      setSearchResults([byRef]);
      return;
    }

    // Check by phone number
    const byPhone = findAppointmentsByPhone(q);
    setSearchResults(byPhone);
  };

  const handleCancel = async (refCode: string) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${refCode}?`)) {
      return;
    }
    const res = await cancelAppointment(refCode, 'Patient cancelled online');
    if (res.success) {
      setFeedbackMessage(`Appointment ${refCode} was successfully cancelled.`);
      // Refresh results
      if (searchQuery.trim()) {
        const byRef = findAppointmentByRef(searchQuery.trim());
        if (byRef) setSearchResults([byRef]);
        else setSearchResults(findAppointmentsByPhone(searchQuery.trim()));
      }
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApp || !newDate || !newTimeSlot) return;

    setRescheduleError(null);
    const res = await rescheduleAppointment(reschedulingApp.referenceCode, newDate, newTimeSlot);
    if (res.success) {
      setFeedbackMessage(`Appointment successfully rescheduled to ${newDate} at ${newTimeSlot}.`);
      setReschedulingApp(null);
      // Refresh search
      const updated = findAppointmentByRef(reschedulingApp.referenceCode);
      if (updated) setSearchResults([updated]);
    } else {
      setRescheduleError(res.error || 'Failed to reschedule.');
    }
  };

  const rescheduleAvailableSlots =
    reschedulingApp && newDate
      ? generateAvailableSlots(
          newDate,
          reschedulingApp.doctorId,
          appointments.filter(a => a.id !== reschedulingApp.id),
          doctors.map(d => d.id)
        )
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Patient Self-Service
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Find & Manage Your Appointment
            </h3>
          </div>
          <button
            onClick={closeLookup}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedbackMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
            <span>{feedbackMessage}</span>
            <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Booking Reference (e.g. AD-7102) or Phone Number"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Reschedule Drawer/Subform */}
          {reschedulingApp && (
            <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">
                  Reschedule: {reschedulingApp.referenceCode} ({reschedulingApp.serviceName})
                </h4>
                <button
                  onClick={() => setReschedulingApp(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Cancel
                </button>
              </div>

              {rescheduleError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
                  {rescheduleError}
                </div>
              )}

              <form onSubmit={handleRescheduleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newDate}
                    onChange={e => {
                      setNewDate(e.target.value);
                      setNewTimeSlot('');
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>

                {newDate && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Available Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
                      {rescheduleAvailableSlots.map(slot => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setNewTimeSlot(slot.time)}
                          className={`py-1.5 px-2 text-[11px] font-semibold rounded ${
                            newTimeSlot === slot.time
                              ? 'bg-teal-700 text-white'
                              : slot.available
                              ? 'border border-slate-200 text-slate-800 hover:bg-slate-50'
                              : 'text-slate-300 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!newDate || !newTimeSlot}
                  className="w-full py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Rescheduled Time
                </button>
              </form>
            </div>
          )}

          {/* Results List */}
          {hasSearched && (
            <div className="space-y-4">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No appointments found for "{searchQuery}". Please check your booking code or phone number.
                </div>
              ) : (
                searchResults.map(app => (
                  <div
                    key={app.id}
                    className="p-5 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-teal-800">
                        {app.referenceCode}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                          app.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'rescheduled'
                            ? 'bg-sky-100 text-sky-800'
                            : app.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">
                      {app.serviceName}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        Doctor: <strong>{app.doctorName}</strong>
                      </div>
                      <div>
                        Patient: <strong>{app.patientName}</strong>
                      </div>
                      <div>
                        Date: <strong>{app.date}</strong>
                      </div>
                      <div>
                        Slot: <strong>{app.timeSlot}</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    {app.status !== 'cancelled' && (
                      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            setReschedulingApp(app);
                            setNewDate(app.date);
                            setNewTimeSlot('');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reschedule</span>
                        </button>

                        <button
                          onClick={() => handleCancel(app.referenceCode)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded hover:bg-rose-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>

                        <a
                          href={createGoogleCalendarUrl(app)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Google Cal</span>
                        </a>

                        <button
                          onClick={() => downloadIcsFile(app)}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>.ics</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
