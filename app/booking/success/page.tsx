'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageCircle, Home, Calendar, Clock, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'KN-2026-00125';
  const name = searchParams.get('name') || 'Sohibul Hajat';

  return (
    <div className="w-full max-w-md text-center">
      {/* Success Animated Circle Icon */}
      <div className="w-20 h-20 rounded-full bg-[#996A19]/15 border-2 border-[#996A19]/30 flex items-center justify-center text-[#996A19] mx-auto mb-5 shadow-lg">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#996A19]/10 text-[#996A19] text-xs font-semibold mb-2">
        <Sparkles className="w-3.5 h-3.5 text-[#B58A3A]" />
        <span>Alhamdulillah Terkirim</span>
      </span>

      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#151917] mb-2 font-serif">
        Permintaan Booking Berhasil Dikirim
      </h1>

      <p className="text-xs sm:text-sm text-[#525D58] mb-6 leading-relaxed">
        Jazakumullahu khairan katsiran, <strong>{name}</strong>. Permintaan jadwal hadroh Anda telah tercatat di sistem kami.
      </p>

      {/* Reference Card */}
      <GlassCard className="text-left mb-6" variant="elevated">
        <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
          <span className="text-xs text-[#525D58]">Kode Referensi Booking</span>
          <span className="px-2.5 py-1 rounded-lg bg-[#996A19]/10 text-[#996A19] font-mono font-bold text-xs">
            {code}
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-[#525D58]">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-4 h-4 text-[#996A19] shrink-0 mt-0.5" />
            <p>
              Pengurus Khoirunnada akan segera menghubungi nomor WhatsApp Anda untuk konfirmasi jadwal dan teknis acara.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-[#B58A3A] shrink-0 mt-0.5" />
            <p>
              Mohon pastikan nomor WhatsApp yang Anda daftarkan aktif dan dapat menerima pesan.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <Link href="/" className="block w-full">
          <GlassButton variant="primary" fullWidth icon={<Home className="w-4 h-4" />}>
            Kembali ke Beranda
          </GlassButton>
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4 antialiased text-[#151917]">
      <Suspense fallback={<div className="text-sm text-[#525D58]">Memuat konfirmasi...</div>}>
        <BookingSuccessContent />
      </Suspense>
    </div>
  );
}
