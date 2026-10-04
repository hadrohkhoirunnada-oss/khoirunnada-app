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
        <div className="pointer-events-auto rounded-2xl px-2 py-1.5 flex items-center justify-around bg-[#0E1311]/92 backdrop-blur-2xl border border-[#B58228]/35 shadow-[0_-8px_32px_rgba(0,0,0,0.7)]">
          {/* 1. Beranda Admin */}
          <Link
            href="/app/admin"
            className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[46px] py-1 px-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname === '/app/admin'
                ? 'bg-[#996A19]/25 text-[#F3E6C8] font-semibold border border-[#996A19]/40'
                : 'text-[#A69E8F] hover:text-[#F8F6F0]'
            }`}
          >
            <ShieldCheck
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname === '/app/admin' ? 'scale-105 stroke-[2.2px] text-[#B58228]' : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname === '/app/admin' ? 'font-bold text-[#F3E6C8]' : 'font-medium'
              }`}
            >
              Beranda
            </span>
          </Link>

          {/* 2. Kelola Booking */}
          <Link
            href="/app/admin/bookings"
            className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[46px] py-1 px-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname.startsWith('/app/admin/bookings')
                ? 'bg-[#996A19]/25 text-[#F3E6C8] font-semibold border border-[#996A19]/40'
                : 'text-[#A69E8F] hover:text-[#F8F6F0]'
            }`}
          >
            <ClipboardList
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname.startsWith('/app/admin/bookings')
                  ? 'scale-105 stroke-[2.2px] text-[#B58228]'
                  : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname.startsWith('/app/admin/bookings')
                  ? 'font-bold text-[#F3E6C8]'
                  : 'font-medium'
              }`}
            >
              Booking
            </span>
          </Link>

          {/* 3. TAMBAH JOB (Membuka Popup Bottom-Sheet Non-Full Layar Khusus Admin) */}
          <button
            onClick={() => setIsAddJobOpen(true)}
            className="relative flex flex-col items-center justify-center min-w-[68px] min-h-[46px] py-1 px-2 rounded-xl bg-gradient-to-tr from-[#996A19] via-[#B58228] to-[#D4A346] text-white font-bold shadow-[0_4px_16px_rgba(153,106,25,0.5)] border border-[#F3E6C8]/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Tambah Job Baru"
          >
            <div className="flex items-center gap-0.5">
              <CalendarPlus className="w-4 h-4 stroke-[2.4px]" />
              <Plus className="w-3 h-3 stroke-[3px] -ml-1" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-extrabold text-white">
              Tambah Job
            </span>
          </button>

          {/* 4. Keuangan Kas Hadroh (Khusus Admin/Bendahara) */}
          <Link
            href="/app/admin/finance"
            className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[46px] py-1 px-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname.startsWith('/app/admin/finance')
                ? 'bg-[#996A19]/25 text-[#F3E6C8] font-semibold border border-[#996A19]/40'
                : 'text-[#A69E8F] hover:text-[#F8F6F0]'
            }`}
          >
            <Wallet
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname.startsWith('/app/admin/finance')
                  ? 'scale-105 stroke-[2.2px] text-[#B58228]'
                  : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname.startsWith('/app/admin/finance')
                  ? 'font-bold text-[#F3E6C8]'
                  : 'font-medium'
              }`}
            >
              Kas
            </span>
          </Link>

          {/* 5. Pengaturan & Akun Admin */}
          <Link
            href="/app/admin/settings"
            className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[46px] py-1 px-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
              pathname.startsWith('/app/admin/settings')
                ? 'bg-[#996A19]/25 text-[#F3E6C8] font-semibold border border-[#996A19]/40'
                : 'text-[#A69E8F] hover:text-[#F8F6F0]'
            }`}
          >
            <Settings
              className={`w-5 h-5 transition-transform duration-150 ${
                pathname.startsWith('/app/admin/settings')
                  ? 'scale-105 stroke-[2.2px] text-[#B58228]'
                  : 'stroke-[1.8px]'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                pathname.startsWith('/app/admin/settings') ? 'font-bold text-[#F3E6C8]' : 'font-medium'
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
