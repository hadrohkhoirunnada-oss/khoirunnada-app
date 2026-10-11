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

export default function AdminBroadcastAnnouncementPage() {
  const router = useRouter();
  const { currentUser, sendAnnouncement, notifications } = useAppStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setSendError('');
    try {
      // Selalu siarkan ke SEMUA ANGGOTA
      await sendAnnouncement(title.trim(), message.trim(), 'all');
      setSentSuccess(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSentSuccess(false), 4000);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Pengumuman gagal dikirim.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <MobileAppShell
      title="Siarkan Pengumuman"
      subtitle="Kirim Notifikasi ke Semua Anggota"
      showBack
      backHref="/app/admin"
    >
      <GlassCard className="p-5 sm:p-6 mb-5 !bg-[#FFFFFF]/95 !border-[#B58228]/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]" variant="elevated">
        {sentSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-800 flex items-center gap-2 mb-4 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Pengumuman berhasil disiarkan ke seluruh perangkat pemain & pengurus!</span>
          </div>
        )}

        {sendError && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/40 text-xs text-red-800 mb-4">
            {sendError}
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#151917] mb-1.5">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Latihan Rutin Malam Jumat"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#B58228]/30 text-xs text-[#151917] placeholder:text-[#585145] focus:outline-none focus:border-[#996A19]"
            />
          </div>

          {/* Target Siaran: Khusus Semua Anggota */}
          <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#B58228]/35 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-lg bg-[#B58228]/20 flex items-center justify-center text-[#70490E]">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-[#151917]">Penerima: Khusus Semua Anggota</span>
            </div>
            <p className="text-[11px] text-[#585145] leading-relaxed">
              Pengumuman akan langsung disiarkan ke seluruh akun anggota (pemain & pengurus), memunculkan badge notifikasi merah di icon lonceng portal Pemain.
            </p>
          </div>

          <div>
            <label className="block font-bold text-[#151917] mb-1.5">
              Isi Pesan Siaran *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pesan lengkap mengenai jadwal, perlengkapan seragam, atau arahan majelis..."
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#B58228]/30 text-xs text-[#151917] placeholder:text-[#585145] focus:outline-none focus:border-[#996A19]"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#996A19] to-[#70490E] hover:from-[#70490E] hover:to-[#996A19] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-white" />
            <span>{isSending ? 'Mengirim Siaran...' : 'Siarkan Sekarang ke Semua Anggota'}</span>
          </button>
        </form>
      </GlassCard>

      {/* History Broadcasts */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145] px-1 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-[#70490E]" />
          <span>Histori Pengumuman Terakhir</span>
        </h3>

        <div className="space-y-2">
          {notifications
            .filter((n) => n.type === 'announcement')
            .map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-[#FFFFFF]/90 border border-[#B58228]/20 text-xs space-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#70490E] text-xs">{notif.title}</span>
                  <span className="text-[10px] text-[#585145]">
                    {new Date(notif.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-[#585145] text-xs leading-relaxed">{notif.message}</p>
              </div>
            ))}
        </div>
      </section>
    </MobileAppShell>
  );
}
