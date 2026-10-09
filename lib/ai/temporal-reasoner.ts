/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - TEMPORAL REASONER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Inferensi temporal berbasis aturan: hari ini, besok, minggu ini, bulan ini,
 * bulan depan, transisi batas tahun, dan penghitungan zona waktu eksplisit.
 */

import type { Job } from '../types.ts';
import type { SafeJob } from './retrieval-types.ts';
import { parseJobDate, toSafeJob } from './job-retriever.ts';

export type TemporalWindowType =
  | 'today'
  | 'tomorrow'
  | 'yesterday'
  | 'this_week'
  | 'next_week'
  | 'this_month'
  | 'next_month'
  | 'this_year'
  | 'nearest'
  | 'past'
  | 'upcoming';

export interface TemporalWindow {
  type: TemporalWindowType;
  startDate: Date;
  endDate: Date;
  timeZone: string;
}

export interface TemporalOptions {
  referenceDate?: Date;
  timeZone?: string; // Default: 'Asia/Jakarta' (WIB, UTC+7)
}

export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

/**
 * Mendapatkan komponen tanggal (tahun, bulan 0-11, hari 1-31) dalam zona waktu yang ditentukan.
 */
export function getDatePartsInTimeZone(
  date: Date,
  timeZone = DEFAULT_TIMEZONE
): { year: number; month: number; day: number; hour: number; minute: number } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
    return {
      year: get('year'),
      month: get('month') - 1, // 0-indexed
      day: get('day'),
      hour: get('hour'),
      minute: get('minute'),
    };
  } catch {
    // Fallback ke UTC jika timezone tidak valid di environment tertentu
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
    };
  }
}

/**
 * Membuat objek Date batas awal hari (00:00:00.000) dan batas akhir hari (23:59:59.999).
 */
export function getDayBounds(date: Date, offsetDays = 0, timeZone = DEFAULT_TIMEZONE): { start: Date; end: Date } {
  const parts = getDatePartsInTimeZone(date, timeZone);
  // Buat UTC timestamp acuan, lalu geser harinya
  const baseUtc = Date.UTC(parts.year, parts.month, parts.day + offsetDays);
  const start = new Date(baseUtc);
  const end = new Date(baseUtc + (24 * 60 * 60 * 1000 - 1));
  return { start, end };
}

/**
 * Mengekstrak rentang temporal terstruktur berdasarkan kata kunci ekspresi waktu.
 */
export function extractTemporalWindow(
  text: string,
  options: TemporalOptions = {}
): TemporalWindow | null {
  const ref = options.referenceDate || new Date();
  const tz = options.timeZone || DEFAULT_TIMEZONE;
  const lower = text.toLowerCase();

  const parts = getDatePartsInTimeZone(ref, tz);

  // 1. Hari Ini
  if (lower.includes('hari ini')) {
    const { start, end } = getDayBounds(ref, 0, tz);
    return { type: 'today', startDate: start, endDate: end, timeZone: tz };
  }

  // 2. Besok
  if (lower.includes('besok')) {
    const { start, end } = getDayBounds(ref, 1, tz);
    return { type: 'tomorrow', startDate: start, endDate: end, timeZone: tz };
  }

  // 3. Kemarin
  if (lower.includes('kemarin')) {
    const { start, end } = getDayBounds(ref, -1, tz);
    return { type: 'yesterday', startDate: start, endDate: end, timeZone: tz };
  }

  // 4. Minggu Ini (7 hari ke depan dari hari ini)
  if (lower.includes('minggu ini')) {
    const { start } = getDayBounds(ref, 0, tz);
    const end = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000 - 1));
    return { type: 'this_week', startDate: start, endDate: end, timeZone: tz };
  }

  // 5. Minggu Depan (hari ke 7 s/d 14)
  if (lower.includes('minggu depan')) {
    const { start } = getDayBounds(ref, 7, tz);
    const end = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000 - 1));
    return { type: 'next_week', startDate: start, endDate: end, timeZone: tz };
  }

  // 6. Bulan Depan (Mendukung transisi batas tahun Desember -> Januari)
  if (lower.includes('bulan depan')) {
    const nextMonth = (parts.month + 1) % 12;
    const nextYear = parts.month === 11 ? parts.year + 1 : parts.year;
    const start = new Date(Date.UTC(nextYear, nextMonth, 1, 0, 0, 0));
    // Hari terakhir bulan depan (tanggal 0 dari bulan setelahnya)
    const end = new Date(Date.UTC(nextYear, nextMonth + 1, 0, 23, 59, 59, 999));
    return { type: 'next_month', startDate: start, endDate: end, timeZone: tz };
  }

  // 7. Bulan Ini
  if (lower.includes('bulan ini')) {
    const start = new Date(Date.UTC(parts.year, parts.month, 1, 0, 0, 0));
    const end = new Date(Date.UTC(parts.year, parts.month + 1, 0, 23, 59, 59, 999));
    return { type: 'this_month', startDate: start, endDate: end, timeZone: tz };
  }

  // 8. Masa Lalu
  if (lower.includes('yang lalu') || lower.includes('sebelumnya') || lower.includes('sudah lewat')) {
    const start = new Date(0); // Epoch 1970
    const end = new Date(ref.getTime() - 1);
    return { type: 'past', startDate: start, endDate: end, timeZone: tz };
  }

  return null;
}

/**
 * Memfilter jadwal job berdasarkan rentang waktu temporal terstruktur.
 * Mengecualikan status 'cancelled'.
 */
export function filterJobsByTemporalWindow(
  jobs: Job[],
  window: TemporalWindow,
  referenceDate = new Date()
): SafeJob[] {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  const startMs = window.startDate.getTime();
  const endMs = window.endDate.getTime();

  return jobs
    .filter((j) => {
      if (!j || j.status === 'cancelled') return false;
      const d = parseJobDate(j.event_date);
      if (!d) return false;
      const time = d.getTime();
      return time >= startMs && time <= endMs;
    })
    .sort((a, b) => {
      const da = parseJobDate(a.event_date)!.getTime();
      const db = parseJobDate(b.event_date)!.getTime();
      return da - db;
    })
    .map((j) => toSafeJob(j, referenceDate));
}
