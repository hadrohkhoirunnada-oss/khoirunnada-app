'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Search,
  Calendar,
  Phone,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassStatusBadge } from '@/components/ui/GlassStatusBadge';
import { GlassEmptyState } from '@/components/ui/GlassEmptyState';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { currentUser, bookings } = useAppStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = b.customer_name.toLowerCase().includes(q);
      const matchPhone = b.customer_phone.includes(q);
      const matchCode = b.booking_code.toLowerCase().includes(q);
      const matchType = b.event_type.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCode && !matchType) return false;
    }
    return true;
  });

  return (
    <MobileAppShell
      title="Kelola Booking"
      subtitle={`${filtered.length} permintaan masuk`}
      showBack
      backHref="/app/admin"
    >
      {/* Search Bar in Obsidian theme */}
      <div className="relative mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pemesan, no WA, atau kode KN-2026..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0] placeholder:text-[#807A6B] focus:outline-none focus:border-[#D4A346] transition-colors"
        />
        <Search className="w-4 h-4 text-[#807A6B] absolute left-3.5 top-3 pointer-events-none" />
      </div>

      {/* Status Filters in Obsidian theme */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
        <button
          onClick={() => setStatusFilter('all')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold shadow-md'
              : 'bg-[#141B18]/90 text-[#9E9885] border border-[#B58228]/25 hover:text-[#F8F6F0]'
          }`}
        >
          Semua ({bookings.length})
        </button>
        <button
          onClick={() => setStatusFilter('new')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'new'
              ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold shadow-md'
              : 'bg-[#141B18]/90 text-[#9E9885] border border-[#B58228]/25 hover:text-[#F8F6F0]'
          }`}
        >
          Baru ({bookings.filter((b) => b.status === 'new').length})
        </button>
        <button
          onClick={() => setStatusFilter('contacted')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'contacted'
              ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold shadow-md'
              : 'bg-[#141B18]/90 text-[#9E9885] border border-[#B58228]/25 hover:text-[#F8F6F0]'
          }`}
        >
          Dihubungi ({bookings.filter((b) => b.status === 'contacted').length})
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === 'confirmed'
              ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold shadow-md'
              : 'bg-[#141B18]/90 text-[#9E9885] border border-[#B58228]/25 hover:text-[#F8F6F0]'
          }`}
        >
          Terkonfirmasi ({bookings.filter((b) => b.status === 'confirmed').length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((b) => (
            <Link key={b.id} href={`/app/admin/bookings/${b.id}`} className="block">
              <div className="p-4 rounded-2xl bg-[#141B18]/90 border border-[#B58228]/25 hover:border-[#B58228]/50 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <GlassStatusBadge status={b.status} />
                    <span className="text-[10px] font-mono font-bold text-[#E6C687]">
                      {b.booking_code}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#D4A346]">{b.event_date}</span>
                </div>

                <h3 className="text-sm font-bold text-[#F8F6F0] mb-0.5">{b.customer_name}</h3>
                <p className="text-xs text-[#D4A346] font-medium">
                  {b.event_type} {b.event_name ? `• ${b.event_name}` : ''}
                </p>

                <div className="space-y-1 text-xs text-[#9E9885] my-2 pt-2 border-t border-[#B58228]/15">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#D4A346] shrink-0" />
                    <span>WhatsApp: {b.customer_phone}</span>
                  </div>
                  <p className="line-clamp-1">{b.location}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-[#E6C687]">
                  <span>Detail & Hubungi WA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-[#141B18]/60 border border-[#B58228]/20 text-center">
            <ClipboardList className="w-10 h-10 text-[#D4A346]/60 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#F8F6F0] mb-1">Tidak Ada Data Booking</h4>
            <p className="text-xs text-[#9E9885]">
              Tidak ada permintaan booking yang sesuai dengan kriteria filter Anda.
            </p>
          </div>
        )}
      </div>
    </MobileAppShell>
  );
}