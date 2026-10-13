export type ServiceCategory = 
  | 'all'
  | 'preventive'
  | 'root-canal'
  | 'implants'
  | 'prosthetics'
  | 'cosmetic'
  | 'surgery'
  | 'pediatric';

export interface DentalService {
  id: string;
  name: string;
  category: Exclude<ServiceCategory, 'all'>;
  durationMinutes: number;
  priceInr: number;
  priceLabel: string;
  priceType: 'fixed' | 'starting_at' | 'consultation';
  shortDescription: string;
  fullDescription: string;
  preparationAdvice: string;
  popular?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  qualifications: string[];
  experienceYears: number;
  specialization: string;
  bio: string;
  availableDays: number[]; // 0 for Sun, 1-6 for Mon-Sat
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'rescheduled' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  referenceCode: string; // e.g. "AD-8492"
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  durationMinutes: number;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge?: string;
  patientGender?: string;
  notes?: string;
  isFirstVisit: boolean;
  status: AppointmentStatus;
  feeEstimated: number;
  createdAt: string; // ISO
  cancellationReason?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  treatment: string;
  comment: string;
  verified: boolean;
  source: 'Practo' | 'Justdial' | 'Google Maps';
}

export interface OperatingHours {
  dayName: string;
  dayIndex: number; // 0=Sunday, 1=Monday...
  isOpen: boolean;
  morningOpen: string;
  morningClose: string;
  eveningOpen?: string;
  eveningClose?: string;
}

export interface ClinicConfig {
  name: string;
  legalName: string;
  leadDentist: string;
  phone: string;
  phoneFormatted: string;
  whatsapp: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  ratingScore: number;
  totalReviewCount: number;
  consultationFeeInr: number;
  bufferMinutes: number;
}
