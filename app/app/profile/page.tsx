'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Bell,
  LogOut,
  ChevronRight,
  Camera,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, logout, updateAvatar, removeAvatar } = useAppStore();

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [installPromptShown, setInstallPromptShown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value agar jika memilih file yang sama tetap memicu event
    e.target.value = '';

    // Validasi format file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setMessage({
        text: 'Format file tidak didukung. Harap pilih foto berformat JPG, PNG, atau WebP.',
        type: 'error',
      });
      return;
    }

    // Validasi ukuran file (maksimal 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: 'Ukuran foto terlalu besar. Maksimal ukuran foto adalah 5 MB.',
        type: 'error',
      });
      return;
    }

    // Preview instan di layar
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    setMessage(null);

    try {
      await updateAvatar(file);
      setMessage({ text: 'Foto profil berhasil diperbarui!', type: 'success' });
      setTimeout(() => {
        setMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 4000);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Gagal memperbarui foto profil.',
        type: 'error',
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetAvatar = async () => {
    if (!confirm('Kembalikan foto profil ke logo resmi Hadroh Khoirunnada?')) return;
    setIsUploading(true);
    setMessage(null);
    try {
      await removeAvatar();
      setPreviewUrl(null);
      setMessage({ text: 'Foto profil dikembalikan ke logo default.', type: 'success' });
      setTimeout(() => {
        setMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 3000);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Gagal mereset foto profil.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const hasCustomAvatar = Boolean(
    currentUser.avatar_url && currentUser.avatar_url !== '/logo-khoirunnada-192.png'
  );

  return (
    <MobileAppShell
      title="Profil"
      subtitle="Hadroh Khoirunnada"
      showBack={Boolean(currentUser.is_admin && !currentUser.is_member)}
      backHref="/app/admin"
    >
      {/* 1. Profile Header Card */}
      <GlassCard className="p-6 text-center mb-4" variant="elevated">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Interactive Avatar Container */}
        <div className="relative w-24 h-24 mx-auto mb-3">
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="group relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer bg-neutral-100 transition-transform active:scale-95"
            title="Klik untuk memilih foto baru"
          >
            <img
              src={previewUrl || currentUser.avatar_url || '/logo-khoirunnada-192.png'}
              alt={currentUser.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5">
              <Camera className="w-5 h-5 text-[#E6C687]" />
              <span>Ganti</span>
            </div>

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4A346]" />
                <span className="text-[9px] font-bold mt-1 text-white">Mengunggah...</span>
              </div>
            )}
          </div>

          {/* Camera Quick Button Badge */}
          <button
            type="button"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Pilih foto profil baru"
            title="Pilih foto profil baru"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[#996A19] to-[#D4A346] text-white border-2 border-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: Ganti & Reset Foto */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-1.5 rounded-full bg-[#996A19]/10 hover:bg-[#996A19]/20 text-[#8C6821] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Foto Profil</span>
              </>
            )}
          </button>

          {hasCustomAvatar && (
            <button
              type="button"
              onClick={handleResetAvatar}
              disabled={isUploading}
              title="Kembalikan foto profil ke logo Hadroh Khoirunnada"
              className="px-2.5 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-[#525D58] hover:text-[#C84A45] text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Reset</span>
            </button>
          )}
        </div>

        {/* Feedback message banner */}
        {message && (
          <div
            className={`text-xs px-3 py-2 rounded-xl mb-3 flex items-center justify-center gap-2 ${
              message.type === 'success'
                ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 font-semibold'
                : 'bg-[#C84A45]/10 text-[#C84A45] border border-[#C84A45]/20 font-medium'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C84A45]" />
            )}
            <span>{message.text}</span>
          </div>
        )}

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
            {currentUser.is_admin
              ? 'Pengurus Admin Hadroh'
              : currentUser.is_treasurer
              ? 'Bendahara Hadroh'
              : 'Pemain Resmi Khoirunnada'}
          </span>
        </div>
      </GlassCard>

      {/* 2. Pengaturan Akun & Aplikasi */}
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
