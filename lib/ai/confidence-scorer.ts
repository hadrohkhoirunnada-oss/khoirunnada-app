/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - CONFIDENCE SCORING ENGINE
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mesin kalkulasi keyakinan terkalibrasi secara heuristik (FASE 6).
 * Menggabungkan skor kecocokan intent, skor entitas, kekuatan bukti retrieval,
 * margin ambiguitas, dan status penalaran tanpa mengklaim probabilitas absolut.
 */

import type { ReasoningResult } from './plan-types.ts';
import type {
  ConfidenceConfig,
  ConfidenceScores,
  ConfidenceTier,
} from './confidence-types.ts';

export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceConfig = {
  highThreshold: 0.75,
  mediumThreshold: 0.50,
  ambiguityMarginThreshold: 0.15,
  maxInputLength: 500,
  maxOperationsLimit: 10,
};

/**
 * Menghitung skor keyakinan terstruktur dari ReasoningResult.
 */
export function evaluateConfidence(
  result: ReasoningResult,
  config: ConfidenceConfig = DEFAULT_CONFIDENCE_CONFIG
): ConfidenceScores {
  let intentScore = 0.0;
  let entityScore = 0.0;
  let evidenceScore = 0.0;
  let ambiguityMargin = 1.0;

  // 1. Hitung Intent Score berdasarkan status & jenis plan
  if (result.status === 'SUCCESS') {
    intentScore = result.plan?.isSupported ? 0.90 : 0.70;
  } else if (result.status === 'AMBIGUOUS') {
    intentScore = 0.65;
  } else if (result.status === 'DATA_NOT_FOUND') {
    intentScore = result.plan?.isSupported ? 0.75 : 0.40;
  } else if (result.status === 'NEED_CONTEXT') {
    intentScore = 0.50;
  } else if (result.status === 'OUT_OF_SCOPE' || result.status === 'UNAUTHORIZED') {
    intentScore = 0.10;
  }

  // 2. Hitung Entity Score & Ambiguity Margin
  if (result.targetEntity) {
    // Entitas spesifik ditemukan
    entityScore = 0.90;
  } else if (result.data.qosidahs && result.data.qosidahs.length > 0) {
    if (result.data.qosidahs.length === 1) {
      entityScore = 0.85;
      ambiguityMargin = 0.80;
    } else {
      // Ada beberapa kandidat, cek selisih (ambiguity margin)
      entityScore = 0.70;
      ambiguityMargin = 0.10; // Margin tipis
    }
  } else if (result.data.nearestJob || (result.data.jobs && result.data.jobs.length > 0)) {
    entityScore = 0.85;
    ambiguityMargin = 0.80;
  } else if (result.data.staticContent) {
    entityScore = 0.80;
    ambiguityMargin = 0.70;
  } else {
    entityScore = 0.20;
    ambiguityMargin = 0.0;
  }

  // Jika hasil secara eksplisit ditandai ambigu
  if (result.isAmbiguous || result.status === 'AMBIGUOUS') {
    ambiguityMargin = 0.05;
    entityScore = Math.min(entityScore, 0.60);
  }

  // 3. Hitung Evidence Score dari MatchEvidence
  const evidenceCount = (result.evidence || []).length;
  if (evidenceCount >= 3) {
    evidenceScore = 0.95;
  } else if (evidenceCount === 2) {
    evidenceScore = 0.80;
  } else if (evidenceCount === 1) {
    evidenceScore = 0.65;
  } else if (result.data.nearestJob || (result.data.jobs && result.data.jobs.length > 0)) {
    evidenceScore = 0.75; // Agenda job berbasis filter tanggal
  } else if (typeof result.data.count === 'number') {
    evidenceScore = 0.80; // Hasil perhitungan data
  } else {
    evidenceScore = 0.30;
  }

  // 4. Hitung Composite Score (Bobot: Intent 40%, Entity 35%, Evidence 15%, Margin 10%)
  let compositeScore =
    intentScore * 0.40 +
    entityScore * 0.35 +
    evidenceScore * 0.15 +
    ambiguityMargin * 0.10;

  // Penalti kegagalan operasi penalaran
  if (result.status !== 'SUCCESS') {
    compositeScore = Math.min(compositeScore, 0.65);
  }
  if (result.status === 'OUT_OF_SCOPE' || result.status === 'UNAUTHORIZED') {
    compositeScore = 0.15;
  }

  // Batasi rentang 0.0 sampai 1.0
  compositeScore = Math.max(0.0, Math.min(1.0, Math.round(compositeScore * 100) / 100));

  // 5. Tentukan Tier Keyakinan
  let tier: ConfidenceTier = 'low';
  if (compositeScore >= config.highThreshold && ambiguityMargin >= config.ambiguityMarginThreshold) {
    tier = 'high';
  } else if (compositeScore >= config.mediumThreshold) {
    tier = 'medium';
  } else {
    tier = 'low';
  }

  // 6. Penjelasan Rasional Penetapan Skor
  const explanation = `Intent=${intentScore.toFixed(2)}, Entity=${entityScore.toFixed(2)}, Evidence=${evidenceScore.toFixed(2)}, Margin=${ambiguityMargin.toFixed(2)} => Composite=${compositeScore.toFixed(2)} [Tier: ${tier.toUpperCase()}]`;

  return {
    intentScore,
    entityScore,
    evidenceScore,
    ambiguityMargin,
    compositeScore,
    tier,
    explanation,
  };
}
