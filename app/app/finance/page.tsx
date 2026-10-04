'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { FinanceTransaction } from '@/lib/types';

type PeriodType = 'all' | 'week' | 'month' | 'year' | 'custom';

export default function FinanceDashboardPage() {
  const router = useRouter();
  const { currentUser, balance, transactions, incomeThisMonth, expenseThisMonth } = useAppStore();

  const isTreasurerOrAdmin = currentUser.is_treasurer || currentUser.is_admin;

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
    // Reference date: latest transaction or current date
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
        // Last 7-14 days window around reference
        const diffTime = Math.abs(refDate.getTime() - trxDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 14;
      }

      if (period === 'month') {
        // Month of Sep / Oct 2026
        const trxMonth = trxDate.getUTCMonth();
        const trxYear = trxDate.getUTCFullYear();
        return trxYear === 2026 && (trxMonth === 8 || trxMonth === 9); // Sep or Oct
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
  const { calculatedIncome, calculatedExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });
    return { calculatedIncome: income, calculatedExpense: expense };
  }, [filteredTransactions]);

  const periodIncome = isTreasurerOrAdmin ? calculatedIncome : incomeThisMonth;
  const periodExpense = isTreasurerOrAdmin ? calculatedExpense : expenseThisMonth;

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
      title="Keuangan Kas"
      subtitle="Hadroh Khoirunnada"
      showBack
      backHref="/app"
    >
      {/* 1. Saldo Kas & Rincian Transparansi (Total Uang Kas, Uang Masuk, Uang Keluar) */}
      <GlassCard className="p-5 mb-4 text-center" variant="elevated">
        <span className="text-xs font-semibold text-[#585145] tracking-wider uppercase block">
          Total Uang Kas
        </span>
        <h2 className="text-3xl font-extrabold text-[#996A19] tracking-tight mt-1 font-serif">
          Rp {balance.toLocaleString('id-ID')}
        </h2>
        <p className="text-[11px] text-[#585145] mt-0.5">
          Kas aktif perkumpulan Hadroh Khoirunnada
        </p>

        {/* Uang Masuk & Uang Keluar Breakdown */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-black/5 text-left">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Uang Masuk</span>
            </div>
            <p className="text-sm font-extrabold text-emerald-900">
              +Rp {periodIncome.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-800 mb-0.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Uang Keluar</span>
            </div>
            <p className="text-sm font-extrabold text-rose-900">
              -Rp {periodExpense.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </GlassCard>

      {isTreasurerOrAdmin ? (
        <>
      {/* 2. Filter Periode & Kalender (LANGSUNG DI BAWAH CARD TOTAL UANG KAS) */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#585145]">
            Periode Transaksi
          </span>

          {/* Tombol Kalender */}
          <button
            onClick={() => setShowCalendarPicker(!showCalendarPicker)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              period === 'custom' || showCalendarPicker
                ? 'bg-[#996A19] text-white border-[#996A19] shadow-xs'
                : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
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
          <button
            onClick={() => {
              setPeriod('all');
              setShowCalendarPicker(false);
            }}
            className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              period === 'all'
                ? 'bg-[#996A19] text-white border-[#996A19] shadow-xs'
                : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => {
              setPeriod('week');
              setShowCalendarPicker(false);
            }}
            className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              period === 'week'
                ? 'bg-[#996A19] text-white border-[#996A19] shadow-xs'
                : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
            }`}
          >
            Minggu
          </button>
          <button
            onClick={() => {
              setPeriod('month');
              setShowCalendarPicker(false);
            }}
            className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              period === 'month'
                ? 'bg-[#996A19] text-white border-[#996A19] shadow-xs'
                : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
            }`}
          >
            Bulan
          </button>
          <button
            onClick={() => {
              setPeriod('year');
              setShowCalendarPicker(false);
            }}
            className={`py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              period === 'year'
                ? 'bg-[#996A19] text-white border-[#996A19] shadow-xs'
                : 'bg-white/80 text-[#585145] border-black/10 hover:bg-white'
            }`}
          >
            Tahun
          </button>
        </div>

        {/* Kalender Date Picker Box (Muncul saat tombol kalender ditekan) */}
        {showCalendarPicker && (
          <GlassCard className="p-3.5 mb-3 bg-[#F5EBD7]/40 border-[#996A19]/30">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
              <span className="text-xs font-bold text-[#151917] flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#996A19]" />
                <span>Pilih Rentang Tanggal Kalender</span>
              </span>
              <button
                onClick={() => setShowCalendarPicker(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#585145] mb-1">
                  Dari Tanggal:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input !min-h-[38px] !py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#585145] mb-1">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input !min-h-[38px] !py-1 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyCustomDate}
                className="flex-1 py-1.5 rounded-xl bg-[#996A19] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Terapkan Tanggal
              </button>
              <button
                onClick={handleResetCustomDate}
                className="px-3 py-1.5 rounded-xl bg-black/5 text-[#585145] text-xs font-semibold hover:bg-black/10 active:scale-95 transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </GlassCard>
        )}

        {/* Indikator Filter Aktif Custom Tanggal */}
        {period === 'custom' && (
          <div className="p-2 mb-2 rounded-xl bg-[#996A19]/10 border border-[#996A19]/25 flex items-center justify-between text-xs text-[#996A19]">
            <span className="font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Periode: {startDate || 'Awal'} s/d {endDate || 'Sekarang'}
              </span>
            </span>
            <button
              onClick={handleResetCustomDate}
              className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-0.5"
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
                ? 'bg-[#151917] text-white'
                : 'bg-black/5 text-[#585145] hover:bg-black/10'
            }`}
          >
            Semua Aliran
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            + Pemasukan
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            - Pengeluaran
          </button>
        </div>
      </section>

      {/* 3. Daftar Transaksi Terakhir (LANGSUNG MEMUNCULKAN HISTORY LENGKAP) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145]">
            Riwayat Transaksi Kas
          </h3>
          <span className="text-[11px] text-[#996A19] font-bold">
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
                className="p-3.5 rounded-2xl glass-card flex items-center justify-between border border-white/80 hover:border-[#996A19]/50 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-500/15 text-emerald-800' : 'bg-rose-500/15 text-rose-800'
                    }`}
                  >
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#151917] line-clamp-1">
                      {trx.category_name}
                    </h4>
                    <p className="text-[11px] text-[#585145] line-clamp-1">{trx.description}</p>
                    <span className="text-[10px] text-gray-400">{trx.transaction_date}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-extrabold ${
                      isIncome ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                  </span>
                  {trx.attachment_url && (
                    <span className="block text-[9px] text-[#996A19] font-semibold mt-0.5">
                      ? Ada Bukti
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center glass-card rounded-2xl">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#151917]">Tidak Ada Transaksi</p>
              <p className="text-[11px] text-[#585145] mt-0.5">
                Tidak ada riwayat transaksi kas pada periode yang dipilih.
              </p>
              <button
                onClick={() => {
                  setPeriod('all');
                  setTypeFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#996A19] text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer"
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
            <div className="text-center p-4 rounded-2xl bg-black/5">
              <span className="text-xs text-[#585145] block mb-1">
                {selectedTrx.type === 'income' ? 'Pemasukan Kas' : 'Pengeluaran Kas'}
              </span>
              <p
                className={`text-2xl font-black font-serif ${
                  selectedTrx.type === 'income' ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {selectedTrx.type === 'income' ? '+' : '-'} Rp {selectedTrx.amount.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="space-y-2 text-xs text-[#585145] border-y border-black/5 py-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-[#996A19]" />
                  <span>Tanggal Transaksi</span>
                </span>
                <span className="font-bold text-[#151917]">{selectedTrx.transaction_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Tag className="w-3.5 h-3.5 text-[#996A19]" />
                  <span>Kategori</span>
                </span>
                <span className="font-bold text-[#151917]">{selectedTrx.category_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <User className="w-3.5 h-3.5 text-[#996A19]" />
                  <span>Dicatat Oleh</span>
                </span>
                <span className="font-bold text-[#151917]">{selectedTrx.created_by_name}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#151917] block mb-1">Keterangan:</span>
              <p className="text-xs text-[#585145] leading-relaxed p-3 rounded-xl bg-white/70 border border-black/5">
                {selectedTrx.description}
              </p>
            </div>

            {/* Receipt Preview */}
            {selectedTrx.attachment_url && (
              <div>
                <span className="text-xs font-bold text-[#151917] block mb-1">
                  Bukti Nota / Kwitansi:
                </span>
                {selectedTrx.attachment_url.toLowerCase().includes('.pdf?') ? (
                  <a
                    href={selectedTrx.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-[#996A19]/20 bg-white/70 p-3 text-center text-xs font-bold text-[#996A19]"
                  >
                    Buka Bukti PDF
                  </a>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-black/10 shadow-sm max-h-56">
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
        </>
      ) : (
        <GlassCard className="p-4 text-center" variant="elevated">
          <p className="text-xs font-bold text-[#151917]">Transparansi Ringkasan Kas</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#585145]">
            Pemain dapat melihat saldo serta arus kas ringkas. Detail transaksi dan bukti nota hanya dapat dibuka oleh Bendahara dan Admin.
          </p>
        </GlassCard>
      )}
    </MobileAppShell>
  );
}
