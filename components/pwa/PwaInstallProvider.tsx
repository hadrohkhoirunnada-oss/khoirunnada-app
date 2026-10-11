'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { QOSIDAH_LIST } from '@/lib/data/qosidah';

type InstallChoice = { outcome: 'accepted' | 'dismissed' };

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<InstallChoice | void>;
  userChoice: Promise<InstallChoice>;
}

type InstallResult = 'accepted' | 'dismissed' | 'unavailable';

type PwaInstallContextValue = {
  isInstalled: boolean;
  install: () => Promise<InstallResult>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      setIsInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
      );
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const warmOfflineLibrary = async () => {
      if (!('serviceWorker' in navigator) || !navigator.onLine) return;
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({
          type: 'CACHE_QOSIDAH_DETAILS',
          ids: QOSIDAH_LIST.map((qosidah) => qosidah.id),
        });
      } catch {
        // Cache akan dicoba lagi ketika koneksi kembali aktif.
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => void warmOfflineLibrary()).catch(() => {
        // Instalasi masih dapat tersedia pada browser yang tidak memerlukan service worker.
      });
      navigator.serviceWorker.addEventListener('controllerchange', warmOfflineLibrary);
      window.addEventListener('online', warmOfflineLibrary);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', warmOfflineLibrary);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', warmOfflineLibrary);
      }
    };
  }, []);

  const install = async (): Promise<InstallResult> => {
    if (!installPrompt || isInstalled) return 'unavailable';

    const prompt = installPrompt;
    setInstallPrompt(null);

    try {
      // Harus dipanggil langsung dari klik agar browser menerima user gesture.
      await prompt.prompt();
      const choice = await prompt.userChoice;
      return choice.outcome;
    } catch {
      return 'unavailable';
    }
  };

  return (
    <PwaInstallContext.Provider value={{ isInstalled, install }}>
      {children}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) throw new Error('usePwaInstall harus digunakan di dalam PwaInstallProvider');
  return context;
}
