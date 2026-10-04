'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ClipboardList,
  Sparkles,
  Phone,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassStatusBadge } from '@/components/ui/GlassStatusBadge';
import { GlassEmptyState } from '@/components/ui/GlassEmptyState';

export default function JobsListPage() {
  const { jobs, attendances, currentUser, bookings } = useAppStore();
  const [activeMainTab, setActiveMainTab] = useState<'jobs' | 'bookings'>('jobs');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredJobs = jobs.filter((j) => {
    if (selectedStatus === 'all') return true;
    return j.status === selectedStatus;
  });

  const filteredBookings = bookings.filter((b) => {
    if (selectedStatus === 'all') return true;
    return b.status === selectedStatus;
  });

  return (
    <MobileAppShell
      title="Jadwal & Acara"
      subtitle="Hadroh Khoirunnada"
    >
      {/* 1. Main Category Toggle: Job Hadroh vs Booking Acara */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/5 mb-4 border border-black/5">
        <button
          onClick={() => {
            setActiveMainTab('jobs');
            setSelectedStatus('all');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMainTab === 'jobs'
              ? 'bg-[#996A19] text-white shadow-sm'
              : 'text-[#525D58] hover:text-[#151917]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Job Hadroh ({jobs.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveMainTab('bookings');
            setSelectedStatus('all');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMainTab === 'bookings'
              ? 'bg-[#996A19] text-white shadow-sm'
              : 'text-[#525D58] hover:text-[#151917]'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Booking Masuk ({bookings.length})</span>
        </button>
      </div>

      {/* 2. Sub-filters based on active category */}
      {activeMainTab === 'jobs' ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'all'
                ? 'bg-[#996A19] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Semua ({jobs.length})
          </button>
          <button
            onClick={() => setSelectedStatus('upcoming')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'upcoming'
                ? 'bg-[#996A19] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Akan Datang ({jobs.filter((j) => j.status === 'upcoming').length})
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'completed'
                ? 'bg-[#996A19] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Selesai ({jobs.filter((j) => j.status === 'completed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'cancelled'
                ? 'bg-[#C84A45] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Batal ({jobs.filter((j) => j.status === 'cancelled').length})
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'all'
                ? 'bg-[#996A19] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Semua ({bookings.length})
          </button>
          <button
            onClick={() => setSelectedStatus('confirmed')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'confirmed'
                ? 'bg-[#996A19] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Terkonfirmasi ({bookings.filter((b) => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('waiting_dp')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'waiting_dp'
                ? 'bg-[#996A19] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Menunggu DP ({bookings.filter((b) => b.status === 'waiting_dp').length})
          </button>
          <button
            onClick={() => setSelectedStatus('new')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === 'new'
                ? 'bg-[#996A19] text-white shadow-xs'
                : 'bg-white/70 text-[#525D58] border border-black/5 hover:bg-white'
            }`}
          >
            Permintaan Baru ({bookings.filter((b) => b.status === 'new').length})
          </button>
        </div>
      )}

      {/* 3. Content List */}
      {activeMainTab === 'jobs' ? (
        <div className="space-y-3">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const jobAttendances = attendances.filter((a) => a.job_id === job.id);
              const attendingCount = jobAttendances.filter((a) => a.status === 'attending').length;
              const myStatus = jobAttendances.find((a) => a.user_id === currentUser.id)?.status;

              return (
                <Link key={job.id} href={`/app/jobs/${job.id}`} className="block">
                  <GlassCard interactive className="p-4 sm:p-5" variant="elevated">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <GlassStatusBadge status={job.status} />
                        <span className="text-[11px] font-semibold text-[#996A19] bg-[#996A19]/10 px-2 py-0.5 rounded-md">
                          {job.event_type}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#151917] block">
                          {job.event_date}
                        </span>
                        <span className="text-[10px] text-[#525D58] block">Mulai {job.start_time}</span>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#151917] mb-1 line-clamp-1">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-[#525D58] mb-3 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-black/5 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[#525D58]">
                          <Users className="w-3.5 h-3.5 text-[#996A19]" />
                          <span>{attendingCount} Hadir</span>
                        </span>

                        {myStatus && (
                          <span className="text-[11px] font-semibold text-[#996A19]">
                            {myStatus === 'attending'
                              ? '✓ Anda Hadir'
                              : myStatus === 'not_attending'
                              ? '✗ Anda Tidak Hadir'
                              : '? Belum Pasti'}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-[#996A19] flex items-center gap-0.5">
                        <span>Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              );
            })
          ) : (
            <GlassEmptyState
              icon={<Calendar className="w-8 h-8 text-[#996A19]" />}
              title="Belum Ada Jadwal Job"
              description="Jadwal job hadroh yang diterbitkan oleh Admin akan tampil di sini."
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((b) => (
              <GlassCard key={b.id} className="p-4 sm:p-5" variant="elevated">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <GlassStatusBadge status={b.status} />
                    <span className="text-[11px] font-mono font-bold text-[#996A19]">
                      {b.booking_code}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#151917] block">
                      {b.event_date}
                    </span>
                    <span className="text-[10px] text-[#525D58] block">Pukul {b.event_time}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#151917] mb-0.5">
                  {b.event_type} {b.event_name ? `(${b.event_name})` : ''}
                </h3>
                <p className="text-xs text-[#525D58] mb-2">
                  Pemesan: <strong>{b.customer_name}</strong>
                </p>

                <div className="flex items-center gap-1.5 text-xs text-[#525D58] mb-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="line-clamp-1">{b.location}</span>
                </div>

                {b.admin_notes && (
                  <div className="p-2.5 rounded-xl bg-black/5 text-[11px] text-[#525D58] mb-2 border border-black/5">
                    <span className="font-bold text-[#151917] block mb-0.5">Catatan Pengurus:</span>
                    <span>{b.admin_notes}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px] text-[#525D58]">
                  <span>Status: <strong>{b.status === 'confirmed' ? 'Acara Terkonfirmasi' : 'Dikelola Pengurus'}</strong></span>
                  <span className="text-[#996A19] font-medium">Tersimpan di Sistem</span>
                </div>
              </GlassCard>
            ))
          ) : (
            <GlassEmptyState
              icon={<ClipboardList className="w-8 h-8 text-[#996A19]" />}
              title="Belum Ada Booking Acara"
              description="Seluruh booking acara yang masuk dan dikelola oleh Admin akan otomatis tampil di sini."
            />
          )}
        </div>
      )}
    </MobileAppShell>
  );
}
