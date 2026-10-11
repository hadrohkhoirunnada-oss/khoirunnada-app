'use client';

import { WifiOff } from 'lucide-react';

export function OfflineLoginModal({
  open,
  onOffline,
  onRetry,
  retrying,
  retryError,
}: {
  open: boolean;
  onOffline: () => void;
  onRetry: () => void;
  retrying: boolean;
  retryError: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#151917]/60 p-4 backdrop-blur-sm" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="offline-login-title" className="w-full max-w-sm rounded-3xl border border-white/70 bg-[#F8F6F0]/95 p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#996A19]/20 bg-[#996A19]/10 text-[#996A19]">
          <WifiOff className="h-7 w-7" />
        </div>
        <h2 id="offline-login-title" className="text-lg font-bold text-[#151917]">Tidak Ada Koneksi Internet</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#525D58]">Perangkat Anda sedang offline. Anda dapat beralih ke Mode Offline untuk langsung membuka Kitab Qosidah dan Mode Panggung tanpa login.</p>
        {retryError && <p role="status" className="mt-3 text-xs text-[#A12B26]">{retryError}</p>}
        <div className="mt-6 space-y-2.5">
          <button type="button" onClick={onOffline} className="min-h-12 w-full rounded-xl bg-[#996A19] px-4 font-semibold text-white shadow-sm transition-colors hover:bg-[#70490E]">Beralih ke Mode Offline</button>
          <button type="button" onClick={onRetry} disabled={retrying} className="min-h-12 w-full rounded-xl border border-[#996A19] bg-white/70 px-4 font-semibold text-[#996A19] transition-colors hover:bg-white disabled:opacity-60">{retrying ? 'Memeriksa koneksi...' : 'Coba Sambungkan Lagi'}</button>
        </div>
      </div>
    </div>
  );
}
