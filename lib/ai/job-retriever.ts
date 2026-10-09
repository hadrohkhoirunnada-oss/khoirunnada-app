/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - JOB RETRIEVER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mesin pencari dan filtering jadwal job hadroh (Upcoming, Past, Nearest, Date filtering).
 * Mengedepankan perlindungan privasi: tidak mengekspos customer_phone atau data privat.
 */

import type { Job, JobStatus } from '../types.ts';
import type { SafeJob, RetrievalResult, MatchEvidence } from './retrieval-types.ts';
import { normalizeText } from './normalizer.ts';
import { stringSimilarity } from './matcher.ts';

/**
 * Parsing tanggal ISO/string secara aman tanpa resiko exception.
 */
export function parseJobDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format tanggal ke format standar Indonesia (id-ID).
 */
export function formatJobDateIndonesia(date: Date, timeZone = 'Asia/Makassar'): string {
  try {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Mengubah entitas Job mentah menjadi SafeJob yang aman bagi publik.
 * Menyembunyikan customer_phone, booking_id, dan notes privat demi kepatuhan sekuriti.
 */
export function toSafeJob(job: Job, referenceDate: Date = new Date(), timeZone = 'Asia/Makassar'): SafeJob {
  const d = parseJobDate(job.event_date);
  const isValid = d !== null;
  const isUpcoming = isValid ? d.getTime() >= referenceDate.getTime() : false;

  return {
    id: job.id,
    title: job.title || 'Jadwal Tanpa Judul',
    event_type: job.event_type || 'Acara',
    event_date: job.event_date || '',
    gather_time: job.gather_time,
    start_time: job.start_time,
    location: job.location || 'Lokasi menyusul',
    maps_url: job.maps_url,
    status: job.status || 'upcoming',
    isUpcoming,
    formattedDate: isValid ? formatJobDateIndonesia(d, timeZone) : 'Tanggal tidak valid',
  };
}

/**
 * Mengambil seluruh jadwal job yang akan datang (upcoming), diurutkan dari yang paling dekat.
 * Mengecualikan status 'cancelled'.
 */
export function getUpcomingJobs(jobs: Job[], referenceDate: Date = new Date()): SafeJob[] {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  const refTime = referenceDate.getTime();

  return jobs
    .filter((j) => {
      if (!j || j.status === 'cancelled') return false;
      const d = parseJobDate(j.event_date);
      return d !== null && d.getTime() >= refTime;
    })
    .sort((a, b) => {
      const da = parseJobDate(a.event_date)!.getTime();
      const db = parseJobDate(b.event_date)!.getTime();
      return da - db;
    })
    .map((j) => toSafeJob(j, referenceDate));
}

/**
 * Mengambil jadwal job yang sudah lewat (past), diurutkan dari yang paling baru selesai.
 */
export function getPastJobs(jobs: Job[], referenceDate: Date = new Date()): SafeJob[] {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  const refTime = referenceDate.getTime();

  return jobs
    .filter((j) => {
      if (!j) return false;
      const d = parseJobDate(j.event_date);
      return d !== null && d.getTime() < refTime;
    })
    .sort((a, b) => {
      const da = parseJobDate(a.event_date)!.getTime();
      const db = parseJobDate(b.event_date)!.getTime();
      return db - da; // Terbaru ke terlama
    })
    .map((j) => toSafeJob(j, referenceDate));
}

/**
 * Mengambil satu jadwal job aktif yang paling dekat dengan waktu sekarang.
 */
export function getNearestJob(jobs: Job[], referenceDate: Date = new Date()): SafeJob | null {
  const upcoming = getUpcomingJobs(jobs, referenceDate);
  return upcoming.length > 0 ? upcoming[0] : null;
}

/**
 * Memfilter jadwal job berdasarkan status tertentu (misal: 'upcoming', 'ongoing', 'completed').
 */
export function filterJobsByStatus(jobs: Job[], status: JobStatus): SafeJob[] {
  if (!Array.isArray(jobs)) return [];
  return jobs.filter((j) => j && j.status === status).map((j) => toSafeJob(j));
}

/**
 * Memfilter jadwal job berdasarkan tahun dan bulan (1-indexed: 1 = Januari, 12 = Desember).
 */
export function filterJobsByMonth(jobs: Job[], year: number, month: number): SafeJob[] {
  if (!Array.isArray(jobs)) return [];
  return jobs
    .filter((j) => {
      const d = parseJobDate(j.event_date);
      if (!d) return false;
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .map((j) => toSafeJob(j));
}

/**
 * Mencari jadwal job berdasarkan kata kunci teks (judul, tipe acara, atau lokasi).
 */
export function searchJobs(
  rawQuery: string,
  jobs: Job[],
  minThreshold = 0.5
): RetrievalResult<SafeJob>[] {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  const normQuery = normalizeText(rawQuery).toLowerCase().trim();
  if (normQuery.length < 2) return [];

  const results: RetrievalResult<SafeJob>[] = [];

  for (const j of jobs) {
    if (!j) continue;
    const safe = toSafeJob(j);
    const normTitle = normalizeText(safe.title).toLowerCase();
    const normType = normalizeText(safe.event_type).toLowerCase();
    const normLoc = normalizeText(safe.location || '').toLowerCase();

    let bestScore = 0;
    let bestStrategy = 'fuzzy_job';
    let matchedField = 'title';
    let snippet = safe.title;

    // 1. Exact match judul atau tipe acara
    if (normQuery === normTitle) {
      bestScore = 1.0;
      bestStrategy = 'exact_title';
      matchedField = 'title';
    } else if (normQuery === normType) {
      bestScore = 0.95;
      bestStrategy = 'exact_title';
      matchedField = 'event_type';
    } else if (normTitle.includes(normQuery) || normQuery.includes(normTitle)) {
      bestScore = 0.85;
      bestStrategy = 'prefix_title';
      matchedField = 'title';
    } else if (normLoc.includes(normQuery)) {
      bestScore = 0.8;
      bestStrategy = 'location_match';
      matchedField = 'location';
      snippet = safe.location || '';
    } else {
      const simTitle = stringSimilarity(normQuery, normTitle);
      if (simTitle >= 0.7) {
        bestScore = simTitle * 0.85;
        bestStrategy = 'fuzzy_title';
        matchedField = 'title';
      }
    }

    if (bestScore >= minThreshold) {
      results.push({
        item: safe,
        score: bestScore,
        confidence: bestScore >= 0.85 ? 'high' : bestScore >= 0.7 ? 'medium' : 'low',
        strategy: bestStrategy,
        evidence: [
          {
            field: matchedField,
            strategy: bestStrategy,
            score: bestScore,
            matchedTerm: normQuery,
            snippet,
          },
        ],
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
