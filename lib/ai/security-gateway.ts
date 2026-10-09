/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - SECURITY GATEWAY & CONFIDENCE PIPELINE
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Gerbang utama pengamanan dan evaluasi keyakinan (FASE 6).
 * Mengintegrasikan seluruh siklus masukan -> isolasi data -> penalaran ->
 * evaluasi keyakinan -> keputusan -> penyusunan respons -> audit faktual.
 */

import type { AIContext, AIResponse } from '../ai-engine.ts';
import type {
  ConfidenceConfig,
  SecurityGateResult,
} from './confidence-types.ts';
import type { ComposerOptions } from './composer-types.ts';

import { validateUserInput } from './input-validator.ts';
import { sanitizeContextForAI } from './data-sanitizer.ts';
import { executeReasoning } from './reasoning-engine.ts';
import { evaluateConfidence, DEFAULT_CONFIDENCE_CONFIG } from './confidence-scorer.ts';
import { determineDecision } from './decision-engine.ts';
import { composeResponse } from './response-composer.ts';
import { auditResponseFacts } from './fact-validator.ts';

export interface SecurityGateOptions extends ComposerOptions {
  confidenceConfig?: ConfidenceConfig;
}

/**
 * Memproses kueri pengguna melalui lapisan perlindungan keamanan dan evaluasi keyakinan penuh.
 */
export function processWithSecurityGate(
  userInput: string,
  context: AIContext,
  options: SecurityGateOptions = {}
): SecurityGateResult {
  const confConfig = options.confidenceConfig || DEFAULT_CONFIDENCE_CONFIG;

  // 1. Validasi Masukan & Perlindungan Abuse
  const validation = validateUserInput(userInput, confConfig.maxInputLength);

  if (!validation.isValid) {
    let refusalText = 'Maaf, pertanyaan Anda belum dapat kami proses.';
    if (validation.isAbusiveOrProhibited) {
      refusalText =
        'Afwan, permintaan tersebut di luar izin akses resmi Hadroh Khoirunnada atau melanggar batasan keamanan sistem.';
    }

    const fallbackResponse: AIResponse = {
      text: refusalText,
      actions: [
        { label: '📖 Cari Qosidah', promptText: 'Carikan saya qosidah' },
        { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
      ],
      isDeepSearch: false,
    };

    const emptyResult: any = {
      status: validation.isAbusiveOrProhibited ? 'UNAUTHORIZED' : 'OUT_OF_SCOPE',
      intent: 'prohibited_input',
      plan: { query: userInput, intent: 'prohibited_input', operations: [], isMultiStep: false, isFollowUp: false, isSupported: false },
      operationsExecuted: [],
      data: {},
      evidence: [],
      failureReason: validation.violationReason,
      summary: 'Input tidak valid atau terindikasi pelanggaran.',
    };

    return {
      decision: validation.isAbusiveOrProhibited ? 'DENY' : 'OUT_OF_SCOPE',
      confidence: {
        intentScore: 0,
        entityScore: 0,
        evidenceScore: 0,
        ambiguityMargin: 0,
        compositeScore: 0,
        tier: 'low',
        explanation: validation.violationReason || 'Input tidak valid.',
      },
      reasoningResult: emptyResult,
      response: fallbackResponse,
      factAudit: {
        isFactuallyAccurate: true,
        verifiedEntityRoutes: [],
        discrepancies: [],
        privateFieldsRedacted: 0,
      },
      isSafe: true,
    };
  }

  // 2. Isolasi Batas Data (Data Boundary Sanitization)
  const { sanitizedContext, redactedCount } = sanitizeContextForAI(context);

  // 3. Eksekusi Penalaran Deterministik
  const reasoning = executeReasoning(validation.sanitizedQuery, sanitizedContext, {
    referenceDate: options.referenceDate,
    timeZone: options.timeZone,
  });

  // 4. Kalkulasi Keyakinan (Confidence Evaluation)
  const confidence = evaluateConfidence(reasoning, confConfig);

  // 5. Keputusan Deterministik (Decision Engine)
  const decision = determineDecision(validation, reasoning, confidence);

  // 6. Penyusunan Respons Alami (Natural Response Composer)
  let rawResponse = composeResponse(reasoning, sanitizedContext, {
    style: options.style,
    seed: options.seed,
    referenceDate: options.referenceDate,
    timeZone: options.timeZone,
    maxActions: options.maxActions,
    userName: options.userName,
  });

  // Jika keputusan adalah DENY, pastikan respons tidak membocorkan data
  if (decision === 'DENY') {
    rawResponse = {
      text: 'Afwan, informasi tersebut bersifat privat dan administratif internal sehingga tidak dapat diakses secara publik.',
      actions: undefined,
      isDeepSearch: false,
    };
  }

  // 7. Audit Faktual dan Verifikasi Aksi Akhir
  const { auditedResponse, report } = auditResponseFacts(rawResponse, reasoning, sanitizedContext);
  report.privateFieldsRedacted += redactedCount;

  return {
    decision,
    confidence,
    reasoningResult: reasoning,
    response: auditedResponse,
    factAudit: report,
    isSafe: true,
  };
}

/**
 * Runner aman yang kompatibel penuh dengan signature AIResponse.
 */
export function safeProcessKhoirunnadaAI(
  userInput: string,
  context: AIContext,
  options: SecurityGateOptions = {}
): AIResponse {
  const result = processWithSecurityGate(userInput, context, options);
  return result.response;
}
