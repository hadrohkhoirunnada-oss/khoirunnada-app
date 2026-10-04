'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shirt,
  Truck,
  FileText,
  UserCheck,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassStatusBadge } from '@/components/ui/GlassStatusBadge';
import { AttendanceStatus } from '@/lib/types';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { jobs, attendances, assignments, profiles, currentUser, setAttendance } = useAppStore();

  const jobId = params?.id as string;
  const job = jobs.find((j) => j.id === jobId);

  const [noteInput, setNoteInput] = useState('');
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  if (!job) {
    return (
      <MobileAppShell title="Job Tidak Ditemukan" showBack backHref="/app/jobs">
        <div className="text-center py-12">
          <p className="text-sm text-[#525D58] mb-4">
            Informasi jadwal job tidak ditemukan atau telah dibatalkan.
          </p>
          <GlassButton variant="primary" onClick={() => router.push('/app/jobs')}>
            Kembali ke Daftar Job
          </GlassButton>
        </div>
      </MobileAppShell>
    );
  }

  // Attendance breakdown
  const jobAttendances = attendances.filter((a) => a.job_id === job.id);
  const myAttendance = jobAttendances.find((a) => a.user_id === currentUser.id);

  const attendingList = jobAttendances.filter((a) => a.status === 'attending');
  const maybeList = jobAttendances.filter((a) => a.status === 'maybe');
  const notAttendingList = jobAttendances.filter((a) => a.status === 'not_attending');

  // Assigned personnel
  const jobAssignments = assignments.filter((asg) => asg.job_id === job.id);

  const handleSetAttendance = async (status: AttendanceStatus) => {
    setIsSavingAttendance(true);
    try {
      await setAttendance(job.id, status, noteInput.trim() || undefined);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  return (
    <MobileAppShell
      title={job.title}
      subtitle={job.event_type}
      showBack
      backHref="/app/jobs"
    >
      {/* 1. Header Information Card */}
      <GlassCard className="p-5 mb-4" variant="elevated">
        <div className="flex items-center justify-between gap-2 mb-2">
          <GlassStatusBadge status={job.status} />
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#996A19]/10 text-[#996A19]">
            {job.event_type}
          </span>
        </div>

        <h2 className="text-lg font-bold text-[#151917] mb-1">{job.title}</h2>
        <p className="text-xs text-[#525D58] mb-4">
          Pemesan: <strong>{job.customer_name}</strong>
        </p>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/5 text-xs text-[#525D58] mb-4">
          <div>
            <span className="text-[10px] text-gray-500 block">Tanggal Acara</span>
            <span className="font-bold text-[#151917]">{job.event_date}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block">Jam Mulai Acara</span>
            <span className="font-bold text-[#151917]">{job.start_time}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-black/5 flex items-center gap-1.5 text-[#8C6821]">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Jam Kumpul Anggota: <strong>{job.gather_time}</strong></span>
          </div>
        </div>

        {/* Location & Google Maps */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-[#525D58]">
            <MapPin className="w-4 h-4 text-[#996A19] shrink-0 mt-0.5" />
            <p className="line-clamp-2">{job.location}</p>
          </div>

          {job.maps_url && (
            <a
              href={job.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <GlassButton
                variant="secondary"
                size="sm"
                fullWidth
                icon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Buka Google Maps
              </GlassButton>
            </a>
          )}
        </div>
      </GlassCard>

      {/* 2. Attendance Confirmation Selector (PRD #23) */}
      <GlassCard className="p-5 mb-4" variant="emerald">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#996A19] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>Konfirmasi Kehadiran Anda</span>
          </h3>
          <span className="text-xs font-semibold text-[#996A19]">
            {myAttendance?.status === 'attending'
              ? '✓ Hadir'
              : myAttendance?.status === 'not_attending'
              ? '✗ Tidak Hadir'
              : myAttendance?.status === 'maybe'
              ? '? Belum Pasti'
              : 'Belum Dijawab'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => handleSetAttendance('attending')}
            disabled={isSavingAttendance}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex flex-col items-center gap-1 ${
              myAttendance?.status === 'attending'
                ? 'bg-[#996A19] text-white border-[#996A19] shadow-sm'
                : 'bg-white/80 text-[#525D58] border-black/10 hover:bg-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hadir</span>
          </button>

          <button
            onClick={() => handleSetAttendance('maybe')}
            disabled={isSavingAttendance}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex flex-col items-center gap-1 ${
              myAttendance?.status === 'maybe'
                ? 'bg-[#B58A3A] text-white border-[#B58A3A] shadow-sm'
                : 'bg-white/80 text-[#525D58] border-black/10 hover:bg-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Belum Pasti</span>
          </button>

          <button
            onClick={() => handleSetAttendance('not_attending')}
            disabled={isSavingAttendance}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 flex flex-col items-center gap-1 ${
              myAttendance?.status === 'not_attending'
                ? 'bg-[#C84A45] text-white border-[#C84A45] shadow-sm'
                : 'bg-white/80 text-[#525D58] border-black/10 hover:bg-white'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Tidak Hadir</span>
          </button>
        </div>

        {/* Optional Attendance Note Input */}
        <div>
          <input
            type="text"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder={myAttendance?.note || 'Catatan kehadiran (misal: izin telat 15 menit)...'}
            className="glass-input text-xs"
          />
        </div>
      </GlassCard>

      {/* 3. Attendance Recap Tally (PRD #23) */}
      <GlassCard className="p-5 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#525D58] mb-3 flex items-center justify-between">
          <span>Rekap Kehadiran Anggota</span>
          <span className="text-xs text-[#996A19] font-semibold">
            {attendingList.length} Hadir • {notAttendingList.length} Tidak Hadir
          </span>
        </h3>

        <div className="space-y-2">
          {jobAttendances.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-black/5 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={att.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={att.user_name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-[#151917]">{att.user_name}</p>
                  {att.note && <p className="text-[10px] text-gray-500 italic">&ldquo;{att.note}&rdquo;</p>}
                </div>
              </div>

              <GlassStatusBadge status={att.status} className="scale-90" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 4. Team Personnel Assignments (PRD #24) */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#525D58] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#996A19]" />
            <span>Tim & Pembagian Tugas</span>
          </h3>
          <span className="text-[11px] text-[#525D58]">{jobAssignments.length} Personel</span>
        </div>

        {jobAssignments.length > 0 ? (
          <div className="space-y-2">
            {jobAssignments.map((asg) => (
              <div
                key={asg.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-black/5 text-xs"
              >
                <div>
                  <p className="font-bold text-[#151917]">{asg.user_name}</p>
                  {asg.notes && <p className="text-[10px] text-gray-500">{asg.notes}</p>}
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#996A19]/10 text-[#996A19] font-semibold text-xs">
                  {asg.role_name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#525D58] italic py-2">
            Belum ada penugasan posisi spesifik dari Admin untuk acara ini.
          </p>
        )}
      </GlassCard>

      {/* 5. Notes & Logistics (Dress Code, Transport) */}
      <GlassCard className="p-5 mb-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#525D58] mb-1">
          Informasi Tambahan & Logistik
        </h3>

        {job.dress_code && (
          <div className="flex items-start gap-2.5 text-xs">
            <Shirt className="w-4 h-4 text-[#996A19] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#151917] block">Dress Code Seragam:</span>
              <p className="text-[#525D58]">{job.dress_code}</p>
            </div>
          </div>
        )}

        {job.transport_info && (
          <div className="flex items-start gap-2.5 text-xs border-t border-black/5 pt-2.5">
            <Truck className="w-4 h-4 text-[#B58A3A] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#151917] block">Informasi Transport:</span>
              <p className="text-[#525D58]">{job.transport_info}</p>
            </div>
          </div>
        )}

        {job.notes && (
          <div className="flex items-start gap-2.5 text-xs border-t border-black/5 pt-2.5">
            <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#151917] block">Catatan Khusus:</span>
              <p className="text-[#525D58] leading-relaxed">{job.notes}</p>
            </div>
          </div>
        )}
      </GlassCard>
    </MobileAppShell>
  );
}
