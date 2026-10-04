'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Wallet,
  CheckCheck,
  ChevronRight,
  Sparkles,
  Radio,
  X,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { AppNotification } from '@/lib/types';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { GlassEmptyState } from '@/components/ui/GlassEmptyState';

export default function NotificationsPage() {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAppStore();

  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Radio className="w-4 h-4 text-[#996A19]" />;
      case 'job_new':
      case 'job_update':
        return <Calendar className="w-4 h-4 text-[#996A19]" />;
      case 'finance':
        return <Wallet className="w-4 h-4 text-[#996A19]" />;
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-[#996A19]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#B58A3A]" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'Pengumuman Resmi';
      case 'job_new':
        return 'Jadwal Job Baru';
      case 'job_update':
        return 'Perubahan Jadwal';
      case 'finance':
        return 'Keuangan Kas';
      case 'approval':
        return 'Persetujuan Anggota';
      default:
        return 'Informasi Majelis';
    }
  };

  // Saat pesan diklik untuk dibuka:
  // 1. Tampilkan modal baca detail pesan
  // 2. Langsung tandai pesan sebagai sudah dibaca (badge di lonceng otomatis hilang)
  const handleOpenNotification = (notif: AppNotification) => {
    setSelectedNotif(notif);
    if (!notif.is_read) {
      markNotificationAsRead(notif.id);
    }
  };

  return (
    <MobileAppShell
      title="Notifikasi"
      subtitle="Hadroh Khoirunnada"
      rightAction={
        unreadNotificationCount > 0 ? (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#996A19] hover:underline cursor-pointer"
            title="Tandai Semua Dibaca"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Baca Semua</span>
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2.5">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const isUnread = !notif.is_read;

            return (
              <div
                key={notif.id}
                onClick={() => handleOpenNotification(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isUnread
                    ? 'bg-white/90 border-[#996A19]/35 shadow-xs ring-1 ring-[#996A19]/20'
                    : 'bg-white/60 border-black/5 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUnread ? 'bg-[#996A19]/15' : 'bg-black/5'
                    }`}
                  >
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                          isUnread ? 'text-[#151917]' : 'text-[#525D58]'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C84A45] shrink-0 shadow-xs" title="Belum Dibaca" />
                      )}
                    </div>

                    <p className="text-xs text-[#525D58] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                      <span className="text-[10px] text-gray-400">
                        {new Date(notif.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <span className="text-[11px] font-semibold text-[#996A19] flex items-center gap-0.5">
                        <span>Baca Pesan</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <GlassEmptyState
            icon={<Bell className="w-8 h-8" />}
            title="Tidak Ada Notifikasi"
            description="Pemberitahuan terkait Job baru, pengumuman latihan, dan arahan majelis akan muncul di sini."
          />
        )}
      </div>

      {/* Modal Popup Baca Pesan Pengumuman Lengkap */}
      <GlassModal
        isOpen={Boolean(selectedNotif)}
        onClose={() => setSelectedNotif(null)}
        title={selectedNotif?.title || 'Detail Pesan'}
        subtitle={selectedNotif ? getTypeLabel(selectedNotif.type) : undefined}
      >
        {selectedNotif && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.03] border border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#996A19]/15 flex items-center justify-center">
                  {getIcon(selectedNotif.type)}
                </div>
                <span className="font-semibold text-[#151917]">
                  {getTypeLabel(selectedNotif.type)}
                </span>
              </div>
              <span className="text-[10px] text-[#585145]">
                {new Date(selectedNotif.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Isi Pesan Pengumuman */}
            <div className="p-4 rounded-xl bg-white/80 border border-black/5">
              <h4 className="font-bold text-sm text-[#151917] mb-2">
                {selectedNotif.title}
              </h4>
              <p className="text-xs text-[#525D58] leading-relaxed whitespace-pre-wrap">
                {selectedNotif.message}
              </p>
            </div>

            {/* Tombol aksi */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#151917] font-semibold text-xs transition-all cursor-pointer"
              >
                Tutup Pesan
              </button>

              {selectedNotif.target_url && selectedNotif.target_url !== '/app' && (
                <Link
                  href={selectedNotif.target_url}
                  onClick={() => setSelectedNotif(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#996A19] hover:bg-[#855B14] text-white font-bold text-xs text-center shadow-xs transition-all"
                >
                  Buka Halaman Terkait
                </Link>
              )}
            </div>
          </div>
        )}
      </GlassModal>
    </MobileAppShell>
  );
}
