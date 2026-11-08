'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Copy, Check, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage, Language } from '@/lib/types';

interface ChatTranscriptProps {
  messages: ChatMessage[];
  language: Language;
  onSendMessage: (text: string) => void;
  onReplayAudio: (message: ChatMessage) => void;
}

export const ChatTranscript: React.FC<ChatTranscriptProps> = ({
  messages,
  language,
  onSendMessage,
  onReplayAudio,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    // Scroll immediately and after layout rendering
    scrollToBottom();
    const frame = requestAnimationFrame(() => {
      scrollToBottom();
    });
    return () => cancelAnimationFrame(frame);
  }, [messages]);

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
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">
            {language === 'am' ? 'የንግግር ታሪክ እና ጽሑፍ' : 'Live Conversation Transcript'}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
        </span>
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
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-amber-950/40 border border-amber-500/30 text-amber-50 rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-700/80 text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                  <span className="font-semibold tracking-wide" suppressHydrationWarning>
                    {msg.sender === 'user'
                      ? 'You'
                      : 'GIRMAIC AI'}
                    {' · '}
                    {isMounted
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '10:00 AM'}
                  </span>

                  <div className="flex items-center gap-2">
                    {msg.sender === 'robot' && (
                      <button
                        onClick={() => onReplayAudio(msg)}
                        className="hover:text-cyan-400 transition-colors"
                        title="Replay Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-cyan-400 transition-colors"
                      title="Copy Text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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
