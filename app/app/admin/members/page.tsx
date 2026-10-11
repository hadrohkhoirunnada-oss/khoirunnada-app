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
      <div className="admin-members-content">
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-800">
          {actionError}
        </div>
      )}
      {/* 1. Pending Approvals Queue */}
      <section className="admin-desktop-pending-members mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#70490E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#151917]">
              Permintaan Anggota Baru ({pendingMembers.length})
            </h3>
          </div>
        </div>

        {pendingMembers.length > 0 ? (
          <div className="space-y-2">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="admin-member-card p-4 rounded-2xl bg-white border border-[#B58228]/40 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
            src={member.avatar_url || '/logo-khoirunnada-192.png'}
            alt={member.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = '/logo-khoirunnada-192.png';
            }}
            className="w-10 h-10 rounded-full object-cover border border-[#B58228]/40"
                    />
                    <div>
                      <h4 className="admin-member-name text-sm font-bold text-[#151917]">{member.name}</h4>
                      <p className="admin-member-email text-xs text-[#585145]">{member.email}</p>
                      <p className="admin-member-meta text-[11px] text-[#70490E] mt-0.5">
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
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#996A19] to-[#70490E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
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
                    className="flex-1 py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-red-500/15 active:scale-95 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#585145] p-3 rounded-xl bg-[#FFFFFF]/60 border border-[#B58228]/20 text-center">
            Tidak ada permohonan anggota yang menunggu approval.
          </p>
        )}
      </section>

      {/* 2. Active Members & Roles Management */}
      <section className="admin-desktop-active-members space-y-3 mb-6">
        <h3 className="admin-members-section-title text-sm font-bold uppercase tracking-wider text-[#151917]">
          Daftar Anggota Aktif ({activeMembers.length})
        </h3>

        <div className="space-y-2.5">
          {activeMembers.map((member) => {
            const isSelf = member.id === currentUser.id;

            return (
              <GlassCard key={member.id} className="admin-member-card p-4 !bg-white !border-[#B58228]/25 shadow-[0_4px_20px_rgba(0,0,0,0.12)]" variant="elevated">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
            src={member.avatar_url || '/logo-khoirunnada-192.png'}
            alt={member.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = '/logo-khoirunnada-192.png';
            }}
            className="w-10 h-10 rounded-full object-cover border border-[#B58228]/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="admin-member-name text-sm font-bold text-[#151917]">
                          {member.name}
                        </h4>
                        {isSelf && (
                          <span className="text-[9px] font-bold text-[#70490E] bg-[#B58228]/20 border border-[#B58228]/30 px-1.5 py-0.5 rounded-md">
                            Akun Ini
                          </span>
                        )}
                      </div>
                      <p className="admin-member-email text-xs text-[#585145]">{member.email}</p>
                      <p className="admin-member-meta text-[11px] text-[#70490E] font-semibold mt-0.5">
                        {member.role_title || 'Pemain Hadroh'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additive Permissions Switches */}
                <div className="admin-member-permissions p-2.5 rounded-xl bg-white border border-[#B58228]/20 space-y-1.5 text-xs text-[#151917] mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="admin-member-permission-label font-medium text-[#585145]">Izin Portal Pemain:</span>
                    <span className="admin-member-permission-value font-bold text-[#70490E]">
                      {member.is_member ? 'Aktif' : 'Non-aktif (Khusus Pengurus)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#B58228]/15">
                    <span className="admin-member-permission-label font-medium text-[#585145]">Izin Bendahara:</span>
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
                          ? 'bg-gradient-to-r from-[#996A19] to-[#70490E] text-white font-bold shadow-xs'
                          : 'bg-[#FFFFFF] text-[#585145] border border-[#B58228]/30 hover:text-[#151917]'
                      }`}
                    >
                      {member.is_treasurer ? 'Aktif (Bendahara)' : 'Non-Aktif'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#B58228]/15">
                    <span className="admin-member-permission-label font-medium text-[#585145]">Izin Admin:</span>
                    <button
                      disabled
                      title="Role Admin hanya dapat diatur melalui allowlist server"
                      className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                        member.is_admin
                          ? 'bg-gradient-to-r from-[#996A19] to-[#70490E] text-white font-bold shadow-xs'
                          : 'bg-[#FFFFFF] text-[#585145] border border-[#B58228]/30 hover:text-[#151917]'
                      } cursor-not-allowed`}
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
                    className="w-full text-center py-1.5 text-[11px] text-red-800 hover:text-red-900 font-semibold"
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
          <p className="text-[#151917] leading-relaxed">{confirmModalData.description}</p>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#FFFFFF] border border-[#B58228]/30 text-[#585145] hover:text-[#151917] font-semibold text-xs"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmModalData.onConfirm}
              disabled={isActionRunning}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#996A19] to-[#70490E] text-white font-bold text-xs shadow-md"
            >
              {isActionRunning ? 'Menyimpan...' : 'Konfirmasi'}
            </button>
          </div>
        </div>
      </GlassModal>
      </div>
    </MobileAppShell>
  );
}
