'use client';

import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Qosidah } from '@/lib/types';

interface PerformanceModeProps {
  qosidah: Qosidah;
  allQosidahs: Qosidah[];
  isOpen: boolean;
  onClose: () => void;
  onSelectQosidah: (q: Qosidah) => void;
}

export function PerformanceMode({
  qosidah,
  allQosidahs,
  isOpen,
  onClose,
  onSelectQosidah,
}: PerformanceModeProps) {
  const [fontSize, setFontSize] = useState<number>(26); // in px
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // default dark on stage for spotlights

  if (!isOpen) return null;

  const currentIndex = allQosidahs.findIndex((q) => q.id === qosidah.id);
  const prevQosidah = currentIndex > 0 ? allQosidahs[currentIndex - 1] : null;
  const nextQosidah =
    currentIndex < allQosidahs.length - 1 ? allQosidahs[currentIndex + 1] : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0D1210] text-[#FFFFFF]' : 'bg-[#F8F6F0] text-[#151917]'
      }`}
    >
      {/* Top Floating Glass Pill Control Bar */}
      <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div
          className={`px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 shadow-lg ${
            isDarkMode
              ? 'bg-[#171E1A]/80 border-white/15 text-white'
              : 'bg-white/80 border-white/80 text-[#151917]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#996A19] animate-pulse" />
          <span className="text-xs font-bold tracking-tight">MODE TAMPIL PANGGUNG</span>
        </div>

        {/* Action Controls */}
        <div
          className={`flex items-center gap-1.5 p-1 rounded-full border backdrop-blur-md shadow-lg ${
            isDarkMode
              ? 'bg-[#171E1A]/80 border-white/15 text-white'
              : 'bg-white/80 border-white/80 text-[#151917]'
          }`}
        >
          <button
            onClick={() => setFontSize((s) => Math.max(18, s - 3))}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all"
            title="Kecilkan Font"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold px-1">{fontSize}px</span>
          <button
            onClick={() => setFontSize((s) => Math.min(42, s + 3))}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all"
            title="Besarkan Font"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-current opacity-20 mx-1" />

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 active:scale-95 transition-all"
            title={isDarkMode ? 'Beralih ke Kanvas Terang' : 'Beralih ke Kanvas Gelap Panggung'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#B58A3A]" /> : <Moon className="w-4 h-4 text-[#996A19]" />}
          </button>

          <div className="w-[1px] h-4 bg-current opacity-20 mx-1" />

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#C84A45]/20 text-[#C84A45] flex items-center justify-center hover:bg-[#C84A45]/30 active:scale-95 transition-all"
            title="Tutup Mode Tampil"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Viewer */}
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full flex flex-col justify-start">
        {/* Title Header */}
        <div className="text-center mb-8 pb-4 border-b border-current border-opacity-15">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
            {qosidah.title}
          </h2>
          {qosidah.alternate_title && (
            <p className="text-xs sm:text-sm opacity-70 italic">
              {qosidah.alternate_title}
            </p>
          )}
        </div>

        {/* Large Crisp Arabic Verses */}
        <div
          className="arabic-font whitespace-pre-line text-right font-normal leading-[2.5] tracking-wide my-auto select-none"
          style={{ fontSize: `${fontSize}px` }}
        >
          {qosidah.arabic_text}
        </div>

        {/* Latin Transliteration for assistance */}
        <div className="mt-12 pt-6 border-t border-current border-opacity-15 opacity-80 text-sm whitespace-pre-line leading-relaxed font-sans text-center">
          <p className="font-semibold text-xs tracking-wider uppercase mb-2 opacity-60">
            Panduan Lafadz Latin
          </p>
          {qosidah.latin_text}
        </div>
      </main>

      {/* Bottom Floating Nav between Qosidahs */}
      <footer className="sticky bottom-0 z-10 px-6 py-4 flex items-center justify-between border-t border-current border-opacity-10 backdrop-blur-md">
        <button
          onClick={() => prevQosidah && onSelectQosidah(prevQosidah)}
          disabled={!prevQosidah}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
            prevQosidah
              ? 'bg-current bg-opacity-10 hover:bg-opacity-15 cursor-pointer'
              : 'opacity-25 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="truncate max-w-[120px]">
            {prevQosidah ? prevQosidah.title : 'Awal Daftar'}
          </span>
        </button>

        <span className="text-xs opacity-60 font-mono">
          {currentIndex + 1} / {allQosidahs.length}
        </span>

        <button
          onClick={() => nextQosidah && onSelectQosidah(nextQosidah)}
          disabled={!nextQosidah}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
            nextQosidah
              ? 'bg-current bg-opacity-10 hover:bg-opacity-15 cursor-pointer'
              : 'opacity-25 pointer-events-none'
          }`}
        >
          <span className="truncate max-w-[120px]">
            {nextQosidah ? nextQosidah.title : 'Akhir Daftar'}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
