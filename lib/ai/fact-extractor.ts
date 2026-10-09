/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - FACT EXTRACTOR
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Modul untuk mengekstrak fakta aman dan terverifikasi dari ReasoningResult (FASE 5).
 * Memisahkan fakta mentah dari representasi bahasa tanpa menambah atau mengarang data.
 */

import type { ReasoningResult } from './plan-types.ts';
import type {
  ExtractedFacts,
  ExtractedJobFact,
  ExtractedQosidahFact,
  ExtractedCandidateFact,
} from './composer-types.ts';
import type { SafeJob } from './retrieval-types.ts';
import type { Qosidah } from '../types.ts';

// Regex perlindungan data sensitif (Nomor telepon Indonesia, email, password)
const SENSITIVE_PHONE_REGEX = /(\+?62|08)[0-9\- ]{8,15}/g;
const SENSITIVE_EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Membersihkan string dari potensi informasi privat atau sensitif.
 */
function sanitizeText(text?: string): string {
  if (!text) return '';
  return text
    .replace(SENSITIVE_PHONE_REGEX, '[KONTAK_DIRAHSIAKAN]')
    .replace(SENSITIVE_EMAIL_REGEX, '[EMAIL_DIRAHSIAKAN]')
    .trim();
}

/**
 * Format tanggal agenda job secara aman dan konsisten.
 */
function formatJobDate(dateStr: string, timeZone: string = 'Asia/Makassar'): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Tanggal belum ditentukan';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone,
    });
  } catch {
    return 'Tanggal belum ditentukan';
  }
}

/**
 * Mengekstrak cuplikan baris lirik (1-2 baris pertama) secara rapi.
 */
function extractSnippet(latinText?: string): string {
  if (!latinText) return '';
  const lines = latinText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return '';
  const previewLines = lines.slice(0, 2);
  return previewLines.join(' / ');
}

/**
 * Ekstraksi fakta terstruktur dari ReasoningResult.
 */
export function extractFacts(
  result: ReasoningResult,
  timeZone: string = 'Asia/Makassar'
): ExtractedFacts {
  const data = result.data || {};

  // 1. Ekstraksi Qosidah
  const qosidahs: ExtractedQosidahFact[] = (data.qosidahs || []).map((q: Qosidah) => ({
    id: q.id,
    title: sanitizeText(q.title),
    category: q.category_name,
    snippet: extractSnippet(q.latin_text),
    translation: sanitizeText(q.translation),
    arabic: q.arabic_text ? q.arabic_text.trim() : undefined,
  }));

  // 2. Ekstraksi Jadwal Job
  const jobs: ExtractedJobFact[] = (data.jobs || []).map((j: SafeJob) => ({
    id: j.id,
    title: sanitizeText(j.title),
    formattedDate: j.formattedDate || formatJobDate(j.event_date, timeZone),
    location: sanitizeText(j.location || 'Menunggu konfirmasi'),
    status: (j.status || 'confirmed').toUpperCase(),
  }));

  // 3. Ekstraksi Nearest Job
  let nearestJob: ExtractedJobFact | null = null;
  if (data.nearestJob) {
    nearestJob = {
      id: data.nearestJob.id,
      title: sanitizeText(data.nearestJob.title),
      formattedDate:
        data.nearestJob.formattedDate || formatJobDate(data.nearestJob.event_date, timeZone),
      location: sanitizeText(data.nearestJob.location || 'Menunggu konfirmasi'),
      status: (data.nearestJob.status || 'confirmed').toUpperCase(),
    };
  }

  // 4. Ekstraksi Kandidat Ambigu jika ada
  const ambiguousCandidates: ExtractedCandidateFact[] = [];
  if (result.isAmbiguous && Array.isArray(result.ambiguousCandidates)) {
    result.ambiguousCandidates.forEach((cand: any) => {
      if (cand && cand.id && (cand.title || cand.name)) {
        ambiguousCandidates.push({
          id: cand.id,
          name: sanitizeText(cand.title || cand.name),
          type: cand.type || 'qosidah',
        });
      }
    });
  }

  // 5. Hitung jumlah fakta
  const count =
    typeof data.count === 'number'
      ? data.count
      : data.qosidahs
      ? data.qosidahs.length
      : data.jobs
      ? data.jobs.length
      : undefined;

  return {
    status: result.status,
    intent: result.intent,
    entityName: result.targetEntity ? sanitizeText(result.targetEntity.name) : undefined,
    entityType: result.targetEntity?.type,
    entityId: result.targetEntity?.id,
    qosidahs,
    jobs,
    nearestJob,
    count,
    attributeName: data.attributeName,
    attributeValue: sanitizeText(data.attributeValue),
    staticContent: sanitizeText(data.staticContent),
    isAmbiguous: result.status === 'AMBIGUOUS' || Boolean(result.isAmbiguous),
    ambiguousCandidates: ambiguousCandidates.length > 0 ? ambiguousCandidates : undefined,
    failureReason: result.failureReason ? sanitizeText(result.failureReason) : undefined,
  };
}
