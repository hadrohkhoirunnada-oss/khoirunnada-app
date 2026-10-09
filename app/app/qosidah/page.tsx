'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Heart, BookOpen, Clock, ChevronRight, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassEmptyState } from '@/components/ui/GlassEmptyState';

export default function QosidahLibraryPage() {
  const { qosidahs, categories, favorites, recentIds, toggleFavorite } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filtered list
  const filteredQosidahs = useMemo(() => {
    return qosidahs.filter((q) => {
      // Category match
      if (selectedCategory !== 'all' && q.category_id !== selectedCategory) {
        return false;
      }

      // Favorite match
      if (showOnlyFavorites && !favorites.includes(q.id)) {
        return false;
      }

      // Search query match (title, alternate_title, arabic, latin, tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchAlt = q.alternate_title?.toLowerCase().includes(query);
        const matchLatin = q.latin_text.toLowerCase().includes(query);
        const matchArabic = q.arabic_text.includes(searchQuery);
        const matchTags = q.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchTitle && !matchAlt && !matchLatin && !matchArabic && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [qosidahs, selectedCategory, showOnlyFavorites, searchQuery, favorites]);

  // Recently opened qosidahs
  const recentQosidahs = useMemo(() => {
    return recentIds
      .map((id) => qosidahs.find((q) => q.id === id))
      .filter((q): q is typeof qosidahs[0] => !!q)
      .slice(0, 4);
  }, [recentIds, qosidahs]);

  return (
    <MobileAppShell title="Qosidah" subtitle="Hadroh Khoirunnada">
      {/* 1. Sleek Search Bar with Zero Icon Overlap */}
      <div className="relative mb-3.5 group">
        <Search className="w-4 h-4 text-[#996A19] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari judul, lirik latin, atau bait arab..."
          className="w-full bg-white/90 hover:bg-white focus:bg-white backdrop-blur-md border border-[#B58228]/25 focus:border-[#996A19] focus:ring-2 focus:ring-[#996A19]/15 rounded-2xl py-3 text-xs sm:text-sm text-[#151917] placeholder:text-[#585145]/60 shadow-[0_2px_10px_rgba(153,106,25,0.04)] focus:shadow-[0_4px_16px_rgba(153,106,25,0.1)] transition-all outline-none"
          style={{ paddingLeft: '44px', paddingRight: '40px' }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 text-[#585145] hover:text-[#151917] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Hapus pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3.5 scrollbar-none no-scrollbar -mx-4 px-4">
        {/* Semua */}
        <button
          onClick={() => {
            setSelectedCategory('all');
            setShowOnlyFavorites(false);
          }}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            selectedCategory === 'all' && !showOnlyFavorites
              ? 'bg-gradient-to-r from-[#996A19] to-[#70490E] text-white shadow-[0_2px_8px_rgba(153,106,25,0.3)]'
              : 'bg-white/85 hover:bg-white text-[#585145] hover:text-[#151917] border border-black/[0.06] shadow-2xs'
          }`}
        >
          <span>Semua</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              selectedCategory === 'all' && !showOnlyFavorites
                ? 'bg-white/25 text-white'
                : 'bg-black/5 text-[#585145]'
            }`}
          >
            {qosidahs.length}
          </span>
        </button>

        {/* Favorit */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            showOnlyFavorites
              ? 'bg-gradient-to-r from-[#C84A45] to-[#A12B26] text-white shadow-[0_2px_8px_rgba(200,74,69,0.3)]'
              : 'bg-white/85 hover:bg-white text-[#C84A45] border border-[#C84A45]/25 shadow-2xs'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current' : ''}`} />
          <span>Favorit</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              showOnlyFavorites
                ? 'bg-white/25 text-white'
                : 'bg-[#C84A45]/10 text-[#C84A45]'
            }`}
          >
            {favorites.length}
          </span>
        </button>

        {/* Kategori dinamis */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id && !showOnlyFavorites;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowOnlyFavorites(false);
              }}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#996A19] to-[#70490E] text-white shadow-[0_2px_8px_rgba(153,106,25,0.3)]'
                  : 'bg-white/85 hover:bg-white text-[#585145] hover:text-[#151917] border border-black/[0.06] shadow-2xs'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* 3. Recently Opened Section */}
      {!searchQuery && !showOnlyFavorites && selectedCategory === 'all' && recentQosidahs.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8C6821] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#996A19]" />
              <span>Terakhir Dibuka</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-4 px-4">
            {recentQosidahs.map((q) => (
              <Link
                key={`recent-${q.id}`}
                href={`/app/qosidah/${q.id}`}
                className="shrink-0 w-44 p-3 rounded-2xl bg-white/90 hover:bg-white border border-[#996A19]/20 hover:border-[#996A19]/45 shadow-[0_2px_10px_rgba(153,106,25,0.04)] transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-[#8C6821] bg-[#996A19]/10 px-2 py-0.5 rounded-md">
                    {q.category_name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#996A19] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs font-bold text-[#151917] truncate">{q.title}</p>
                <p className="arabic-font text-xs text-[#151917]/80 truncate mt-1.5 text-right font-medium" dir="rtl">
                  {q.arabic_text.split('\n')[0]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Qosidah List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs sm:text-sm font-bold text-[#151917]">
            Daftar Lirik Qosidah
          </span>
          <span className="text-[11px] font-semibold text-[#8C6821] bg-[#996A19]/10 px-2.5 py-0.5 rounded-full">
            {filteredQosidahs.length} Syair
          </span>
        </div>

        {filteredQosidahs.length > 0 ? (
          filteredQosidahs.map((q, index) => {
            const isFav = favorites.includes(q.id);
            const firstVerse = q.arabic_text.split('\n')[0];

            return (
              <div
                key={q.id}
                className="relative group rounded-2xl bg-white/90 hover:bg-white border border-[#B58228]/20 hover:border-[#996A19]/40 p-4 shadow-[0_2px_12px_rgba(153,106,25,0.03)] hover:shadow-[0_6px_24px_rgba(153,106,25,0.08)] transition-all duration-200 active:scale-[0.995]"
              >
                {/* Top row: Nomor urut + Kategori + Tag + Tombol Favorit */}
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

                  {/* Tombol Favorit */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(q.id);
                    }}
                    className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                      isFav
                        ? 'bg-[#C84A45]/15 text-[#C84A45]'
                        : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#585145] hover:text-[#151917]'
                    }`}
                    aria-label="Tandai Favorit"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
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
          <GlassEmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="Tidak Ada Qosidah Ditemukan"
            description="Coba ubah kata kunci pencarian atau pilih kategori lain."
          />
        )}
      </section>
    </MobileAppShell>
  );
}
