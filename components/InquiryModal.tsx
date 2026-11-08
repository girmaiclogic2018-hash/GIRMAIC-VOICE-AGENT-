'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, Download, Briefcase, PhoneCall, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerInquiry, Language } from '@/lib/types';

interface InquiryModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  inquiries: CustomerInquiry[];
  onAddInquiry: (inquiry: CustomerInquiry) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  language,
  onClose,
  inquiries,
  onAddInquiry,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [interest, setInterest] = useState<CustomerInquiry['businessInterest']>('Services');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    const newInquiry: CustomerInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      businessInterest: interest,
      message: message.trim() || 'General customer inquiry via GIRMAIC Voice Agent.',
      timestamp: new Date().toISOString(),
      status: 'New',
    };

    onAddInquiry(newInquiry);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setContact('');
      setMessage('');
      setActiveTab('list');
    }, 2000);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Contact', 'Business Interest', 'Message', 'Timestamp', 'Status'];
    const rows = inquiries.map((inq) => [
      inq.id,
      `"${inq.name.replace(/"/g, '""')}"`,
      `"${inq.contact.replace(/"/g, '""')}"`,
      inq.businessInterest,
      `"${inq.message.replace(/"/g, '""')}"`,
      inq.timestamp,
      inq.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GIRMAIC_Customer_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {language === 'am' ? 'የመረጃ እና አገልግሎት መጠየቂያ ቅጽ' : 'Customer Inquiry & Lead Collection'}
              </h2>
              <p className="text-[11px] text-slate-400">
                GIRMAIC AI Technology & Trading · Dire Dawa, Ethiopia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'form'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'am' ? 'አዲስ መጠየቂያ አስገባ' : 'Submit New Inquiry'}
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{language === 'am' ? 'የተመዘገቡ መጠየቂያዎች' : 'Inquiries Log'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400">
              {inquiries.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'form' ? (
            submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-100">
                  {language === 'am' ? 'መጠየቂያዎ በስኬት ተመዝግቧል!' : 'Inquiry Submitted Successfully!'}
                </h3>
                <p className="text-xs text-slate-300 max-w-sm">
                  {language === 'am'
                    ? 'እናመሰግናለን። የGIRMAIC ቡድን አባል በተቻለ ፍጥነት ያገኝዎታል!'
                    : 'Thank you! The GIRMAIC team will follow up on your request shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'am' ? 'ሙሉ ስም' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'am' ? 'ምሳሌ፡ አበበ ከበደ' : 'e.g. Girma Haile / Sarah Williams'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'am' ? 'ስልክ ቁጥር ወይም ኢሜይል' : 'Phone Number or Email'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={language === 'am' ? 'ምሳሌ፡ +2519... ወይም email@domain.com' : 'e.g. +251982422266 or email@example.com'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'am' ? 'የንግድ ወይም የአገልግሎት ፍላጎት' : 'Business Interest / Inquiry Type'}
                  </label>
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Services">AI Services & Voice Integration (የድምፅ AI)</option>
                    <option value="Trading">Technology Trading & Products (የቴክኖሎጂ ንግድ)</option>
                    <option value="Partnership">Business Partnership (ሽርክና)</option>
                    <option value="Appointment">Consultation / Appointment Request (ቀጠሮ)</option>
                    <option value="General Inquiry">General Inquiry (ጠቅላላ ጥያቄ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'am' ? 'የመጠየቂያ ዝርዝር ወይም መልዕክት' : 'Inquiry Message / Details'}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      language === 'am'
                        ? 'እባክዎ የሚፈልጉትን አገልግሎት ወይም ጥያቄዎን እዚህ ይግለጹ...'
                        : 'Please describe your inquiry, project scope, or questions...'
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'am' ? 'መጠየቂያውን ላክ' : 'Submit Inquiry'}</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">
                  {inquiries.length} {inquiries.length === 1 ? 'Record' : 'Records'} Found
                </span>
                <button
                  onClick={handleExportCSV}
                  disabled={inquiries.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {inquiries.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No inquiries collected yet.</p>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{inq.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {inq.businessInterest}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-400">{inq.contact}</div>
                      <p className="text-xs text-slate-300 italic">&quot;{inq.message}&quot;</p>
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80" suppressHydrationWarning>
                        Submitted: {isMounted ? new Date(inq.timestamp).toLocaleString() : inq.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
