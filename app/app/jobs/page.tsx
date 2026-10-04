'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassStatusBadge } from '@/components/ui/GlassStatusBadge';
import { GlassEmptyState } from '@/components/ui/GlassEmptyState';
import { JobStatus } from '@/lib/types';

export default function JobsListPage() {
  const { jobs, attendances, currentUser } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredJobs = jobs.filter((j) => {
    if (selectedStatus === 'all') return true;
    return j.status === selectedStatus;
  });

  return (
    <MobileAppShell
      title="Jadwal Job"
      subtitle="Hadroh Khoirunnada"

    >
      {/* 1. Filter Tabs (PRD #21) */}
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

      {/* 2. Job Schedule Cards */}
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

                  <div className="space-y-1 text-xs text-[#525D58] my-2.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#B58A3A] shrink-0" />
                      <span>Kumpul: <strong>{job.gather_time}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#996A19] shrink-0" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>
                  </div>

                  {/* Footer Recap & Personal Attendance Status */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-black/5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#525D58]">
                      <Users className="w-3.5 h-3.5 text-[#996A19]" />
                      <span className="text-[11px] font-medium">
                        {attendingCount} Anggota Hadir
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-[#525D58]">
                        Status Anda:
                      </span>
                      <GlassStatusBadge
                        status={myStatus || 'no_response'}
                        className="scale-95"
                      />
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })
        ) : (
          <GlassEmptyState
            icon={<Calendar className="w-8 h-8" />}
            title="Belum Ada Jadwal Job"
            description="Jadwal Job Khoirunnada akan muncul di sini setelah disepakati bersama pemesan."
          />
        )}
      </div>
    </MobileAppShell>
  );
}
