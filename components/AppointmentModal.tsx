'use client';

import React, { useState } from 'react';
import { X, Calendar, Download, Plus, CheckCircle2, Clock, Phone, User, Sparkles, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppointmentRecord, Language } from '@/lib/types';

interface AppointmentModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  appointments: AppointmentRecord[];
  onAddAppointment: (apt: AppointmentRecord) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  language,
  onClose,
  appointments,
  onAddAppointment,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() =>
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [serviceCategory, setServiceCategory] = useState('AI Voice Service Consultation');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerName.trim() || !callerPhone.trim()) return;

    const newApt: AppointmentRecord = {
      id: `apt-${Date.now()}`,
      callerName: callerName.trim(),
      callerPhone: callerPhone.trim(),
      appointmentDate,
      appointmentTime,
      serviceCategory,
      notes: notes.trim() || 'Appointment created via GIRMAIC Voice Interface.',
      timestamp: new Date().toISOString(),
      status: 'Confirmed',
      autoBooked: true,
    };

    onAddAppointment(newApt);
    setSubmitted(true);

    import('canvas-confetti')
      .then((mod) => {
        const conf = mod.default || mod;
        conf({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      })
      .catch(() => {});

    setTimeout(() => {
      setSubmitted(false);
      setCallerName('');
      setCallerPhone('');
      setNotes('');
      setActiveTab('list');
    }, 1800);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Caller Name', 'Caller Phone', 'Date', 'Time', 'Service Category', 'Status', 'Auto Booked'];
    const rows = appointments.map((apt) => [
      apt.id,
      `"${apt.callerName.replace(/"/g, '""')}"`,
      `"${apt.callerPhone.replace(/"/g, '""')}"`,
      apt.appointmentDate,
      apt.appointmentTime,
      `"${apt.serviceCategory.replace(/"/g, '""')}"`,
      apt.status,
      apt.autoBooked ? 'Yes (No Human Intervention)' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GIRMAIC_AutoBooked_Appointments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {language === 'am' ? 'በራስ-ሰር የተያዙ የቀጠሮ መዝገቦች' : 'Autonomous AI Appointments Manager'}
              </h2>
              <p className="text-[11px] text-slate-400">
                GIRMAIC AI Phone Operator · Dire Dawa, Ethiopia
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'የተመዘገቡ ቀጠሮዎች' : 'Auto-Booked List'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'አዲስ ቀጠሮ ያዝ' : 'Book New Slot'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">
                  {appointments.length} {appointments.length === 1 ? 'Appointment' : 'Appointments'} Found
                </span>
                <button
                  onClick={handleExportCSV}
                  disabled={appointments.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No appointments scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-slate-100">{apt.callerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {apt.autoBooked && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              AUTO-BOOKED (NO HUMAN)
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {apt.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-mono">{apt.callerPhone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{apt.appointmentDate} at {apt.appointmentTime}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Service:</strong> {apt.serviceCategory}
                      </div>

                      {apt.notes && (
                        <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          &quot;{apt.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-100">
                  {language === 'am' ? 'ቀጠሮዎ በራስ-ሰር ተይዟል!' : 'Appointment Booked Automatically!'}
                </h3>
                <p className="text-xs text-slate-300 max-w-sm">
                  The appointment has been confirmed in the GIRMAIC AI Operator schedule.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Caller / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="e.g. Solomon Bekele / Sarah Williams"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    placeholder="e.g. +251911223344"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Time *</label>
                    <input
                      type="text"
                      required
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      placeholder="e.g. 10:30 AM"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Service Category</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="AI Voice Service Consultation">AI Voice Service Consultation</option>
                    <option value="Technology Trading Procurement">Technology Trading Procurement</option>
                    <option value="Enterprise AI Integration">Enterprise AI Integration</option>
                    <option value="General Consultation">General Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Appointment Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specific requests or project details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};
