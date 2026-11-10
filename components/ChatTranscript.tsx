import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Volume2, Copy, Check, Bot, User, Sparkles, Download, FileText, Printer, History } from 'lucide-react';
import { ChatMessage, Language } from '@/lib/types';

interface ChatTranscriptProps {
  messages: ChatMessage[];
  language: Language;
  onSendMessage: (text: string) => void;
  onReplayAudio: (message: ChatMessage) => void;
  onOpenHistory?: () => void;
}

export const ChatTranscript: React.FC<ChatTranscriptProps> = ({
  messages,
  language,
  onSendMessage,
  onReplayAudio,
  onOpenHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Automatically scroll to bottom whenever messages array updates or new message arrives
  useEffect(() => {
    if (messages.length === 0) return;

    // Immediate scroll
    scrollToBottom('smooth');

    // Deferred scroll ticks to guarantee visibility after React layout & image rendering
    const frameId = requestAnimationFrame(() => {
      scrollToBottom('smooth');
    });

    const timerId = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [messages, messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
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
      'Official Voice Agent Conversation Transcript',
      'Founder: Girma Haile Bunaro | Dire Dawa, Ethiopia',
      `Session Export Date: ${new Date().toLocaleString()}`,
      '==================================================',
      '',
    ].join('\n');

    const body = messages
      .map((msg) => {
        const timeStr = new Date(msg.timestamp).toLocaleTimeString();
        const speaker = msg.sender === 'user' ? 'CUSTOMER' : 'GIRMAIC AI';
        return `[${timeStr}] ${speaker}:\n${msg.text}\n`;
      })
      .join('\n');

    const fullContent = header + body;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GIRMAIC_Transcript_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    if (messages.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GIRMAIC AI Conversation Transcript</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
            .brand { font-size: 20px; font-weight: 800; color: #0284c7; }
            .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
            .msg-box { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; font-size: 13px; }
            .user-msg { background: #fef3c7; border-left: 4px solid #f59e0b; }
            .ai-msg { background: #f0f9ff; border-left: 4px solid #0284c7; }
            .speaker { font-weight: 700; font-size: 11px; margin-bottom: 4px; color: #475569; }
            .footer { margin-top: 40px; pt-4; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">GIRMAIC AI TECHNOLOGY AND INNOVATION CENTER</div>
            <div class="sub">Official Multilingual Voice Agent Transcript · Founder: Girma Haile Bunaro · Dire Dawa, Ethiopia</div>
            <div class="sub">Exported on: ${new Date().toLocaleString()}</div>
          </div>
          <div class="content">
            ${messages
              .map(
                (m) => `
              <div class="msg-box ${m.sender === 'user' ? 'user-msg' : 'ai-msg'}">
                <div class="speaker">${m.sender === 'user' ? 'CUSTOMER' : 'GIRMAIC AI'} · ${new Date(
                  m.timestamp
                ).toLocaleTimeString()}</div>
                <div>${m.text.replace(/\n/g, '<br/>')}</div>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="footer">
            African Intelligence. Global Innovation. Human Progress.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setShowExportMenu(false);
  };

  const promptSuggestions = language === 'am'
    ? [
        'የGIRMAIC AI Technology አገልግሎቶች ምንድን ናቸው?',
        'ስለ ድሬዳዋ ዋና መሥሪያ ቤት ንገረኝ',
        'የቀጠሮ ወይም የመረጃ መጠየቂያ ማስተላለፍ እፈልጋለሁ',
        'ስለ ድርጅቱ መሥራች ግርማ ሃይሌ አካፍለኝ'
      ]
    : [
        'What services does GIRMAIC AI Technology provide?',
        'Tell me about GIRMAIC HQ in Dire Dawa, Ethiopia.',
        'I would like to submit a partnership inquiry.',
        'Who is the founder of GIRMAIC AI Technology?'
      ];

  return (
    <div className="w-full flex flex-col h-[400px] glass-panel rounded-2xl overflow-hidden border border-slate-800">
      {/* Transcript Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 relative">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            {language === 'am' ? 'የንግግር ታሪክ እና ጽሑፍ' : 'Live Conversation Transcript'}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
          </span>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-amber-300 transition-colors"
              title="View Full Session Transcript History"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Full History</span>
            </button>
          )}

          {/* Export Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={messages.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-cyan-300 transition-colors"
              title="Export Conversation Transcript"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-30 space-y-1">
                <button
                  onClick={handleExportTxt}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Text File (.txt)</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>PDF / Print</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400/60 animate-pulse" />
            <p className="text-sm text-slate-300 font-medium">
              {language === 'am'
                ? 'የGIRMAIC AI ድምፅ ረዳትን ለመጠየቅ ከላይ የድምፅ ቁልፉን ይጫኑ ወይም ከታች ይጻፉ።'
                : 'Click the microphone above to speak or type your question below.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
              {promptSuggestions.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs text-cyan-300 transition-all text-left"
                >
                  &quot;{prompt}&quot;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 my-2 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-lg transition-transform duration-200 hover:scale-105 ${
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

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm shadow-xl transition-all duration-200 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-amber-600/90 via-amber-700/80 to-amber-900/90 border border-amber-400/40 text-amber-50 rounded-tr-none shadow-amber-950/40'
                    : 'bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-cyan-950/80 border border-cyan-500/40 text-slate-100 rounded-tl-none shadow-cyan-950/40 backdrop-blur-md'
                }`}
              >
                {/* Message Header Bar */}
                <div
                  className={`flex items-center justify-between gap-4 mb-2 pb-1.5 text-[11px] border-b ${
                    msg.sender === 'user'
                      ? 'border-amber-400/30 text-amber-200/90'
                      : 'border-cyan-500/30 text-cyan-300/90'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold tracking-wide uppercase">
                      {msg.sender === 'user' ? 'CUSTOMER' : 'GIRMAIC AI'}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono" suppressHydrationWarning>
                      {isMounted
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '10:00 AM'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.sender === 'robot' && (
                      <>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 tracking-wider">
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

                {/* Message Body Text */}
                <p className="leading-relaxed whitespace-pre-wrap font-sans text-sm sm:text-[14.5px] tracking-normal">
                  {msg.text}
                </p>
              </div>
            </div>
          ))
        )}
        {/* Invisible anchor element for auto-scrolling */}
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            language === 'am'
              ? 'ጥያቄዎን ወይም መልዕክትዎን እዚህ ይጻፉ...'
              : 'Type your message or question here...'
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-medium text-sm flex items-center gap-1.5 transition-all shadow-md shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
