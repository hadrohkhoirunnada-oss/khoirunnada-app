'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GlassAppHeader } from '../navigation/GlassAppHeader';
import { GlassBottomNavigation } from '../navigation/GlassBottomNavigation';
import { AdminBottomNavigation } from '../navigation/AdminBottomNavigation';
import { GlobalLoadingOverlay } from '../ui/GlobalLoadingOverlay';
import { KhoirunnadaAIWidget } from '../ai/KhoirunnadaAIWidget';

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

  // Bilateral route guard
  useEffect(() => {
    if (isLoading || !currentUser.id) return;

    const isDedicatedAdminAccount =
      (currentUser.is_admin || currentUser.is_treasurer) && !currentUser.is_member;

    if (isDedicatedAdminAccount && !isAdmin && pathname !== '/app/profile') {
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
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <GlobalLoadingOverlay isLoading={true} message="Memuat Hadroh Khoirunnada..." />
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
      <div className="min-h-screen bg-[#070908] flex items-center justify-center">
        <GlobalLoadingOverlay isLoading={true} message="Membuka Portal Admin..." />
      </div>
    );
  }

  if (!currentUser?.is_admin && !currentUser?.is_treasurer && isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <GlobalLoadingOverlay isLoading={true} message="Membuka Portal Pemain..." />
      </div>
    );
  }

  return (
    <div
      className={`h-screen h-[100dvh] w-full flex flex-col items-center justify-start overflow-hidden antialiased selection:bg-[#996A19]/30 selection:text-[#F3E6C8] transition-colors ${
        isAdmin ? 'bg-[#070908] text-[#F8F6F0]' : 'bg-[#F8F6F0] text-[#151917]'
      }`}
    >
      {/* Ambient Radial Lighting on Canvas (Statis fixed di background) */}
      {isAdmin ? (
        <div className="admin-ambient-lighting" />
      ) : (
        <div className="ambient-lighting" />
      )}

      {/* Container simulating smartphone app frame: Fixed viewport, header fixed di atas, konten scroll mulus */}
      <div
        data-admin-mode={isAdmin ? "true" : undefined}
        className={`w-full max-w-[440px] h-full flex flex-col relative overflow-hidden transition-colors ${
          isAdmin
            ? 'bg-[#0D1210] text-[#F8F6F0] sm:border-x sm:border-[#B58228]/25 shadow-[0_0_60px_rgba(0,0,0,0.8)]'
            : 'bg-[#F8F6F0] text-[#151917] sm:border-x sm:border-black/5 shadow-[0_0_50px_rgba(0,0,0,0.08)]'
        }`}
      >
        {!hideHeader && (
          <div className="shrink-0 z-30">
            <GlassAppHeader
              title={title}
              subtitle={subtitle}
              showBack={showBack}
              backHref={backHref}
              rightAction={rightAction}
            />
          </div>
        )}

        <main className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4 ${hideNav ? 'pb-6' : 'pb-32'}`}>
          {children}
        </main>

        {/* Soft protective gradient curtain so scrolled cards don't visually collide with bottom navigation */}
        {!hideNav && (
          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-30 transition-colors ${
              isAdmin
                ? 'bg-gradient-to-t from-[#0D1210] via-[#0D1210]/80 to-transparent'
                : 'bg-gradient-to-t from-[#F8F6F0] via-[#F8F6F0]/85 to-transparent'
            }`}
          />
        )}

        {!hideNav && (isAdmin ? <AdminBottomNavigation /> : <GlassBottomNavigation />)}

        {/* Floating Khoirunnada AI Widget di Sudut Kanan Bawah */}
        <KhoirunnadaAIWidget />
      </div>
    </div>
  );
}
