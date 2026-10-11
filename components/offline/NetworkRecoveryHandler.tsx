'use client';

import { useEffect, useState } from 'react';
import { setIsOfflineGuest, useOfflineGuest, verifyOnlineConnection } from '@/lib/offline-guest';
import { NetworkRecoveryModal } from './NetworkRecoveryModal';

export function NetworkRecoveryHandler() {
  const isOfflineGuest = useOfflineGuest();
  const [showRecovery, setShowRecovery] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOfflineGuest) return;

    let cancelled = false;
    const verifyConnection = async () => {
      if (await verifyOnlineConnection() && !cancelled) setShowRecovery(true);
    };
    const handleOffline = () => {
      setShowRecovery(false);
      setDismissed(false);
    };
    const handleOnline = () => {
      if (!dismissed) void verifyConnection();
    };

    if (!dismissed) void verifyConnection();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleOnline);
    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleOnline);
    };
  }, [isOfflineGuest, dismissed]);

  if (!isOfflineGuest || !showRecovery) return null;

  return (
    <NetworkRecoveryModal
      onRestart={() => {
        setIsOfflineGuest(false);
        window.location.replace('/auth/login');
      }}
      onStay={() => {
        setShowRecovery(false);
        setDismissed(true);
      }}
    />
  );
}
