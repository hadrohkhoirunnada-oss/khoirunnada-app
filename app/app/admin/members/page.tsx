'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Check,
  X,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';

export default function AdminMembersManagementPage() {
  const router = useRouter();
  const {
    currentUser,
    profiles,
    approveMember,
    rejectMember,
    toggleMemberRole,
    deactivateMember,
  } = useAppStore();

  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const [actionError, setActionError] = useState('');
  const [isActionRunning, setIsActionRunning] = useState(false);

  const pendingMembers = profiles.filter((p) => p.status === 'pending');
  const activeMembers = profiles.filter((p) => p.status === 'active');
  const inactiveMembers = profiles.filter((p) => p.status === 'inactive' || p.status === 'rejected');

  const openConfirm = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>
  ) => {
    setConfirmModalData({
      isOpen: true,
      title,
      description,
      onConfirm: async () => {
        setIsActionRunning(true);
        setActionError('');
        try {
          await onConfirm();
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          setActionError(error instanceof Error ? error.message : 'Perubahan anggota gagal disimpan.');
        } finally {
          setIsActionRunning(false);
        }
      },
    });
  };

  return (
    <MobileAppShell
      title="Kelola Anggota & Peran"
      subtitle={`${activeMembers.length} anggota terdaftar`}
      showBack
      backHref="/app/admin"
    >
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
          {actionError}
        </div>
      )}
      {/* 1. Pending Approvals Queue */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#D4A346]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F6F0]">
              Permintaan Anggota Baru ({pendingMembers.length})
            </h3>
          </div>
        </div>

        {pendingMembers.length > 0 ? (
          <div className="space-y-2">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-[#141B18]/95 border border-[#B58228]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#B58228]/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#F8F6F0]">{member.name}</h4>
                      <p className="text-[11px] text-[#9E9885]">{member.email}</p>
                      <p className="text-[10px] text-[#D4A346] mt-0.5">
                        Daftar: {new Date(member.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#B58228]/15">
                  <button
                    type="button"
                    onClick={() =>
                      openConfirm(
                        'Setujui Anggota?',
                        `Berikan akses Member resmi kepada ${member.name}?`,
                        () => approveMember(member.id)
                      )
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openConfirm(
                        'Tolak Pendaftaran?',
                        `Tolak pendaftaran akun Google milik ${member.name}?`,
                        () => rejectMember(member.id)
                      )
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-red-900/50 active:scale-95 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#9E9885] p-3 rounded-xl bg-[#141B18]/60 border border-[#B58228]/20 text-center">
            Tidak ada permohonan anggota yang menunggu approval.
          </p>
        )}
      </section>

      {/* 2. Active Members & Roles Management */}
      <section className="space-y-3 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9885]">
          Daftar Anggota Aktif ({activeMembers.length})
        </h3>

        <div className="space-y-2.5">
          {activeMembers.map((member) => {
            const isSelf = member.id === currentUser.id;

            return (
              <GlassCard key={member.id} className="p-4 !bg-[#141B18]/90 !border-[#B58228]/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" variant="elevated">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#B58228]/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-[#F8F6F0]">
                          {member.name}
                        </h4>
                        {isSelf && (
                          <span className="text-[9px] font-bold text-[#E6C687] bg-[#B58228]/20 border border-[#B58228]/30 px-1.5 py-0.5 rounded-md">
                            Akun Ini
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9E9885]">{member.email}</p>
                      <p className="text-[10px] text-[#D4A346] font-semibold mt-0.5">
                        {member.role_title || 'Pemain Hadroh'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additive Permissions Switches */}
                <div className="p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/20 space-y-1.5 text-xs text-[#F8F6F0] mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#9E9885]">Izin Portal Pemain:</span>
                    <span className="font-bold text-[#D4A346]">
                      {member.is_member ? 'Aktif' : 'Non-aktif (Khusus Pengurus)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#B58228]/15">
                    <span className="font-medium text-[#9E9885]">Izin Bendahara:</span>
                    <button
                      onClick={() =>
                        openConfirm(
                          member.is_treasurer ? 'Cabut Akses Bendahara?' : 'Beri Akses Bendahara?',
                          `${member.is_treasurer ? 'Cabut' : 'Berikan'} izin kelola keuangan kas pada ${member.name}?`,
                          () => toggleMemberRole(member.id, 'is_treasurer')
                        )
                      }
                      className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        member.is_treasurer
                          ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold shadow-xs'
                          : 'bg-[#141B18] text-[#9E9885] border border-[#B58228]/30 hover:text-[#F8F6F0]'
                      }`}
                    >
                      {member.is_treasurer ? 'Aktif (Bendahara)' : 'Non-Aktif'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#B58228]/15">
                    <span className="font-medium text-[#9E9885]">Izin Admin:</span>
                    <button
                      disabled
                      title="Role Admin hanya dapat diatur melalui allowlist server"
                      className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        member.is_admin
                          ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold shadow-xs'
                          : 'bg-[#141B18] text-[#9E9885] border border-[#B58228]/30 hover:text-[#F8F6F0]'
                      } opacity-60 cursor-not-allowed`}
                    >
                      {member.is_admin ? 'Aktif (Akun Resmi)' : 'Khusus Allowlist'}
                    </button>
                  </div>
                </div>

                {!isSelf && (
                  <button
                    onClick={() =>
                      openConfirm(
                        'Non-aktifkan Anggota?',
                        `Nonaktifkan akun ${member.name}? Anggota ini tidak akan bisa login ke aplikasi.`,
                        () => deactivateMember(member.id)
                      )
                    }
                    className="w-full text-center py-1.5 text-[11px] text-red-400/80 hover:text-red-300 font-semibold"
                  >
                    Nonaktifkan Anggota Ini
                  </button>
                )}
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Confirmation Modal */}
      <GlassModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModalData.title}
        subtitle="Konfirmasi Tindakan Pengurus"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#F8F6F0] leading-relaxed">{confirmModalData.description}</p>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-[#9E9885] hover:text-[#F8F6F0] font-semibold text-xs"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmModalData.onConfirm}
              disabled={isActionRunning}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold text-xs shadow-md"
            >
              {isActionRunning ? 'Menyimpan...' : 'Konfirmasi'}
            </button>
          </div>
        </div>
      </GlassModal>
    </MobileAppShell>
  );
}
