'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Heart, BookOpen, Clock, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
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
      {/* 1. Search Bar (PRD #29) */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari judul, lirik latin, atau bait arab..."
          className="glass-input pl-10 pr-4 text-xs sm:text-sm"
        />
        <Search className="w-4 h-4 text-[#525D58] absolute left-3.5 top-3.5 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-xs text-[#525D58] hover:text-[#151917] px-1.5 py-0.5 rounded-full bg-black/5"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* 2. Category Filter Pills (PRD #28) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none no-scrollbar">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setShowOnlyFavorites(false);
          }}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            selectedCategory === 'all' && !showOnlyFavorites
              ? 'bg-[#996A19] text-white shadow-xs'
              : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
          }`}
        >
          Semua ({qosidahs.length})
        </button>

        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            showOnlyFavorites
              ? 'bg-[#C84A45] text-white shadow-xs'
              : 'bg-white/70 text-[#C84A45] border border-black/5 hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current' : ''}`} />
          <span>Favorit ({favorites.length})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id && !showOnlyFavorites;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowOnlyFavorites(false);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-[#996A19] text-white shadow-xs'
                  : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* 3. Recently Opened Section if no search active (PRD #31) */}
      {!searchQuery && !showOnlyFavorites && selectedCategory === 'all' && recentQosidahs.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#525D58] uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-[#B58A3A]" />
            <span>Terakhir Dibuka</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentQosidahs.map((q) => (
              <Link
                key={`recent-${q.id}`}
                href={`/app/qosidah/${q.id}`}
                className="shrink-0 w-44 p-3 rounded-2xl glass-card-interactive border border-white/80"
              >
                <p className="text-xs font-bold text-[#151917] truncate">{q.title}</p>
                <p className="text-[10px] text-[#996A19] font-medium truncate mt-0.5">
                  {q.category_name}
                </p>
                <p className="arabic-font text-xs text-[#525D58] truncate mt-1 text-right">
                  {q.arabic_text.split('\n')[0]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Qosidah List */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#525D58] px-1">
          <span>Menampilkan {filteredQosidahs.length} Qosidah</span>
        </div>

        {filteredQosidahs.length > 0 ? (
          filteredQosidahs.map((q) => {
            const isFav = favorites.includes(q.id);
            const firstVerse = q.arabic_text.split('\n')[0];

            return (
              <div
                key={q.id}
                className="relative group rounded-2xl glass-card-interactive p-4 border border-white/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/app/qosidah/${q.id}`} className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#996A19]/10 text-[#996A19]">
                        {q.category_name}
                      </span>
                      {q.tags && q.tags[0] && (
                        <span className="text-[10px] text-[#525D58] font-medium">
                          #{q.tags[0]}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#151917] group-hover:text-[#996A19] transition-colors">
                      {q.title}
                    </h3>

                    {q.alternate_title && (
                      <p className="text-xs text-[#525D58] italic mb-2 line-clamp-1">
                        {q.alternate_title}
                      </p>
                    )}

                    {/* Arabic preview line with high contrast */}
                    <p className="arabic-font text-sm text-[#151917] mt-1 text-right line-clamp-1">
                      {firstVerse}
                    </p>
                  </Link>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(q.id);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                      isFav
                        ? 'bg-[#C84A45]/10 text-[#C84A45]'
                        : 'bg-black/5 hover:bg-black/10 text-[#525D58]'
                    }`}
                    aria-label="Tandai Favorit"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>
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
