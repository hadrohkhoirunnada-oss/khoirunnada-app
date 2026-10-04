'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Save,
  Tag,
  Share2,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassStatusBadge } from '@/components/ui/GlassStatusBadge';
import { GlassModal } from '@/components/ui/GlassModal';
import { BookingStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: BookingStatus }[] = [
  { label: 'Baru', value: 'new' },
  { label: 'Sudah Dihubungi', value: 'contacted' },
  { label: 'Negosiasi', value: 'negotiation' },
  { label: 'Menunggu DP', value: 'waiting_dp' },
  { label: 'Terkonfirmasi', value: 'confirmed' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' },
  { label: 'Ditolak', value: 'rejected' },
];

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, bookings, updateBookingStatus, convertBookingToJob } = useAppStore();

  const bookingId = params?.id as string;
  const booking = bookings.find((b) => b.id === bookingId);

  const [status, setStatus] = useState<BookingStatus>(booking?.status || 'new');
  const [adminNotes, setAdminNotes] = useState(booking?.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Conversion form state
  const [gatherTime, setGatherTime] = useState('18:30 WITA');
  const [dressCode, setDressCode] = useState('Gamis Putih, Jas Hitam Khoirunnada');
  const [transportInfo, setTransportInfo] = useState('Kumpul di Markaz Khoirunnada');
  const [isConverting, setIsConverting] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!booking) {
    return (
      <MobileAppShell title="Booking Tidak Ditemukan" showBack backHref="/app/admin/bookings">
        <div className="text-center py-12">
          <p className="text-sm text-[#9E9885] mb-4">
            Data booking tidak ditemukan atau telah dihapus.
          </p>
          <GlassButton variant="primary" onClick={() => router.push('/app/admin/bookings')}>
            Kembali ke Daftar Booking
          </GlassButton>
        </div>
      </MobileAppShell>
    );
  }

  const cleanPhone = booking.customer_phone.replace(/\D/g, '').replace(/^0/, '62');
  const waMessage = `Assalamu'alaikum Kak ${booking.customer_name}.

Kami dari Hadroh Khoirunnada.

Kami telah menerima permintaan booking untuk acara ${booking.event_type} pada tanggal ${booking.event_date}.

Kami ingin melakukan konfirmasi lebih lanjut terkait ketersediaan jadwal dan rincian acara tersebut.

Terima kasih.`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  const handleSaveStatus = async () => {
    setIsSaving(true);
    setActionError('');
    try {
      await updateBookingStatus(booking.id, status, adminNotes);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Status booking gagal disimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConvert = async () => {
    setIsConverting(true);
    setActionError('');
    try {
      await convertBookingToJob(booking.id, {
        gather_time: gatherTime,
        dress_code: dressCode,
        transport_info: transportInfo,
      });
      setIsConvertModalOpen(false);
      router.push('/app/admin/jobs');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Booking gagal dijadikan job.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <MobileAppShell
      title={`Detail ${booking.booking_code}`}
      subtitle={booking.customer_name}
      showBack
      backHref="/app/admin/bookings"
    >
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
          {actionError}
        </div>
      )}
      {/* 1. Header Information */}
      <GlassCard className="p-5 mb-4 !bg-[#141B18]/95 !border-[#B58228]/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]" variant="elevated">
        <div className="flex items-center justify-between gap-2 mb-2">
          <GlassStatusBadge status={booking.status} />
          <span className="font-mono text-xs font-bold text-[#E6C687]">
            {booking.booking_code}
          </span>
        </div>

        <h2 className="text-lg font-bold text-[#F8F6F0] mb-0.5">{booking.customer_name}</h2>
        <p className="text-xs text-[#D4A346] font-semibold mb-4">
          Acara: {booking.event_type} {booking.event_name ? `(${booking.event_name})` : ''}
        </p>

        {/* WhatsApp CTA */}
        <div className="mb-4">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Hubungi via WhatsApp Pelanggan</span>
            </button>
          </a>
          <p className="text-[10px] text-[#9E9885] text-center mt-1.5">
            Membuka template pesan WhatsApp resmi Hadroh Khoirunnada
          </p>
        </div>

        {/* Booking Conversion CTA */}
        {booking.converted_job_id ? (
          <div className="p-3 rounded-xl bg-[#B58228]/15 border border-[#B58228]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4A346]" />
              <span className="text-xs font-bold text-[#E6C687]">Telah Dikonversi Jadi Job</span>
            </div>
            <button
              onClick={() => router.push('/app/admin/jobs')}
              className="text-xs font-semibold text-[#D4A346] hover:underline cursor-pointer"
            >
              Buka Job di Admin
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConvertModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0D1210] border border-[#B58228]/35 text-[#E6C687] hover:bg-[#B58228]/15 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Konfirmasi Sebagai Job Resmi</span>
            <ArrowRight className="w-4 h-4 text-[#D4A346]" />
          </button>
        )}
      </GlassCard>

      {/* 2. Event & Customer Details */}
      <GlassCard className="p-5 mb-4 space-y-3 !bg-[#141B18]/90 !border-[#B58228]/25" variant="elevated">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9885] mb-1">
          Rincian Permintaan Acara
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15">
            <span className="text-[10px] text-[#807A6B] block">Tanggal Acara</span>
            <span className="font-bold text-[#F8F6F0]">{booking.event_date}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15">
            <span className="text-[10px] text-[#807A6B] block">Waktu Mulai</span>
            <span className="font-bold text-[#F8F6F0]">{booking.event_time}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15 text-xs space-y-1">
          <span className="text-[10px] text-[#807A6B] block">Lokasi Acara</span>
          <p className="font-bold text-[#F8F6F0] flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D4A346] shrink-0 mt-0.5" />
            <span>{booking.location}</span>
          </p>
          {booking.location_detail && (
            <p className="text-[11px] text-[#9E9885] pl-5">Patokan: {booking.location_detail}</p>
          )}
        </div>

        {booking.notes && (
          <div className="p-3 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15 text-xs">
            <span className="text-[10px] text-[#807A6B] block mb-0.5">Catatan Khusus Pemesan</span>
            <p className="text-[#9E9885] italic">“{booking.notes}”</p>
          </div>
        )}
      </GlassCard>

      {/* 3. Status Management & Admin Notes */}
      <GlassCard className="p-5 mb-4 space-y-3 !bg-[#141B18]/90 !border-[#B58228]/25" variant="elevated">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E9885]">
          Status & Catatan Internal Admin
        </h3>

        <div>
          <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5">Ubah Status Booking</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0] focus:outline-none focus:border-[#D4A346]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0D1210] text-[#F8F6F0]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5">
            Catatan Internal Pengurus
          </label>
          <textarea
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Catatan negosiasi harga, DP yang sudah masuk, kontak PJ acara..."
            className="w-full px-3 py-2.5 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0] placeholder:text-[#807A6B] focus:outline-none focus:border-[#D4A346]"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveStatus}
          disabled={isSaving}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] hover:from-[#C89230] hover:to-[#B58228] text-[#070908] font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#070908]" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Status'}</span>
        </button>
      </GlassCard>

      {/* Modal Convert to Job */}
      <GlassModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Konversi Booking ke Job Resmi"
        subtitle="Jadikan Jadwal Hadroh Khoirunnada"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Jam Kumpul / Standby:</label>
            <input
              type="text"
              value={gatherTime}
              onChange={(e) => setGatherTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Seragam / Dresscode:</label>
            <input
              type="text"
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Informasi Titik Kumpul:</label>
            <input
              type="text"
              value={transportInfo}
              onChange={(e) => setTransportInfo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsConvertModalOpen(false)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-[#9E9885] hover:text-[#F8F6F0] font-semibold text-xs"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold text-xs shadow-md"
            >
              {isConverting ? 'Mengonversi...' : 'Buat Job Resmi'}
            </button>
          </div>
        </div>
      </GlassModal>
    </MobileAppShell>
  );
}
