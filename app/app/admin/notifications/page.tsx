'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function AdminBroadcastAnnouncementPage() {
  const router = useRouter();
  const { currentUser, sendAnnouncement, notifications } = useAppStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'member' | 'treasurer' | 'admin'>('all');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setSendError('');
    try {
      await sendAnnouncement(title.trim(), message.trim(), targetType);
      setSentSuccess(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSentSuccess(false), 3000);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Pengumuman gagal dikirim.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MobileAppShell
      title="Siarkan Pengumuman"
      subtitle="Kirim Notifikasi ke Anggota"
      showBack
      backHref="/app/admin"
    >
      <GlassCard className="p-5 sm:p-6 mb-5 !bg-[#141B18]/95 !border-[#B58228]/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]" variant="elevated">
        {sentSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Pengumuman berhasil disiarkan ke seluruh perangkat anggota!</span>
          </div>
        )}

        {sendError && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-xs text-red-200 mb-4">
            {sendError}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1.5">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Latihan Rutin Malam Jumat"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0] placeholder:text-[#807A6B] focus:outline-none focus:border-[#D4A346]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1.5">
              Target Penerima Notifikasi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  targetType === 'all'
                    ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold border-transparent shadow-xs'
                    : 'bg-[#0D1210] text-[#9E9885] border-[#B58228]/25 hover:text-[#F8F6F0]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Semua Anggota</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('member')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  targetType === 'member'
                    ? 'bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold border-transparent shadow-xs'
                    : 'bg-[#0D1210] text-[#9E9885] border-[#B58228]/25 hover:text-[#F8F6F0]'
                }`}
              >
                <span>Hanya Pemain</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1.5">
              Isi Pesan Siaran *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pesan lengkap mengenai jadwal, perlengkapan seragam, atau arahan majelis..."
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0] placeholder:text-[#807A6B] focus:outline-none focus:border-[#D4A346]"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] hover:from-[#C89230] hover:to-[#B58228] text-[#070908] font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#070908]" />
            <span>{isSending ? 'Mengirim Siaran...' : 'Siarkan Sekarang'}</span>
          </button>
        </form>
      </GlassCard>

      {/* History Broadcasts */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9885] px-1 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-[#D4A346]" />
          <span>Histori Pengumuman Terakhir</span>
        </h3>

        <div className="space-y-2">
          {notifications
            .filter((n) => n.type === 'announcement')
            .map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-[#141B18]/90 border border-[#B58228]/20 text-xs space-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E6C687] text-xs">{notif.title}</span>
                  <span className="text-[10px] text-[#807A6B]">
                    {new Date(notif.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-[#9E9885] text-xs leading-relaxed">{notif.message}</p>
              </div>
            ))}
        </div>
      </section>
    </MobileAppShell>
  );
}
