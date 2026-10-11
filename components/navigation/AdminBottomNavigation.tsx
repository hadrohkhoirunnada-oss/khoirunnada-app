'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  ClipboardList,
  CalendarPlus,
  Wallet,
  Settings,
  Plus,
} from 'lucide-react';
import { AddJobBottomSheet } from '../admin/AddJobBottomSheet';

export function AdminBottomNavigation() {
  const pathname = usePathname();
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  return (
    <>
      <nav className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-3 pt-2 pointer-events-none">
        <div className="pointer-events-auto rounded-2xl px-2 py-1.5 flex items-center justify-around bg-white/95 backdrop-blur-2xl border border-[#996A19]/20 shadow-[0_4px_24px_rgba(153,106,25,0.12)]">
          {/* 1. Beranda Admin */}
          <Link
            href="/app/admin"
            className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname === '/app/admin'
                ? 'bg-[#996A19]/12 text-[#70490E] font-semibold'
                : 'text-[#585145] hover:text-[#151917]'
            }`}
          >
            <ShieldCheck
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname === '/app/admin' ? 'scale-105 stroke-[2.2px] text-[#70490E]' : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname === '/app/admin' ? 'font-bold text-[#70490E]' : 'font-medium'
              }`}
            >
              Beranda
            </span>
          </Link>

          {/* 2. Kelola Booking */}
          <Link
            href="/app/admin/bookings"
            className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname.startsWith('/app/admin/bookings')
                ? 'bg-[#996A19]/12 text-[#70490E] font-semibold'
                : 'text-[#585145] hover:text-[#151917]'
            }`}
          >
            <ClipboardList
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname.startsWith('/app/admin/bookings')
                  ? 'scale-105 stroke-[2.2px] text-[#70490E]'
                  : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname.startsWith('/app/admin/bookings')
                  ? 'font-bold text-[#70490E]'
                  : 'font-medium'
              }`}
            >
              Booking
            </span>
          </Link>

          {/* 3. TAMBAH JOB (Membuka Popup Bottom-Sheet Non-Full Layar Khusus Admin) */}
          <button
            onClick={() => setIsAddJobOpen(true)}
            className="relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl text-[#585145] hover:text-[#151917] font-medium active:scale-95 transition-all cursor-pointer"
            aria-label="Tambah Job Baru"
          >
            <div className="flex items-center gap-0.5">
              <CalendarPlus className="w-5 h-5 stroke-[1.8px]" />
              <Plus className="w-3 h-3 stroke-[3px] -ml-1" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">
              Tambah Job
            </span>
          </button>

          {/* 4. Keuangan Kas Hadroh (Khusus Admin/Bendahara) */}
          <Link
            href="/app/admin/finance"
            className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname.startsWith('/app/admin/finance')
                ? 'bg-[#996A19]/12 text-[#70490E] font-semibold'
                : 'text-[#585145] hover:text-[#151917]'
            }`}
          >
            <Wallet
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname.startsWith('/app/admin/finance')
                  ? 'scale-105 stroke-[2.2px] text-[#70490E]'
                  : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname.startsWith('/app/admin/finance')
                  ? 'font-bold text-[#70490E]'
                  : 'font-medium'
              }`}
            >
              Kas
            </span>
          </Link>

          {/* 5. Pengaturan & Akun Admin */}
          <Link
            href="/app/admin/settings"
            className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname.startsWith('/app/admin/settings')
                ? 'bg-[#996A19]/12 text-[#70490E] font-semibold'
                : 'text-[#585145] hover:text-[#151917]'
            }`}
          >
            <Settings
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname.startsWith('/app/admin/settings')
                  ? 'scale-105 stroke-[2.2px] text-[#70490E]'
                  : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname.startsWith('/app/admin/settings') ? 'font-bold text-[#70490E]' : 'font-medium'
              }`}
            >
              Kelola
            </span>
          </Link>
        </div>
      </nav>

      {/* Popup Bottom Sheet Form Tambah Job */}
      <AddJobBottomSheet
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
      />
    </>
  );
}
