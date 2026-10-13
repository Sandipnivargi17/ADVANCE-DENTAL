import React, { useState } from 'react';
import { CLINIC_CONFIG, OPERATING_HOURS } from '../data/clinicData';
import { MapPin, Phone, MessageSquare, Clock, Send, ExternalLink, CheckCircle, Navigation } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;
    setInquirySubmitted(true);
  };

  return (
    <section id="location" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-800 mb-2">
            Location & Timings
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
            Conveniently located in Vijayanagar, Bengaluru.
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Easy access from Vijayanagar Metro Station, Magadi Road, and Chord Road. Dedicated ground floor access and parking available.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Clinic Details & Operating Hours (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Address & Landmark Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-700 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {CLINIC_CONFIG.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-medium mb-1">
                    {CLINIC_CONFIG.legalName}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {CLINIC_CONFIG.address},<br />
                    {CLINIC_CONFIG.city}, {CLINIC_CONFIG.state} – {CLINIC_CONFIG.pincode}
                  </p>
                  <p className="text-xs text-teal-800 font-medium mt-1">
                    Landmark: {CLINIC_CONFIG.landmark}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href={CLINIC_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <a
                  href={`tel:${CLINIC_CONFIG.phone}`}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call {CLINIC_CONFIG.phoneFormatted}</span>
                </a>

                <a
                  href={`https://wa.me/919845012348?text=${encodeURIComponent("Hello Advance Dental, I have an inquiry regarding treatment at your Vijayanagar clinic.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Clinic</span>
                </a>
              </div>
            </div>

            {/* Operating Hours Table */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-teal-700" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Weekly Operating Schedule
                </h4>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-sm">
                {OPERATING_HOURS.map(sched => (
                  <div
                    key={sched.dayName}
                    className="px-4 py-3 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 w-28">
                      {sched.dayName}
                    </span>
                    <span className="text-slate-600 tabular-nums">
                      {sched.eveningOpen ? (
                        <>
                          <span>9:30 AM – 2:30 PM</span>
                          <span className="text-slate-400 mx-1.5">|</span>
                          <span>3:00 PM – 8:30 PM</span>
                        </>
                      ) : (
                        <span>10:30 AM – 3:00 PM</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                * Daily clinical break observed between 2:30 PM and 3:00 PM for sterilization cycle.
              </p>
            </div>
          </div>

          {/* Quick Contact & Inquiry Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Have a Question or Special Request?
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Send a message directly to our clinic desk. We respond promptly during operating hours.
              </p>

              {inquirySubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-950">
                    Message Received
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Thank you, {inquiryName}! Our receptionist will call or WhatsApp you shortly at {inquiryPhone}.
                  </p>
                  <button
                    onClick={() => {
                      setInquirySubmitted(false);
                      setInquiryName('');
                      setInquiryPhone('');
                      setInquiryMessage('');
                    }}
                    className="text-xs font-semibold text-emerald-900 underline pt-2 cursor-pointer"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={e => setInquiryName(e.target.value)}
                      placeholder="e.g. Ramesh V."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={e => setInquiryPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Inquiry / Symptoms (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryMessage}
                      onChange={e => setInquiryMessage(e.target.value)}
                      placeholder="e.g. Tooth sensitivity, inquiry about dental implants or braces..."
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 font-semibold text-sm text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Clinic Desk</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Your details are strictly confidential. We never spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
