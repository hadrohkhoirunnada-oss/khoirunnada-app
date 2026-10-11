'use client';

import { Wifi } from 'lucide-react';

export function NetworkRecoveryModal({ onRestart, onStay }: { onRestart: () => void; onStay: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#151917]/60 p-4 backdrop-blur-sm" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="network-recovery-title" className="w-full max-w-sm rounded-3xl border border-white/70 bg-[#F8F6F0]/95 p-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
          <Wifi className="h-7 w-7" />
        </div>
        <h2 id="network-recovery-title" className="text-lg font-bold text-[#151917]">Internet Kembali Terhubung!</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#525D58]">Koneksi jaringan telah aktif. Silakan mulai ulang aplikasi untuk masuk ke akun Hadroh Khoirunnada Anda dan menyinkronkan seluruh data.</p>
        <div className="mt-6 space-y-2.5">
          <button type="button" onClick={onRestart} className="min-h-12 w-full rounded-xl bg-[#996A19] px-4 font-semibold text-white shadow-sm transition-colors hover:bg-[#70490E]">Mulai Ulang / Masuk Akun</button>
          <button type="button" onClick={onStay} className="min-h-12 w-full rounded-xl border border-[#996A19] bg-white/70 px-4 font-semibold text-[#996A19] transition-colors hover:bg-white">Tetap di Mode Offline</button>
        </div>
      </div>
    </div>
  );
}
