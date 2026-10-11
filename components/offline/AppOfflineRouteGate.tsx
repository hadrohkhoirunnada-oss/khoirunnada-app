'use client';

import { usePathname } from 'next/navigation';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { useOfflineGuest } from '@/lib/offline-guest';

export function AppOfflineRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOfflineGuest = useOfflineGuest();
  const isQosidah = pathname === '/app/qosidah' || pathname.startsWith('/app/qosidah/');

  if (isOfflineGuest && !isQosidah) {
    return <MobileAppShell title="Mode Offline" subtitle="Hadroh Khoirunnada"><span className="sr-only">Fitur ini memerlukan koneksi internet.</span></MobileAppShell>;
  }

  return children;
}
