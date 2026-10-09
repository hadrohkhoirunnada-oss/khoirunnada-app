'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Search, X, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassEmptyState } from '@/components/ui/GlassEmptyState';

export default function ProfileFavoritesPage() {
  const { qosidahs, favorites, toggleFavorite } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Ambil hanya qosidah yang ada di daftar favorit pengguna
  const favoriteQosidahs = useMemo(() => {
    return qosidahs.filter((q) => favorites.includes(q.id));
  }, [qosidahs, favorites]);

  // Filter berdasarkan pencarian jika diisi
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favoriteQosidahs;
    const q = searchQuery.toLowerCase();
    return favoriteQosidahs.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAlt = item.alternate_title?.toLowerCase().includes(q);
      const matchLatin = item.latin_text.toLowerCase().includes(q);
      const matchArabic = item.arabic_text.includes(searchQuery);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchAlt || matchLatin || matchArabic || matchTags;
    });
  }, [favoriteQosidahs, searchQuery]);

  return (
    <MobileAppShell
      title="Qosidah Favorit"
      subtitle={`${favorites.length} Syair Tersimpan`}
      showBack
      backHref="/app/profile"
    >
      {/* 1. Bar Pencarian (Jika ada favorit tersimpan) */}
      {favoriteQosidahs.length > 0 && (
        <div className="relative mb-3.5 group flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam qosidah favorit..."
            className="w-full bg-white/90 hover:bg-white focus:bg-white backdrop-blur-md border border-[#B58228]/25 focus:border-[#996A19] focus:ring-2 focus:ring-[#996A19]/15 rounded-2xl py-3 text-xs sm:text-sm text-[#151917] placeholder:text-[#585145]/60 shadow-[0_2px_10px_rgba(153,106,25,0.04)] focus:shadow-[0_4px_16px_rgba(153,106,25,0.1)] transition-all outline-none"
            style={{ paddingLeft: '44px', paddingRight: '40px' }}
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center">
            <Search className="w-4 h-4 text-[#585145] group-focus-within:text-[#996A19] transition-colors" />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 text-[#585145] hover:text-[#151917] flex items-center justify-center transition-all cursor-pointer z-20"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. Daftar Qosidah Favorit */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5 mb-1">
          <span className="text-xs sm:text-sm font-bold text-[#151917]">
            Koleksi Favorit Saya
          </span>
          <span className="text-[11px] font-semibold text-[#C84A45] bg-[#C84A45]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" />
            <span>{filteredFavorites.length} Tersimpan</span>
          </span>
        </div>

        {filteredFavorites.length > 0 ? (
          filteredFavorites.map((q, index) => {
            const firstVerse = q.arabic_text.split('\n')[0];

            return (
              <div
                key={q.id}
                className="relative group rounded-2xl bg-white/90 hover:bg-white border border-[#B58228]/20 hover:border-[#996A19]/40 p-4 shadow-[0_2px_12px_rgba(153,106,25,0.03)] hover:shadow-[0_6px_24px_rgba(153,106,25,0.08)] transition-all duration-200 active:scale-[0.995]"
              >
                {/* Top row: Nomor urut + Kategori + Tag + Tombol Hapus Favorit */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-[#F5EBD7] to-white border border-[#996A19]/25 flex items-center justify-center text-xs font-bold text-[#70490E] shadow-2xs">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#996A19]/12 text-[#70490E]">
                        {q.category_name}
                      </span>
                      {q.tags && q.tags[0] && (
                        <span className="text-[10px] text-[#585145] font-medium bg-black/[0.03] px-2 py-0.5 rounded-full">
                          #{q.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tombol Favorit (Bisa di-tap untuk hapus dari favorit) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(q.id);
                    }}
                    className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center bg-[#C84A45]/15 text-[#C84A45] hover:bg-[#C84A45]/25 transition-all active:scale-90 cursor-pointer"
                    title="Hapus dari Favorit"
                    aria-label="Hapus dari Favorit"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Middle & Bottom Link */}
                <Link href={`/app/qosidah/${q.id}`} className="block mt-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-[#151917] group-hover:text-[#996A19] transition-colors tracking-tight">
                    {q.title}
                  </h3>

                  {q.alternate_title && (
                    <p className="text-xs text-[#585145] italic mt-0.5 line-clamp-1">
                      {q.alternate_title}
                    </p>
                  )}

                  {/* Potongan Bait Arab dengan typography authentic dan divider pemisah */}
                  <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#996A19] group-hover:translate-x-0.5 transition-transform shrink-0">
                      Lihat Lirik
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <p
                      className="arabic-font text-base sm:text-lg font-medium text-[#151917] line-clamp-1 leading-relaxed text-right flex-1 pl-2"
                      dir="rtl"
                    >
                      {firstVerse}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })
        ) : (
          <div className="py-8">
            <GlassEmptyState
              icon={<Heart className="w-8 h-8 text-[#C84A45]/50" />}
              title={searchQuery ? 'Tidak Ada Hasil Pencarian' : 'Belum Ada Qosidah Favorit'}
              description={
                searchQuery
                  ? 'Tidak ada syair favorit yang cocok dengan kata kunci Anda.'
                  : 'Tandai qosidah pilihan Anda dengan ikon hati di Kitab Qosidah agar tersimpan di sini.'
              }
              action={
                !searchQuery ? (
                  <Link
                    href="/app/qosidah"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#996A19] to-[#70490E] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Buka Kitab Qosidah</span>
                  </Link>
                ) : undefined
              }
            />
          </div>
        )}
      </section>
    </MobileAppShell>
  );
}
