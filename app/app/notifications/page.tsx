'use client';

import React from 'react';
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
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassEmptyState } from '@/components/ui/GlassEmptyState';

export default function NotificationsPage() {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAppStore();

  const getIcon = (type: string) => {
    switch (type) {
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

  return (
    <MobileAppShell
      title="Notifikasi"
      subtitle="Hadroh Khoirunnada"
      rightAction={
        unreadNotificationCount > 0 ? (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#996A19] hover:underline"
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
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isUnread
                    ? 'bg-white/85 border-[#996A19]/30 shadow-sm'
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

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-xs sm:text-sm font-bold tracking-tight line-clamp-1 ${
                          isUnread ? 'text-[#151917]' : 'text-[#525D58]'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#996A19] shrink-0" />
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

                      {notif.target_url && (
                        <Link
                          href={notif.target_url}
                          className="text-[11px] font-semibold text-[#996A19] flex items-center gap-1 hover:underline"
                        >
                          <span>Buka Detail</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
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
            description="Pemberitahuan terkait Job baru, latihan, dan pengumuman akan ditampilkan di sini."
          />
        )}
      </div>
    </MobileAppShell>
  );
}
