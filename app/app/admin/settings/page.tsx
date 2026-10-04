'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  History,
  Shield,
  RefreshCw,
  CheckCircle2,
  Database,
  Lock,
  LogOut,
  Users,
  BookOpen,
  Bell,
  Calendar,
  Wallet,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { currentUser, auditLogs, logout, refreshData } = useAppStore();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRefreshData = async () => {
    await refreshData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

  return (
    <MobileAppShell
      title="Kelola & Pengaturan"
      subtitle="Akun Admin & Konfigurasi Sistem"
      showBack
      backHref="/app/admin"
    >
      {resetSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 mb-4 shadow-lg backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Data terbaru berhasil disinkronkan dari Supabase.</span>
        </div>
      )}

      {/* 1. Dedicated Admin & Bendahara Account Profile Card */}
      <GlassCard className="p-5 mb-4 !bg-[#141B18]/95 !border-[#B58228]/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]" variant="elevated">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-14 h-14 rounded-2xl p-1 bg-gradient-to-br from-[#E6C687]/20 via-[#B58228]/10 to-transparent border border-[#B58228]/40 shrink-0 flex items-center justify-center shadow-inner overflow-hidden">
            <img
              src="/logo-khoirunnada-192.png"
              alt="Logo Khoirunnada"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#B58228]/20 text-[#E6C687] border border-[#B58228]/30">
                Akun Resmi Majelis
              </span>
            </div>
            <h2 className="text-base font-bold text-[#F8F6F0] tracking-tight leading-tight truncate">
              {currentUser.name || 'Admin & Bendahara Hadroh'}
            </h2>
            <p className="text-xs text-[#9E9885] truncate font-mono mt-0.5">
              {currentUser.email || 'admin.khoirunnada@gmail.com'}
            </p>
          </div>
        </div>

        {/* Roles Badges */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/20 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D4A346] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-[#9E9885] block leading-none">Otoritas</span>
              <span className="text-xs font-bold text-[#F8F6F0] truncate block mt-0.5">
                Administrator
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/20 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#D4A346] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-[#9E9885] block leading-none">Otoritas</span>
              <span className="text-xs font-bold text-[#F8F6F0] truncate block mt-0.5">
                Bendahara Kas
              </span>
            </div>
          </div>
        </div>

        {/* Security & Isolation Notice */}
        <div className="p-3 rounded-xl bg-[#0D1210]/60 border border-[#B58228]/15 text-[11px] text-[#9E9885] leading-relaxed mb-4">
          <p className="flex items-center gap-1.5 font-semibold text-[#D4A346] mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Zona Akses Khusus Pengurus</span>
          </p>
          Akun Google ini dikhususkan bagi Admin dan Bendahara untuk mengelola jadwal, pemesanan, dan kas Hadroh Khoirunnada. Akun ini tidak terhubung dengan portal pemain.
        </div>

        {/* Logout Button */}
        <GlassButton
          variant="danger"
          size="md"
          fullWidth
          isLoading={isLoggingOut}
          onClick={handleLogout}
          icon={<LogOut className="w-4 h-4" />}
          className="!bg-red-950/40 !border-red-500/30 !text-red-200 hover:!bg-red-900/50"
        >
          Keluar dari Akun Admin
        </GlassButton>
      </GlassCard>

      {/* 2. Fast Navigation to Admin Modules */}
      <section className="mb-4 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9885] px-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A346]" />
          <span>Menu Manajemen Pengurus</span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <Link href="/app/admin/members" className="block">
            <div className="p-3.5 rounded-2xl bg-[#141B18]/90 border border-[#B58228]/25 hover:border-[#B58228]/50 active:scale-[0.98] transition-all flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#B58228]/15 text-[#D4A346] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[#807A6B]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F8F6F0]">Kelola Anggota</h4>
                <p className="text-[10px] text-[#9E9885]">Approval & Peran</p>
              </div>
            </div>
          </Link>

          <Link href="/app/admin/qosidah" className="block">
            <div className="p-3.5 rounded-2xl bg-[#141B18]/90 border border-[#B58228]/25 hover:border-[#B58228]/50 active:scale-[0.98] transition-all flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#B58228]/15 text-[#D4A346] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[#807A6B]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F8F6F0]">Bank Qosidah</h4>
                <p className="text-[10px] text-[#9E9885]">Lirik & Kategori</p>
              </div>
            </div>
          </Link>

          <Link href="/app/admin/notifications" className="block">
            <div className="p-3.5 rounded-2xl bg-[#141B18]/90 border border-[#B58228]/25 hover:border-[#B58228]/50 active:scale-[0.98] transition-all flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#B58228]/15 text-[#D4A346] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[#807A6B]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F8F6F0]">Siarkan Notifikasi</h4>
                <p className="text-[10px] text-[#9E9885]">Broadcast Pengumuman</p>
              </div>
            </div>
          </Link>

          <Link href="/app/admin/jobs" className="block">
            <div className="p-3.5 rounded-2xl bg-[#141B18]/90 border border-[#B58228]/25 hover:border-[#B58228]/50 active:scale-[0.98] transition-all flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#B58228]/15 text-[#D4A346] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-[#807A6B]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F8F6F0]">Kelola Job</h4>
                <p className="text-[10px] text-[#9E9885]">Jadwal & Personel</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. System Config Information */}
      <GlassCard className="p-5 mb-4 space-y-3 !bg-[#141B18]/90 !border-[#B58228]/25" variant="elevated">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9885] flex items-center gap-1.5">
          <Database className="w-4 h-4 text-[#D4A346]" />
          <span>Arsitektur & Konfigurasi Sistem</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15">
            <span className="text-[#9E9885]">Frontend:</span>
            <span className="font-bold text-[#F8F6F0]">Next.js (App Router) + React</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15">
            <span className="text-[#9E9885]">Tema Admin:</span>
            <span className="font-bold text-[#E6C687]">Executive Obsidian & Royal Gold</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15">
            <span className="text-[#9E9885]">Aksesibilitas:</span>
            <span className="font-bold text-[#F8F6F0]">WCAG 2.1 AA/AAA Standard</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15">
            <span className="text-[#9E9885]">Status PWA:</span>
            <span className="font-bold text-[#E6C687]">Installed Shell Ready</span>
          </div>
        </div>

        <div className="pt-2">
          <GlassButton
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleRefreshData}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            className="!border-[#B58228]/30 !text-[#E6C687]"
          >
            Sinkronkan Ulang Data Supabase
          </GlassButton>
        </div>
      </GlassCard>

      {/* 4. Audit Logs Viewer */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9885] flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#D4A346]" />
            <span>Log Audit Aktivitas Pengurus ({auditLogs.length})</span>
          </span>
        </h3>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-[#141B18]/90 border border-[#B58228]/20 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#D4A346] bg-[#B58228]/15 border border-[#B58228]/30 px-2 py-0.5 rounded-md text-[10px]">
                  {log.action}
                </span>
                <span className="text-[10px] text-[#807A6B]">
                  {new Date(log.created_at).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="font-semibold text-[#F8F6F0]">{log.description}</p>
              <div className="flex items-center justify-between text-[11px] text-[#9E9885] pt-1">
                <span>Oleh: {log.user_name}</span>
                <span className="text-[10px] text-[#807A6B]">{log.entity_type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MobileAppShell>
  );
}
