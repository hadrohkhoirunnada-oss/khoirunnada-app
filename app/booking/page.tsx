'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Phone, MapPin, Clock, FileText, Send, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

const EVENT_TYPES = [
  'Pernikahan',
  'Walimatul Ursy',
  'Maulid Nabi',
  'Aqiqah',
  'Pengajian',
  'Haflah',
  'Khitan',
  'Majelis',
  'Acara Instansi',
  'Lainnya',
];

export default function BookingPage() {
  const router = useRouter();
  const { createBooking } = useAppStore();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    event_type: 'Pernikahan',
    event_name: '',
    event_date: '',
    event_time: '19:30',
    location: '',
    location_detail: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Nama pemesan wajib diisi.';
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Nomor WhatsApp wajib diisi.';
    } else if (formData.customer_phone.length < 8) {
      newErrors.customer_phone = 'Nomor WhatsApp tidak valid.';
    }
    if (!formData.event_type) newErrors.event_type = 'Pilih jenis acara.';
    if (!formData.event_date) newErrors.event_date = 'Tanggal acara wajib diisi.';
    if (!formData.location.trim()) newErrors.location = 'Lokasi / alamat acara wajib diisi.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await createBooking({
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        event_type: formData.event_type,
        event_name: formData.event_name.trim() || undefined,
        event_date: formData.event_date,
        event_time: formData.event_time.trim(),
        location: formData.location.trim(),
        location_detail: formData.location_detail.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      router.push(`/booking/success?code=${created.booking_code}&name=${encodeURIComponent(created.customer_name)}`);
    } catch (submitError) {
      setErrors({
        submit:
          submitError instanceof Error
            ? submitError.message
            : 'Booking belum dapat disimpan. Silakan coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-start p-4 antialiased text-[#151917]">
      <div className="w-full max-w-lg">
        {/* Top Header */}
        <div className="flex items-center justify-between py-4 mb-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[#996A19] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-xs text-[#525D58] font-medium">Layanan Publik</span>
        </div>

        {/* Hero Branding Container */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
            <img src="/logo-khoirunnada-192.png" alt="Logo Hadroh Khoirunnada" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#151917] mb-1 font-serif">
            Booking Hadroh Khoirunnada
          </h1>
          <p className="text-xs sm:text-sm text-[#525D58] max-w-sm mx-auto leading-relaxed">
            Silakan lengkapi formulir di bawah ini. Pengurus Khoirunnada akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi ketersediaan jadwal.
          </p>
        </div>

        {/* Booking Form Card */}
        <GlassCard className="p-6 sm:p-8" variant="elevated">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="rounded-xl border border-[#C84A45]/30 bg-[#C84A45]/10 p-3 text-xs text-[#A12B26]">
                {errors.submit}
              </div>
            )}
            {/* Nama Pemesan */}
            <div>
              <label className="block text-xs font-bold text-[#151917] mb-1.5">
                Nama Pemesan / Sohibul Hajat <span className="text-[#C84A45]">*</span>
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Contoh: H. Ahmad Zarkasyi"
                className={`glass-input ${errors.customer_name ? 'border-[#C84A45] ring-1 ring-[#C84A45]/30' : ''}`}
                disabled={isSubmitting}
              />
              {errors.customer_name && (
                <p className="text-xs text-[#C84A45] mt-1">{errors.customer_name}</p>
              )}
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-[#151917] mb-1.5">
                Nomor WhatsApp Aktif <span className="text-[#C84A45]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className={`glass-input ${errors.customer_phone ? 'border-[#C84A45] ring-1 ring-[#C84A45]/30' : ''}`}
                  disabled={isSubmitting}
                />
                <Phone className="w-4 h-4 text-[#525D58] absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.customer_phone && (
                <p className="text-xs text-[#C84A45] mt-1">{errors.customer_phone}</p>
              )}
            </div>

            {/* Jenis Acara & Nama Acara */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#151917] mb-1.5">
                  Jenis Acara <span className="text-[#C84A45]">*</span>
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="glass-input cursor-pointer"
                  disabled={isSubmitting}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151917] mb-1.5">
                  Nama / Judul Acara <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  placeholder="Contoh: Walimatul Ursy Putri Kami"
                  className="glass-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Tanggal & Waktu Acara */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#151917] mb-1.5">
                  Tanggal Acara <span className="text-[#C84A45]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className={`glass-input ${errors.event_date ? 'border-[#C84A45]' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.event_date && (
                  <p className="text-xs text-[#C84A45] mt-1">{errors.event_date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151917] mb-1.5">
                  Perkiraan Jam Mulai <span className="text-[#C84A45]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="glass-input"
                    disabled={isSubmitting}
                  />
                  <Clock className="w-4 h-4 text-[#525D58] absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Lokasi Acara */}
            <div>
              <label className="block text-xs font-bold text-[#151917] mb-1.5">
                Lokasi / Alamat Acara <span className="text-[#C84A45]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Gedung Graha Sakinah / Masjid Baiturrahman"
                  className={`glass-input ${errors.location ? 'border-[#C84A45]' : ''}`}
                  disabled={isSubmitting}
                />
                <MapPin className="w-4 h-4 text-[#525D58] absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.location && (
                <p className="text-xs text-[#C84A45] mt-1">{errors.location}</p>
              )}
            </div>

            {/* Detail Lokasi */}
            <div>
              <label className="block text-xs font-bold text-[#151917] mb-1.5">
                Detail Patokan Lokasi <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={formData.location_detail}
                onChange={(e) => setFormData({ ...formData, location_detail: e.target.value })}
                placeholder="Contoh: Lantai 2 Ballroom / Samping Puskesmas"
                className="glass-input"
                disabled={isSubmitting}
              />
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-bold text-[#151917] mb-1.5">
                Catatan Khusus <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Permintaan qosidah khusus, durasi acara, atau hal penting lainnya..."
                rows={3}
                className="glass-input resize-none py-2.5"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <GlassButton
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                icon={<Send className="w-4 h-4" />}
              >
                Kirim Permintaan Booking
              </GlassButton>
            </div>

            <p className="text-center text-[11px] text-[#525D58] pt-1">
              Data Anda aman dan hanya digunakan oleh pengurus Khoirunnada untuk keperluan konfirmasi acara.
            </p>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
