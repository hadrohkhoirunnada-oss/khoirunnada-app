'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface GlassAppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export function GlassAppHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
  rightAction,
}: GlassAppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadNotificationCount } = useAppStore();

  const isAdmin = pathname.startsWith('/app/admin');

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between transition-colors ${
        isAdmin
          ? 'bg-[#0E1311]/92 backdrop-blur-2xl border-b border-[#B58228]/35 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'glass-header'
      }`}
    >
      {/* Left: Logo (Tanpa card background) & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack && (
          <button
            onClick={handleBack}
            className={`p-1 -ml-1 active:scale-95 transition-all cursor-pointer shrink-0 ${
              isAdmin
                ? 'text-[#F8F6F0] hover:text-[#B58228]'
                : 'text-[#151917] hover:text-[#996A19]'
            }`}
            aria-label="Kembali"
          >
            <ArrowLeft className={`w-5 h-5 ${isAdmin ? 'text-[#B58228]' : 'text-[#996A19]'}`} />
          </button>
        )}

        {/* Logo resmi Hadroh Khoirunnada tanpa card background */}
        <div className="w-9 h-9 shrink-0 flex items-center justify-center">
          <img
            src="/logo-khoirunnada-192.png"
            alt="Logo Hadroh Khoirunnada"
            className="w-full h-full object-contain drop-shadow-xs"
          />
        </div>

        <div className="flex flex-col text-left min-w-0">
          <h1
            className={`text-base font-bold tracking-tight truncate leading-tight ${
              isAdmin ? 'text-[#F8F6F0] font-serif' : 'text-[#151917]'
            }`}
          >
            {title || (isAdmin ? 'Pusat Admin' : 'Beranda')}
          </h1>
          <div className="flex items-center gap-1.5 leading-tight mt-0.5 min-w-0">
            <p
              className={`text-[11px] font-medium truncate ${
                isAdmin ? 'text-[#B58228]' : 'text-[#996A19]'
              }`}
            >
              {subtitle || 'Hadroh Khoirunnada'}
            </p>
            {isAdmin && (
              <span className="px-1.5 py-0.5 rounded bg-[#B58228]/20 border border-[#B58228]/40 text-[#D4A346] text-[9px] font-extrabold tracking-wider shrink-0">
                ADMIN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Icon Lonceng & Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {rightAction}

        {/* Bell Icon: HANYA untuk portal Pemain. Di bagian Admin TIDAK ADA icon lonceng */}
        {!isAdmin && (
          <Link
            href="/app/notifications"
            className="relative p-1.5 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5 stroke-[2.2px] text-[#996A19] hover:text-[#70490E]" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 bg-[#C84A45] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
