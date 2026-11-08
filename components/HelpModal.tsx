'use client';

import React from 'react';
import { X, HelpCircle, Smartphone, Mic, Globe, CheckCircle } from 'lucide-react';
import { Language } from '@/lib/types';

interface HelpModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, language, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-100">
              {language === 'am' ? 'የአጠቃቀም መመሪያ እና ድጋፍ' : 'Usage Guide & Testing Instructions'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Quick steps */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Mic className="w-4 h-4" />
              How to Interact with GIRMAIC AI
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
              <li>Click the large central <strong>Microphone Button</strong> to start voice input.</li>
              <li>Grant microphone permission when prompted by Chrome/Android.</li>
              <li>Speak your question clearly in <strong>English</strong> or <strong>Amharic (አማርኛ)</strong>.</li>
              <li>Toggle between English and Amharic anytime using the language selector.</li>
              <li>Type your question in the text bar if microphone access is restricted.</li>
            </ol>
          </div>

          {/* Android Guide */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Testing on Android Phones
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Open URL in Google Chrome mobile browser on Android.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tap &quot;Allow&quot; for microphone permissions when requested.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>If 3D graphics lag on older Android devices, enable &quot;2D Avatar Mode&quot; in Settings.</span>
              </li>
            </ul>
          </div>

          {/* Contact HQ */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400 text-xs">GIRMAIC AI Dire Dawa HQ Contact</h4>
            <p className="text-[11px] text-slate-300">Email: girmaiclogic2018@gmail.com</p>
            <p className="text-[11px] text-slate-300">Phone: +251982422266</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
