'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Search,
  Download,
  Printer,
  Volume2,
  Copy,
  Check,
  History,
  User,
  Sparkles,
  Clock,
  Trash2,
  FileText,
  Bot,
} from 'lucide-react';
import { ChatMessage, Language } from '@/lib/types';

interface TranscriptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  language: Language;
  sessionDuration: number;
  onReplayAudio: (message: ChatMessage) => void;
  onClearSession: () => void;
}

export const TranscriptHistoryModal: React.FC<TranscriptHistoryModalProps> = ({
  isOpen,
  onClose,
  messages,
  language,
  sessionDuration,
  onReplayAudio,
  onClearSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  const filteredMessages = messages.filter((msg) =>
    msg.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTxt = () => {
    if (messages.length === 0) return;
    const header = [
      '==================================================',
      'GIRMAIC AI TECHNOLOGY AND INNOVATION CENTER',
      'Full Session Transcript History',
      'Founder: Girma Haile Bunaro | Dire Dawa, Ethiopia',
      `Export Timestamp: ${new Date().toLocaleString()}`,
      `Total Turns: ${messages.length}`,
      `Active Session Elapsed Time: ${formatDuration(sessionDuration)}`,
      '==================================================',
      '',
    ].join('\n');

    const body = messages
      .map((msg) => {
        const timeStr = new Date(msg.timestamp).toLocaleTimeString();
        const speaker = msg.sender === 'user' ? 'CUSTOMER' : 'GIRMAIC AI';
        return `[${timeStr}] (${msg.language.toUpperCase()}) ${speaker}:\n${msg.text}\n`;
      })
      .join('\n');

    const fullContent = header + body;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GIRMAIC_Full_Transcript_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (messages.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GIRMAIC AI Session Transcript History</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 2px solid #06b6d4; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
            .msg { margin-bottom: 18px; padding: 12px 16px; rounded: 8px; border-left: 4px solid #cbd5e1; background: #f8fafc; }
            .msg.user { border-left-color: #f59e0b; background: #fffbeb; }
            .msg.robot { border-left-color: #06b6d4; background: #f0fdf4; }
            .speaker { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 4px; }
            .text { font-size: 14px; white-space: pre-wrap; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">GIRMAIC AI TECHNOLOGY AND INNOVATION CENTER</div>
            <div class="subtitle">Official Voice Agent Full Conversation Transcript · Dire Dawa, Ethiopia</div>
            <div class="subtitle">Session Duration: ${formatDuration(sessionDuration)} · Total Messages: ${messages.length}</div>
          </div>
          ${messages
            .map(
              (msg) => `
            <div class="msg ${msg.sender}">
              <div class="speaker">${msg.sender === 'user' ? 'CUSTOMER' : 'GIRMAIC AI VOICE AGENT'} · ${new Date(msg.timestamp).toLocaleTimeString()} (${msg.language.toUpperCase()})</div>
              <div class="text">${msg.text}</div>
            </div>
          `
            )
            .join('')}
          <div class="footer">
            GIRMAIC AI TECHNOLOGY AND INNOVATION CENTER · Founder: Girma Haile Bunaro · +251982422266
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const userMsgCount = messages.filter((m) => m.sender === 'user').length;
  const aiMsgCount = messages.filter((m) => m.sender === 'robot').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Session Transcript History</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {messages.length} Turns
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                GIRMAIC AI Voice Agent full conversation record
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Search Toolbar */}
        <div className="p-4 sm:px-6 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transcript by keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Quick Metrics */}
          <div className="sm:col-span-6 flex items-center justify-end gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer: {userMsgCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>GIRMAIC AI: {aiMsgCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatDuration(sessionDuration)}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Message List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-600" />
              <p className="text-sm">No matching interactions found in session history.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 my-2 ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold border-2 border-amber-400/80'
                      : 'ring-2 ring-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.4)] bg-slate-900'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-5 h-5 text-slate-950 font-bold" />
                  ) : (
                    <Image
                      src="/assets/aistudio/IMG_20261110_020235_716_a7b35e2f.jpg"
                      alt="GIRMAIC AI Avatar"
                      width={36}
                      height={36}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Content Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-amber-600/90 via-amber-700/80 to-amber-900/90 border border-amber-400/40 text-amber-50 rounded-tr-none'
                      : 'bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-cyan-950/80 border border-cyan-500/40 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-4 mb-2 pb-1.5 text-[11px] border-b ${
                      msg.sender === 'user'
                        ? 'border-amber-400/30 text-amber-200/90'
                        : 'border-cyan-500/30 text-cyan-300/90'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold tracking-wide uppercase">
                        {msg.sender === 'user' ? 'CUSTOMER' : 'GIRMAIC AI VOICE AGENT'}
                      </span>
                      <span className="text-[10px] opacity-75 font-mono" suppressHydrationWarning>
                        {isMounted
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          : '10:00 AM'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {msg.sender === 'robot' && (
                        <>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                            {msg.language === 'am' ? 'አማርኛ' : msg.language.toUpperCase()}
                          </span>
                          <button
                            onClick={() => onReplayAudio(msg)}
                            className="p-1 rounded-md hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                            title="Replay Voice Response"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className={`p-1 rounded-md transition-colors ${
                          msg.sender === 'user'
                            ? 'hover:bg-amber-500/20 text-amber-200'
                            : 'hover:bg-cyan-500/20 text-cyan-300'
                        }`}
                        title="Copy Message Text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="leading-relaxed whitespace-pre-wrap font-sans text-sm sm:text-[14.5px]">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => {
              if (confirm('Clear entire active conversation transcript?')) {
                onClearSession();
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900 transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Transcript</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportTxt}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Export Text (.txt)</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
