'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { AddJobBottomSheet } from '@/components/admin/AddJobBottomSheet';

const POSITIONS = [
  'Vokal Utama',
  'Backing Vocal',
  'Penabuh Terbang 1',
  'Penabuh Terbang 2',
  'Penabuh Bass',
  'Penabuh Tam',
  'Penabuh Keprak',
  'Dokumentasi',
  'Driver Rombongan',
];

export default function AdminJobsManagementPage() {
  const router = useRouter();
  const { currentUser, jobs, profiles, assignMember, assignments } = useAppStore();

  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');

  // Assignment form
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState(POSITIONS[0]);

  const handleAssign = async () => {
    if (!selectedJobId || !assignUserId) return;
    await assignMember(selectedJobId, assignUserId, assignRole);
    setIsAssignModalOpen(false);
  };

  return (
    <MobileAppShell
      title="Kelola Jadwal & Tim"
      subtitle="Manajemen Job Hadroh Khoirunnada"
      showBack
      backHref="/app/admin"
      rightAction={
        <button
          onClick={() => setIsAddJobOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#070908]" />
          <span>Buat Job</span>
        </button>
      }
    >
      <div className="space-y-3">
        {jobs.map((job) => {
          const jobAssignments = assignments.filter((a) => a.job_id === job.id);

          return (
            <GlassCard key={job.id} className="p-4 sm:p-5 !bg-[#141B18]/90 !border-[#B58228]/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" variant="elevated">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B58228]/15 text-[#E6C687] border border-[#B58228]/30">
                    {job.event_type}
                  </span>
                  <h3 className="text-sm font-bold text-[#F8F6F0] mt-1.5">{job.title}</h3>
                </div>
                <span className="text-xs font-bold text-[#D4A346]">{job.event_date}</span>
              </div>

              <div className="space-y-1 text-xs text-[#9E9885] my-2 pt-1">
                <p>Kumpul: <strong className="text-[#F8F6F0]">{job.gather_time}</strong> • Mulai: <strong className="text-[#F8F6F0]">{job.start_time}</strong></p>
                <p className="line-clamp-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A346] shrink-0" />
                  <span>{job.location}</span>
                </p>
              </div>

              {/* Assigned Personnel list */}
              <div className="pt-2 border-t border-[#B58228]/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#F8F6F0]">
                    Penugasan Anggota ({jobAssignments.length}):
                  </span>
                  <button
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setIsAssignModalOpen(true);
                    }}
                    className="text-[11px] font-semibold text-[#D4A346] flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tugaskan Personel</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {jobAssignments.map((asg) => (
                    <span
                      key={asg.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0D1210] border border-[#B58228]/20 text-[10px] text-[#E6C687]"
                    >
                      <strong className="text-[#F8F6F0]">{asg.user_name.split(' ')[0]}:</strong>
                      <span>{asg.role_name}</span>
                    </span>
                  ))}
                  {jobAssignments.length === 0 && (
                    <span className="text-[10px] text-[#807A6B] italic">Belum ada personel ditugaskan</span>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Bottom Sheet Tambah Job */}
      <AddJobBottomSheet
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
      />

      {/* Modal Assign Personnel */}
      <GlassModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Tugaskan Posisi Anggota"
        subtitle="Hadroh Khoirunnada"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Pilih Anggota:</label>
            <select
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            >
              <option value="">Pilih Anggota...</option>
              {profiles
                .filter((p) => p.status === 'active' && p.is_member)
                .map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0D1210] text-[#F8F6F0]">
                    {p.name} ({p.role_title || 'Pemain'})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Tugas / Posisi:</label>
            <select
              value={assignRole}
              onChange={(e) => setAssignRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos} className="bg-[#0D1210] text-[#F8F6F0]">
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-[#9E9885] hover:text-[#F8F6F0] font-semibold text-xs"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAssign}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold text-xs shadow-md"
            >
              Simpan Penugasan
            </button>
          </div>
        </div>
      </GlassModal>
    </MobileAppShell>
  );
}
