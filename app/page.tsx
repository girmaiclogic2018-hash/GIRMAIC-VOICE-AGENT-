'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Mic,
  Volume2,
  Globe,
  Settings,
  ShieldCheck,
  HelpCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Bot,
  MessageSquarePlus,
  Compass,
  FileText,
  UserCheck,
  ArrowRight,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import { RobotState, Language, ChatMessage, CustomerInquiry, AgentSettings, CompanyKnowledgeItem } from '@/lib/types';
import { INITIAL_KNOWLEDGE, INITIAL_TEST_INQUIRIES } from '@/lib/companyKnowledge';

import { MicrophoneControls } from '@/components/MicrophoneControls';
import { ChatTranscript } from '@/components/ChatTranscript';
import { InquiryModal } from '@/components/InquiryModal';
import { AdminDrawer } from '@/components/AdminDrawer';
import { PrivacyModal } from '@/components/PrivacyModal';
import { HelpModal } from '@/components/HelpModal';
import { TelephonyModal } from '@/components/TelephonyModal';

// Dynamically load WebGL 3D Canvas strictly on client side (disable SSR for WebGL/Three.js)
const Robot3DCanvas = dynamic(
  () => import('@/components/Robot3DCanvas').then((mod) => mod.Robot3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl glass-panel flex flex-col items-center justify-center p-6 border border-slate-800">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-mono text-cyan-300">Initializing GIRMAIC 3D Engine...</span>
      </div>
    ),
  }
);

export default function Home() {
  // Default settings
  const [settings, setSettings] = useState<AgentSettings>({
    robotName: 'GIRMAIC AI Voice Agent',
    greetingEN: 'Hello! Welcome to GIRMAIC AI Technology and Trading. I am your GIRMAIC AI Voice Assistant. How may I assist you today?',
    greetingAM: 'ሰላም! ወደ GIRMAIC AI Technology and Trading እንኳን በደህና መጡ። እኔ የGIRMAIC ሰው ሰራሽ አስተውሎት የድምፅ ረዳትዎ ነኝ። እንዴት ልርዳዎት?',
    voicePitch: 1.0,
    voiceRate: 1.0,
    voiceGender: 'neutral',
    autoListen: false,
    lowPowerMode: false,
    reducedMotion: false,
  });

  // Data State
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(INITIAL_TEST_INQUIRIES);
  const [knowledgeBase, setKnowledgeBase] = useState<CompanyKnowledgeItem[]>(INITIAL_KNOWLEDGE);

  // Application State
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [language, setLanguage] = useState<Language>('en');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'robot',
      text: 'Hello! Welcome to GIRMAIC AI Technology and Trading. I am your GIRMAIC AI Voice Assistant. How may I assist you today?',
      language: 'en',
      timestamp: '2026-11-08T10:00:00.000Z',
    },
  ]);

  // Modal visibilities
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTelephonyOpen, setIsTelephonyOpen] = useState(false);

  const handleClearSession = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setRobotState('idle');
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'robot',
        text: language === 'am' ? settings.greetingAM : settings.greetingEN,
        language,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Web Speech References
  const recognitionRef = useRef<any>(null);

  // Read stored data on mount after hydration completes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedInquiries = localStorage.getItem('girmaic_inquiries');
        if (storedInquiries) setInquiries(JSON.parse(storedInquiries));

        const storedKb = localStorage.getItem('girmaic_kb');
        if (storedKb) setKnowledgeBase(JSON.parse(storedKb));

        const storedSettings = localStorage.getItem('girmaic_settings');
        if (storedSettings) setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleAddInquiry = (inquiry: CustomerInquiry) => {
    const updated = [inquiry, ...inquiries];
    setInquiries(updated);
    try {
      localStorage.setItem('girmaic_inquiries', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleUpdateKnowledge = (items: CompanyKnowledgeItem[]) => {
    setKnowledgeBase(items);
    try {
      localStorage.setItem('girmaic_kb', JSON.stringify(items));
    } catch (e) {}
  };

  const handleUpdateSettings = (newSettings: AgentSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('girmaic_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  // Speech Synthesis Engine
  const speakResponse = useCallback(
    (text: string, lang: Language) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setRobotState('idle');
        return;
      }

      window.speechSynthesis.cancel();
      setRobotState('speaking');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'am' ? 'am-ET' : 'en-US';
      utterance.rate = settings.voiceRate;
      utterance.pitch = settings.voicePitch;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const matchingVoice = voices.find((v) => v.lang.startsWith(lang === 'am' ? 'am' : 'en'));
        if (matchingVoice) utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setRobotState('speaking');
        let step = 0;
        const interval = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            step++;
            setAudioLevel(0.3 + Math.abs(Math.sin(step * 0.4)) * 0.7);
          } else {
            clearInterval(interval);
            setAudioLevel(0);
          }
        }, 100);
      };

      utterance.onend = () => {
        setRobotState('idle');
        setAudioLevel(0);
      };

      utterance.onerror = () => {
        setRobotState('idle');
        setAudioLevel(0);
      };

      window.speechSynthesis.speak(utterance);
    },
    [settings]
  );

  // Send Message to Gemini Server API Route
  const handleSendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: userText,
        language,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setRobotState('thinking');

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userText,
            language,
            history: messages.slice(-4),
            knowledgeBase,
          }),
        });

        const data = await res.json();
        const replyText = data.text || data.fallbackText || 'I am ready to assist you.';

        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'robot',
          text: replyText,
          language: data.language || language,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMsg]);
        speakResponse(replyText, data.language || language);
      } catch (err) {
        console.error('Chat API Error:', err);
        setRobotState('error');
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'robot',
          text:
            language === 'am'
              ? 'ይቅርታ፣ ጊዜያዊ የግንኙነት ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።'
              : 'I am experiencing a temporary connection issue. Please try speaking or typing again.',
          language,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [language, messages, knowledgeBase, speakResponse]
  );

  // Speech Recognition Setup (Browser STT)
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser. Please type your message!');
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'am' ? 'am-ET' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setRobotState('listening');
        setMicPermission('granted');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSendMessage(transcript);
        } else {
          setRobotState('idle');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
        }
        setRobotState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Mic start error:', e);
      setIsListening(false);
      setRobotState('idle');
    }
  }, [language, handleSendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setRobotState('idle');
  }, []);

  const interruptSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setRobotState('idle');
    setAudioLevel(0);
  }, []);

  // Language Change Handler
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);

    // Speak introductory message in selected language if starting out
    const introText = newLang === 'am' ? settings.greetingAM : settings.greetingEN;
    const sysGreeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'robot',
      text: introText,
      language: newLang,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, sysGreeting]);
    speakResponse(introText, newLang);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-amber-500/30">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      {/* TOP BAR CONTRACT: Single Row, Three-Zone Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-lg">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <Link href="/" className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>GIRMAIC AI VOICE AGENT</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PROTOTYPE
              </span>
            </Link>
          </div>

          {/* Zone 2: Navigation Links (single line, clean text) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-400" />
              <span>Inquiries & Leads</span>
            </button>
            <button
              onClick={() => setIsTelephonyOpen(true)}
              className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Phone Integration</span>
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Usage & Android Guide</span>
            </button>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Disclosure</span>
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Admin Control</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Language Toggle */}
            <button
              onClick={() => handleLanguageChange(language === 'en' ? 'am' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-amber-300 hover:border-amber-500 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Amharic (አማርኛ)' : 'English'}</span>
            </button>

            <button
              onClick={() => setIsInquiryOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg whitespace-nowrap shrink-0"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero Banner Title */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-[11px] font-mono text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AFRICAN INTELLIGENCE · GLOBAL INNOVATION · HUMAN PROGRESS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            GIRMAIC AI Humanoid Voice Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Official Multilingual Voice Prototype for{' '}
            <span className="text-slate-200 font-semibold">GIRMAIC AI TECHNOLOGY AND TRADING ONE PLC MEMBER</span>.
            Founded by <span className="text-amber-300 font-semibold">Girma Haile Bunaro</span> in Dire Dawa, Ethiopia.
          </p>
        </div>

        {/* Central Split View: 3D Robot & Mic Controls + Live Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (7 Cols): 3D Humanoid Robot & Voice Mic Controls */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <Robot3DCanvas
              state={robotState}
              audioLevel={audioLevel}
              lowPowerMode={settings.lowPowerMode}
              reducedMotion={settings.reducedMotion}
            />

            <MicrophoneControls
              state={robotState}
              language={language}
              isListening={isListening}
              micPermission={micPermission}
              audioLevel={audioLevel}
              onStartListening={startListening}
              onStopListening={stopListening}
              onInterrupt={interruptSpeech}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Right Column (5 Cols): Live Conversation Transcript */}
          <div className="lg:col-span-5 flex flex-col">
            <ChatTranscript
              messages={messages}
              language={language}
              onSendMessage={handleSendMessage}
              onReplayAudio={(msg) => speakResponse(msg.text, msg.language)}
            />
          </div>
        </div>

        {/* Quick Organization Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">GIRMAIC Technology & Trading</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Based in Dire Dawa, Ethiopia. Innovating in voice automation, humanoid robotics, and digital transformation.
            </p>
            <button
              onClick={() => setIsInquiryOpen(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1"
            >
              <span>Submit Business Inquiry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">English & Amharic Speech</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built for seamless Amharic (አማርኛ) and English natural speech synthesis, recognition, and transcript logging.
            </p>
            <button
              onClick={() => handleLanguageChange(language === 'en' ? 'am' : 'en')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 pt-1"
            >
              <span>Switch Voice Language</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2 hover:border-slate-700 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Founder & Vision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Led by Founder & Visionary Girma Haile Bunaro. Dedicated to advancing Ethiopian & African AI leadership worldwide.
            </p>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-1"
            >
              <span>View Android Testing Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-8 px-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-200">
              GIRMAIC AI TECHNOLOGY AND TRADING ONE PLC MEMBER
            </p>
            <p className="text-slate-400">
              Founder & Visionary: Girma Haile Bunaro · Dire Dawa, Ethiopia
            </p>
            <p className="text-[11px] text-slate-500">
              Official Contact: girmaiclogic2018@gmail.com · +251982422266
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button onClick={() => setIsInquiryOpen(true)} className="hover:text-amber-300 transition-colors">
              Submit Inquiry
            </button>
            <span className="text-slate-700">·</span>
            <button onClick={() => setIsHelpOpen(true)} className="hover:text-cyan-300 transition-colors">
              Android Guide
            </button>
            <span className="text-slate-700">·</span>
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-emerald-300 transition-colors">
              Privacy Notice
            </button>
            <span className="text-slate-700">·</span>
            <button onClick={() => setIsAdminOpen(true)} className="hover:text-amber-300 transition-colors">
              Admin Panel
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <InquiryModal
        isOpen={isInquiryOpen}
        language={language}
        onClose={() => setIsInquiryOpen(false)}
        inquiries={inquiries}
        onAddInquiry={handleAddInquiry}
      />

      <AdminDrawer
        isOpen={isAdminOpen}
        language={language}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        knowledgeBase={knowledgeBase}
        onUpdateKnowledge={handleUpdateKnowledge}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        language={language}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        language={language}
        onClose={() => setIsHelpOpen(false)}
      />

      <TelephonyModal
        isOpen={isTelephonyOpen}
        language={language}
        onClose={() => setIsTelephonyOpen(false)}
        onSimulatePhoneQuery={handleSendMessage}
      />
    </div>
  );
}
