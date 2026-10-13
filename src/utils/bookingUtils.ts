import { Appointment } from '../types/dental';
import { OPERATING_HOURS, CLINIC_CONFIG } from '../data/clinicData';

export interface TimeSlotOption {
  time: string; // e.g. "10:30 AM"
  available: boolean;
  reason?: string;
  session: 'morning' | 'evening';
}

/**
 * Parses time string like "09:30" or "14:30" to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
}

/**
 * Formats 24h hours/minutes to "hh:mm AM/PM"
 */
export function formatTo12Hour(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = minutes.toString().padStart(2, '0');
  const displayHoursStr = displayHours.toString().padStart(2, '0');
  return `${displayHoursStr}:${displayMins} ${period}`;
}

/**
 * Checks if a given date is in the past (before today's local date in YYYY-MM-DD)
 */
export function isDateInPast(dateString: string): boolean {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  return dateString < todayStr;
}

/**
 * Gets operating hours configuration for a given date
 */
export function getDaySchedule(dateString: string) {
  // Parse date without timezone shifts
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayIndex = targetDate.getDay();
  return OPERATING_HOURS.find(h => h.dayIndex === dayIndex) || OPERATING_HOURS[1];
}

/**
 * Generates all valid time slots for a given date, checking operating hours,
 * breaks, existing bookings, and past hours if today.
 */
export function generateAvailableSlots(
  dateString: string,
  doctorId: string, // 'any' or specific doctor id
  existingAppointments: Appointment[],
  activeDoctorIds: string[] = ['dr-prasad', 'dr-ananya']
): TimeSlotOption[] {
  if (isDateInPast(dateString)) {
    return [];
  }

  const schedule = getDaySchedule(dateString);
  if (!schedule.isOpen) {
    return [];
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const isToday = (() => {
    const now = new Date();
    return now.getFullYear() === year && (now.getMonth() + 1) === month && now.getDate() === day;
  })();

  const now = new Date();
  const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

  // Active appointments on this date
  const dayAppointments = existingAppointments.filter(
    app => app.date === dateString && app.status !== 'cancelled'
  );

  const slotIntervalMinutes = 30; // standard appointment granularity
  const slots: TimeSlotOption[] = [];

  // Generate slots for a window
  const generateWindow = (openStr: string, closeStr: string, session: 'morning' | 'evening') => {
    const openMins = timeStringToMinutes(openStr);
    const closeMins = timeStringToMinutes(closeStr);

    for (let m = openMins; m + slotIntervalMinutes <= closeMins; m += slotIntervalMinutes) {
      const slotHour = Math.floor(m / 60);
      const slotMinute = m % 60;
      const formattedSlot = formatTo12Hour(slotHour, slotMinute);

      // Check if slot has already passed today
      if (isToday && m <= currentMinutesFromMidnight + 30) {
        slots.push({
          time: formattedSlot,
          available: false,
          reason: 'Time passed',
          session,
        });
        continue;
      }

      // Check double-booking collisions
      let isBooked = false;
      if (doctorId === 'any') {
        // If 'any', check if all eligible doctors are already booked in this slot
        const bookedDoctorsForSlot = dayAppointments
          .filter(a => a.timeSlot === formattedSlot)
          .map(a => a.doctorId);
        
        // If every active doctor is booked, slot is unavailable
        isBooked = activeDoctorIds.every(id => bookedDoctorsForSlot.includes(id));
      } else {
        // Specific doctor check
        isBooked = dayAppointments.some(
          a => a.timeSlot === formattedSlot && a.doctorId === doctorId
        );
      }

      slots.push({
        time: formattedSlot,
        available: !isBooked,
        reason: isBooked ? 'Reserved' : undefined,
        session,
      });
    }
  };

  // Morning window
  generateWindow(schedule.morningOpen, schedule.morningClose, 'morning');

  // Evening window (if applicable, e.g. Mon-Sat)
  if (schedule.eveningOpen && schedule.eveningClose) {
    generateWindow(schedule.eveningOpen, schedule.eveningClose, 'evening');
  }

  return slots;
}

/**
 * Validates whether a specific slot can be booked right now to prevent double-booking
 */
export function isSlotAvailable(
  dateString: string,
  timeSlot: string,
  doctorId: string,
  existingAppointments: Appointment[],
  activeDoctorIds: string[] = ['dr-prasad', 'dr-ananya']
): boolean {
  const slots = generateAvailableSlots(dateString, doctorId, existingAppointments, activeDoctorIds);
  const target = slots.find(s => s.time === timeSlot);
  return Boolean(target && target.available);
}

/**
 * Generates a memorable 6-character booking reference code (e.g., AD-4829)
 */
export function generateReferenceCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AD-${num}`;
}

/**
 * Creates a Google Calendar URL for one-click add
 */
export function createGoogleCalendarUrl(appointment: Appointment): string {
  const [year, month, day] = appointment.date.split('-');
  
  // Parse timeSlot like "10:30 AM" or "04:00 PM"
  const [time, period] = appointment.timeSlot.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;

  const startDate = new Date(Number(year), Number(month) - 1, Number(day), h, m);
  const endDate = new Date(startDate.getTime() + appointment.durationMinutes * 60000);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const title = encodeURIComponent(`Dental Appointment: ${appointment.serviceName} at Advance Dental`);
  const details = encodeURIComponent(
    `Confirmed appointment at ${CLINIC_CONFIG.name} (${CLINIC_CONFIG.legalName}).\n` +
    `Doctor: ${appointment.doctorName}\n` +
    `Booking Ref: ${appointment.referenceCode}\n` +
    `Patient: ${appointment.patientName} (${appointment.patientPhone})\n` +
    `Clinic Phone: ${CLINIC_CONFIG.phoneFormatted}\n` +
    `Address: ${CLINIC_CONFIG.address}, ${CLINIC_CONFIG.city}\n` +
    `Landmark: ${CLINIC_CONFIG.landmark}`
  );
  const location = encodeURIComponent(`${CLINIC_CONFIG.address}, ${CLINIC_CONFIG.city}, Karnataka 560040`);
  const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/**
 * Generates and triggers download of an .ics iCalendar file
 */
export function downloadIcsFile(appointment: Appointment) {
  const [year, month, day] = appointment.date.split('-');
  const [time, period] = appointment.timeSlot.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;

  const startDate = new Date(Number(year), Number(month) - 1, Number(day), h, m);
  const endDate = new Date(startDate.getTime() + appointment.durationMinutes * 60000);

  const formatIcs = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Advance Dental//Appointment Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${appointment.referenceCode}-${Date.now()}@advancedental.in`,
    `DTSTAMP:${formatIcs(new Date())}`,
    `DTSTART:${formatIcs(startDate)}`,
    `DTEND:${formatIcs(endDate)}`,
    `SUMMARY:Dental Appointment: ${appointment.serviceName}`,
    `DESCRIPTION:Appointment at Advance Dental with ${appointment.doctorName}. Ref: ${appointment.referenceCode}`,
    `LOCATION:${CLINIC_CONFIG.address}, ${CLINIC_CONFIG.city}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Advance_Dental_${appointment.referenceCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Creates a direct WhatsApp link with pre-filled booking details
 */
export function createWhatsAppConfirmationLink(appointment: Appointment): string {
  const text = encodeURIComponent(
    `Hello Advance Dental Team! I have booked an appointment.\n` +
    `Ref Code: ${appointment.referenceCode}\n` +
    `Patient: ${appointment.patientName}\n` +
    `Service: ${appointment.serviceName}\n` +
    `Doctor: ${appointment.doctorName}\n` +
    `Date: ${appointment.date} at ${appointment.timeSlot}\n` +
    `Please confirm my slot. Thank you!`
  );
  return `https://wa.me/919845012348?text=${text}`;
}
