'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import type { Qosidah } from '@/lib/types';
import { ARABIC_VERSE_SEPARATOR, splitArabicStanzas } from '@/lib/arabic-lyrics';

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
  const [fontSize, setFontSize] = useState<number>(30);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentIndex = allQosidahs.findIndex((q) => q.id === qosidah.id);
  const prevQosidah = currentIndex > 0 ? allQosidahs[currentIndex - 1] : null;
  const nextQosidah =
    currentIndex < allQosidahs.length - 1 ? allQosidahs[currentIndex + 1] : null;
  const stanzas = splitArabicStanzas(qosidah.arabic_text);
  const controlSurface = isDarkMode
    ? 'border-white/25 bg-[#1A211D] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]'
    : 'border-[#CFC7B8] bg-white text-[#151917] shadow-[0_8px_24px_rgba(58,42,17,0.12)]';
  const secondaryButton = isDarkMode
    ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white'
    : 'border-[#CFC7B8] bg-[#F8F6F0] text-[#151917] hover:bg-[#EEE8DC] focus-visible:ring-[#70490E]';
  const navigationButton = isDarkMode
    ? 'border-white/30 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white'
    : 'border-[#BDB4A3] bg-white text-[#151917] hover:bg-[#EEE8DC] focus-visible:ring-[#70490E]';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Mode tampil panggung: ${qosidah.title}`}
      className={`fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden transition-colors duration-200 ${
        isDarkMode
          ? 'stage-dark-mode bg-[#0D1210] text-white'
          : 'bg-[#F8F6F0] text-[#151917]'
      }`}
    >
      <header
        className={`z-20 shrink-0 border-b px-3 pb-3 backdrop-blur-xl sm:px-6 ${
          isDarkMode
            ? 'border-white/20 bg-[#0D1210]/95'
            : 'border-[#D8D0C1] bg-[#F8F6F0]/95'
        }`}
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-[#C89B48] bg-[#F6E7C7] px-3 py-2 text-[#5F3D08] shadow-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#996A19]" />
              <span className="truncate text-[11px] font-extrabold tracking-[0.08em] sm:text-xs">
                MODE TAMPIL PANGGUNG
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E98D88] bg-[#B83732] px-3 text-sm font-bold text-white shadow-md transition hover:bg-[#9F2E2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#B83732] active:scale-[0.97]"
              aria-label="Tutup mode tampil panggung"
              title="Tutup Mode Tampil"
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span>Tutup</span>
            </button>
          </div>

          <div className="flex items-stretch gap-2">
            <div className={`flex min-w-0 flex-1 items-center justify-between gap-1 rounded-2xl border p-1.5 ${controlSurface}`}>
              <span className="pl-2 text-[11px] font-bold sm:text-xs">Teks</span>
              <button
                type="button"
                onClick={() => setFontSize((size) => Math.max(22, size - 2))}
                disabled={fontSize <= 22}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 ${secondaryButton}`}
                aria-label="Kecilkan ukuran teks Arab"
                title="Kecilkan Teks"
              >
                <ZoomOut className="h-5 w-5" aria-hidden="true" />
              </button>
              <output
                className="min-w-12 text-center font-mono text-sm font-extrabold tabular-nums"
                aria-live="polite"
                aria-label={`Ukuran teks ${fontSize} piksel`}
              >
                {fontSize}px
              </output>
              <button
                type="button"
                onClick={() => setFontSize((size) => Math.min(44, size + 2))}
                disabled={fontSize >= 44}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 ${secondaryButton}`}
                aria-label="Besarkan ukuran teks Arab"
                title="Besarkan Teks"
              >
                <ZoomIn className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode((current) => !current)}
              className={`flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl border px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 active:scale-[0.97] ${secondaryButton}`}
              aria-label={isDarkMode ? 'Gunakan tampilan terang' : 'Gunakan tampilan gelap'}
              title={isDarkMode ? 'Gunakan Tampilan Terang' : 'Gunakan Tampilan Gelap'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-[#FFD36A]" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 text-[#70490E]" aria-hidden="true" />
              )}
              <span>{isDarkMode ? 'Terang' : 'Gelap'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <div
            className={`mb-5 border-b pb-5 text-center sm:mb-8 sm:pb-6 ${
              isDarkMode ? 'border-white/25' : 'border-[#D8D0C1]'
            }`}
          >
            <p className={`mb-2 text-[11px] font-bold uppercase tracking-[0.18em] ${isDarkMode ? 'text-[#FFD36A]' : 'text-[#70490E]'}`}>
              Lirik Arab
            </p>
            <h2 id="performance-title" className="text-xl font-extrabold leading-snug tracking-tight sm:text-3xl">
              {qosidah.title}
            </h2>
            {qosidah.alternate_title && (
              <p className={`mt-1.5 text-sm font-medium leading-relaxed sm:text-base ${isDarkMode ? 'text-[#D7DDD9]' : 'text-[#4A4D49]'}`}>
                {qosidah.alternate_title}
              </p>
            )}
          </div>

          <section aria-labelledby="performance-title" className="select-none" lang="ar" dir="rtl">
            {stanzas.map((stanza, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div className="flex items-center gap-4 py-2 text-[#C89B48]" aria-hidden="true">
                    <span className={`h-px flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-[#D8D0C1]'}`} />
                    <span className="text-2xl leading-none">{ARABIC_VERSE_SEPARATOR}</span>
                    <span className={`h-px flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-[#D8D0C1]'}`} />
                  </div>
                )}
                <p
                  className={`arabic-font whitespace-pre-line break-words py-5 text-right font-medium sm:py-7 ${
                    isDarkMode ? 'text-white' : 'text-[#151917]'
                  }`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: 2.35 }}
                >
                  {stanza}
                </p>
              </React.Fragment>
            ))}
          </section>

          {qosidah.latin_text && (
            <section
              className={`mt-8 rounded-2xl border p-5 shadow-sm sm:mt-12 sm:p-7 ${
                isDarkMode
                  ? 'border-white/25 bg-white/[0.08] text-white'
                  : 'border-[#D8D0C1] bg-white text-[#20221F]'
              }`}
              aria-labelledby="latin-heading"
            >
              <h3
                id="latin-heading"
                className={`mb-4 text-xs font-extrabold uppercase tracking-[0.16em] ${
                  isDarkMode ? 'text-[#FFD36A]' : 'text-[#70490E]'
                }`}
              >
                Panduan Lafadz Latin
              </h3>
              <p className="whitespace-pre-line text-left text-base font-medium leading-8 sm:text-lg sm:leading-9">
                {qosidah.latin_text}
              </p>
            </section>
          )}

          <p className={`mt-7 text-center text-xs font-semibold ${isDarkMode ? 'text-[#B7C0BB]' : 'text-[#5C605C]'}`}>
            Geser layar ke atas untuk melanjutkan lirik
          </p>
        </div>
      </main>

      <footer
        className={`z-20 shrink-0 border-t px-3 pt-3 backdrop-blur-xl sm:px-6 ${
          isDarkMode
            ? 'border-white/20 bg-[#0D1210]/95'
            : 'border-[#D8D0C1] bg-[#F8F6F0]/95'
        }`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <button
            type="button"
            onClick={() => prevQosidah && onSelectQosidah(prevQosidah)}
            disabled={!prevQosidah}
            className={`flex min-h-14 min-w-0 items-center gap-2 rounded-2xl border px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] ${navigationButton}`}
            aria-label={prevQosidah ? `Qosidah sebelumnya: ${prevQosidah.title}` : 'Sudah di awal daftar'}
          >
            <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wide opacity-75">Sebelumnya</span>
              <span className="block truncate text-xs font-bold sm:text-sm">
                {prevQosidah ? prevQosidah.title : 'Awal daftar'}
              </span>
            </span>
          </button>

          <div
            className={`rounded-xl border px-2.5 py-2 text-center font-mono text-xs font-extrabold tabular-nums ${controlSurface}`}
            aria-label={`Qosidah ${currentIndex + 1} dari ${allQosidahs.length}`}
          >
            <span className="block sm:hidden">{currentIndex + 1}</span>
            <span className="hidden sm:block">{currentIndex + 1} / {allQosidahs.length}</span>
          </div>

          <button
            type="button"
            onClick={() => nextQosidah && onSelectQosidah(nextQosidah)}
            disabled={!nextQosidah}
            className={`flex min-h-14 min-w-0 items-center justify-end gap-2 rounded-2xl border px-3 text-right transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] ${navigationButton}`}
            aria-label={nextQosidah ? `Qosidah berikutnya: ${nextQosidah.title}` : 'Sudah di akhir daftar'}
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wide opacity-75">Berikutnya</span>
              <span className="block truncate text-xs font-bold sm:text-sm">
                {nextQosidah ? nextQosidah.title : 'Akhir daftar'}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
