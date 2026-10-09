/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - CONFIDENCE-BASED DECISION ENGINE
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mengambil keputusan deterministik (ANSWER / CLARIFY / NOT_FOUND / NEED_CONTEXT / OUT_OF_SCOPE / DENY)
 * berdasarkan skor keyakinan, status operasi, bukti fakta, dan batasan keamanan (FASE 6).
 */

import type { ReasoningResult } from './plan-types.ts';
import type {
  ConfidenceDecision,
  ConfidenceScores,
  InputValidationResult,
} from './confidence-types.ts';

/**
 * Menentukan keputusan tindakan terbaik bagi sistem.
 */
export function determineDecision(
  validation: InputValidationResult,
  result: ReasoningResult,
  scores: ConfidenceScores
): ConfidenceDecision {
  // 1. Pelanggaran Keamanan / Probing Data Privat / Upaya Serangan
  if (validation.isAbusiveOrProhibited || result.status === 'UNAUTHORIZED') {
    return 'DENY';
  }

  // 2. Butuh Konteks Percakapan Sebelumnya (Anaphora / Follow-up tanpa memori)
  if (result.status === 'NEED_CONTEXT') {
    return 'NEED_CONTEXT';
  }

  // 3. Data Tidak Ditemukan dalam Basis Data
  if (result.status === 'DATA_NOT_FOUND') {
    return 'NOT_FOUND';
  }

  // 4. Ambigu atau Beberapa Kandidat Berjarak Tipis
  if (
    result.status === 'AMBIGUOUS' ||
    result.isAmbiguous ||
    (scores.ambiguityMargin < 0.15 && scores.tier === 'medium' && (result.data.qosidahs || []).length > 1)
  ) {
    return 'CLARIFY';
  }

  // 5. Pertanyaan di Luar Cakupan Domain Resmi
  if (result.status === 'OUT_OF_SCOPE' || scores.tier === 'low') {
    return 'OUT_OF_SCOPE';
  }

  // 6. Jawaban Definitif (Didukung Bukti & Keyakinan Memadai)
  if (result.status === 'SUCCESS' && (scores.tier === 'high' || scores.tier === 'medium')) {
    return 'ANSWER';
  }

  // Default fallback aman
  return 'OUT_OF_SCOPE';
}
