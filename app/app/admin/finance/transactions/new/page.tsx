'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Upload,
  Save,
  ArrowLeft,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function AdminNewTransactionPage() {
  const router = useRouter();
  const { financeCategories, jobs, addTransaction, uploadReceipt } = useAppStore();

  const [type, setType] = useState<'income' | 'expense'>('income');
  const [categoryId, setCategoryId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [relatedJobId, setRelatedJobId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableCategories = financeCategories.filter((c) => c.type === type);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmountStr('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmountStr(num.toLocaleString('id-ID'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseInt(amountStr.replace(/\./g, ''), 10);
    if (!numericAmount || numericAmount <= 0) {
      setError('Nominal harus lebih dari 0.');
      return;
    }

    const cat = availableCategories.find((c) => c.id === categoryId) || availableCategories[0];
    if (!cat) {
      setError('Pilih kategori transaksi.');
      return;
    }

    if (!description.trim()) {
      setError('Keterangan transaksi wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const attachmentPath = receiptFile ? await uploadReceipt(receiptFile) : undefined;
      await addTransaction({
        type,
        category_id: cat.id,
        category_name: cat.name,
        amount: numericAmount,
        transaction_date: transactionDate,
        description: description.trim(),
        job_id: relatedJobId || undefined,
        attachment_url: attachmentPath,
      });

      router.push('/app/admin/finance');
    } catch {
      setError('Gagal mencatat transaksi.');
      setIsSubmitting(false);
    }
  };

  return (
    <MobileAppShell
      title="Catat Transaksi Kas"
      subtitle="Pembukuan Hadroh Khoirunnada"
      showBack
      backHref="/app/admin/finance"
    >
      <form onSubmit={handleSubmit} className="admin-desktop-finance-form space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="admin-desktop-form-error p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* 1. Type Selector (Income vs Expense) */}
        <div className="admin-desktop-finance-type grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('');
            }}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-700 text-white border-emerald-500 shadow-md font-bold'
                : 'bg-[#FFFFFF] text-[#585145] border-black/5 hover:border-black/10'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-xs">Uang Masuk</span>
            </div>
            <p className="text-[10px]">Penerimaan / Donasi / Kas</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryId('');
            }}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-700 text-white border-rose-500 shadow-md font-bold'
                : 'bg-[#FFFFFF] text-[#585145] border-black/5 hover:border-black/10'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ArrowDownRight className="w-4 h-4" />
              <span className="text-xs">Uang Keluar</span>
            </div>
            <p className="text-[10px]">Alat / Konsumsi / Transport</p>
          </button>
        </div>

        {/* 2. Amount Input Card */}
        <div className="admin-desktop-finance-amount p-4 rounded-2xl bg-[#FFFFFF] border border-[#B58228]/40 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-[#151917]">
            Nominal Transaksi (Rp) <span className="text-[#70490E]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-base font-black text-[#70490E]">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountStr}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full bg-[#F5EBD7] text-[#151917] border border-[#B58228]/35 rounded-xl pl-11 pr-3 py-2.5 text-lg font-bold font-serif focus:outline-none focus:border-[#996A19]"
              required
            />
          </div>
        </div>

        {/* 3. Category & Date Details */}
        <div className="admin-desktop-finance-fields p-4 rounded-2xl bg-[#FFFFFF] border border-black/5 shadow-sm space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#151917] mb-1">Kategori Transaksi *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#F5EBD7] text-[#151917] border border-white/15 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#996A19]"
              required
            >
              <option value="">Pilih Kategori...</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-[#151917] mb-1">Tanggal Transaksi *</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full bg-[#F5EBD7] text-[#151917] border border-white/15 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#996A19]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[#151917] mb-1">Keterangan / Rincian *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembayaran DP Job Maulid Akbar di Masjid Al-Ikhlas"
              rows={2}
              className="w-full bg-[#F5EBD7] text-[#151917] placeholder-[#706B60] border border-white/15 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#996A19] resize-none"
              required
            />
          </div>

          {/* Related Job (Optional) */}
          <div>
            <label className="block font-bold text-[#151917] mb-1">Terkait Jadwal Job (Opsional)</label>
            <select
              value={relatedJobId}
              onChange={(e) => setRelatedJobId(e.target.value)}
              className="w-full bg-[#F5EBD7] text-[#151917] border border-white/15 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#996A19]"
            >
              <option value="">Tidak Terkait Job Tertentu</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.event_date})
                </option>
              ))}
            </select>
          </div>

          {/* Receipt upload */}
          <div>
            <label className="block font-bold text-[#151917] mb-1">Bukti Nota / Kwitansi</label>
            <label className="w-full min-h-[44px] bg-[#F5EBD7] text-[#151917] border border-white/15 rounded-xl px-3 py-2.5 text-xs flex items-center gap-2 cursor-pointer hover:border-[#996A19] transition-colors">
              <Upload className="w-4 h-4 text-[#70490E]" />
              <span className="truncate">{receiptFile?.name || 'Pilih JPG, PNG, WebP, atau PDF'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            <p className="text-[10px] text-[#585145] mt-1">
              File disimpan privat di Supabase Storage, maksimal 5 MB.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="admin-desktop-form-submit pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#996A19] to-[#996A19] text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Kas'}</span>
          </button>
        </div>
      </form>
    </MobileAppShell>
  );
}
