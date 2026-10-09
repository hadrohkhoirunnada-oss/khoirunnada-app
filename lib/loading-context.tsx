'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string, duration?: number) => void;
  hideLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  loadingMessage: 'Memproses...',
  showLoading: () => {},
  hideLoading: () => {},
  withLoading: async (fn) => fn(),
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Memproses...');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const currentPathRef = useRef(pathname);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideLoading = useCallback(() => {
    clearTimer();
    setIsLoading(false);
  }, [clearTimer]);

  const showLoading = useCallback(
    (message = 'Memproses...', duration?: number) => {
      clearTimer();
      setLoadingMessage(message);
      setIsLoading(true);

      if (duration && duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsLoading(false);
        }, duration);
      } else {
        // Failsafe timeout 2.5 detik agar UI tidak pernah macet
        timeoutRef.current = setTimeout(() => {
          setIsLoading(false);
        }, 2500);
      }
    },
    [clearTimer]
  );

  const withLoading = useCallback(
    async <T,>(asyncFn: () => Promise<T>, message = 'Memproses...'): Promise<T> => {
      showLoading(message);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  // Deteksi pergantian rute / navigasi: ketika pathname berganti, sembunyikan loading
  useEffect(() => {
    if (currentPathRef.current !== pathname) {
      currentPathRef.current = pathname;
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Interseptor klik global untuk setiap tombol atau elemen interaktif
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Abaikan klik pada input teks, password, textarea, select, dll.
      if (
        target.closest(
          'input, textarea, select, [contenteditable="true"], .no-loading, [data-no-loading="true"]'
        )
      ) {
        return;
      }

      // 2. Abaikan tombol khusus tutup modal / dialog
      const closeTrigger = target.closest(
        '[aria-label*="Tutup"], [aria-label*="tutup"], [aria-label*="Close"], [aria-label*="close"]'
      );
      if (closeTrigger) {
        return;
      }

      // 3. Deteksi elemen interaktif (button, link a, role="button", cursor-pointer)
      const clickable = target.closest<HTMLElement>(
        'button, a, [role="button"], .cursor-pointer, [data-clickable="true"]'
      );

      if (!clickable) return;

      // Abaikan jika elemen sedang disabled
      if (
        clickable.hasAttribute('disabled') ||
        clickable.getAttribute('aria-disabled') === 'true' ||
        clickable.classList.contains('disabled') ||
        clickable.classList.contains('pointer-events-none')
      ) {
        return;
      }

      // Khusus elemen link (<a>):
      if (clickable.tagName.toLowerCase() === 'a') {
        const href = clickable.getAttribute('href');
        // Jangan aktifkan jika hash link (#), target _blank, atau link eksternal khusus
        if (
          !href ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          clickable.getAttribute('target') === '_blank'
        ) {
          return;
        }

        // Tampilkan loading navigasi halaman
        showLoading('Memuat Halaman...');
        return;
      }

      // Abaikan tombol trigger pemilihan file foto
      if (
        clickable.getAttribute('data-action') === 'pick-file' ||
        clickable.querySelector('input[type="file"]')
      ) {
        return;
      }

      // Untuk setiap tombol aksi atau item interaktif lainnya:
      // Tampilkan animasi loading di tengah dengan latar belakang blur selama 380ms
      showLoading('Memproses...', 380);
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [showLoading]);

  // Bersihkan timeout saat unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading,
        withLoading,
      }}
    >
      {children}
      <GlobalLoadingOverlay isLoading={isLoading} message={loadingMessage} />
    </LoadingContext.Provider>
  );
}
