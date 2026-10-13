/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookingProvider } from './context/BookingContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DoctorSection } from './components/DoctorSection';
import { ServicesSection } from './components/ServicesSection';
import { TechAndSafetySection } from './components/TechAndSafetySection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { AppointmentLookupModal } from './components/AppointmentLookupModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PolicyModal } from './components/PolicyModal';
import { MobileStickyBar } from './components/MobileStickyBar';

export default function App() {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 pb-16 lg:pb-0">
        <Header />
        <main className="flex-grow">
          <Hero />
          <ServicesSection />
          <DoctorSection />
          <TechAndSafetySection />
          <ReviewsSection />
          <LocationSection />
        </main>
        <Footer />

        {/* Interactive Overlays & Modals */}
        <BookingModal />
        <AppointmentLookupModal />
        <AdminDashboard />
        <PolicyModal />
        <MobileStickyBar />
      </div>
    </BookingProvider>
  );
}
