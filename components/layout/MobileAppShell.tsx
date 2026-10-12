'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GlassAppHeader } from '../navigation/GlassAppHeader';
import { GlassBottomNavigation } from '../navigation/GlassBottomNavigation';
import { AdminBottomNavigation } from '../navigation/AdminBottomNavigation';
import { GlobalLoadingOverlay } from '../ui/GlobalLoadingOverlay';
import { OfflineGatedCard } from '../offline/OfflineGatedCard';
import { OfflineGuestNavigation, type OfflineSection } from '../offline/OfflineGuestNavigation';
import { checkIsOnline, OFFLINE_SECTION_EVENT, useOfflineGuest } from '@/lib/offline-guest';

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
  const isOfflineGuest = useOfflineGuest();
  const isAdmin = pathname.startsWith('/app/admin');
  const isOfflineLibrary = pathname === '/app/qosidah' || pathname.startsWith('/app/qosidah/');
  const [offlineSection, setOfflineSection] = useState<OfflineSection>('qosidah');
  const showOfflineGate = isOfflineGuest && (!isOfflineLibrary || offlineSection !== 'qosidah');

  useEffect(() => {
    const handleSection = (event: Event) => {
      setOfflineSection((event as CustomEvent<OfflineSection>).detail);
    };
    window.addEventListener(OFFLINE_SECTION_EVENT, handleSection);
    return () => window.removeEventListener(OFFLINE_SECTION_EVENT, handleSection);
  }, []);

  useEffect(() => {
    if (!isOfflineGuest && !currentUser.id && !checkIsOnline()) {
      window.location.replace('/auth/login');
    }
  }, [currentUser.id, isOfflineGuest]);

  // Samakan warna kanvas Admin dengan portal Pemain saat overscroll.
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
    if (isOfflineGuest || isLoading || !currentUser.id) return;

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
  }, [currentUser, isAdmin, isLoading, isOfflineGuest, router, pathname]);

  if (isLoading && !isOfflineGuest) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <GlobalLoadingOverlay isLoading={true} message="Memuat Hadroh Khoirunnada..." />
      </div>
    );
  }

  if (!isOfflineGuest && (dataError || !currentUser.id)) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center px-6 text-center text-[#A12B26] text-xs font-medium">
        {dataError || 'Sesi tidak tersedia. Silakan masuk kembali.'}
      </div>
    );
  }

  const isDedicatedAdminAccount =
    (currentUser?.is_admin || currentUser?.is_treasurer) && !currentUser?.is_member;

  if (!isOfflineGuest && isDedicatedAdminAccount && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <GlobalLoadingOverlay isLoading={true} message="Membuka Portal Admin..." />
      </div>
    );
  }

  if (!isOfflineGuest && !currentUser?.is_admin && !currentUser?.is_treasurer && isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <GlobalLoadingOverlay isLoading={true} message="Membuka Portal Pemain..." />
      </div>
    );
  }

  return (
    <div
      className={`h-screen h-[100dvh] w-full flex flex-col items-center justify-start overflow-hidden antialiased selection:bg-[#996A19]/30 transition-colors bg-[#F8F6F0] text-[#151917] ${
        isAdmin ? 'selection:text-[#151917]' : 'selection:text-[#F3E6C8]'
      } ${isAdmin ? 'admin-desktop-root' : ''}`}
    >
      {/* Ambient Radial Lighting on Canvas (Statis fixed di background) */}
      <div className="ambient-lighting" />

      {/* Container simulating smartphone app frame: Fixed viewport, header fixed di atas, konten scroll mulus */}
      <div
        data-admin-mode={isAdmin ? "true" : undefined}
        data-admin-route={isAdmin ? pathname : undefined}
        className="w-full max-w-[440px] h-full flex flex-col relative overflow-hidden transition-colors bg-[#F8F6F0] text-[#151917] sm:border-x sm:border-black/5 shadow-[0_0_50px_rgba(0,0,0,0.08)]"
      >
        {!hideHeader && (
          <div className={`shrink-0 z-30 ${isAdmin ? 'admin-desktop-header' : ''}`}>
            <GlassAppHeader
              title={title}
              subtitle={subtitle}
              showBack={showBack}
              backHref={backHref}
              rightAction={rightAction}
            />
          </div>
        )}

        {isOfflineGuest && (
          <div role="status" className="shrink-0 border-b border-[#996A19]/15 bg-[#F5EBD7]/70 px-4 py-2 text-center text-[11px] font-semibold text-[#70490E]">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-600" />
            Mode Offline Aktif — 98 Koleksi Qosidah &amp; Mode Panggung Siap Digunakan
          </div>
        )}

        <main className={`flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4 ${hideNav ? 'pb-6' : 'pb-32'} ${isAdmin ? 'admin-desktop-main' : ''}`}>
          {showOfflineGate ? <OfflineGatedCard onBack={isOfflineLibrary ? () => setOfflineSection('qosidah') : undefined} /> : children}
        </main>

        {/* Soft protective gradient curtain so scrolled cards don't visually collide with bottom navigation */}
        {!hideNav && (
          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-30 transition-colors bg-gradient-to-t from-[#F8F6F0] via-[#F8F6F0]/85 to-transparent ${isAdmin ? 'admin-desktop-curtain' : ''}`}
          />
        )}

        {!hideNav && (isOfflineGuest && isOfflineLibrary ? <OfflineGuestNavigation active={offlineSection} onSelect={setOfflineSection} /> : isAdmin ? <AdminBottomNavigation /> : <GlassBottomNavigation />)}

      </div>
    </div>
  );
}
