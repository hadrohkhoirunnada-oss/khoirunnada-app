'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { processKhoirunnadaAI, AIMessage, AIAction } from '@/lib/ai-engine';

export function KhoirunnadaAIWidget() {
  const router = useRouter();
  const { currentUser, qosidahs, jobs, favorites } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const initialGreeting: AIMessage = {
    id: 'welcome',
    sender: 'ai',
    text: `Assalamu'alaikum${currentUser?.name ? ` ${currentUser.name}` : ''}! 🙏\n\nSaya Khoirunnada AI, asisten cerdas resmi Hadroh Khoirunnada.\n\nSaya siap membantu Anda seputar syair qosidah, jadwal job, panduan aplikasi, sejarah, hingga struktur organisasi. Silakan tanyakan apa saja!`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    actions: [
      { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
      { label: '📖 Cari Qosidah Busyro Lana', promptText: 'Carikan saya qosidah Busyro Lana' },
      { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
      { label: '📜 Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' },
      { label: '👥 Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
      { label: '👨‍💻 Pembuat Aplikasi', promptText: 'Siapa yang membuat dan mengembangkan aplikasi ini?' },
    ],
  };

  const [messages, setMessages] = useState<AIMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Fokuskan input saat popup dibuka
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulasi respons AI natural (350ms - 550ms)
    setTimeout(() => {
      const response = processKhoirunnadaAI(text, {
        currentUser,
        qosidahs,
        jobs,
        favorites,
      });

      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 450);
  };

  const handleActionClick = (action: AIAction) => {
    if (action.href) {
      setIsOpen(false);
      router.push(action.href);
      return;
    }

    if (action.promptText) {
      handleSend(action.promptText);
    }
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
    setInputValue('');
  };

  // Render teks format rapi tanpa simbol * sama sekali
  const formatText = (content: string) => {
    // Bersihkan semua simbol * agar tidak pernah tampil di layar
    const cleanContent = content.replace(/\*/g, '');

    return cleanContent.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      // Heading dengan titik dua di akhir (misal: "Sejarah Hadroh Khoirunnada:")
      if (trimmed.endsWith(':') && !trimmed.startsWith('-') && !trimmed.match(/^\d+\./)) {
        return (
          <p key={idx} className="text-xs font-bold text-[#70490E] tracking-tight mt-1 mb-0.5">
            {trimmed}
          </p>
        );
      }

      // Baris berpoin nomor (1. Beranda: ..., 2. ...)
      const numberedMatch = trimmed.match(/^(\d+\.)\s*(.*)$/);
      if (numberedMatch) {
        const num = numberedMatch[1];
        const rest = numberedMatch[2];
        const colonIdx = rest.indexOf(':');

        if (colonIdx !== -1) {
          const label = rest.slice(0, colonIdx + 1);
          const desc = rest.slice(colonIdx + 1);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-[#996A19] font-bold text-xs shrink-0">{num}</span>
              <span className="flex-1 text-xs leading-relaxed text-slate-800">
                <span className="font-semibold text-[#70490E]">{label}</span>
                {desc}
              </span>
            </div>
          );
        }

        return (
          <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
            <span className="text-[#996A19] font-bold text-xs shrink-0">{num}</span>
            <span className="flex-1 text-xs leading-relaxed text-slate-800">{rest}</span>
          </div>
        );
      }

      // Baris poin tanda hubung atau bullet (- Ketua Umum: ...)
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const rest = trimmed.replace(/^[-•]\s*/, '');
        const colonIdx = rest.indexOf(':');

        if (colonIdx !== -1) {
          const label = rest.slice(0, colonIdx + 1);
          const desc = rest.slice(colonIdx + 1);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="text-[#996A19] font-bold text-xs shrink-0">•</span>
              <span className="flex-1 text-xs leading-relaxed text-slate-800">
                <span className="font-semibold text-[#70490E]">{label}</span>
                {desc}
              </span>
            </div>
          );
        }

        return (
          <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
            <span className="text-[#996A19] font-bold text-xs shrink-0">•</span>
            <span className="flex-1 text-xs leading-relaxed text-slate-800">{rest}</span>
          </div>
        );
      }

      // Paragraf biasa
      return (
        <p key={idx} className="text-xs leading-relaxed my-0.5 text-slate-800">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div data-no-loading="true">
      {/* 1. Floating Robot Button di Sudut Kanan Bawah */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          data-no-loading="true"
          title="Tanya Khoirunnada AI"
          aria-label="Buka Khoirunnada AI"
          className="absolute bottom-20 right-3.5 z-40 w-11 h-11 rounded-full bg-gradient-to-tr from-[#70490E] via-[#996A19] to-[#D4A346] text-white shadow-lg shadow-[#996A19]/35 border-2 border-white/90 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer group animate-in fade-in"
        >
          {/* Subtle Outer Glow */}
          <span className="absolute -inset-0.5 rounded-full bg-[#D4A346]/40 blur-xs -z-10 group-hover:blur-sm transition-all" />

          {/* Icon Robot */}
          <Bot className="w-5 h-5 text-white group-hover:rotate-6 transition-transform" />

          {/* Badge "AI" Kecil & Rapi */}
          <span className="absolute -top-1 -right-1 bg-white text-[#70490E] text-[8px] font-black px-1 py-0.2 rounded-full border border-[#D4A346]/50 shadow-xs uppercase tracking-tighter">
            AI
          </span>
        </button>
      )}

      {/* 2. Popup Interaksi Khoirunnada AI */}
      {isOpen && (
        <div
          data-no-loading="true"
          className="fixed inset-0 sm:absolute sm:inset-0 z-50 flex items-end sm:items-stretch justify-center p-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            data-no-loading="true"
            className="w-full h-[85vh] sm:h-full bg-white rounded-t-[28px] sm:rounded-none shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
          >
            {/* Header Popup */}
            <div className="bg-gradient-to-r from-[#151917] via-[#202723] to-[#151917] p-3.5 sm:p-4 text-white flex items-center justify-between border-b border-[#996A19]/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#70490E] to-[#D4A346] border border-white/30 flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-5 h-5" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#151917]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight text-white">Khoirunnada AI</h3>
                    <span className="px-1.5 py-0.2 rounded bg-[#D4A346]/20 text-[#E6C687] text-[9px] font-extrabold uppercase">
                      Sistem Mandiri
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A6AEA9]">Asisten Cerdas Hadroh Khoirunnada</p>
                </div>
              </div>

              {/* Action Buttons: Reset & Close */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Mulai Percakapan Baru"
                  data-no-loading="true"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#D4A346] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Tutup Khoirunnada AI"
                  data-no-loading="true"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Thread Messages Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-[#F9F7F2]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Bubble Container */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#151917] text-white rounded-br-xs'
                        : 'bg-white text-[#151917] border border-[#996A19]/15 rounded-bl-xs'
                    }`}
                  >
                    {/* Message Header for AI */}
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#996A19] mb-1">
                        <Sparkles className="w-3 h-3 text-[#D4A346]" />
                        <span>Khoirunnada AI</span>
                      </div>
                    )}

                    {/* Formatted Content */}
                    <div className="text-xs break-words">
                      {formatText(msg.text)}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-white/60' : 'text-neutral-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Suggestion Chips & Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          data-no-loading="true"
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF6EE] text-[#70490E] border border-[#996A19]/25 text-[10px] font-semibold shadow-2xs hover:border-[#996A19] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3 h-3 text-[#996A19]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Animated Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 bg-white border border-[#996A19]/15 rounded-2xl px-3.5 py-2.5 max-w-[140px] shadow-2xs">
                  <Bot className="w-3.5 h-3.5 text-[#996A19]" />
                  <span className="text-[10px] text-[#70490E] font-medium">Sedang berpikir</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#996A19] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A346] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E6C687] animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Bar (Pill Prompt Cepat) */}
            <div className="bg-white px-3 py-1.5 border-t border-black/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => handleSend('Bagaimana cara menggunakan aplikasi ini?')}
                data-no-loading="true"
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[#996A19]/10 text-[#525D58] hover:text-[#70490E] text-[10px] font-medium transition-colors cursor-pointer"
              >
                Cara Pakai
              </button>
              <button
                type="button"
                onClick={() => handleSend('Carikan saya qosidah Mughrom')}
                data-no-loading="true"
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[#996A19]/10 text-[#525D58] hover:text-[#70490E] text-[10px] font-medium transition-colors cursor-pointer"
              >
                Cari Qosidah
              </button>
              <button
                type="button"
                onClick={() => handleSend('Ada jadwal job apa saja?')}
                data-no-loading="true"
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[#996A19]/10 text-[#525D58] hover:text-[#70490E] text-[10px] font-medium transition-colors cursor-pointer"
              >
                Jadwal Job
              </button>
              <button
                type="button"
                onClick={() => handleSend('Bagaimana sejarah Khoirunnada?')}
                data-no-loading="true"
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[#996A19]/10 text-[#525D58] hover:text-[#70490E] text-[10px] font-medium transition-colors cursor-pointer"
              >
                Sejarah
              </button>
              <button
                type="button"
                onClick={() => handleSend('Bagaimana struktur organisasi Khoirunnada?')}
                data-no-loading="true"
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[#996A19]/10 text-[#525D58] hover:text-[#70490E] text-[10px] font-medium transition-colors cursor-pointer"
              >
                Struktur
              </button>
              <button
                type="button"
                onClick={() => handleSend('Siapa yang membuat dan mengembangkan aplikasi ini?')}
                data-no-loading="true"
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[#996A19]/10 text-[#525D58] hover:text-[#70490E] text-[10px] font-medium transition-colors cursor-pointer"
              >
                Pembuat Aplikasi
              </button>
            </div>

            {/* Input Bar Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              data-no-loading="true"
              className="p-2.5 sm:p-3 bg-white border-t border-black/5 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tanya Khoirunnada AI..."
                disabled={isTyping}
                maxLength={200}
                data-no-loading="true"
                className="flex-1 px-3.5 py-2.5 rounded-full border border-neutral-200 bg-neutral-50/70 text-xs text-[#151917] focus:outline-none focus:border-[#996A19] focus:ring-2 focus:ring-[#996A19]/20 transition-all placeholder:text-neutral-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                data-no-loading="true"
                title="Kirim Pertanyaan"
                aria-label="Kirim Pertanyaan"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#70490E] to-[#D4A346] text-white flex items-center justify-center shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
