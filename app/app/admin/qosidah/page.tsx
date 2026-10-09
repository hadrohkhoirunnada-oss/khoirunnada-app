'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  Heart,
  Sparkles,
  Code,
  FileCode,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AdminQosidahCMSPage() {
  const { qosidahs, favorites, toggleFavorite } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQosidahs = qosidahs.filter((q) => {
    const matchesCategory = selectedCategory === 'all' || q.category_id === selectedCategory;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.alternate_title && q.alternate_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.latin_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MobileAppShell
      title="Bank Lirik Qosidah"
      subtitle={`${qosidahs.length} judul terprogram di kode`}
      showBack
      backHref="/app/admin"
    >
      <div className="space-y-3">
        {/* Banner Info Penyimpanan */}
        <GlassCard className="p-3.5 !bg-[#141B18]/95 !border-[#B58228]/30 shadow-md">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B58228]/15 border border-[#B58228]/30 flex items-center justify-center shrink-0 text-[#E6C687]">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-[#E6C687] flex items-center gap-1.5">
                <span>Katalog Lirik Terintegrasi di Kode</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#B58228]/20 text-[#D4A346] rounded font-mono">
                  lib/data/qosidah.ts
                </span>
              </h4>
              <p className="text-[11px] text-[#A69E8F] mt-1 leading-relaxed">
                Seluruh teks syair dan lirik Qosidah tersimpan langsung di dalam kode aplikasi. Database Supabase dikhususkan menyimpan data <strong>Lagu Favorit</strong> yang ditandai oleh personel.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul atau penggalan lirik..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#141B18]/90 border border-[#B58228]/25 text-xs text-[#F8F6F0] placeholder:text-[#807A6B] focus:border-[#B58228] focus:outline-none transition-colors"
          />
        </div>

        {/* List of Qosidahs */}
        <div className="space-y-3">
          {filteredQosidahs.map((qos) => {
            const isFav = favorites.includes(qos.id);
            return (
              <GlassCard
                key={qos.id}
                className="p-4 sm:p-5 !bg-[#141B18]/90 !border-[#B58228]/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:border-[#B58228]/50"
                variant="elevated"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B58228]/15 text-[#E6C687] border border-[#B58228]/30">
                    {qos.category_name || 'Sholawat'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#807A6B]">
                      Urutan #{qos.sort_order}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(qos.id)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isFav
                          ? 'bg-[#B58228]/20 border-[#B58228]/40 text-[#E6C687]'
                          : 'bg-black/20 border-white/5 text-[#807A6B] hover:text-[#E6C687]'
                      }`}
                      title={isFav ? 'Hapus dari Favorit' : 'Tandai Favorit di Database'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#F8F6F0] mb-0.5">{qos.title}</h3>
                {qos.alternate_title && (
                  <p className="text-xs text-[#9E9885] italic mb-2">
                    Judul lain: {qos.alternate_title}
                  </p>
                )}

                {/* Arabic preview snippet */}
                <div className="p-3 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15 text-right font-serif text-sm text-[#E6C687] leading-loose my-2 line-clamp-2">
                  {qos.arabic_text}
                </div>

                <p className="text-xs text-[#9E9885] line-clamp-1 italic mb-3">
                  {qos.latin_text}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#B58228]/15 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {qos.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#0D1210] border border-[#B58228]/20 text-[#D4A346]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#D4A346] flex items-center gap-1 bg-[#B58228]/10 px-2 py-0.5 rounded-full border border-[#B58228]/20">
                      <Code className="w-3 h-3" />
                      <span>Built-in Kode</span>
                    </span>
                    <Link
                      href={`/app/qosidah/${qos.id}`}
                      className="p-1 px-2 rounded-lg bg-[#B58228]/15 hover:bg-[#B58228]/25 text-[#E6C687] text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Baca</span>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </MobileAppShell>
  );
}
