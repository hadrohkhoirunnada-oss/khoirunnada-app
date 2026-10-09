/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - CONFIDENCE, VALIDATION & SECURITY TYPES
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Definisi tipe data untuk Confidence Scorer, Decision Engine, dan Security Guard (FASE 6).
 */

import type { AIAction, AIResponse } from '../ai-engine.ts';
import type { ReasoningResult } from './plan-types.ts';

export type ConfidenceTier = 'high' | 'medium' | 'low';

export type ConfidenceDecision =
  | 'ANSWER'        // Jawaban didukung data dan bukti yang kuat
  | 'CLARIFY'       // Ambigu atau beberapa kandidat berjarak tipis, tawarkan pilihan
  | 'NOT_FOUND'     // Kueri didukung namun entitas/data tidak ditemukan di sistem
  | 'NEED_CONTEXT'  // Kueri lanjutan rujukan tanpa konteks aktif
  | 'OUT_OF_SCOPE'  // Di luar domain hadroh Khoirunnada
  | 'DENY';         // Permintaan data sensitif, ilegal, atau serangan injeksi

export interface ConfidenceScores {
  intentScore: number;       // 0.0 - 1.0 (Skor pencocokan maksud pengguna)
  entityScore: number;       // 0.0 - 1.0 (Skor kecocokan entitas qosidah/job)
  evidenceScore: number;     // 0.0 - 1.0 (Kekuatan bukti retrieval)
  ambiguityMargin: number;   // Selisih skor antara top-1 dan runner-up (0.0 - 1.0)
  compositeScore: number;    // Skor gabungan terkalibrasi secara heuristik (0.0 - 1.0)
  tier: ConfidenceTier;      // Kategori keyakinan: high | medium | low
  explanation: string;       // Penjelasan rasional penetapan skor
}

export interface ConfidenceConfig {
  highThreshold: number;             // Default: 0.75
  mediumThreshold: number;           // Default: 0.50
  ambiguityMarginThreshold: number;  // Default: 0.15
  maxInputLength: number;            // Default: 500 karakter
  maxOperationsLimit: number;        // Default: 10 operasi
}

export interface InputValidationResult {
  isValid: boolean;
  sanitizedQuery: string;
  isAbusiveOrProhibited: boolean;
  violationReason?: string;
}

export interface FactAuditReport {
  isFactuallyAccurate: boolean;
  verifiedEntityRoutes: string[];
  discrepancies: string[];
  privateFieldsRedacted: number;
}

export interface SecurityGateResult {
  decision: ConfidenceDecision;
  confidence: ConfidenceScores;
  reasoningResult: ReasoningResult;
  response: AIResponse;
  factAudit: FactAuditReport;
  isSafe: boolean;
}
