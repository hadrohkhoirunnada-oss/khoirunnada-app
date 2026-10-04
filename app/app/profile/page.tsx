'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, profiles, logout } = useAppStore();

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [installPromptShown, setInstallPromptShown] = useState(false);

  const activeMembers = profiles.filter((p) => p.status === 'active');

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <MobileAppShell title="Profil & Tim" subtitle="Hadroh Khoirunnada">
      {/* 1. Profile Header Card */}
      <GlassCard className="p-6 text-center mb-4" variant="elevated">
        <div className="relative w-20 h-20 mx-auto mb-3">
          <img
            src={currentUser.avatar_url || '/logo-khoirunnada-192.png'}
            alt={currentUser.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mx-auto"
          />
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#996A19] border-2 border-white flex items-center justify-center text-white text-[11px] font-bold">
            ✓
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-[#151917] tracking-tight">
          {currentUser.name}
        </h2>
        <p className="text-xs text-[#525D58] mb-2">{currentUser.email}</p>
        <p className="text-xs font-semibold text-[#996A19] bg-[#996A19]/10 inline-block px-3 py-1 rounded-full mb-3">
          {currentUser.role_title || (currentUser.is_admin ? 'Administrator' : currentUser.is_treasurer ? 'Bendahara' : 'Pemain Resmi')}
        </p>

        {/* Status Peran Pemain */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-black/5">
          <span className="px-3 py-1 rounded-lg bg-[#996A19]/10 text-[#996A19] text-xs font-bold">
            Pemain Resmi Khoirunnada
          </span>
        </div>
      </GlassCard>

      {/* 2. Struktur Tim & Daftar Anggota (Sinkronisasi Admin -> Pemain) */}
      <GlassCard className="p-4 mb-4" variant="elevated">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#525D58] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#996A19]" />
            <span>Struktur Tim & Anggota ({activeMembers.length})</span>
          </h3>
          <span className="text-[10px] font-semibold text-[#996A19] bg-[#996A19]/10 px-2 py-0.5 rounded-full">
            Dikelola Admin
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {activeMembers.length > 0 ? (
            activeMembers.map((m) => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  m.id === currentUser.id
                    ? 'bg-[#996A19]/10 border-[#996A19]/30'
                    : 'bg-white/60 border-black/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={m.avatar_url || '/logo-khoirunnada-192.png'}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-black/10"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs text-[#151917] truncate">{m.name}</p>
                      {m.id === currentUser.id && (
                        <span className="text-[9px] px-1 bg-[#996A19] text-white font-bold rounded">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#525D58] truncate">{m.email}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#996A19]/10 text-[#996A19]">
                    {m.role_title || (m.is_admin ? 'Admin' : m.is_treasurer ? 'Bendahara' : 'Pemain')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#525D58] italic py-2 text-center">
              Belum ada anggota lain yang terdaftar.
            </p>
          )}
        </div>
      </GlassCard>

      {/* 3. Pengaturan Akun & Aplikasi */}
      <GlassCard className="p-2 mb-4 space-y-1">
        {/* Notifications Setting Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#525D58]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#151917]">Pemberitahuan Push</p>
              <p className="text-[10px] text-[#525D58]">Kabar job dan info jadwal latihan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
              notificationEnabled ? 'bg-[#996A19] justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* PWA Install Info */}
        <div
          onClick={() => setInstallPromptShown(true)}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B58A3A]/15 flex items-center justify-center text-[#8C6821]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#151917]">Pasang Aplikasi (PWA)</p>
              <p className="text-[10px] text-[#525D58]">Simpan ke Layar Utama Smartphone</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </GlassCard>

      {/* PWA Info Card if clicked */}
      {installPromptShown && (
        <GlassCard className="p-4 mb-4 bg-[#F5EBD7]/50 border-[#996A19]/30">
          <h4 className="text-xs font-bold text-[#70490E] mb-1">Cara Pasang ke Layar Utama:</h4>
          <ol className="text-[11px] text-[#585145] list-decimal pl-4 space-y-1 leading-relaxed">
            <li>Buka browser smartphone (Chrome di Android atau Safari di iPhone).</li>
            <li>Ketuk tombol menu (titik tiga di kanan atas) atau tombol Bagikan di Safari.</li>
            <li>Pilih <strong>&ldquo;Tambahkan ke Layar Utama&rdquo; / &ldquo;Install App&rdquo;</strong>.</li>
          </ol>
          <button
            type="button"
            onClick={() => setInstallPromptShown(false)}
            className="text-[11px] font-bold text-[#996A19] mt-2 underline cursor-pointer"
          >
            Tutup Panduan
          </button>
        </GlassCard>
      )}

      {/* App Information */}
      <div className="text-center py-4 text-xs text-[#525D58] space-y-1">
        <p className="font-semibold text-[#151917]">Hadroh Khoirunnada Web App</p>
        <p className="text-[11px]">Versi 1.0 (Portal Resmi Pemain Hadroh)</p>
      </div>

      {/* Logout Button */}
      <GlassButton
        variant="danger"
        fullWidth
        onClick={handleLogout}
        icon={<LogOut className="w-4 h-4" />}
      >
        Keluar Akun
      </GlassButton>
    </MobileAppShell>
  );
}
