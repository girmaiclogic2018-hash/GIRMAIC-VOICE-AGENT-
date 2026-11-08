'use client';

import React, { useState } from 'react';
import { X, PhoneCall, PhoneForwarded, Cpu, Radio, ShieldAlert, CheckCircle, Play, Square, RefreshCw } from 'lucide-react';
import { Language } from '@/lib/types';

interface TelephonyModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onSimulatePhoneQuery: (text: string) => void;
}

export const TelephonyModal: React.FC<TelephonyModalProps> = ({
  isOpen,
  language,
  onClose,
  onSimulatePhoneQuery,
}) => {
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);
  const [callLog, setCallLog] = useState<string[]>([]);
  const [callStatus, setCallStatus] = useState<'idle' | 'connected' | 'escalating' | 'ended'>('idle');

  if (!isOpen) return null;

  const handleStartSimulatedCall = () => {
    setIsSimulatingCall(true);
    setCallStatus('connected');
    setCallLog([
      '00:00 - SIP Handshake Received (Caller: +251911223344)',
      '00:01 - Webhook routed to /api/telephony (Twilio / Asterisk Protocol)',
      '00:02 - Audio Stream Opened (16kHz Mono PCM Audio)',
      '00:03 - GIRMAIC AI Assistant Connected: "Hello! Welcome to GIRMAIC AI Technology and Trading."',
    ]);
  };

  const handleSimulateQuestion = (questionText: string) => {
    setCallLog((prev) => [
      ...prev,
      `Caller: "${questionText}"`,
      `AI Engine: Processing prompt via Gemini Server API...`,
    ]);
    onSimulatePhoneQuery(questionText);
  };

  const handleEscalateCall = () => {
    setCallStatus('escalating');
    setCallLog((prev) => [
      ...prev,
      '00:45 - Customer requested human representative.',
      '00:46 - TwiML <Dial> Executed: Transferring call to Dire Dawa HQ (+251982422266)...',
    ]);
    setTimeout(() => {
      setCallStatus('ended');
      setIsSimulatingCall(false);
    }, 4000);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setIsSimulatingCall(false);
    setCallLog((prev) => [...prev, 'Call Terminated securely. Inquiry recorded.']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {language === 'am' ? 'የወደፊት ስልክ ጥሪ ማቀናጃ ዲዛይን' : 'Future Telephone Integration Architecture'}
              </h2>
              <p className="text-[11px] text-slate-400">SIP / Twilio / Asterisk Gateway Bridge · Dire Dawa Ethiopia</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-300">
          {/* Architecture Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                Telephony Architecture Ready
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                STANDBY (TEST MODE)
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The GIRMAIC AI Voice server has a dedicated telephony API layer (<code className="text-cyan-300">/api/telephony</code>). When a SIP provider (e.g., Twilio, Asterisk, or local Ethiopian telecom gateway) is connected in the future, incoming phone calls will stream audio directly to the GIRMAIC AI engine.
            </p>
          </div>

          {/* Architecture Pipeline Visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-[11px]">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <PhoneCall className="w-4 h-4 text-cyan-400 mx-auto" />
              <div className="font-bold text-slate-200">1. Customer Call</div>
              <div className="text-[10px] text-slate-500">Phone Dialed</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <Radio className="w-4 h-4 text-amber-400 mx-auto" />
              <div className="font-bold text-slate-200">2. SIP Gateway</div>
              <div className="text-[10px] text-slate-500">WebSocket PCM</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <Cpu className="w-4 h-4 text-blue-400 mx-auto" />
              <div className="font-bold text-slate-200">3. GIRMAIC AI</div>
              <div className="text-[10px] text-slate-500">Server AI Engine</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <PhoneForwarded className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="font-bold text-slate-200">4. Escalation</div>
              <div className="text-[10px] text-slate-500">+251982422266</div>
            </div>
          </div>

          {/* Interactive Telephone Call Simulation */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 text-xs">Simulated Telephone Call Test</h4>
              {callStatus !== 'idle' && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  callStatus === 'connected'
                    ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                    : callStatus === 'escalating'
                    ? 'bg-amber-500/20 text-amber-300 animate-bounce'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  STATUS: {callStatus.toUpperCase()}
                </span>
              )}
            </div>

            {!isSimulatingCall ? (
              <button
                onClick={handleStartSimulatedCall}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4" />
                <span>Simulate Incoming Phone Call</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] h-32 overflow-y-auto space-y-1 text-slate-300">
                  {callLog.map((log, idx) => (
                    <div key={idx} className="text-cyan-300/90">{log}</div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSimulateQuestion('What services does GIRMAIC AI offer?')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                  >
                    Ask Services
                  </button>
                  <button
                    onClick={() => handleSimulateQuestion('How can I contact founder Girma Haile Bunaro?')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                  >
                    Ask Founder Info
                  </button>
                  <button
                    onClick={handleEscalateCall}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold flex items-center gap-1"
                  >
                    <PhoneForwarded className="w-3.5 h-3.5" />
                    <span>Escalate to HQ (+251982422266)</span>
                  </button>
                  <button
                    onClick={handleEndCall}
                    className="px-3 py-1.5 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-500/40 text-xs font-semibold ml-auto flex items-center gap-1"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>End Phone Call</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 flex gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Security Guarantee:</strong> This telephony simulator operates entirely within your secure application server. No external phone charges are incurred, and no real calls are dialed without administrator configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
