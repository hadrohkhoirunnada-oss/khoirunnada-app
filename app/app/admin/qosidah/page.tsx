'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Save,
  Check,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassModal } from '@/components/ui/GlassModal';

export default function AdminQosidahCMSPage() {
  const router = useRouter();
  const { currentUser, qosidahs, categories, createQosidah, refreshData } = useAppStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [alternateTitle, setAlternateTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [arabicText, setArabicText] = useState('');
  const [latinText, setLatinText] = useState('');
  const [translation, setTranslation] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsStr, setTagsStr] = useState('Sholawat, Favorit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !arabicText.trim() || !latinText.trim()) return;

    setIsSubmitting(true);
    setFormError('');
    const cat = categories.find((c) => c.id === categoryId) || categories[0];
    if (!cat) {
      setFormError('Kategori qosidah belum tersedia di database.');
      setIsSubmitting(false);
      return;
    }

    try {
      await createQosidah({
        title: title.trim(),
        alternate_title: alternateTitle.trim() || undefined,
        category_id: cat.id,
        category_name: cat.name,
        arabic_text: arabicText.trim(),
        latin_text: latinText.trim(),
        translation: translation.trim(),
        notes: notes.trim() || undefined,
        tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
        sort_order: qosidahs.length + 1,
      });

      setIsAddModalOpen(false);
      setTitle('');
      setAlternateTitle('');
      setArabicText('');
      setLatinText('');
      setTranslation('');
      setNotes('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Qosidah gagal disimpan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, qTitle: string) => {
    if (!confirm(`Hapus lirik qosidah "${qTitle}" dari database?`)) return;
    try {
      const res = await fetch(`/api/qosidah?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus qosidah');
      await refreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus');
    }
  };

  return (
    <MobileAppShell
      title="Bank Lirik Qosidah"
      subtitle={`${qosidahs.length} judul terarsip`}
      showBack
      backHref="/app/admin"
      rightAction={
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#070908]" />
          <span>Tambah Lirik</span>
        </button>
      }
    >
      <div className="space-y-3">
        {qosidahs.map((qos) => (
          <GlassCard key={qos.id} className="p-4 sm:p-5 !bg-[#141B18]/90 !border-[#B58228]/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" variant="elevated">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B58228]/15 text-[#E6C687] border border-[#B58228]/30">
                {qos.category_name || 'Sholawat'}
              </span>
              <span className="text-[10px] font-mono text-[#807A6B]">Urutan #{qos.sort_order}</span>
            </div>

            <h3 className="text-sm font-bold text-[#F8F6F0] mb-0.5">{qos.title}</h3>
            {qos.alternate_title && (
              <p className="text-xs text-[#9E9885] italic mb-2">
                Judul lain: {qos.alternate_title}
              </p>
            )}

            {/* Arabic preview snippet */}
            <div className="p-3 rounded-xl bg-[#0D1210]/90 border border-[#B58228]/15 text-right font-serif text-sm text-[#E6C687] leading-loose my-2 line-clamp-2">
              {qos.arabic_text}
            </div>

            <p className="text-xs text-[#9E9885] line-clamp-1 italic mb-3">
              {qos.latin_text}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[#B58228]/15 text-xs">
              <div className="flex flex-wrap gap-1">
                {qos.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#0D1210] border border-[#B58228]/20 text-[#D4A346]"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold text-[#E6C687] flex items-center gap-0.5">
                  <span>Tersimpan di DB</span>
                  <Check className="w-3.5 h-3.5 text-[#D4A346]" />
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(qos.id, qos.title)}
                  className="p-1 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
                  title="Hapus Lirik"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal Add Qosidah */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Lirik Qosidah Baru"
        subtitle="Arsip Bank Hadroh Khoirunnada"
      >
        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          {formError && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-red-200">
              {formError}
            </div>
          )}
          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Judul Utama *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ya Thoybah"
              required
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Judul Alternatif (Opsional)</label>
            <input
              type="text"
              value={alternateTitle}
              onChange={(e) => setAlternateTitle(e.target.value)}
              placeholder="Contoh: Ya Ali Yabna Abi Tholib"
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Kategori Qosidah</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0D1210] text-[#F8F6F0]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Teks Arab Lengkap *</label>
            <textarea
              rows={4}
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              dir="rtl"
              placeholder="يَا طَيْبَةُ يَا طَيْبَةُ يَا دَوَاءَ الْعَيَانَا..."
              required
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-sm font-serif text-[#F8F6F0] text-right"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Transliterasi Latin *</label>
            <textarea
              rows={3}
              value={latinText}
              onChange={(e) => setLatinText(e.target.value)}
              placeholder="Ya Thoybah ya thoybah, ya dawal 'ayana..."
              required
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F8F6F0] mb-1">Terjemahan Indonesia</label>
            <textarea
              rows={2}
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Wahai penyejuk hati..."
              className="w-full px-3 py-2 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-xs text-[#F8F6F0]"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0D1210] border border-[#B58228]/30 text-[#9E9885] hover:text-[#F8F6F0] font-semibold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#B58228] to-[#996A19] text-[#070908] font-bold text-xs shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Qosidah'}
            </button>
          </div>
        </form>
      </GlassModal>
    </MobileAppShell>
  );
}
