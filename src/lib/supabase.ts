import { createClient } from '@supabase/supabase-js';
import { Appointment } from '../types/dental';

export const SUPABASE_PROJECT_ID = 'axuyqpoylyjmzyfsklxh';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_y-Bbcb2Y1Wh_Js_lLpM35Q_sebdyDjR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface SupabaseAppointmentRow {
  id: string;
  reference_code: string;
  service_id: string;
  service_name: string;
  service_category?: string;
  doctor_id: string;
  doctor_name: string;
  appointment_date: string;
  time_slot: string;
  duration_minutes: number;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_age?: string;
  patient_gender?: string;
  notes?: string;
  is_first_visit: boolean;
  status: string;
  fee_estimated: number;
  created_at?: string;
  cancellation_reason?: string;
}

export const SQL_SCHEMA_SETUP = `-- Run this in your Supabase SQL Editor:
-- Project: ${SUPABASE_PROJECT_ID}
-- 1. Create the appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  reference_code TEXT NOT NULL UNIQUE,
  service_id TEXT,
  service_name TEXT NOT NULL,
  service_category TEXT,
  doctor_id TEXT,
  doctor_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  patient_age TEXT,
  patient_gender TEXT,
  notes TEXT,
  is_first_visit BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'confirmed',
  fee_estimated NUMERIC DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancellation_reason TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Policy to allow anonymous site visitors to insert new bookings
CREATE POLICY "Allow public insert" ON public.appointments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. Policy to allow visitors and receptionist to view bookings
CREATE POLICY "Allow public select" ON public.appointments
  FOR SELECT TO anon, authenticated
  USING (true);

-- 5. Policy to allow rescheduling or cancellation updates
CREATE POLICY "Allow public update" ON public.appointments
  FOR UPDATE TO anon, authenticated
  USING (true);

-- 6. Policy to allow deletions if needed
CREATE POLICY "Allow public delete" ON public.appointments
  FOR DELETE TO anon, authenticated
  USING (true);
`;

/**
 * Maps frontend Appointment object to Supabase row format
 */
export function appointmentToRow(app: Appointment): SupabaseAppointmentRow {
  return {
    id: app.id,
    reference_code: app.referenceCode,
    service_id: app.serviceId,
    service_name: app.serviceName,
    service_category: app.serviceCategory,
    doctor_id: app.doctorId,
    doctor_name: app.doctorName,
    appointment_date: app.date,
    time_slot: app.timeSlot,
    duration_minutes: app.durationMinutes,
    patient_name: app.patientName,
    patient_phone: app.patientPhone,
    patient_email: app.patientEmail || undefined,
    patient_age: app.patientAge || undefined,
    patient_gender: app.patientGender || undefined,
    notes: app.notes || undefined,
    is_first_visit: app.isFirstVisit,
    status: app.status,
    fee_estimated: app.feeEstimated,
    created_at: app.createdAt,
    cancellation_reason: app.cancellationReason || undefined,
  };
}

/**
 * Maps Supabase row to frontend Appointment object
 */
export function rowToAppointment(row: any): Appointment {
  return {
    id: row.id,
    referenceCode: row.reference_code,
    serviceId: row.service_id || 'consultation-checkup',
    serviceName: row.service_name || 'General Dental Consultation',
    serviceCategory: row.service_category || 'preventive',
    doctorId: row.doctor_id || 'dr-prasad',
    doctorName: row.doctor_name || 'Dr. Prasad Kulkarni',
    date: row.appointment_date,
    timeSlot: row.time_slot,
    durationMinutes: Number(row.duration_minutes) || 30,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientEmail: row.patient_email || '',
    patientAge: row.patient_age || undefined,
    patientGender: row.patient_gender || undefined,
    notes: row.notes || undefined,
    isFirstVisit: Boolean(row.is_first_visit),
    status: row.status || 'confirmed',
    feeEstimated: Number(row.fee_estimated) || 200,
    createdAt: row.created_at || new Date().toISOString(),
    cancellationReason: row.cancellation_reason || undefined,
  };
}

/**
 * Checks connection to Supabase and whether the `appointments` table exists
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
}> {
  try {
    const { data, error } = await supabase.from('appointments').select('id').limit(1);

    if (error) {
      if (
        error.code === 'PGRST205' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('not find the table')
      ) {
        return {
          connected: true,
          tableExists: false,
          message:
            "Connected to Supabase project, but the 'appointments' table has not been created yet in your database.",
        };
      }
      return {
        connected: false,
        tableExists: false,
        message: error.message || 'Supabase connection failed.',
      };
    }

    return {
      connected: true,
      tableExists: true,
      message: "Connected! The 'appointments' table is ready and syncing.",
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      message: err?.message || 'Network error reaching Supabase endpoint.',
    };
  }
}

/**
 * Inserts a single appointment into Supabase
 */
export async function insertAppointmentToSupabase(
  app: Appointment
): Promise<{ success: boolean; error?: string }> {
  try {
    const row = appointmentToRow(app);
    const { error } = await supabase.from('appointments').insert([row]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to insert to Supabase' };
  }
}

/**
 * Updates appointment status in Supabase
 */
export async function updateAppointmentStatusInSupabase(
  id: string,
  status: string,
  cancellationReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = { status };
    if (cancellationReason) {
      updatePayload.cancellation_reason = cancellationReason;
    }
    const { error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update in Supabase' };
  }
}

/**
 * Updates rescheduled date & time in Supabase
 */
export async function rescheduleAppointmentInSupabase(
  referenceCode: string,
  date: string,
  timeSlot: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        appointment_date: date,
        time_slot: timeSlot,
        status: 'rescheduled',
      })
      .eq('reference_code', referenceCode);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reschedule in Supabase' };
  }
}

/**
 * Fetches all appointments from Supabase
 */
export async function fetchAppointmentsFromSupabase(): Promise<{
  success: boolean;
  appointments?: Appointment[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: true, appointments: [] };
    }

    const parsed = data.map(rowToAppointment);
    return { success: true, appointments: parsed };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch from Supabase' };
  }
}
