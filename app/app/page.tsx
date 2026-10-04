'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Calendar,
  BookOpen,
  Wallet,
  Clock,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassStatusBadge } from '@/components/ui/GlassStatusBadge';

export default function MemberHomePage() {
  const {
    currentUser,
    jobs,
    attendances,
    setAttendance,
    notifications,
    balance,
    incomeThisMonth,
    expenseThisMonth,
  } = useAppStore();

  // Find nearest upcoming job
  const upcomingJobs = jobs.filter((j) => j.status === 'upcoming');
  const nextJob = upcomingJobs[0] || jobs[0];

  // Current user's attendance status for nextJob
  const myAttendance = nextJob
    ? attendances.find((a) => a.job_id === nextJob.id && a.user_id === currentUser.id)
    : null;

  // Active announcements
  const latestAnnouncement = notifications.find((n) => n.type === 'announcement');

  return (
    <MobileAppShell title="Beranda" subtitle="Hadroh Khoirunnada">
      {/* 1. Greeting Section */}
      <section className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#996A19] flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B58228]" />
              <span>Ahlan wa Sahlan</span>
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#151917]">
              Assalamu&apos;alaikum, {currentUser.name.split(' ')[0]}
            </h2>
            <p className="text-xs text-[#585145] mt-0.5">
              {currentUser.role_title || 'Anggota Hadroh Khoirunnada'}
            </p>
          </div>

          <img
            src={currentUser.avatar_url}
            alt={currentUser.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm"
          />
        </div>
      </section>

      {/* 2. Announcement Banner if available */}
      {latestAnnouncement && (
        <section className="mb-5">
          <GlassCard className="p-3.5 bg-[#B58228]/10 border-[#B58228]/25" variant="gold">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#B58228]/20 flex items-center justify-center text-[#8C5E16] shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-bold text-[#8C5E16]">{latestAnnouncement.title}</p>
                <p className="text-[#585145] mt-0.5 leading-relaxed line-clamp-2">
                  {latestAnnouncement.message}
                </p>
              </div>
            </div>
          </GlassCard>
        </section>
      )}

      {/* 3. Transparansi Kas Hadroh (Khusus Pemain: Total Uang Kas, Uang Masuk, Uang Keluar) */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-[#996A19]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145]">
              Keuangan Kas Hadroh
            </h3>
          </div>
          <Link
            href="/app/finance"
            className="text-[11px] font-semibold text-[#996A19] hover:underline flex items-center gap-0.5"
          >
            <span>Rincian</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <GlassCard className="p-4" variant="elevated">
          {/* Total Uang Kas */}
          <div className="text-center pb-3 border-b border-black/5">
            <span className="text-[11px] font-semibold text-[#585145] uppercase tracking-wider block mb-1">
              Total Uang Kas
            </span>
            <span className="text-2xl font-extrabold text-[#996A19] tracking-tight font-serif">
              Rp {balance.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Uang Masuk & Uang Keluar */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-800 text-[10px] font-semibold mb-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Uang Masuk</span>
              </div>
              <p className="text-xs font-bold text-emerald-900">
                +Rp {incomeThisMonth.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="flex items-center justify-center gap-1 text-rose-800 text-[10px] font-semibold mb-0.5">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                <span>Uang Keluar</span>
              </div>
              <p className="text-xs font-bold text-rose-900">
                -Rp {expenseThisMonth.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 4. Upcoming Job Highlight */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#996A19] animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145]">
              Jadwal Job Terdekat
            </h3>
          </div>
          <Link
            href="/app/jobs"
            className="text-xs font-semibold text-[#996A19] hover:underline flex items-center gap-1"
          >
            <span>Semua Jadwal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {nextJob ? (
          <GlassCard className="p-4" variant="emerald">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <GlassStatusBadge status={nextJob.status} />
                <h4 className="text-base font-bold text-[#151917] mt-1.5 line-clamp-1">
                  {nextJob.title}
                </h4>
                <p className="text-xs text-[#996A19] font-semibold">{nextJob.event_type}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-[#151917] block">
                  {nextJob.event_date}
                </span>
                <span className="text-[10px] text-[#585145] block">Mulai {nextJob.start_time}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#585145] my-3 border-y border-black/5 py-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B58228] shrink-0" />
                <span>Jam Kumpul: <strong>{nextJob.gather_time}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#996A19] shrink-0" />
                <span className="line-clamp-1">{nextJob.location}</span>
              </div>
            </div>

            {/* Quick Attendance Selector inside Home */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#151917]">
                  Konfirmasi Kehadiran Anda:
                </span>
                <span className="text-[11px] font-semibold text-[#996A19]">
                  {myAttendance?.status === 'attending'
                    ? '✓ Hadir'
                    : myAttendance?.status === 'not_attending'
                    ? '✗ Tidak Hadir'
                    : myAttendance?.status === 'maybe'
                    ? '? Belum Pasti'
                    : 'Belum Menjawab'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  onClick={() => setAttendance(nextJob.id, 'attending')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    myAttendance?.status === 'attending'
                      ? 'bg-[#996A19] text-white border-[#996A19] shadow-xs'
                      : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
                  }`}
                >
                  Hadir
                </button>
                <button
                  onClick={() => setAttendance(nextJob.id, 'maybe')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    myAttendance?.status === 'maybe'
                      ? 'bg-[#B58228] text-white border-[#B58228] shadow-xs'
                      : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
                  }`}
                >
                  Ragu / Izin
                </button>
                <button
                  onClick={() => setAttendance(nextJob.id, 'not_attending')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    myAttendance?.status === 'not_attending'
                      ? 'bg-[#C84A45] text-white border-[#C84A45] shadow-xs'
                      : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
                  }`}
                >
                  Tidak Hadir
                </button>
              </div>

              <Link href={`/app/jobs/${nextJob.id}`} className="block w-full">
                <GlassButton variant="secondary" size="sm" fullWidth icon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Lihat Detail Acara & Tim Penugasan
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-[#585145]">Belum ada jadwal job terdekat.</p>
          </GlassCard>
        )}
      </section>

      {/* 5. Quick Access Grid */}
      <section className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145] mb-2.5">
          Akses Cepat Fitur
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Qosidah Shortcut */}
          <Link href="/app/qosidah" className="block">
            <GlassCard interactive className="p-3.5 h-full flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#996A19]/10 flex items-center justify-center text-[#996A19] mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Kitab Qosidah</h4>
                <p className="text-[10px] text-[#585145] mt-0.5">Teks Arab & Mode Tampil</p>
              </div>
            </GlassCard>
          </Link>

          {/* Job Schedule Shortcut */}
          <Link href="/app/jobs" className="block">
            <GlassCard interactive className="p-3.5 h-full flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#B58228]/15 flex items-center justify-center text-[#8C5E16] mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Jadwal Job</h4>
                <p className="text-[10px] text-[#585145] mt-0.5">Daftar Acara & Absensi</p>
              </div>
            </GlassCard>
          </Link>

          {/* Finance Shortcut (Transparansi Kas Pemain) */}
          <Link href="/app/finance" className="block">
            <GlassCard interactive className="p-3.5 h-full flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-800 mb-2">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Keuangan Kas</h4>
                <p className="text-[10px] text-[#585145] mt-0.5">Total Kas & Arus</p>
              </div>
            </GlassCard>
          </Link>

          {/* Profil Pemain Shortcut */}
          <Link href="/app/profile" className="block">
            <GlassCard interactive className="p-3.5 h-full flex flex-col justify-between">
              <div className="w-9 h-9 rounded-xl bg-[#996A19]/10 flex items-center justify-center text-[#996A19] mb-2">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#151917]">Profil Pemain</h4>
                <p className="text-[10px] text-[#585145] mt-0.5">Akun & Pengaturan</p>
              </div>
            </GlassCard>
          </Link>
        </div>
      </section>
    </MobileAppShell>
  );
}