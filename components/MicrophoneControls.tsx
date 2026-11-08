'use client';

import React from 'react';
import { Mic, MicOff, Square, Globe, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { RobotState, Language } from '@/lib/types';

interface MicrophoneControlsProps {
  state: RobotState;
  language: Language;
  isListening: boolean;
  micPermission: 'prompt' | 'granted' | 'denied';
  audioLevel: number;
  onStartListening: () => void;
  onStopListening: () => void;
  onInterrupt: () => void;
  onLanguageChange: (lang: Language) => void;
}

export const MicrophoneControls: React.FC<MicrophoneControlsProps> = ({
  state,
  language,
  isListening,
  micPermission,
  audioLevel,
  onStartListening,
  onStopListening,
  onInterrupt,
  onLanguageChange,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4 py-2">
      {/* Soundwave audio input meter when listening */}
      {isListening && (
        <div className="flex items-center gap-1 h-6 px-4 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30">
          <span className="text-[11px] font-mono text-cyan-400 mr-2">MIC INPUT</span>
          {[0.3, 0.7, 1.0, 0.6, 0.4, 0.9, 0.5, 0.2].map((factor, idx) => (
            <div
              key={idx}
              className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, audioLevel * 24 * factor)}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Microphone Button & Action Controls */}
      <div className="relative flex items-center justify-center gap-6">
        {/* Language Switch Button */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'am' : 'en')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition-all text-xs font-semibold shadow-lg"
          title="Switch Language"
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{language === 'en' ? 'English' : 'አማርኛ (Amharic)'}</span>
        </button>

        {/* Central Glowing Mic Button */}
        <div className="relative">
          {/* Animated wave rings around mic when listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 -m-3 rounded-full border border-cyan-400/60 animate-ping pointer-events-none" />
              <div className="absolute inset-0 -m-6 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={() => {
              if (isListening) {
                onStopListening();
              } else {
                onStartListening();
              }
            }}
            disabled={state === 'thinking'}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/40 ${
              isListening
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_35px_rgba(6,182,212,0.6)] scale-105'
                : state === 'speaking'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_0_25px_rgba(59,130,246,0.5)]'
                : state === 'thinking'
                ? 'bg-amber-600 text-white opacity-80 cursor-wait'
                : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-cyan-400 border-2 border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:scale-105'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse text-white" />
                <span className="text-[10px] font-semibold tracking-wider uppercase mt-1">Tap Stop</span>
              </>
            ) : state === 'thinking' ? (
              <>
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-amber-200" />
                <span className="text-[10px] font-semibold tracking-wider uppercase mt-1">Thinking</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
                <span className="text-[10px] font-semibold tracking-wider uppercase mt-1">Start Voice</span>
              </>
            )}
          </button>
        </div>

        {/* Interrupt / Stop Speech Button */}
        {state === 'speaking' ? (
          <button
            onClick={onInterrupt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 hover:bg-red-900 transition-all text-xs font-semibold shadow-lg animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Interrupt</span>
          </button>
        ) : (
          <button
            onClick={isListening ? onStopListening : onStartListening}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-lg ${
              isListening
                ? 'bg-slate-800 border-red-500/40 text-red-300 hover:bg-slate-700'
                : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-red-400" />
                <span>End Voice</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Speak Now</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Mic Permission Warning & Step-by-Step Chrome/Android Guidance */}
      {micPermission === 'denied' && (
        <div className="text-xs text-amber-300 bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 text-left max-w-md space-y-1.5 shadow-lg">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <MicOff className="w-4 h-4 text-amber-400" />
            <span>Microphone Access Blocked in Browser</span>
          </div>
          <p className="text-[11px] text-slate-300">
            To enable voice conversation on Android or Chrome:
          </p>
          <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-0.5">
            <li>Tap the <strong>Lock / Tune icon</strong> next to the web URL bar.</li>
            <li>Select <strong>Permissions &gt; Microphone</strong> and tap <strong>Allow</strong>.</li>
            <li>Refresh the page and tap <strong>Start Voice</strong> again.</li>
          </ol>
          <p className="text-[10px] text-cyan-400 italic pt-1">
            Note: You can always type questions in the conversation box below without microphone access!
          </p>
        </div>
      )}
    </div>
  );
};
