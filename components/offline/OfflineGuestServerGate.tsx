'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { useOfflineGuest } from '@/lib/offline-guest';

export function OfflineGuestServerGate() {
  const router = useRouter();
  const isOfflineGuest = useOfflineGuest();

  useEffect(() => {
    if (!isOfflineGuest) router.replace('/auth/login');
  }, [isOfflineGuest, router]);

  if (!isOfflineGuest) return null;
  return <MobileAppShell title="Mode Offline" subtitle="Hadroh Khoirunnada"><span className="sr-only">Fitur ini memerlukan koneksi internet.</span></MobileAppShell>;
}
