'use client';

import React from 'react';
import { X, ShieldCheck, Lock, EyeOff } from 'lucide-react';
import { Language } from '@/lib/types';

interface PrivacyModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, language, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-100">
              {language === 'am' ? 'የግላዊነት እና የAI ይፋ ማድረጊያ መግለጫ' : 'Privacy Notice & AI Disclosure'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-2.5">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100">AI Assistance Disclosure</h4>
              <p className="text-slate-400">
                GIRMAIC Voice Assistant is an artificial intelligence application created for GIRMAIC AI Technology and Trading. It is not a human employee.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-2.5">
            <EyeOff className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100">Microphone & Audio Privacy</h4>
              <p className="text-slate-400">
                Your microphone input is processed strictly to convert speech to text for conversation. Audio files are not permanently stored or recorded without your permission.
              </p>
            </div>
          </div>

          <p className="text-slate-400 pt-1">
            <strong className="text-slate-200">Organization Notice:</strong> GIRMAIC AI TECHNOLOGY AND TRADING ONE PLC MEMBER is an Ethiopian technology initiative founded by Girma Haile Bunaro in Dire Dawa, Ethiopia.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          Close Privacy Notice
        </button>
      </div>
    </div>
  );
};
