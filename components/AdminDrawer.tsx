'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Database, Sliders, Activity, Plus, Trash2, Save, ShieldCheck } from 'lucide-react';
import { AgentSettings, CompanyKnowledgeItem, Language } from '@/lib/types';

interface AdminDrawerProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  settings: AgentSettings;
  onUpdateSettings: (newSettings: AgentSettings) => void;
  knowledgeBase: CompanyKnowledgeItem[];
  onUpdateKnowledge: (items: CompanyKnowledgeItem[]) => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  language,
  onClose,
  settings,
  onUpdateSettings,
  knowledgeBase,
  onUpdateKnowledge,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<'persona' | 'knowledge' | 'diagnostics'>('persona');

  // Persona states
  const [robotName, setRobotName] = useState(settings.robotName);
  const [greetingEN, setGreetingEN] = useState(settings.greetingEN);
  const [greetingAM, setGreetingAM] = useState(settings.greetingAM);
  const [voiceRate, setVoiceRate] = useState(settings.voiceRate);
  const [voicePitch, setVoicePitch] = useState(settings.voicePitch);
  const [lowPowerMode, setLowPowerMode] = useState(settings.lowPowerMode);
  const [reducedMotion, setReducedMotion] = useState(settings.reducedMotion);

  // Knowledge editing
  const [kbItems, setKbItems] = useState<CompanyKnowledgeItem[]>(knowledgeBase);
  const [newTitle, setNewTitle] = useState('');
  const [newEN, setNewEN] = useState('');
  const [newAM, setNewAM] = useState('');

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...settings,
      robotName,
      greetingEN,
      greetingAM,
      voiceRate,
      voicePitch,
      lowPowerMode,
      reducedMotion,
    });
  };

  const handleAddKnowledge = () => {
    if (!newTitle.trim() || (!newEN.trim() && !newAM.trim())) return;
    const item: CompanyKnowledgeItem = {
      id: `kb-${Date.now()}`,
      category: 'General',
      title: newTitle.trim(),
      contentEN: newEN.trim() || newAM.trim(),
      contentAM: newAM.trim() || newEN.trim(),
    };
    const updated = [...kbItems, item];
    setKbItems(updated);
    onUpdateKnowledge(updated);
    setNewTitle('');
    setNewEN('');
    setNewAM('');
  };

  const handleDeleteKnowledge = (id: string) => {
    const updated = kbItems.filter((i) => i.id !== id);
    setKbItems(updated);
    onUpdateKnowledge(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full glass-panel border-l border-slate-700 shadow-2xl flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {language === 'am' ? 'የአስተዳዳሪ ማዋቀሪያ እና መቆጣጠሪያ' : 'GIRMAIC Prototype Admin & Settings'}
              </h2>
              <p className="text-[11px] text-slate-400">Control Panel · Dire Dawa Ethiopia</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('persona')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'persona'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Robot Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'knowledge'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'persona' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Robot Persona Name</label>
                <input
                  type="text"
                  value={robotName}
                  onChange={(e) => setRobotName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  English Initial Greeting
                </label>
                <textarea
                  rows={2}
                  value={greetingEN}
                  onChange={(e) => setGreetingEN(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amharic Initial Greeting (የአማርኛ ሰላምታ)
                </label>
                <textarea
                  rows={2}
                  value={greetingAM}
                  onChange={(e) => setGreetingAM(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100"
                />
              </div>

              {/* Humanoid Speech Rate & Pitch Fine-Tuning Section */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Humanoid Speech Rate (Fine-Tune)</span>
                  </label>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {voiceRate.toFixed(2)}x
                  </span>
                </div>

                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />

                {/* Quick Presets for Humanoid Persona */}
                <div className="flex items-center justify-between gap-2 pt-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setVoiceRate(0.85)}
                    className={`px-2 py-1 rounded-md border transition-all ${
                      voiceRate === 0.85
                        ? 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Deliberate (0.85x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceRate(1.0)}
                    className={`px-2 py-1 rounded-md border transition-all ${
                      voiceRate === 1.0
                        ? 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Natural Persona (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceRate(1.2)}
                    className={`px-2 py-1 rounded-md border transition-all ${
                      voiceRate === 1.2
                        ? 'bg-amber-500/30 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    High-Tech Brief (1.2x)
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Voice Pitch Modulation
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={voicePitch}
                      onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                      className="w-28 accent-amber-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                    />
                    <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                      {voicePitch.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>2D Avatar / Low Power Mode (Saves GPU)</span>
                  <input
                    type="checkbox"
                    checked={lowPowerMode}
                    onChange={(e) => setLowPowerMode(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span>Reduced Motion Accessibility</span>
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save Persona Configuration</span>
              </button>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add Verified Knowledge Fact
                </h4>
                <input
                  type="text"
                  placeholder="Fact Title / Topic"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
                <input
                  type="text"
                  placeholder="English Fact Detail"
                  value={newEN}
                  onChange={(e) => setNewEN(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Amharic Fact Detail (የአማርኛ መረጃ)"
                  value={newAM}
                  onChange={(e) => setNewAM(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />
                <button
                  onClick={handleAddKnowledge}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Add Fact
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400">Current Knowledge Items</h4>
                {kbItems.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{item.title}</span>
                      <button
                        onClick={() => handleDeleteKnowledge(item.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300">{item.contentEN}</p>
                    <p className="text-[11px] text-cyan-300 font-sans">{item.contentAM}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  System Diagnostic Status
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Gemini Server API Endpoint</span>
                    <span className="text-emerald-400 font-mono">OK (/api/chat)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Speech Recognition (STT)</span>
                    <span className="text-cyan-400 font-mono" suppressHydrationWarning>
                      {isMounted && typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
                        ? 'Supported'
                        : 'Web Speech Fallback Active'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Speech Synthesis (TTS)</span>
                    <span className="text-cyan-400 font-mono" suppressHydrationWarning>
                      {isMounted && typeof window !== 'undefined' && 'speechSynthesis' in window
                        ? 'Supported'
                        : 'Server Audio Fallback'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">3D WebGL Engine</span>
                    <span className="text-amber-300 font-mono">Three.js r160+ Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
