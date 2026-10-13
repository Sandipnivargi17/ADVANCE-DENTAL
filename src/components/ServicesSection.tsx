import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { DENTAL_SERVICES } from '../data/clinicData';
import { DentalService, ServiceCategory } from '../types/dental';
import { Search, Clock, ArrowRight, Info, Check, Shield } from 'lucide-react';

const CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: 'all', label: 'All Treatments' },
  { id: 'preventive', label: 'Diagnostics & Hygiene' },
  { id: 'root-canal', label: 'Laser Root Canal' },
  { id: 'implants', label: 'Dental Implants' },
  { id: 'prosthetics', label: 'Crowns & Bridges' },
  { id: 'cosmetic', label: 'Smile Makeovers' },
  { id: 'surgery', label: 'Surgery & Aligners' },
  { id: 'pediatric', label: 'Pediatric Care' },
];

export const ServicesSection: React.FC = () => {
  const { openBooking } = useBooking();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInfoId, setExpandedInfoId] = useState<string | null>(null);

  const filteredServices = DENTAL_SERVICES.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <section id="treatments" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-800 mb-2">
              Comprehensive Dental Specializations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
              Specialized treatments with transparent pricing.
            </h2>
            <p className="mt-2 text-slate-600 text-base">
              Every procedure is explained before beginning. No hidden costs or unneeded procedures.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search treatment or symptom..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Category Filter Tabs (Interactive Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Treatment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div
              key={service.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div>
                {/* Unboxed Metadata Strip */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.durationMinutes} mins</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{service.category.replace('-', ' ')}</span>
                  </div>
                  {service.popular && (
                    <span className="text-teal-700 font-semibold text-[11px] tracking-wide uppercase">
                      Most Requested
                    </span>
                  )}
                </div>

                {/* Treatment Title */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Expanded preparation advice toggle */}
                {expandedInfoId === service.id ? (
                  <div className="mt-3 p-3 bg-teal-50/70 border border-teal-100 rounded-lg text-xs text-teal-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-teal-700" />
                      <span>Clinical Details:</span>
                    </p>
                    <p>{service.fullDescription}</p>
                    <p className="text-teal-800 pt-1">
                      <strong>Preparation:</strong> {service.preparationAdvice}
                    </p>
                    <button
                      onClick={() => setExpandedInfoId(null)}
                      className="text-teal-700 font-semibold underline text-[11px] pt-1 block cursor-pointer"
                    >
                      Hide details
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedInfoId(service.id)}
                    className="mt-3 text-xs text-slate-500 hover:text-teal-700 inline-flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>View preparation & details</span>
                  </button>
                )}
              </div>

              {/* Price & Action Row */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                    {service.priceType === 'fixed'
                      ? 'Treatment Fee'
                      : service.priceType === 'starting_at'
                      ? 'Starting from'
                      : 'Consultation'}
                  </div>
                  <div className="text-xl font-bold text-slate-900 tabular-nums">
                    {service.priceLabel}
                  </div>
                </div>

                <button
                  onClick={() => openBooking(service.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-teal-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-base text-slate-700 font-medium">
              No treatments matched "{searchQuery}" in this category.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-teal-700 font-semibold underline cursor-pointer"
            >
              Reset filters to show all services
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
