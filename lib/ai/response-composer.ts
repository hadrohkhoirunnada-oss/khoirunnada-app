/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - NATURAL RESPONSE COMPOSER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mesin utama penyusun jawaban alami (Natural Response Composer) untuk FASE 5.
 * Mengubah ReasoningResult menjadi respons bahasa Indonesia yang santun, komunikatif,
 * akurat, dan sesuai fakta tanpa menggunakan model bahasa eksternal (Rp0 Cost).
 */

import type { AIContext, AIResponse } from '../ai-engine.ts';
import type { ReasoningResult } from './plan-types.ts';
import type {
  ComposerOptions,
  ComposedResponse,
  ResponseStyle,
} from './composer-types.ts';

import { detectResponseStyle } from './response-style.ts';
import { extractFacts } from './fact-extractor.ts';
import { generateSentence } from './sentence-generator.ts';
import { buildClarificationMessage } from './clarification-builder.ts';
import { composeActions } from './action-composer.ts';
import { sanitizeResponse } from './output-sanitizer.ts';
import { checkResponseConsistency } from './consistency-checker.ts';

/**
 * Menyusun respons alami terstruktur (AIResponse) dari hasil penalaran (ReasoningResult).
 */
export function composeResponse(
  result: ReasoningResult,
  context: AIContext,
  options: ComposerOptions = {}
): AIResponse {
  const meta = composeResponseWithMeta(result, context, options);
  return meta.response;
}

/**
 * Menyusun respons alami lengkap dengan metadata untuk audit kualitas dan pengujian (FASE 5).
 */
export function composeResponseWithMeta(
  result: ReasoningResult,
  context: AIContext,
  options: ComposerOptions = {}
): ComposedResponse {
  const timeZone = options.timeZone || 'Asia/Makassar';
  const facts = extractFacts(result, timeZone);

  // Tentukan gaya respons (concise, informative, detailed)
  const style: ResponseStyle = options.style || detectResponseStyle(result.plan?.query);

  let rawText = '';
  const factsUsed: string[] = [];

  // Jika status penalaran bukan SUCCESS, gunakan natural clarification builder
  if (facts.status !== 'SUCCESS') {
    rawText = buildClarificationMessage(facts, style);
    if (facts.failureReason) factsUsed.push(`Status: ${facts.status} (${facts.failureReason})`);
  } else {
    // Susun kalimat berbasis fakta terverifikasi
    rawText = generateSentence(facts, style, options.seed);

    if (facts.qosidahs.length > 0) {
      factsUsed.push(`Qosidahs: ${facts.qosidahs.map((q) => q.title).join(', ')}`);
    }
    if (facts.jobs.length > 0) {
      factsUsed.push(`Jobs: ${facts.jobs.map((j) => j.title).join(', ')}`);
    }
    if (facts.nearestJob) {
      factsUsed.push(`NearestJob: ${facts.nearestJob.title}`);
    }
    if (typeof facts.count === 'number') {
      factsUsed.push(`Count: ${facts.count}`);
    }
    if (facts.attributeValue) {
      factsUsed.push(`Attribute: ${facts.attributeName} = ${facts.attributeValue.slice(0, 30)}...`);
    }
    if (facts.staticContent) {
      factsUsed.push('StaticOfficialContent');
    }
  }

  // Susun tombol tindakan (AIAction) yang aman dan relevan
  const rawActions = composeActions(facts, { maxActions: options.maxActions });

  // Tentukan apakah memerlukan deep search animation (misal profil Dzarin / Nexarin)
  const isDeepSearch =
    result.intent === 'dzarin_profile' ||
    result.intent === 'siapa_dzarin' ||
    Boolean(facts.staticContent && facts.staticContent.includes('Muhammad Abi Dzarin')) ||
    Boolean(result.plan?.query && /\b(dzarin|nexarin|by-rins)\b/i.test(result.plan.query));

  // Sanitasi akhir: jamin Zero Asterisk (*), bebas HTML berbahaya, dan bebas trace internal
  const sanitizedResponse = sanitizeResponse({
    text: rawText,
    actions: rawActions.length > 0 ? rawActions : undefined,
    isDeepSearch,
  });

  // Verifikasi konsistensi faktual
  const consistency = checkResponseConsistency(sanitizedResponse.text, facts);

  return {
    response: sanitizedResponse,
    style,
    factsUsed,
    reasoningStatus: facts.status,
    isConsistent: consistency.isConsistent,
  };
}
