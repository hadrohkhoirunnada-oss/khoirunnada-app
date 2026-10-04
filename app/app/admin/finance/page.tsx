'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Receipt,
  Calendar,
  CalendarDays,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Tag,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { FinanceTransaction } from '@/lib/types';

type PeriodType = 'all' | 'week' | 'month' | 'year' | 'custom';

export default function AdminFinancePage() {
  const { balance, transactions } = useAppStore();

  // Filters State
  const [period, setPeriod] = useState<PeriodType>('all');
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [selectedTrx, setSelectedTrx] = useState<FinanceTransaction | null>(null);

  // Filtered transactions logic
  const filteredTransactions = useMemo(() => {
    const refDate = new Date('2026-10-04T00:00:00Z');

    return transactions.filter((trx) => {
      // 1. Type Filter
      if (typeFilter !== 'all' && trx.type !== typeFilter) return false;

      // 2. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = trx.description.toLowerCase().includes(q);
        const matchCat = trx.category_name.toLowerCase().includes(q);
        if (!matchDesc && !matchCat) return false;
      }

      // 3. Period Filter
      const trxDate = new Date(trx.transaction_date + 'T00:00:00Z');

      if (period === 'week') {
        const diffTime = Math.abs(refDate.getTime() - trxDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 14;
      }

      if (period === 'month') {
        const trxMonth = trxDate.getUTCMonth();
        const trxYear = trxDate.getUTCFullYear();
        return trxYear === 2026 && (trxMonth === 8 || trxMonth === 9);
      }

      if (period === 'year') {
        return trxDate.getUTCFullYear() === 2026;
      }

      if (period === 'custom') {
        if (startDate && trx.transaction_date < startDate) return false;
        if (endDate && trx.transaction_date > endDate) return false;
      }

      return true;
    });
  }, [transactions, period, typeFilter, search, startDate, endDate]);

  // Calculate dynamic totals for the active filtered period
  const { periodIncome, periodExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });
    return { periodIncome: income, periodExpense: expense };
  }, [filteredTransactions]);

  const handleApplyCustomDate = () => {
    if (startDate || endDate) {
      setPeriod('custom');
      setShowCalendarPicker(false);
    }
  };

  const handleResetCustomDate = () => {
    setStartDate('');
    setEndDate('');
    setPeriod('all');
    setShowCalendarPicker(false);
  };

  return (
    <MobileAppShell
      title="Kelola Keuangan Kas"
      subtitle="Panel Pembukuan Hadroh"
      showBack
      backHref="/app/admin"
      rightAction={
        <Link href="/app/admin/finance/transactions/new">
          <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#996A19] to-[#D4A346] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span>Catat Kas</span>
          </button>
        </Link>
      }
    >
      {/* 1. Saldo Kas & Rincian Transparansi */}
      <div className="p-5 mb-4 rounded-2xl bg-gradient-to-br from-[#1C2521] via-[#141B18] to-[#0E1311] border border-[#B58228]/40 shadow-lg text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#D4A346]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Kas Pengurus Hadroh Khoirunnada</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#F8F6F0] tracking-tight mt-1 font-serif">
          Rp {balance.toLocaleString('id-ID')}
        </h2>
        <p className="text-[11px] text-[#A69E8F] mt-0.5">
          Saldo riil kas aktif perkumpulan Hadroh Khoirunnada
        </p>

        {/* Uang Masuk & Uang Keluar Breakdown */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10 text-left">
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pemasukan</span>
            </div>
            <p className="text-sm font-extrabold text-emerald-300">
              +Rp {periodIncome.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 mb-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Pengeluaran</span>
            </div>
            <p className="text-sm font-extrabold text-rose-300">
              -Rp {periodExpense.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filter Periode & Kalender */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A69E8F]">
            Periode Transaksi
          </span>

          {/* Tombol Kalender */}
          <button
            onClick={() => setShowCalendarPicker(!showCalendarPicker)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              period === 'custom' || showCalendarPicker
                ? 'bg-[#996A19] text-white border-[#B58228] shadow-xs'
                : 'bg-[#141B18] text-[#A69E8F] border-white/10 hover:border-white/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4A346]" />
            <span>{period === 'custom' ? 'Kalender (Aktif)' : 'Kalender'}</span>
            {showCalendarPicker ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Tab Pilihan Periode: Semua, Minggu Ini, Bulan Ini, Tahun Ini */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {(['all', 'week', 'month', 'year'] as PeriodType[]).map((pKey) => {
            const labels: Record<string, string> = {
              all: 'Semua',
              week: 'Minggu',
              month: 'Bulan',
              year: 'Tahun',
            };
            const isSelected = period === pKey;
            return (
              <button
                key={pKey}
                onClick={() => {
                  setPeriod(pKey);
                  setShowCalendarPicker(false);
                }}
                className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#996A19] text-white border-[#B58228] shadow-xs'
                    : 'bg-[#141B18] text-[#A69E8F] border-white/10 hover:border-white/20'
                }`}
              >
                {labels[pKey]}
              </button>
            );
          })}
        </div>

        {/* Kalender Date Picker Box (Muncul saat tombol kalender ditekan) */}
        {showCalendarPicker && (
          <div className="p-3.5 mb-3 rounded-2xl bg-[#141B18] border border-[#B58228]/40 shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-xs font-bold text-[#F8F6F0] flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#D4A346]" />
                <span>Pilih Rentang Tanggal Kalender</span>
              </span>
              <button
                onClick={() => setShowCalendarPicker(false)}
                className="text-[#A69E8F] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#A69E8F] mb-1">
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1C2521] text-[#F8F6F0] border border-[#B58228]/35 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#D4A346]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#A69E8F] mb-1">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1C2521] text-[#F8F6F0] border border-[#B58228]/35 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#D4A346]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyCustomDate}
                className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-[#996A19] to-[#D4A346] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Terapkan Tanggal
              </button>
              <button
                onClick={handleResetCustomDate}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-[#F8F6F0] text-xs font-semibold hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Indikator Filter Aktif Custom Tanggal */}
        {period === 'custom' && (
          <div className="p-2 mb-2 rounded-xl bg-[#996A19]/20 border border-[#B58228]/40 flex items-center justify-between text-xs text-[#D4A346]">
            <span className="font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Periode: {startDate || 'Awal'} s/d {endDate || 'Sekarang'}
              </span>
            </span>
            <button
              onClick={handleResetCustomDate}
              className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-0.5"
            >
              <X className="w-3 h-3" />
              <span>Hapus Filter</span>
            </button>
          </div>
        )}

        {/* Filter Jenis: Semua / Pemasukan / Pengeluaran */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#B58228] text-white font-bold'
                : 'bg-[#141B18] text-[#A69E8F] border border-white/10'
            }`}
          >
            Semua Aliran
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            + Pemasukan
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            - Pengeluaran
          </button>
        </div>
      </section>

      {/* 3. Daftar Riwayat Transaksi Kas */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A69E8F]">
            Riwayat Pembukuan Kas Hadroh
          </h3>
          <span className="text-[11px] text-[#D4A346] font-bold">
            {filteredTransactions.length} Transaksi
          </span>
        </div>

        {/* List Transaksi */}
        <div className="space-y-2">
          {filteredTransactions.map((trx) => {
            const isIncome = trx.type === 'income';

            return (
              <div
                key={trx.id}
                onClick={() => setSelectedTrx(trx)}
                className="p-3.5 rounded-2xl bg-[#141B18]/90 border border-white/10 hover:border-[#B58228]/50 active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F8F6F0] line-clamp-1">
                      {trx.category_name}
                    </h4>
                    <p className="text-[11px] text-[#A69E8F] line-clamp-1">{trx.description}</p>
                    <span className="text-[10px] text-gray-500">{trx.transaction_date}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-extrabold ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                  </span>
                  {trx.attachment_url && (
                    <span className="block text-[9px] text-[#D4A346] font-semibold mt-0.5">
                      ? Ada Bukti
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-[#141B18]/80 border border-white/10">
              <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#F8F6F0]">Tidak Ada Transaksi</p>
              <p className="text-[11px] text-[#A69E8F] mt-0.5">
                Tidak ada riwayat pembukuan kas pada periode yang dipilih.
              </p>
              <button
                onClick={() => {
                  setPeriod('all');
                  setTypeFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#996A19] to-[#D4A346] text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                Tampilkan Semua Periode
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Modal Rincian Transaksi & Bukti Nota */}
      {selectedTrx && (
        <GlassModal
          isOpen={!!selectedTrx}
          onClose={() => setSelectedTrx(null)}
          title="Rincian Transaksi Kas"
          subtitle={selectedTrx.category_name}
        >
          <div className="space-y-4">
            <div className="text-center p-4 rounded-2xl bg-black/10">
              <span className="text-xs text-[#A69E8F] block mb-1">
                {selectedTrx.type === 'income' ? 'Pemasukan Kas' : 'Pengeluaran Kas'}
              </span>
              <p
                className={`text-2xl font-black font-serif ${
                  selectedTrx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedTrx.type === 'income' ? '+' : '-'} Rp {selectedTrx.amount.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#A69E8F] border-y border-white/10 py-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-[#D4A346]" />
                  <span>Tanggal Transaksi</span>
                </span>
                <span className="font-bold text-[#F8F6F0]">{selectedTrx.transaction_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Tag className="w-3.5 h-3.5 text-[#D4A346]" />
                  <span>Kategori</span>
                </span>
                <span className="font-bold text-[#F8F6F0]">{selectedTrx.category_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <User className="w-3.5 h-3.5 text-[#D4A346]" />
                  <span>Dicatat Oleh</span>
                </span>
                <span className="font-bold text-[#F8F6F0]">{selectedTrx.created_by_name}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#F8F6F0] block mb-1">Keterangan:</span>
              <p className="text-xs text-[#A69E8F] leading-relaxed p-3 rounded-xl bg-white/5 border border-white/10">
                {selectedTrx.description}
              </p>
            </div>

            {/* Receipt Preview */}
            {selectedTrx.attachment_url && (
              <div>
                <span className="text-xs font-bold text-[#F8F6F0] block mb-1">
                  Bukti Nota / Kwitansi:
                </span>
                {selectedTrx.attachment_url.toLowerCase().includes('.pdf?') ? (
                  <a
                    href={selectedTrx.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-[#B58228]/30 bg-[#0D1210] p-3 text-center text-xs font-bold text-[#D4A346]"
                  >
                    Buka Bukti PDF
                  </a>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-white/15 shadow-sm max-h-56">
                    <img
                      src={selectedTrx.attachment_url}
                      alt="Bukti Transaksi"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            <GlassButton
              variant="secondary"
              fullWidth
              onClick={() => setSelectedTrx(null)}
            >
              Tutup Rincian
            </GlassButton>
          </div>
        </GlassModal>
      )}
    </MobileAppShell>
  );
}
