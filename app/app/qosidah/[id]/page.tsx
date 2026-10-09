'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  Play,
  Pause,
  Maximize2,
  Volume2,
  Info,
  BookOpen,
  Share2,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { PerformanceMode } from '@/components/qosidah/PerformanceMode';
import { getQosidahById } from '@/lib/data/qosidah';

export default function QosidahDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { qosidahs, favorites, toggleFavorite, markAsRecent } = useAppStore();

  const qosidahId = params?.id as string;
  const qosidah = qosidahs.find((q) => q.id === qosidahId) || getQosidahById(qosidahId);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPerformanceModeOpen, setIsPerformanceModeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (qosidahId) {
      markAsRecent(qosidahId);
    }
  }, [qosidahId]);

  if (!qosidah) {
    return (
      <MobileAppShell title="Qosidah Tidak Ditemukan" showBack backHref="/app/qosidah">
        <div className="text-center py-12">
          <p className="text-sm text-[#525D58] mb-4">
            Syair Qosidah yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <GlassButton variant="primary" onClick={() => router.push('/app/qosidah')}>
            Kembali ke Kitab Qosidah
          </GlassButton>
        </div>
      </MobileAppShell>
    );
  }

  const isFav = favorites.includes(qosidah.id);

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `${qosidah.title}\n\n${qosidah.arabic_text}\n\n(Hadroh Khoirunnada)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MobileAppShell
      title={qosidah.title}
      subtitle={qosidah.category_name}
      showBack
      backHref="/app/qosidah"
      rightAction={
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFavorite(qosidah.id)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isFav ? 'bg-[#C84A45]/10 text-[#C84A45]' : 'bg-white/70 text-[#525D58]'
            }`}
            title="Favorit"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-xl bg-white/70 text-[#525D58] flex items-center justify-center"
            title="Salin Teks"
          >
            {copied ? <Check className="w-4 h-4 text-[#996A19]" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      }
    >
      {/* 1. Performance Mode Primary Banner CTA (PRD #32) */}
      <section className="mb-4">
        <div
          onClick={() => setIsPerformanceModeOpen(true)}
          className="p-4 rounded-2xl bg-gradient-to-r from-[#996A19] to-[#70490E] text-white cursor-pointer shadow-lg hover:shadow-xl transition-all active:scale-[0.985] flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-tight">MODE TAMPIL PANGGUNG</p>
              <p className="text-[11px] text-white/80">Font besar, bebas distraksi & kontras tinggi</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
            Buka
          </span>
        </div>
      </section>

      {/* 2. Audio Reference Player Bar if available */}
      <section className="mb-4">
        <GlassCard className="p-3.5 flex items-center justify-between" variant="emerald">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-9 h-9 rounded-full bg-[#996A19] text-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <p className="text-xs font-bold text-[#151917]">Audio Referensi Latihan</p>
              <p className="text-[10px] text-[#525D58]">
                {isPlayingAudio ? 'Sedang memutar audio demo Khoirunnada...' : 'Ketuk untuk mendengarkan lagu'}
              </p>
            </div>
          </div>
          <Volume2 className="w-4 h-4 text-[#996A19] opacity-60" />
        </GlassCard>
      </section>

      {/* 3. Main Arabic Text Display (WCAG AAA contrast, Noto Naskh, 2.3x line height) */}
      <section className="mb-6">
        <GlassCard className="p-6 sm:p-8" variant="elevated">
          <div className="border-b border-black/5 pb-3 mb-6 text-center">
            <h2 className="text-lg font-bold text-[#151917] tracking-tight">{qosidah.title}</h2>
            {qosidah.alternate_title && (
              <p className="text-xs text-[#525D58] italic mt-0.5">{qosidah.alternate_title}</p>
            )}
          </div>

          {/* Authentic Arabic Text with Crisp Harakat */}
          <div className="arabic-font text-xl sm:text-2xl text-[#151917] leading-[2.5] tracking-wide whitespace-pre-line text-right selection:bg-[#996A19]/20 select-text">
            {qosidah.arabic_text}
          </div>
        </GlassCard>
      </section>

      {/* 4. Latin Transliteration & Indonesian Translation */}
      <section className="space-y-4 mb-6">
        <GlassCard className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#996A19] mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lafadz Latin</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#151917] whitespace-pre-line leading-relaxed font-sans">
            {qosidah.latin_text}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#525D58] mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Arti / Terjemahan Bahasa Indonesia</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#525D58] whitespace-pre-line leading-relaxed italic">
            {qosidah.translation}
          </p>
        </GlassCard>

        {qosidah.notes && (
          <GlassCard className="p-4 bg-[#B58A3A]/10 border-[#B58A3A]/30">
            <h3 className="text-xs font-bold text-[#8C6821] mb-1">Catatan Khusus Hadroh Khoirunnada:</h3>
            <p className="text-xs text-[#525D58] leading-relaxed">{qosidah.notes}</p>
          </GlassCard>
        )}
      </section>

      {/* On-Stage Performance Mode Fullscreen Overlay */}
      <PerformanceMode
        qosidah={qosidah}
        allQosidahs={qosidahs}
        isOpen={isPerformanceModeOpen}
        onClose={() => setIsPerformanceModeOpen(false)}
        onSelectQosidah={(newQ) => {
          router.push(`/app/qosidah/${newQ.id}`);
        }}
      />
    </MobileAppShell>
  );
}
