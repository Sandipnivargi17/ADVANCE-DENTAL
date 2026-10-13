import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appointment, DentalService, Doctor } from '../types/dental';
import { INITIAL_APPOINTMENTS, DENTAL_SERVICES, DOCTORS } from '../data/clinicData';
import { isSlotAvailable, generateReferenceCode } from '../utils/bookingUtils';
import {
  testSupabaseConnection,
  insertAppointmentToSupabase,
  updateAppointmentStatusInSupabase,
  rescheduleAppointmentInSupabase,
  fetchAppointmentsFromSupabase,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
} from '../lib/supabase';

export interface SupabaseSyncStatus {
  connected: boolean;
  tableExists: boolean;
  message: string;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  projectId: string;
}

interface BookingContextType {
  appointments: Appointment[];
  services: DentalService[];
  doctors: Doctor[];
  isBookingOpen: boolean;
  preselectedServiceId: string | null;
  isLookupOpen: boolean;
  isAdminOpen: boolean;
  policyModal: {
    isOpen: boolean;
    type: 'cancellation' | 'privacy' | 'charter';
  };
  supabaseStatus: SupabaseSyncStatus;
  checkSupabaseHealth: () => Promise<void>;
  syncLocalToSupabase: () => Promise<{ success: boolean; syncedCount: number; error?: string }>;
  openBooking: (serviceId?: string) => void;
  closeBooking: () => void;
  openLookup: () => void;
  closeLookup: () => void;
  openAdmin: () => void;
  closeAdmin: () => void;
  openPolicy: (type: 'cancellation' | 'privacy' | 'charter') => void;
  closePolicy: () => void;
  bookAppointment: (
    data: Omit<Appointment, 'id' | 'referenceCode' | 'createdAt' | 'status'>
  ) => Promise<{ success: boolean; appointment?: Appointment; supabaseSaved?: boolean; error?: string }>;
  cancelAppointment: (referenceCode: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  rescheduleAppointment: (referenceCode: string, newDate: string, newTimeSlot: string) => Promise<{ success: boolean; error?: string }>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addWalkinAppointment: (appointment: Appointment) => Promise<void>;
  findAppointmentByRef: (ref: string) => Appointment | undefined;
  findAppointmentsByPhone: (phone: string) => Appointment[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEY = 'advance_dental_appointments_v1';

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load appointments from localStorage', e);
    }
    return INITIAL_APPOINTMENTS;
  });

  const [services] = useState<DentalService[]>(DENTAL_SERVICES);
  const [doctors] = useState<Doctor[]>(DOCTORS);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [policyModal, setPolicyModal] = useState<{
    isOpen: boolean;
    type: 'cancellation' | 'privacy' | 'charter';
  }>({
    isOpen: false,
    type: 'cancellation',
  });

  // Supabase live status
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseSyncStatus>({
    connected: false,
    tableExists: false,
    message: 'Testing Supabase connection...',
    isSyncing: false,
    lastSyncedAt: null,
    projectId: SUPABASE_PROJECT_ID,
  });

  // Check Supabase Health and load records if available
  const checkSupabaseHealth = useCallback(async () => {
    setSupabaseStatus(prev => ({ ...prev, isSyncing: true }));
    const health = await testSupabaseConnection();

    if (health.connected && health.tableExists) {
      // Fetch latest records from Supabase
      const remote = await fetchAppointmentsFromSupabase();
      if (remote.success && remote.appointments && remote.appointments.length > 0) {
        setAppointments(prev => {
          // Merge remote appointments with any local unique ones
          const remoteRefs = new Set(remote.appointments!.map(a => a.referenceCode));
          const localOnly = prev.filter(a => !remoteRefs.has(a.referenceCode));
          return [...remote.appointments!, ...localOnly];
        });
      }

      setSupabaseStatus({
        connected: true,
        tableExists: true,
        message: 'Connected to Supabase. Appointments will be saved directly to the database.',
        isSyncing: false,
        lastSyncedAt: new Date().toLocaleTimeString(),
        projectId: SUPABASE_PROJECT_ID,
      });
    } else {
      setSupabaseStatus({
        connected: health.connected,
        tableExists: health.tableExists,
        message: health.message,
        isSyncing: false,
        lastSyncedAt: null,
        projectId: SUPABASE_PROJECT_ID,
      });
    }
  }, []);

  // Run health check on mount
  useEffect(() => {
    checkSupabaseHealth();
  }, [checkSupabaseHealth]);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed to save appointments to localStorage', e);
    }
  }, [appointments]);

  const openBooking = (serviceId?: string) => {
    setPreselectedServiceId(serviceId || null);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    setPreselectedServiceId(null);
  };

  const openLookup = () => setIsLookupOpen(true);
  const closeLookup = () => setIsLookupOpen(false);

  const openAdmin = () => setIsAdminOpen(true);
  const closeAdmin = () => setIsAdminOpen(false);

  const openPolicy = (type: 'cancellation' | 'privacy' | 'charter') => {
    setPolicyModal({ isOpen: true, type });
  };
  const closePolicy = () => {
    setPolicyModal(prev => ({ ...prev, isOpen: false }));
  };

  /**
   * Sync all local appointments to Supabase
   */
  const syncLocalToSupabase = async (): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
    setSupabaseStatus(prev => ({ ...prev, isSyncing: true }));
    let synced = 0;
    let lastError: string | undefined;

    for (const app of appointments) {
      const res = await insertAppointmentToSupabase(app);
      if (res.success) {
        synced++;
      } else {
        lastError = res.error;
      }
    }

    await checkSupabaseHealth();
    return {
      success: synced > 0 || !lastError,
      syncedCount: synced,
      error: lastError,
    };
  };

  const bookAppointment = async (
    data: Omit<Appointment, 'id' | 'referenceCode' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; appointment?: Appointment; supabaseSaved?: boolean; error?: string }> => {
    // 1. Double-booking check
    const activeDoctorIds = doctors.map(d => d.id);
    const available = isSlotAvailable(
      data.date,
      data.timeSlot,
      data.doctorId,
      appointments,
      activeDoctorIds
    );

    if (!available) {
      return {
        success: false,
        error: 'This appointment slot was just reserved or is no longer available. Please select another time.',
      };
    }

    // 2. Resolve Doctor Name if "any" was selected
    let resolvedDoctorId = data.doctorId;
    let resolvedDoctorName = data.doctorName;
    if (data.doctorId === 'any') {
      const dayAppointments = appointments.filter(
        a => a.date === data.date && a.timeSlot === data.timeSlot && a.status !== 'cancelled'
      );
      const bookedDoctorIds = dayAppointments.map(a => a.doctorId);
      const freeDoc = doctors.find(d => !bookedDoctorIds.includes(d.id)) || doctors[0];
      resolvedDoctorId = freeDoc.id;
      resolvedDoctorName = freeDoc.name;
    }

    const newAppointment: Appointment = {
      ...data,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      referenceCode: generateReferenceCode(),
      doctorId: resolvedDoctorId,
      doctorName: resolvedDoctorName,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // 3. Save to Supabase
    let supabaseSaved = false;
    try {
      const dbResult = await insertAppointmentToSupabase(newAppointment);
      if (dbResult.success) {
        supabaseSaved = true;
        setSupabaseStatus(prev => ({
          ...prev,
          lastSyncedAt: new Date().toLocaleTimeString(),
        }));
      }
    } catch (e) {
      console.warn('Supabase insertion error:', e);
    }

    // 4. Update local appointments state
    setAppointments(prev => [newAppointment, ...prev]);

    return {
      success: true,
      appointment: newAppointment,
      supabaseSaved,
    };
  };

  const cancelAppointment = async (referenceCode: string, reason?: string) => {
    const target = appointments.find(
      a => a.referenceCode.toUpperCase() === referenceCode.toUpperCase()
    );

    if (!target) {
      return { success: false, error: 'Appointment reference not found.' };
    }

    if (target.status === 'cancelled') {
      return { success: false, error: 'Appointment is already cancelled.' };
    }

    // Update in Supabase
    await updateAppointmentStatusInSupabase(target.id, 'cancelled', reason || 'Cancelled by patient');

    setAppointments(prev =>
      prev.map(app =>
        app.referenceCode.toUpperCase() === referenceCode.toUpperCase()
          ? { ...app, status: 'cancelled', cancellationReason: reason || 'Cancelled by patient' }
          : app
      )
    );

    return { success: true };
  };

  const rescheduleAppointment = async (
    referenceCode: string,
    newDate: string,
    newTimeSlot: string
  ) => {
    const target = appointments.find(
      a => a.referenceCode.toUpperCase() === referenceCode.toUpperCase()
    );

    if (!target) {
      return { success: false, error: 'Appointment not found.' };
    }

    const otherAppointments = appointments.filter(a => a.id !== target.id);
    const available = isSlotAvailable(
      newDate,
      newTimeSlot,
      target.doctorId,
      otherAppointments,
      doctors.map(d => d.id)
    );

    if (!available) {
      return { success: false, error: 'The selected rescheduled time slot is unavailable.' };
    }

    // Update in Supabase
    await rescheduleAppointmentInSupabase(referenceCode, newDate, newTimeSlot);

    setAppointments(prev =>
      prev.map(app =>
        app.id === target.id
          ? {
              ...app,
              date: newDate,
              timeSlot: newTimeSlot,
              status: 'rescheduled',
            }
          : app
      )
    );

    return { success: true };
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    updateAppointmentStatusInSupabase(id, status);
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );
  };

  const addWalkinAppointment = async (appointment: Appointment) => {
    await insertAppointmentToSupabase(appointment);
    setAppointments(prev => [appointment, ...prev]);
  };

  const findAppointmentByRef = (ref: string) => {
    return appointments.find(
      a => a.referenceCode.trim().toUpperCase() === ref.trim().toUpperCase()
    );
  };

  const findAppointmentsByPhone = (phone: string) => {
    const cleanQuery = phone.replace(/[^0-9]/g, '');
    if (cleanQuery.length < 5) return [];
    return appointments.filter(a => {
      const cleanPhone = a.patientPhone.replace(/[^0-9]/g, '');
      return cleanPhone.includes(cleanQuery);
    });
  };

  return (
    <BookingContext.Provider
      value={{
        appointments,
        services,
        doctors,
        isBookingOpen,
        preselectedServiceId,
        isLookupOpen,
        isAdminOpen,
        policyModal,
        supabaseStatus,
        checkSupabaseHealth,
        syncLocalToSupabase,
        openBooking,
        closeBooking,
        openLookup,
        closeLookup,
        openAdmin,
        closeAdmin,
        openPolicy,
        closePolicy,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        updateAppointmentStatus,
        addWalkinAppointment,
        findAppointmentByRef,
        findAppointmentsByPhone,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
