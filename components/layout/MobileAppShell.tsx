'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GlassAppHeader } from '../navigation/GlassAppHeader';
import { GlassBottomNavigation } from '../navigation/GlassBottomNavigation';
import { AdminBottomNavigation } from '../navigation/AdminBottomNavigation';

interface MobileAppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
  hideNav?: boolean;
  hideHeader?: boolean;
}

export function MobileAppShell({
  children,
  title,
  subtitle,
  showBack,
  backHref,
  rightAction,
  hideNav = false,
  hideHeader = false,
}: MobileAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, dataError } = useAppStore();
  const isAdmin = pathname.startsWith('/app/admin');

  // Terapkan tema gelap ke html & body agar tidak ada sela putih/krem saat overscroll
  useEffect(() => {
    if (isAdmin) {
      document.documentElement.classList.add('admin-theme');
      document.body.classList.add('admin-theme');
    } else {
      document.documentElement.classList.remove('admin-theme');
      document.body.classList.remove('admin-theme');
    }
    return () => {
      document.documentElement.classList.remove('admin-theme');
      document.body.classList.remove('admin-theme');
    };
  }, [isAdmin]);

  // Bilateral route guard:
  // 1. Akun khusus Admin & Bendahara (admin.khoirunnada@gmail.com)
  //    TIDAK BISA akses portal pemain (/app, /app/jobs, /app/profile, /app/qosidah, /app/finance) -> direct redirect ke /app/admin
  // 2. Pemain biasa (!is_admin && !is_treasurer)
  //    TIDAK BISA akses portal admin (/app/admin/*) -> direct redirect ke /app
  useEffect(() => {
    if (isLoading || !currentUser.id) return;

    const isDedicatedAdminAccount =
      (currentUser.is_admin || currentUser.is_treasurer) && !currentUser.is_member;

    if (isDedicatedAdminAccount && !isAdmin) {
      router.replace('/app/admin');
      return;
    }

    if (!currentUser.is_admin && !currentUser.is_treasurer && isAdmin) {
      router.replace('/app');
      return;
    }
  }, [currentUser, isAdmin, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center text-[#996A19] text-xs font-medium">
        Memuat data Khoirunnada...
      </div>
    );
  }

  if (dataError || !currentUser.id) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-6 text-center text-[#A12B26] text-xs font-medium">
        {dataError || 'Sesi tidak tersedia. Silakan masuk kembali.'}
      </div>
    );
  }

  const isDedicatedAdminAccount =
    (currentUser?.is_admin || currentUser?.is_treasurer) && !currentUser?.is_member;

  if (isDedicatedAdminAccount && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#070908] flex items-center justify-center text-[#D4A346] text-xs font-medium">
        Mengarahkan ke Portal Khusus Admin & Bendahara...
      </div>
    );
  }

  if (!currentUser?.is_admin && !currentUser?.is_treasurer && isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center text-[#996A19] text-xs font-medium">
        Mengarahkan ke Portal Pemain...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start antialiased selection:bg-[#996A19]/30 selection:text-[#F3E6C8] transition-colors ${
        isAdmin ? 'bg-[#070908] text-[#F8F6F0]' : 'bg-[#F8F6F0] text-[#151917]'
      }`}
    >
      {/* Ambient Radial Lighting on Canvas */}
      {isAdmin ? (
        <div className="admin-ambient-lighting" />
      ) : (
        <div className="ambient-lighting" />
      )}

      {/* Container simulating smartphone app frame on desktop */}
      <div
        data-admin-mode={isAdmin ? "true" : undefined}
        className={`w-full max-w-[440px] min-h-screen flex flex-col relative overflow-x-hidden overscroll-none transition-colors ${
          isAdmin
            ? 'bg-[#0D1210] text-[#F8F6F0] sm:border-x sm:border-[#B58228]/25 shadow-[0_0_60px_rgba(0,0,0,0.8)]'
            : 'bg-[#F8F6F0] text-[#151917] sm:border-x sm:border-black/5 shadow-[0_0_50px_rgba(0,0,0,0.08)]'
        }`}
      >
        {!hideHeader && (
          <GlassAppHeader
            title={title}
            subtitle={subtitle}
            showBack={showBack}
            backHref={backHref}
            rightAction={rightAction}
          />
        )}

        <main className={`flex-1 flex flex-col px-4 py-4 ${hideNav ? 'pb-6' : 'pb-20'}`}>
          {children}
        </main>

        {!hideNav && (isAdmin ? <AdminBottomNavigation /> : <GlassBottomNavigation />)}
      </div>
    </div>
  );
}
