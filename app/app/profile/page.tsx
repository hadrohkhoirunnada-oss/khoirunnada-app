'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  Bell,
  LogOut,
  ChevronRight,
  Pencil,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Heart,
  X,
  Settings,
  User,
  Check,
  Camera,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, logout, updateAvatar, removeAvatar, updateUsername, favorites } = useAppStore();

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [installPromptShown, setInstallPromptShown] = useState(false);

  // State untuk Popup Pengaturan Profil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pageMessage, setPageMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditModal = () => {
    setUsernameInput(currentUser.name || '');
    setModalMessage(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (isUploading || isSavingUsername) return;
    setIsEditModalOpen(false);
    setModalMessage(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value agar dapat memilih file yang sama kembali jika diinginkan
    e.target.value = '';

    // Validasi format file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setModalMessage({
        text: 'Format file tidak didukung. Harap pilih foto berformat JPG, PNG, atau WebP.',
        type: 'error',
      });
      return;
    }

    // Validasi ukuran file (maksimal 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setModalMessage({
        text: 'Ukuran foto terlalu besar. Maksimal ukuran foto adalah 5 MB.',
        type: 'error',
      });
      return;
    }

    // Preview instan di layar
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    setModalMessage(null);

    try {
      const newUrl = await updateAvatar(file);
      if (newUrl) setPreviewUrl(newUrl);
      setModalMessage({ text: 'Foto profil berhasil diperbarui dan tersimpan di database!', type: 'success' });
      setPageMessage({ text: 'Foto profil berhasil diperbarui!', type: 'success' });
      setTimeout(() => {
        setPageMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 4000);
    } catch (err) {
      setModalMessage({
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
    setModalMessage(null);
    try {
      await removeAvatar();
      setPreviewUrl(null);
      setModalMessage({ text: 'Foto profil dikembalikan ke logo default.', type: 'success' });
      setPageMessage({ text: 'Foto profil dikembalikan ke logo default.', type: 'success' });
      setTimeout(() => {
        setPageMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 3000);
    } catch (err) {
      setModalMessage({
        text: err instanceof Error ? err.message : 'Gagal mereset foto profil.',
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUsername = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = usernameInput.trim();

    if (!trimmed) {
      setModalMessage({ text: 'Username tidak boleh kosong.', type: 'error' });
      return;
    }

    if (trimmed.length < 2) {
      setModalMessage({ text: 'Username minimal 2 karakter.', type: 'error' });
      return;
    }

    if (trimmed.length > 60) {
      setModalMessage({ text: 'Username maksimal 60 karakter.', type: 'error' });
      return;
    }

    if (trimmed === currentUser.name) {
      setModalMessage({ text: 'Username tidak mengalami perubahan.', type: 'error' });
      return;
    }

    setIsSavingUsername(true);
    setModalMessage(null);

    try {
      await updateUsername(trimmed);
      setModalMessage({ text: 'Username berhasil diperbarui di database!', type: 'success' });
      setPageMessage({ text: 'Username berhasil diperbarui!', type: 'success' });
      setTimeout(() => {
        setPageMessage((prev) => (prev?.type === 'success' ? null : prev));
      }, 4000);
    } catch (err) {
      setModalMessage({
        text: err instanceof Error ? err.message : 'Gagal memperbarui username.',
        type: 'error',
      });
    } finally {
      setIsSavingUsername(false);
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
        {/* Interactive Avatar Container with Pencil Badge */}
        <div className="relative w-24 h-24 mx-auto mb-3">
          <div
            onClick={handleOpenEditModal}
            className="group relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer bg-neutral-100 transition-transform active:scale-95"
            title="Klik untuk membuka pengaturan profil"
          >
            <img
              src={previewUrl || currentUser.avatar_url || '/logo-khoirunnada-192.png'}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = '/logo-khoirunnada-192.png';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5">
              <Pencil className="w-5 h-5 text-[#E6C687]" />
              <span>Edit</span>
            </div>

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4A346]" />
                <span className="text-[9px] font-bold mt-1 text-white">Menyimpan...</span>
              </div>
            )}
          </div>

          {/* Pencil Quick Button Badge */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            disabled={isUploading}
            aria-label="Pengaturan profil (Ubah foto & username)"
            title="Pengaturan profil (Ubah foto & username)"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-tr from-[#996A19] to-[#D4A346] text-white border-2 border-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message banner on main page */}
        {pageMessage && (
          <div
            className={`text-xs px-3 py-2 rounded-xl mb-3 flex items-center justify-center gap-2 ${
              pageMessage.type === 'success'
                ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 font-semibold'
                : 'bg-[#C84A45]/10 text-[#C84A45] border border-[#C84A45]/20 font-medium'
            }`}
          >
            {pageMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C84A45]" />
            )}
            <span>{pageMessage.text}</span>
          </div>
        )}

        <h2 className="text-base sm:text-lg font-bold text-[#151917] tracking-tight">
          {currentUser.name}
        </h2>
        <p className="text-xs text-[#525D58] mb-2">{currentUser.email}</p>
        <p className="text-xs font-semibold text-[#996A19] bg-[#996A19]/10 inline-block px-3 py-1 rounded-full">
          {currentUser.role_title || (currentUser.is_admin ? 'Administrator' : currentUser.is_treasurer ? 'Bendahara' : 'Pemain Resmi')}
        </p>
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

        {/* Menu Qosidah Favorit (Tepat di bawah Pemberitahuan Push) */}
        <Link
          href="/app/profile/favorites"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C84A45]/12 flex items-center justify-center text-[#C84A45]">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#151917]">Qosidah Favorit</p>
                {favorites.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#C84A45]/15 text-[#C84A45] text-[10px] font-bold">
                    {favorites.length}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#525D58]">Koleksi syair & sholawat pilihan saya</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        {/* PWA Install Info */}
        <div
          onClick={() => setInstallPromptShown(true)}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#B58228]/15 flex items-center justify-center text-[#8C6821]">
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

      {/* 3. Popup / Modal Pengaturan Profil */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseEditModal();
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-[#996A19]/20 max-w-sm sm:max-w-md w-full overflow-hidden p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Hidden File Input for Avatar */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-black/5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#996A19]/10 flex items-center justify-center text-[#996A19]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#151917]">Pengaturan Profil</h3>
                  <p className="text-[11px] text-[#525D58]">Ubah foto profil & username</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={isUploading || isSavingUsername}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#525D58] hover:text-[#151917] transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Tutup popup pengaturan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Feedback Message */}
            {modalMessage && (
              <div
                className={`text-xs px-3.5 py-2.5 rounded-xl mb-4 flex items-center gap-2.5 ${
                  modalMessage.type === 'success'
                    ? 'bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 font-semibold'
                    : 'bg-[#C84A45]/10 text-[#C84A45] border border-[#C84A45]/20 font-medium'
                }`}
              >
                {modalMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#C84A45]" />
                )}
                <span className="text-xs leading-snug">{modalMessage.text}</span>
              </div>
            )}

            {/* BAGIAN 1: Ubah Foto Profil */}
            <div className="bg-[#FAF6EE] rounded-2xl p-4 border border-[#996A19]/15 mb-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Camera className="w-4 h-4 text-[#996A19]" />
                <h4 className="text-xs font-bold text-[#70490E]">1. Ubah Foto Profil</h4>
              </div>

              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                  <img
                    src={previewUrl || currentUser.avatar_url || '/logo-khoirunnada-192.png'}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/logo-khoirunnada-192.png';
                    }}
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload & Reset Actions */}
                <div className="flex-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#996A19] to-[#D4A346] text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunggah Foto...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Foto Baru</span>
                      </>
                    )}
                  </button>

                  {hasCustomAvatar && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      disabled={isUploading}
                      className="w-full py-1.5 px-3 rounded-xl bg-white border border-neutral-200 text-[#525D58] hover:text-[#C84A45] hover:border-[#C84A45]/30 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Kembalikan Foto Default</span>
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-[#7A756C] mt-2.5 leading-relaxed">
                Maksimal 5 MB (JPG, PNG, WebP). Foto lama otomatis diganti dan dihapus dari penyimpanan.
              </p>
            </div>

            {/* BAGIAN 2: Ubah Username */}
            <div className="bg-[#FAF6EE] rounded-2xl p-4 border border-[#996A19]/15 mb-5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <User className="w-4 h-4 text-[#996A19]" />
                <h4 className="text-xs font-bold text-[#70490E]">2. Ubah Username</h4>
              </div>

              <form onSubmit={handleSaveUsername} className="space-y-2.5">
                <div>
                  <label htmlFor="username-input" className="block text-[11px] font-semibold text-[#525D58] mb-1">
                    Username / Nama Tampilan
                  </label>
                  <input
                    id="username-input"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username baru"
                    disabled={isSavingUsername}
                    maxLength={60}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs font-medium text-[#151917] focus:outline-none focus:border-[#996A19] focus:ring-2 focus:ring-[#996A19]/20 transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isSavingUsername ||
                    !usernameInput.trim() ||
                    usernameInput.trim() === currentUser.name
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-[#151917] text-white hover:bg-[#252C28] text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSavingUsername ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Menyimpan Username...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#E6C687]" />
                      <span>Simpan Perubahan Username</span>
                    </>
                  )}
                </button>
              </form>
              <p className="text-[10px] text-[#7A756C] mt-2 leading-relaxed">
                Nama ini akan diperbarui pada akun Anda dan ditampilkan di seluruh fitur Hadroh Khoirunnada.
              </p>
            </div>

            {/* Modal Footer */}
            <button
              type="button"
              onClick={handleCloseEditModal}
              disabled={isUploading || isSavingUsername}
              className="w-full py-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-[#151917] text-xs font-bold transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </MobileAppShell>
  );
}
