'use client';

import React from 'react';

interface GlobalLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function GlobalLoadingOverlay({
  isLoading,
  message = 'Memproses...',
}: GlobalLoadingOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-200 select-none ${
        isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. Backdrop dengan efek blur mendalam (Glass Scrim) */}
      <div
        className="absolute inset-0 bg-black/40 transition-all duration-200"
        style={{
          backdropFilter: 'blur(12px) saturate(160%)',
          WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        }}
      />

      {/* 2. Kartu Animasi Loading di Tengah (Center Glass Floating Card) */}
      <div
        className={`relative z-10 px-6 py-5 sm:px-7 sm:py-6 rounded-3xl bg-white/92 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-[#996A19]/30 backdrop-blur-xl flex flex-col items-center justify-center max-w-[210px] w-full text-center transition-all duration-200 transform ${
          isLoading ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2'
        }`}
      >
        {/* Lingkaran Logo dengan Dual Cincin Orbital Berputar */}
        <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
          {/* Efek Aura Emas Lembut di Belakang Logo */}
          <div className="absolute inset-0 rounded-full bg-[#D4A346]/25 blur-md animate-pulse" />

          {/* Cincin Orbital 1: Berputar searah jarum jam */}
          <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#D4A346] border-r-[#996A19] animate-spin" />

          {/* Cincin Orbital 2: Berputar berlawanan arah */}
          <div className="absolute -inset-2.5 rounded-full border border-transparent border-b-[#E6C687]/80 border-l-[#B58228]/50 animate-spin [animation-duration:2.5s] [animation-direction:reverse]" />

          {/* Logo Hadroh Khoirunnada */}
          <div className="w-13 h-13 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center border border-[#996A19]/30 p-1.5 relative z-10">
            <img
              src="/logo-khoirunnada-192.png"
              alt="Hadroh Khoirunnada"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Teks Status Loading */}
        <p className="text-[11px] sm:text-xs font-bold text-[#70490E] tracking-wider uppercase mb-1.5">
          {message || 'Memproses...'}
        </p>

        {/* 3 Titik Animasi Berdenyut Emas */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#996A19] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A346] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6C687] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
