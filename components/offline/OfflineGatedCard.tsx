'use client';

import { WifiOff } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export function OfflineGatedCard({ onBack }: { onBack?: () => void }) {
  return (
    <GlassCard className="mx-auto mt-8 max-w-sm p-7 text-center" variant="elevated">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#996A19]/20 bg-[#996A19]/10 text-[#996A19]">
        <WifiOff className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-bold text-[#151917]">Memerlukan Koneksi Internet</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#525D58]">Data biodata, jadwal job, dan riwayat tersimpan aman di database online. Silakan sambungkan internet untuk mengakses fitur ini.</p>
      {onBack ? (
        <button type="button" onClick={onBack} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#996A19] px-5 text-sm font-semibold text-white hover:bg-[#70490E]">Kembali ke Qosidah</button>
      ) : (
        <button type="button" onClick={() => window.location.replace('/app/qosidah')} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#996A19] px-5 text-sm font-semibold text-white hover:bg-[#70490E]">Kembali ke Qosidah</button>
      )}
    </GlassCard>
  );
}
