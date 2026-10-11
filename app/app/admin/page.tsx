'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ClipboardList,
  Calendar,
  Users,
  BookOpen,
  Bell,
  Settings,
  AlertCircle,
  Plus,
  ChevronRight,
  Sparkles,
  Wallet,
  ArrowUpRight,
  Eye,
  Camera,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { AddJobBottomSheet } from '@/components/admin/AddJobBottomSheet';

export default function AdminCenterPage() {
  const router = useRouter();
  const { currentUser, bookings, profiles, jobs, balance } = useAppStore();
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  if (!currentUser.is_admin) {
    return (
      <MobileAppShell title="Akses Dibatasi">
        <div className="text-center py-12">
          <p className="text-sm text-[#585145] mb-4">
            Menu pusat administratif hanya dapat diakses oleh Admin Hadroh Khoirunnada.
          </p>
          <GlassButton variant="primary" onClick={() => router.push('/')}>
            Kembali ke Login
          </GlassButton>
        </div>
      </MobileAppShell>
    );
  }

  const newBookingsCount = bookings.filter((b) => b.status === 'new').length;
  const pendingMembersCount = profiles.filter((p) => p.status === 'pending').length;
  const upcomingJobsCount = jobs.filter((j) => j.status === 'upcoming').length;

  return (
    <MobileAppShell
      title="Pusat Admin"
      subtitle="Hadroh Khoirunnada"
    >
      {/* 1. Greeting and admin profile */}
      <section className="mb-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5EBD7] via-[#FFFFFF] to-[#FFFFFF] border border-[#B58228]/40 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#996A19]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#B58228]/15 border border-[#B58228]/35 text-[#70490E] text-[10px] font-extrabold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pusat Manajemen Admin</span>
              </div>
              <h2 className="text-lg font-black text-[#151917] tracking-tight font-serif">
                Assalamu&apos;alaikum, {currentUser.name.split(' ')[0]}
              </h2>
              <p className="text-xs text-[#585145] mt-0.5">
                Pengelolaan Operasional Terpadu Hadroh Khoirunnada
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/app/profile')}
              title="Buka Profil & Ubah Foto"
              className="relative group w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#B58228]/60 shadow-md shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <img
            src={currentUser.avatar_url || '/logo-khoirunnada-192.png'}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = '/logo-khoirunnada-192.png';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Quick CTA to Add Job directly */}
          <div className="mt-4 pt-3 border-t border-black/5">
            <button
              onClick={() => setIsAddJobOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#996A19] to-[#996A19] text-white text-xs font-bold shadow-[0_4px_16px_rgba(153,106,25,0.45)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5px]" />
              <span>+ Buat Jadwal Job Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Attention Metrics */}
      <section className="mb-5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* New Bookings Attention Card */}
          <Link href="/app/admin/bookings" className="block">
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-[#B58228]/35 hover:border-[#B58228]/60 transition-all cursor-pointer shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#151917]">Booking Baru</span>
                {newBookingsCount > 0 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C84A45] animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-black/10" />
                )}
              </div>
              <p className="text-2xl font-black text-[#70490E] font-serif">{newBookingsCount}</p>
              <p className="text-[10px] text-[#585145] mt-0.5">Permintaan acara masuk</p>
            </div>
          </Link>

          {/* Pending Members Attention Card */}
          <Link href="/app/admin/members" className="block">
            <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-[#B58228]/35 hover:border-[#B58228]/60 transition-all cursor-pointer shadow-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#151917]">Approval Calon</span>
                {pendingMembersCount > 0 ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#996A19] animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-black/10" />
                )}
              </div>
              <p className="text-2xl font-black text-[#70490E] font-serif">{pendingMembersCount}</p>
              <p className="text-[10px] text-[#585145] mt-0.5">Calon anggota mendaftar</p>
            </div>
          </Link>

          {/* Active Jobs Card */}
          <Link href="/app/admin/jobs" className="block">
            <div className="p-3 rounded-xl bg-[#FFFFFF]/70 border border-black/5 hover:border-[#B58228]/40 transition-all cursor-pointer">
              <span className="text-[11px] font-bold text-[#585145] block mb-0.5">Job Aktif</span>
              <p className="text-xl font-black text-[#151917]">{upcomingJobsCount} Acara</p>
              <span className="text-[10px] text-[#70490E]">Kelola jadwal & tim →</span>
            </div>
          </Link>

          {/* Total Kas Ringkasan */}
          <Link href="/app/admin/finance" className="block">
            <div className="p-3 rounded-xl bg-[#FFFFFF]/70 border border-black/5 hover:border-[#B58228]/40 transition-all cursor-pointer">
              <span className="text-[11px] font-bold text-[#585145] block mb-0.5">Saldo Kas</span>
              <p className="text-sm font-extrabold text-[#70490E] truncate">
                Rp {balance.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-[#585145]">Pembukuan kas →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Admin Modules Grid */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145]">
            Modul Manajemen Admin
          </h3>
          <span className="text-[10px] text-[#70490E] font-semibold">6 Modul</span>
        </div>

        {/* 1. Booking Management */}
        <Link href="/app/admin/bookings" className="block">
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-black/5 hover:border-[#B58228]/40 flex items-center justify-between transition-all cursor-pointer shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#70490E] flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Kelola Booking Acara</h4>
                <p className="text-[10px] text-[#585145]">
                  WhatsApp pemesan & konversi booking jadi Job
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#585145]/50" />
          </div>
        </Link>

        {/* 2. Jobs Management */}
        <Link href="/app/admin/jobs" className="block">
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-black/5 hover:border-[#B58228]/40 flex items-center justify-between transition-all cursor-pointer shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#996A19]/25 border border-[#996A19]/40 text-[#70490E] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Kelola Jadwal & Penugasan Tim</h4>
                <p className="text-[10px] text-[#585145]">
                  Tentukan posisi vokal, terbang, bass & detail job
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#585145]/50" />
          </div>
        </Link>

        {/* 3. Member Management */}
        <Link href="/app/admin/members" className="block">
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-black/5 hover:border-[#B58228]/40 flex items-center justify-between transition-all cursor-pointer shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Kelola Anggota & Peran</h4>
                <p className="text-[10px] text-[#585145]">
                  Approval calon, atur peran Pemain, Bendahara, Admin
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#585145]/50" />
          </div>
        </Link>

        {/* 4. Qosidah CMS */}
        <Link href="/app/admin/qosidah" className="block">
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-black/5 hover:border-[#B58228]/40 flex items-center justify-between transition-all cursor-pointer shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-800 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Kelola Kitab Qosidah</h4>
                <p className="text-[10px] text-[#585145]">
                  Tambah syair, edit teks Arab RTL & transliterasi
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#585145]/50" />
          </div>
        </Link>

        {/* 5. Notification Announcement */}
        <Link href="/app/admin/notifications" className="block">
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-black/5 hover:border-[#B58228]/40 flex items-center justify-between transition-all cursor-pointer shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-800 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Siarkan Pengumuman</h4>
                <p className="text-[10px] text-[#585145]">
                  Kirim notifikasi broadcast ke seluruh anggota
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#585145]/50" />
          </div>
        </Link>

        {/* 6. Settings & Audit Logs */}
        <Link href="/app/admin/settings" className="block">
          <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-black/5 hover:border-[#B58228]/40 flex items-center justify-between transition-all cursor-pointer shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/5 border border-black/10 text-[#151917] flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Pengaturan & Log Audit</h4>
                <p className="text-[10px] text-[#585145]">
                  Histori perubahan sistem & konfigurasi Hadroh
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#585145]/50" />
          </div>
        </Link>
      </section>

      {/* Bottom Sheet Popup for Tambah Job */}
      <AddJobBottomSheet
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
      />
    </MobileAppShell>
  );
}
