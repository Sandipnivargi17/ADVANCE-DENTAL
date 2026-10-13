import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Appointment, DentalService } from '../types/dental';
import { CLINIC_CONFIG } from '../data/clinicData';
import { SQL_SCHEMA_SETUP, SUPABASE_PROJECT_ID, SUPABASE_URL } from '../lib/supabase';
import {
  X,
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Printer,
  Plus,
  Filter,
  DollarSign,
  Search,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    closeAdmin,
    appointments,
    services,
    doctors,
    updateAppointmentStatus,
    addWalkinAppointment,
    supabaseStatus,
    checkSupabaseHealth,
    syncLocalToSupabase,
  } = useBooking();

  // Authentication gate: PIN 1328
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Walk-in modal state
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServiceId, setWalkinServiceId] = useState(services[0].id);
  const [walkinDoctorId, setWalkinDoctorId] = useState(doctors[0].id);
  const [walkinDate, setWalkinDate] = useState(new Date().toISOString().split('T')[0]);
  const [walkinTime, setWalkinTime] = useState('11:00 AM');

  // Supabase Schema guide toggle & copy state
  const [showSupabaseSetup, setShowSupabaseSetup] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isAdminOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1328' || pinInput === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleManualSync = async () => {
    setSyncFeedback('Syncing with Supabase...');
    const result = await syncLocalToSupabase();
    if (result.success) {
      setSyncFeedback(`Successfully synchronized ${result.syncedCount} appointments to Supabase!`);
    } else {
      setSyncFeedback(`Sync notice: ${result.error || 'Check that appointments table exists in Supabase.'}`);
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesDate = !selectedDateFilter || app.date === selectedDateFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.patientPhone.includes(searchTerm) ||
      app.referenceCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  // Calculate Operational Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
  const totalActive = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Reference Code',
      'Patient Name',
      'Phone',
      'Service',
      'Doctor',
      'Date',
      'Time Slot',
      'Status',
      'Fee Estimated',
      'Created At',
    ];

    const rows = filteredAppointments.map(a => [
      `"${a.referenceCode}"`,
      `"${a.patientName}"`,
      `"${a.patientPhone}"`,
      `"${a.serviceName}"`,
      `"${a.doctorName}"`,
      `"${a.date}"`,
      `"${a.timeSlot}"`,
      `"${a.status}"`,
      a.feeEstimated,
      `"${a.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Advance_Dental_Appointments_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Walk-in submit
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) return;

    const svc = services.find(s => s.id === walkinServiceId) || services[0];
    const doc = doctors.find(d => d.id === walkinDoctorId) || doctors[0];

    const newApp: Appointment = {
      id: `walkin-${Date.now()}`,
      referenceCode: `AD-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: svc.id,
      serviceName: svc.name,
      serviceCategory: svc.category,
      doctorId: doc.id,
      doctorName: doc.name,
      date: walkinDate,
      timeSlot: walkinTime,
      durationMinutes: svc.durationMinutes,
      patientName: walkinName.trim(),
      patientPhone: walkinPhone.trim(),
      patientEmail: 'desk@advancedental.in',
      isFirstVisit: true,
      status: 'confirmed',
      feeEstimated: svc.priceInr,
      createdAt: new Date().toISOString(),
      notes: 'Added as walk-in patient at clinic desk',
    };

    await addWalkinAppointment(newApp);
    setShowWalkinModal(false);
    setWalkinName('');
    setWalkinPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">
                Staff & Reception Console
              </div>
              <h3 className="text-base font-bold text-white">
                {CLINIC_CONFIG.name} · Vijayanagar Front Desk
              </h3>
            </div>
          </div>

          <button
            onClick={closeAdmin}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate Screen */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-800">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">
                Staff Authentication
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Enter your reception PIN to access clinic appointment schedules. (Demo PIN: <strong>1328</strong>)
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Enter 4-digit PIN (1328)"
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-medium">
                  Invalid PIN. Enter 1328 to access.
                </p>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Unlock Reception Desk
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthenticated(true)}
                  className="px-3 py-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Quick Demo Access
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Main Authenticated Dashboard */
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Supabase Connection Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-2">
                      <span>Supabase Project:</span>
                      <code className="text-emerald-300 font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                        {SUPABASE_PROJECT_ID}
                      </code>
                      <span className="text-slate-500">·</span>
                      <span
                        className={`text-[11px] font-medium flex items-center gap-1 ${
                          supabaseStatus.tableExists
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {supabaseStatus.tableExists ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Connected & Active</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Setup Required (Table Missing)</span>
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {supabaseStatus.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowSupabaseSetup(!showSupabaseSetup)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors cursor-pointer"
                  >
                    {showSupabaseSetup ? 'Hide SQL Guide' : 'View SQL Setup'}
                  </button>

                  <button
                    onClick={handleManualSync}
                    disabled={supabaseStatus.isSyncing}
                    className="px-2.5 py-1 text-[11px] font-medium bg-teal-700 hover:bg-teal-600 text-white rounded transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${supabaseStatus.isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Database</span>
                  </button>
                </div>
              </div>

              {syncFeedback && (
                <div className="p-2 bg-slate-800 border border-slate-700 rounded text-xs text-teal-300">
                  {syncFeedback}
                </div>
              )}

              {/* Collapsible Supabase SQL Schema Drawer */}
              {showSupabaseSetup && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">
                        Supabase Database Setup Instructions
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        To enable direct auto-saving in your Supabase backend, run this SQL script once in your Supabase SQL Editor.
                      </p>
                    </div>

                    <button
                      onClick={handleCopySql}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                    </button>
                  </div>

                  <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <li>
                      Open your Supabase Project dashboard: <a href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`} target="_blank" rel="noopener noreferrer" className="text-teal-400 underline inline-flex items-center gap-0.5">Project {SUPABASE_PROJECT_ID} <ExternalLink className="w-2.5 h-2.5" /></a>
                    </li>
                    <li>Click on <strong>SQL Editor</strong> in the left sidebar</li>
                    <li>Click <strong>New query</strong>, paste the copied SQL below, and click <strong>Run</strong></li>
                    <li>Once run, all appointments submitted on the website will instantly appear in your <code>appointments</code> table!</li>
                  </ol>

                  <pre className="p-3 bg-slate-950 text-slate-300 rounded text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                    {SQL_SCHEMA_SETUP}
                  </pre>
                </div>
              )}
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold uppercase">
                  Today's Queue
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {todayCount}
                </div>
                <div className="text-[11px] text-teal-800 font-medium mt-0.5">
                  Scheduled for {todayStr}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold uppercase">
                  Active Confirmed
                </div>
                <div className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
                  {totalActive}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Upcoming bookings
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold uppercase">
                  Completed Treatments
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {completedCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Fulfilled sessions
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold uppercase">
                  Cancelled / No-Show
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {cancelledCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Available for rebooking
                </div>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search patient, phone, ref..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Date Filter */}
                <input
                  type="date"
                  value={selectedDateFilter}
                  onChange={e => setSelectedDateFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
                />
                {selectedDateFilter && (
                  <button
                    onClick={() => setSelectedDateFilter('')}
                    className="text-xs text-slate-500 underline cursor-pointer"
                  >
                    Clear date
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWalkinModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Walk-in</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Walk-in Modal Form */}
            {showWalkinModal && (
              <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    New Reception Walk-in Appointment
                  </h4>
                  <button
                    onClick={() => setShowWalkinModal(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleWalkinSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      value={walkinName}
                      onChange={e => setWalkinName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={walkinPhone}
                      onChange={e => setWalkinPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Treatment</label>
                    <select
                      value={walkinServiceId}
                      onChange={e => setWalkinServiceId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.priceLabel})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Doctor</label>
                    <select
                      value={walkinDoctorId}
                      onChange={e => setWalkinDoctorId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={walkinDate}
                      onChange={e => setWalkinDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={walkinTime}
                      onChange={e => setWalkinTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
                    >
                      Save Walk-in Appointment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appointments Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Treatment</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No appointments match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-teal-800">
                            {app.referenceCode}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{app.patientName}</div>
                            <div className="text-slate-500 text-[11px]">{app.patientPhone}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {app.serviceName}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {app.doctorName}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{app.date}</div>
                            <div className="text-slate-500 text-[11px]">{app.timeSlot}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                app.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'completed'
                                  ? 'bg-slate-100 text-slate-800'
                                  : app.status === 'rescheduled'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status !== 'completed' && app.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'completed')}
                                  className="px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="Mark as Completed"
                                >
                                  Complete
                                </button>
                              )}
                              {app.status !== 'cancelled' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                  className="px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Cancel Appointment"
                                >
                                  Cancel
                                </button>
                              )}
                              {app.status === 'cancelled' && (
                                <button
                                  onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                                  className="px-2 py-1 text-[11px] font-medium text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                                  title="Reinstate"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
