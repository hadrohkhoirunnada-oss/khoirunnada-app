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
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-all duration-300 select-none ${
        isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. Latar Belakang Blur Saja (Murni Backdrop Blur tanpa Card) */}
      <div
        className="absolute inset-0 bg-black/45 transition-all duration-300"
        style={{
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        }}
      />

      {/* 2. Animasi Terpusat di Tengah (Melayang Langsung di Atas Blur, TANPA Card Putih) */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center transition-all duration-300 transform ${
          isLoading ? 'scale-100 translate-y-0' : 'scale-90 translate-y-2'
        }`}
      >
        {/* Lingkaran Logo dengan Dual Cincin Orbital Berputar */}
        <div className="relative w-20 h-20 mb-3.5 flex items-center justify-center">
          {/* Efek Pijar Aura Emas (Golden Glow) */}
          <div className="absolute inset-0 rounded-full bg-[#D4A346]/35 blur-xl animate-pulse" />

          {/* Cincin Orbital 1: Berputar searah jarum jam */}
          <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#E6C687] border-r-[#996A19] animate-spin" />

          {/* Cincin Orbital 2: Berputar berlawanan arah */}
          <div className="absolute -inset-3 rounded-full border border-transparent border-b-[#D4A346] border-l-[#B58228]/60 animate-spin [animation-duration:2.5s] [animation-direction:reverse]" />

          {/* Logo Hadroh Khoirunnada */}
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-[0_0_30px_rgba(212,163,70,0.5)] flex items-center justify-center border-2 border-[#D4A346]/60 p-1.5 relative z-10">
            <img
              src="/logo-khoirunnada-192.png"
              alt="Hadroh Khoirunnada"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Teks Status Loading (Teks Terbaca Jelas Langsung di Atas Blur) */}
        <p className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
          {message || 'Memproses...'}
        </p>

        {/* 3 Titik Animasi Berdenyut Emas */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D4A346] shadow-[0_0_10px_rgba(212,163,70,0.9)] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#E6C687] shadow-[0_0_10px_rgba(230,198,135,0.9)] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#B58228] shadow-[0_0_10px_rgba(181,130,40,0.9)] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
