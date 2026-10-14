'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  ClipboardList,
  FileText,
  LoaderCircle,
  Save,
  Trash2,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassModal } from '@/components/ui/GlassModal';
import { createClient } from '@/lib/supabase/client';
import {
  DEFAULT_DEVELOPER_WHATSAPP,
  formatQosidahDraftsToWhatsApp,
  generateWhatsAppUrl,
  type QosidahDraft,
} from '@/lib/whatsapp-qosidah';

const QOSIDAH_CATEGORIES = [
  { id: 'qosidah-arobiah', name: "Qosidah 'Arobiah" },
  { id: 'qosidah-jawa', name: 'Qosidah Jawa' },
  { id: 'qosidah-indonesia', name: 'Qosidah Indonesia' },
] as const;

type QosidahCategoryId = (typeof QOSIDAH_CATEGORIES)[number]['id'];

type Notice = {
  kind: 'success' | 'error';
  message: string;
};

export default function TambahQosidahPage() {
  const supabase = createClient();
  const arabicTextRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<QosidahCategoryId>(QOSIDAH_CATEGORIES[0].id);
  const [arabicText, setArabicText] = useState('');
  const [drafts, setDrafts] = useState<QosidahDraft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(Boolean(supabase));
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [modalStep, setModalStep] = useState<0 | 1 | 2>(0);
  const [notice, setNotice] = useState<Notice | null>(null);

  const showNotice = useCallback((nextNotice: Notice) => {
    setNotice(nextNotice);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    if (!supabase) return;

    let isCancelled = false;
    const fetchDrafts = async () => {
      const { data, error } = await supabase
        .from('qosidah_drafts')
        .select('id,title,category_id,category_name,arabic_text,created_by,created_at')
        .order('created_at', { ascending: true });

      if (isCancelled) return;

      if (error) {
        showNotice({ kind: 'error', message: 'Daftar draf belum dapat dimuat. Coba muat ulang halaman.' });
      } else {
        setDrafts((data ?? []) as QosidahDraft[]);
      }
      setIsLoadingDrafts(false);
    };

    void fetchDrafts();

    return () => {
      isCancelled = true;
    };
  }, [showNotice, supabase]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanArabicText = arabicText.trim();

    if (!cleanTitle || !cleanArabicText) {
      showNotice({ kind: 'error', message: 'Judul dan teks Arab wajib diisi.' });
      return;
    }

    if (!supabase) {
      showNotice({ kind: 'error', message: 'Konfigurasi Supabase belum tersedia.' });
      return;
    }

    const category = QOSIDAH_CATEGORIES.find((item) => item.id === categoryId);
    if (!category) {
      showNotice({ kind: 'error', message: 'Kategori qosidah tidak valid.' });
      return;
    }

    setIsSaving(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsSaving(false);
      showNotice({ kind: 'error', message: 'Sesi login telah berakhir. Silakan masuk kembali.' });
      return;
    }

    const { data, error } = await supabase
      .from('qosidah_drafts')
      .insert({
        title: cleanTitle,
        category_id: category.id,
        category_name: category.name,
        arabic_text: cleanArabicText,
        created_by: user.id,
      })
      .select('id,title,category_id,category_name,arabic_text,created_by,created_at')
      .single();

    setIsSaving(false);
    if (error || !data) {
      showNotice({ kind: 'error', message: 'Draf gagal disimpan. Silakan coba lagi.' });
      return;
    }

    setDrafts((current) => [...current, data as QosidahDraft]);
    setTitle('');
    setCategoryId(QOSIDAH_CATEGORIES[0].id);
    setArabicText('');
    showNotice({ kind: 'success', message: 'Qosidah berhasil disimpan ke antrean draf.' });
  };

  const handleDelete = async (draftId: string) => {
    if (!supabase || deletingId) return;

    setDeletingId(draftId);
    const { error } = await supabase.from('qosidah_drafts').delete().eq('id', draftId);
    setDeletingId(null);

    if (error) {
      showNotice({ kind: 'error', message: 'Draf gagal dihapus. Silakan coba lagi.' });
      return;
    }

    setDrafts((current) => current.filter((draft) => draft.id !== draftId));
    showNotice({ kind: 'success', message: 'Draf dibatalkan dan telah dihapus.' });
  };

  const handlePasteArabicText = async () => {
    if (!navigator.clipboard?.readText) {
      showNotice({
        kind: 'error',
        message: 'Browser tidak mengizinkan akses clipboard. Tempelkan teks secara manual.',
      });
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) {
        showNotice({ kind: 'error', message: 'Clipboard kosong. Salin teks terlebih dahulu.' });
        return;
      }

      const textarea = arabicTextRef.current;
      const selectionStart = textarea?.selectionStart ?? arabicText.length;
      const selectionEnd = textarea?.selectionEnd ?? arabicText.length;
      const nextText =
        arabicText.slice(0, selectionStart) + clipboardText + arabicText.slice(selectionEnd);
      const nextCursorPosition = selectionStart + clipboardText.length;

      setArabicText(nextText);
      window.requestAnimationFrame(() => {
        arabicTextRef.current?.focus();
        arabicTextRef.current?.setSelectionRange(nextCursorPosition, nextCursorPosition);
      });
      showNotice({ kind: 'success', message: 'Teks dari clipboard berhasil ditempel.' });
    } catch {
      showNotice({
        kind: 'error',
        message: 'Clipboard tidak dapat dibaca. Izinkan akses clipboard atau tempelkan teks secara manual.',
      });
    }
  };

  const handleOpenSummary = () => {
    if (drafts.length === 0) {
      showNotice({ kind: 'error', message: 'Draf kosong. Simpan qosidah sebelum mengirim.' });
      return;
    }
    setModalStep(1);
  };

  const handleSend = async () => {
    if (!supabase || drafts.length === 0 || isSending) return;

    const draftIds = drafts.map((draft) => draft.id);
    const message = formatQosidahDraftsToWhatsApp(drafts);
    const whatsappUrl = generateWhatsAppUrl(DEFAULT_DEVELOPER_WHATSAPP, message);
    const whatsappWindow = window.open('', '_blank');

    if (!whatsappWindow) {
      showNotice({
        kind: 'error',
        message: 'WhatsApp diblokir oleh browser. Izinkan pop-up lalu coba kembali.',
      });
      return;
    }
    whatsappWindow.opener = null;
    whatsappWindow.location.href = whatsappUrl;

    setIsSending(true);
    const { error } = await supabase.from('qosidah_drafts').delete().in('id', draftIds);
    setIsSending(false);

    if (error) {
      showNotice({
        kind: 'error',
        message: 'WhatsApp sudah dibuka, tetapi database belum berhasil dibersihkan.',
      });
      return;
    }

    setDrafts([]);
    setModalStep(0);
    showNotice({
      kind: 'success',
      message: 'Draf berhasil dikirim ke WhatsApp dan database telah dibersihkan.',
    });
  };

  return (
    <MobileAppShell
      title="Tambah Qosidah"
      subtitle="Draf Pengajuan Kitab Qosidah"
      showBack
      backHref="/app/admin/settings"
    >
      <div className="space-y-5">
        {notice && (
          <div
            role="alert"
            className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs shadow-sm ${
              notice.kind === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800'
                : 'border-red-500/30 bg-red-500/10 text-red-800'
            }`}
          >
            {notice.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
        )}

        <GlassCard
          className="overflow-hidden !border-[#B58228]/25 !bg-[#FFFFFF]/95 !p-0 shadow-[0_8px_28px_rgba(112,73,14,0.08)]"
          variant="elevated"
        >
          <div className="flex items-center justify-between border-b border-[#B58228]/15 bg-[#F8F6F0]/70 px-4 py-3.5 sm:px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#996A19]">Langkah 1</p>
              <h2 className="mt-0.5 text-sm font-bold text-[#151917]">Detail Qosidah</h2>
            </div>
            <span className="rounded-full border border-[#B58228]/20 bg-white px-2.5 py-1 text-[9px] font-semibold text-[#70490E]">
              Tiga kolom wajib
            </span>
          </div>

          <form className="space-y-4 p-4 sm:p-5" onSubmit={handleSave}>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="qosidah-title" className="block text-xs font-bold text-[#151917]">
                  Judul Qosidah
                </label>
                <span className="text-[9px] font-medium text-[#996A19]">Wajib diisi</span>
              </div>
              <input
                id="qosidah-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Thohan Nabi..."
                className="glass-input !border-[#B58228]/25 !bg-white/90 !text-sm placeholder:!text-[#8B8378]"
                required
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="qosidah-category" className="block text-xs font-bold text-[#151917]">
                  Kategori Qosidah
                </label>
                <span className="text-[9px] font-medium text-[#996A19]">Pilih satu kategori</span>
              </div>
              <select
                id="qosidah-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value as QosidahCategoryId)}
                className="glass-input !border-[#B58228]/25 !bg-white/90 !text-sm"
              >
                {QOSIDAH_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="qosidah-arabic-text" className="block text-xs font-bold text-[#151917]">
                  Teks Arab
                </label>
                <button
                  type="button"
                  onClick={() => void handlePasteArabicText()}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[#B58228]/25 bg-[#F5EBD7]/70 px-2.5 py-1 text-[10px] font-bold text-[#70490E] transition-colors hover:border-[#B58228]/45 hover:bg-[#F5EBD7] active:bg-[#EEDDB8]"
                  aria-label="Tempel teks Arab dari clipboard"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>Tempel</span>
                </button>
              </div>
              <textarea
                ref={arabicTextRef}
                id="qosidah-arabic-text"
                dir="rtl"
                rows={6}
                value={arabicText}
                onChange={(event) => setArabicText(event.target.value)}
                placeholder="اُكْتُبْ نَصَّ الْقَصِيْدَةِ الْعَرَبِيَّةِ هُنَا..."
                className="glass-input arabic-font min-h-44 resize-y !border-[#B58228]/25 !bg-white/90 !px-4 !py-3 text-lg placeholder:!text-[#8B8378]"
                required
              />
              <p className="mt-1.5 text-[10px] leading-relaxed text-[#70695F]">
                Periksa kembali susunan bait dan harakat sebelum menyimpan draf.
              </p>
            </div>

            <div className="grid gap-2 border-t border-[#B58228]/15 pt-4 sm:grid-cols-2">
              <GlassButton
                type="submit"
                fullWidth
                isLoading={isSaving}
                icon={<Save className="h-4 w-4" />}
              >
                Simpan ke Draf
              </GlassButton>
              <GlassButton
                type="button"
                variant="secondary"
                fullWidth
                disabled={isLoadingDrafts || deletingId !== null || isSaving}
                onClick={handleOpenSummary}
                icon={<WhatsAppIcon className="h-4 w-4" />}
                className="!border-[#25D366]/35 !bg-[#25D366]/10 !text-[#128C7E] hover:!bg-[#25D366]/15"
              >
                Kirim ke Developer (WhatsApp)
              </GlassButton>
            </div>
          </form>
        </GlassCard>

        <section aria-labelledby="draft-list-title">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#B58228]/20 bg-[#B58228]/10 text-[#70490E]">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#996A19]">Langkah 2</p>
                <h2 id="draft-list-title" className="text-sm font-bold text-[#151917]">
                  Antrean Draf Belum Terkirim
                </h2>
              </div>
            </div>
            <span className="rounded-full border border-[#B58228]/25 bg-white px-2.5 py-1 text-[10px] font-bold text-[#70490E] shadow-sm">
              {drafts.length} draf
            </span>
          </div>

          {isLoadingDrafts ? (
            <GlassCard className="flex items-center justify-center gap-2.5 p-8 !border-[#B58228]/20 !bg-white/85 text-xs text-[#585145]">
              <LoaderCircle className="h-4 w-4 animate-spin text-[#996A19]" />
              <span>Memuat antrean draf...</span>
            </GlassCard>
          ) : drafts.length === 0 ? (
            <GlassCard className="border-dashed p-8 text-center !border-[#B58228]/25 !bg-white/75">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EBD7] text-[#996A19]">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[#151917]">Antrean masih kosong</p>
              <p className="mx-auto mt-1 max-w-64 text-[10px] leading-relaxed text-[#585145]">
                Qosidah yang disimpan melalui formulir akan tampil di bagian ini.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft, index) => (
                <GlassCard
                  key={draft.id}
                  className="overflow-hidden !border-[#B58228]/25 !bg-[#FFFFFF]/95 !p-0 shadow-[0_6px_22px_rgba(112,73,14,0.06)]"
                  variant="elevated"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[#B58228]/15 px-4 py-3.5">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#B58228]/10 text-[11px] font-bold text-[#70490E]">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[#151917]">{draft.title}</h3>
                        <span className="mt-1 inline-flex rounded-full border border-[#B58228]/20 bg-[#B58228]/10 px-2 py-0.5 text-[9px] font-semibold text-[#70490E]">
                          {draft.category_name}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(draft.id)}
                      disabled={deletingId !== null}
                      aria-label={`Hapus draf ${draft.title}`}
                      title="Hapus draf"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-700 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                    >
                      {deletingId === draft.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="bg-[#F8F6F0]/70 px-4 py-3">
                    <p className="mb-1 text-left text-[9px] font-bold uppercase tracking-wider text-[#8B6B32]">
                      Cuplikan teks Arab
                    </p>
                    <p dir="rtl" className="arabic-font line-clamp-3 text-base text-[#70490E]">
                      {draft.arabic_text}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      </div>

      <GlassModal
        isOpen={modalStep === 1}
        onClose={() => setModalStep(0)}
        title="Pengajuan Qosidah ke Developer"
        subtitle="Tinjau antrean sebelum melanjutkan"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#B58228]/20 bg-[#F8F6F0] p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#B58228]/10 text-[#70490E]">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#151917]">{drafts.length} qosidah siap dikirim</p>
              <p className="mt-0.5 text-[10px] text-[#585145]">Pastikan judul dan kategori sudah sesuai.</p>
            </div>
          </div>
          <ol className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {drafts.map((draft, index) => (
              <li
                key={draft.id}
                className="flex items-start gap-2 rounded-xl border border-[#B58228]/20 bg-[#F8F6F0] p-3"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B58228]/15 text-[10px] font-bold text-[#70490E]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#151917]">{draft.title}</p>
                  <p className="mt-0.5 text-[10px] text-[#70490E]">{draft.category_name}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <GlassButton type="button" variant="ghost" fullWidth onClick={() => setModalStep(0)}>
              Batal
            </GlassButton>
            <GlassButton
              type="button"
              fullWidth
              onClick={() => setModalStep(2)}
              icon={<WhatsAppIcon className="h-4 w-4" />}
            >
              Lanjutkan
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      <GlassModal
        isOpen={modalStep === 2}
        onClose={() => !isSending && setModalStep(0)}
        title="Peringatan Penting"
        subtitle="Konfirmasi terakhir sebelum pengiriman"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-white/65 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Draf akan dihapus otomatis</p>
                <p className="mt-1 text-[10px] leading-relaxed text-amber-900/80">
                  Tindakan ini membersihkan seluruh qosidah yang tercantum dalam antrean pengiriman.
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[#585145]">
            Setelah menyetujui pengiriman ini ke Developer, seluruh qosidah di daftar draf akan langsung terhapus otomatis dari database sementara. Pastikan data sudah benar sebelum melanjutkan.
          </p>
          <div className="space-y-2 pt-1">
            <GlassButton
              type="button"
              fullWidth
              isLoading={isSending}
              onClick={() => void handleSend()}
              icon={<WhatsAppIcon className="h-4 w-4" />}
              className="!bg-[#25D366] !text-white hover:!bg-[#1FAF55] active:!bg-[#189B49]"
            >
              Ya, Setuju &amp; Kirim ke WhatsApp
            </GlassButton>
            <GlassButton
              type="button"
              variant="ghost"
              fullWidth
              disabled={isSending}
              onClick={() => setModalStep(0)}
            >
              Batal
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </MobileAppShell>
  );
}
