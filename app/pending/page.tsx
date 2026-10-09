'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { currentUser, logout, refreshData, isLoading } = useAppStore();
  const [isChecking, setIsChecking] = React.useState(false);

  React.useEffect(() => {
    if (currentUser.status !== 'active') return;
    router.replace(currentUser.is_admin ? '/app/admin' : '/app');
    router.refresh();
  }, [currentUser, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    const profile = await refreshData();
    setIsChecking(false);
    if (profile?.status === 'active') {
      router.push(profile.is_admin ? '/app/admin' : '/app');
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center text-xs font-medium text-[#996A19]">
        Memeriksa status akun...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4 antialiased text-[#151917]">
      <div className="w-full max-w-sm text-center">
        {/* Pending Clock Icon */}
        <div className="w-20 h-20 rounded-full bg-[#B58A3A]/15 border-2 border-[#B58A3A]/30 flex items-center justify-center text-[#B58A3A] mx-auto mb-5 shadow-lg">
          <Clock className="w-10 h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B58A3A]/10 text-[#8C6821] text-xs font-semibold mb-2">
          <span>Status: Menunggu Persetujuan Pengurus</span>
        </span>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#151917] mb-2 font-serif">
          Pendaftaran Berhasil!
        </h1>

        <p className="text-xs sm:text-sm text-[#525D58] mb-6 leading-relaxed">
          Assalamu&apos;alaikum, <strong>{currentUser.name}</strong>. Akun Anda telah terdaftar namun memerlukan konfirmasi persetujuan dari Pengurus Hadroh Khoirunnada sebelum dapat membuka fitur tim.
        </p>

        {/* User Info Card */}
        <GlassCard className="text-left mb-6" variant="elevated">
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-black/5">
            <img
            src={currentUser.avatar_url || '/logo-khoirunnada-192.png'}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = '/logo-khoirunnada-192.png';
            }}
            className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
            />
            <div>
              <p className="text-xs font-bold text-[#151917]">{currentUser.name}</p>
              <p className="text-[11px] text-[#525D58]">{currentUser.email}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#525D58]">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B58A3A]" />
              <span>Admin sedang memeriksa permohonan keanggotaan Anda.</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#996A19]" />
              <span>Setelah disetujui Admin, Anda akan otomatis dapat mengakses seluruh jadwal Job, bank lirik Qosidah, dan pengumuman.</span>
            </p>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="space-y-3">
          <GlassButton
            variant="primary"
            fullWidth
            onClick={handleCheckStatus}
            isLoading={isChecking}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Cek Status Persetujuan
          </GlassButton>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#525D58] hover:text-[#151917] hover:bg-black/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar & Ganti Akun</span>
          </button>
        </div>

        {/* Footer info */}
        <footer className="mt-8 text-xs text-[#525D58] opacity-75">
          Khidmah Lil Ummah • Hadroh Khoirunnada
        </footer>
      </div>
    </div>
  );
}
