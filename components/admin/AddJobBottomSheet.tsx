'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Users,
  Shirt,
  Phone,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface AddJobBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventType?: string;
}

const EVENT_TYPE_OPTIONS = [
  'Pernikahan',
  'Maulid Nabi',
  'Pengajian Akbar',
  'Khitanan',
  'Haflah Sholawat',
  'Haul & Tasyakuran',
  'Acara Resmi',
];

export function AddJobBottomSheet({
  isOpen,
  onClose,
  defaultEventType = 'Pernikahan',
}: AddJobBottomSheetProps) {
  const { createJob } = useAppStore();

  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState(defaultEventType);
  const [eventDate, setEventDate] = useState('');
  const [gatherTime, setGatherTime] = useState('19:00 WITA');
  const [startTime, setStartTime] = useState('20:00 WITA');
  const [location, setLocation] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [dressCode, setDressCode] = useState('Gamis Putih, Jas Hitam Khoirunnada');
  const [transportInfo, setTransportInfo] = useState('Kumpul di Markaz Hadroh Khoirunnada');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let frame = 0;
    if (isOpen) {
      frame = window.requestAnimationFrame(() => {
        setIsMounted(true);
        setIsClosing(false);
        setIsSuccess(false);
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSmoothClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsMounted(false);
      onClose();
    }, 280);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Nama / Judul acara wajib diisi.');
      return;
    }
    if (!eventDate) {
      setErrorMsg('Tanggal acara wajib ditentukan.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Lokasi acara wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createJob({
        title: title.trim(),
        event_type: eventType,
        customer_name: customerName.trim() || 'Internal Khoirunnada',
        customer_phone: customerPhone.trim() || '-',
        event_date: eventDate,
        gather_time: gatherTime.trim(),
        start_time: startTime.trim(),
        location: location.trim(),
        maps_url: 'https://maps.google.com/?q=' + encodeURIComponent(location.trim()),
        dress_code: dressCode.trim(),
        transport_info: transportInfo.trim(),
        notes: notes.trim(),
        status: 'upcoming',
      });
      setIsSuccess(true);
      setTimeout(() => {
        handleSmoothClose();
        setTitle('');
        setLocation('');
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        setIsSuccess(false);
      }, 650);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Job gagal diterbitkan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Backdrop Scrim with Blur */}
      <div
        onClick={handleSmoothClose}
        className={`fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
      />

      {/* Bottom Sheet Container (Tidak Full Layar, Rounded Top, Smooth Slide) */}
      <div
        className={`relative w-full max-w-[440px] bg-[#121715] text-[#F8F6F0] rounded-t-[32px] border-t border-[#B58228]/40 shadow-[0_-12px_45px_rgba(0,0,0,0.7)] z-10 max-h-[85vh] flex flex-col overflow-hidden ${
          isClosing ? 'animate-slide-down-sheet' : 'animate-slide-up-sheet'
        }`}
      >
        {/* Top Drag Indicator Pill */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={handleSmoothClose}>
          <div className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors" />
        </div>

        {/* Header Sheet */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-white/10 shrink-0 bg-[#121715]/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#996A19] to-[#D4A346] text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5 stroke-[2.2px]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B58228] px-1.5 py-0.5 rounded-md bg-[#B58228]/15 border border-[#B58228]/30">
                  Admin Panel
                </span>
                <span className="text-[10px] text-[#A69E8F]">Job Baru</span>
              </div>
              <h3 className="text-base font-extrabold text-[#F8F6F0] tracking-tight mt-0.5 font-serif">
                Tambah Jadwal Job
              </h3>
            </div>
          </div>

          <button
            onClick={handleSmoothClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Tutup Popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-bold text-emerald-300">Job Berhasil Diterbitkan!</h4>
            <p className="text-xs text-[#A69E8F] max-w-xs">
              Jadwal telah ditambahkan ke sistem dan pengumuman disiarkan ke seluruh anggota.
            </p>
          </div>
        ) : (
          /* Form Content (Scrollable) */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Nama / Judul Acara */}
            <div>
              <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5">
                Nama / Judul Acara <span className="text-[#B58228]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Walimatul Ursy Ahmad & Fatimah"
                className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-[#B58228]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#B58228] focus:ring-2 focus:ring-[#B58228]/25 transition-all"
                required
              />
            </div>

            {/* 2. Jenis / Kategori Acara (Chips Selector) */}
            <div>
              <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#B58228]" />
                <span>Kategori Acara</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPE_OPTIONS.map((item) => {
                  const isSelected = eventType === item;
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setEventType(item)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#996A19] text-white shadow-xs border border-[#F3E6C8]/40 scale-102'
                          : 'bg-[#18201D] text-[#A69E8F] border border-white/10 hover:border-white/25'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Tanggal & Jam */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#B58228]" />
                  <span>Tanggal <span className="text-[#B58228]">*</span></span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#18201D] text-[#F8F6F0] border border-[#B58228]/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B58228]" />
                  <span>Jam Kumpul</span>
                </label>
                <input
                  type="text"
                  value={gatherTime}
                  onChange={(e) => setGatherTime(e.target.value)}
                  placeholder="19:00 WITA"
                  className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-[#B58228]/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jam Mulai Acara</span>
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="20:00 WITA"
                className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-[#B58228]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all"
              />
            </div>

            {/* 4. Lokasi Acara */}
            <div>
              <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B58228]" />
                <span>Lokasi Acara <span className="text-[#B58228]">*</span></span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Gedung Al-Ikhlas, Jl. Melati No. 12"
                className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-[#B58228]/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#B58228] transition-all"
                required
              />
            </div>

            {/* 5. Tuan Rumah / Kontak Pemesan (Opsional) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5">
                  Nama Tuan Rumah
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Bpk. H. Sukardi"
                  className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-white/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#B58228]" />
                  <span>No. WhatsApp</span>
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-white/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all"
                />
              </div>
            </div>

            {/* 6. Seragam & Transportasi */}
            <div>
              <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5 text-[#B58228]" />
                <span>Dress Code Seragam</span>
              </label>
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="Gamis Putih, Jas Hitam Khoirunnada"
                className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-white/15 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#B58228]" />
                <span>Info Titik Kumpul / Transport</span>
              </label>
              <input
                type="text"
                value={transportInfo}
                onChange={(e) => setTransportInfo(e.target.value)}
                placeholder="Kumpul di Markaz Hadroh Khoirunnada"
                className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-white/15 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all"
              />
            </div>

            {/* 7. Catatan Tambahan */}
            <div>
              <label className="block text-xs font-bold text-[#F8F6F0] mb-1.5">
                Catatan Tambahan
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan khusus untuk personel (contoh: bawa terbang cadangan, dsb)"
                rows={2}
                className="w-full bg-[#18201D] text-[#F8F6F0] placeholder-[#706B60] border border-white/15 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#B58228] transition-all resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 pb-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#996A19] via-[#B58228] to-[#996A19] text-white font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(153,106,25,0.45)] border border-[#F3E6C8]/40 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F8F6F0]" />
                <span>{isSubmitting ? 'Menyimpan Jadwal...' : 'Terbitkan Jadwal Job Sekarang'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
