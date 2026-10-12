'use client';

import { useState } from 'react';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { PerformanceMode } from '@/components/qosidah/PerformanceMode';
import { ArabicLyricsCard } from '@/components/qosidah/ArabicLyricsCard';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Qosidah } from '@/lib/types';

export function OfflineQosidahReader({
  qosidah,
  allQosidahs,
  onBack,
  onSelect,
}: {
  qosidah: Qosidah;
  allQosidahs: Qosidah[];
  onBack: () => void;
  onSelect: (qosidah: Qosidah) => void;
}) {
  const [isPerformanceModeOpen, setIsPerformanceModeOpen] = useState(false);

  return (
    <MobileAppShell title={qosidah.title} subtitle={qosidah.category_name} hideNav>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#996A19]">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Kitab Qosidah
      </button>
      <button type="button" onClick={() => setIsPerformanceModeOpen(true)} className="mb-4 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#996A19] to-[#70490E] p-4 text-left text-white shadow-lg">
        <span className="flex items-center gap-3"><Maximize2 className="h-5 w-5" /><span className="text-sm font-bold">MODE TAMPIL PANGGUNG</span></span>
        <span className="text-xs">Buka</span>
      </button>
      <ArabicLyricsCard
        className="mb-4"
        title={qosidah.title}
        alternateTitle={qosidah.alternate_title}
        text={qosidah.arabic_text}
      />
      {qosidah.latin_text && <GlassCard className="mb-4 p-5"><h3 className="mb-2 text-xs font-bold uppercase text-[#996A19]">Lafadz Latin</h3><p className="whitespace-pre-line text-sm leading-relaxed text-[#151917]">{qosidah.latin_text}</p></GlassCard>}
      {qosidah.translation && <GlassCard className="mb-4 p-5"><h3 className="mb-2 text-xs font-bold uppercase text-[#996A19]">Arti / Terjemahan Bahasa Indonesia</h3><p className="whitespace-pre-line text-sm leading-relaxed text-[#525D58]">{qosidah.translation}</p></GlassCard>}
      {qosidah.notes && <GlassCard className="mb-4 p-5"><h3 className="mb-2 text-xs font-bold text-[#70490E]">Catatan Khusus Hadroh Khoirunnada</h3><p className="text-sm leading-relaxed text-[#525D58]">{qosidah.notes}</p></GlassCard>}
      <PerformanceMode
        qosidah={qosidah}
        allQosidahs={allQosidahs}
        isOpen={isPerformanceModeOpen}
        onClose={() => setIsPerformanceModeOpen(false)}
        onSelectQosidah={onSelect}
      />
    </MobileAppShell>
  );
}
