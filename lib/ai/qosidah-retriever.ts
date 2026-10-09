/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - QOSIDAH RETRIEVER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mesin pencari qosidah hybrid: Exact, Alternate/Alias, Arabic Normalized,
 * Prefix, Damerau-Levenshtein, N-Gram Dice, Tags, Category, dan Content Lyrics.
 */

import type { Qosidah } from '../types.ts';
import type { RetrievalResult, MatchEvidence, RetrievalStrategy } from './retrieval-types.ts';
import { normalizeText, normalizeArabic, normalizeSlang } from './normalizer.ts';
import { extractWords } from './tokenizer.ts';
import { damerauLevenshtein, ngramSimilarity, stringSimilarity, tokenOverlapScore } from './matcher.ts';

export interface QosidahRetrievalOptions {
  limit?: number;
  minThreshold?: number;
  enableContentSearch?: boolean;
}

/**
 * Membersihkan awalan frasa perintah pencarian (misal "carikan saya qosidah", "lirik lagu", dsb)
 */
export function cleanQosidahQuery(input: string): string {
  let q = input.trim();
  // Hilangkan tanda baca luar
  q = q.replace(/^[?"'«»“”…\s]+|[?"'«»“”…\s]+$/g, '');
  // Hilangkan slang & pola pencarian umum
  q = normalizeSlang(q);

  const prefixRegex =
    /^(carikan|cariin|carikn|cari|buka|lihat|tampilkan|bacakan)\s+(saya\s+|dong\s+|in\s+)?(qosidah|qasidah|sholawat|salawat|lagu|syair|lirik|teks|bacaan)?\s*/i;
  const withoutCommand = q.replace(prefixRegex, '').trim();

  // Jika setelah dibersihkan tersisa sesuatu, gunakan itu
  if (withoutCommand.length >= 2) {
    q = withoutCommand;
  }

  // Jika kata pertama adalah qosidah/sholawat tetapi diikuti kata lain, kita simpan juga
  // agar query seperti "Sholawat Badar" atau "Qosidah Burdah" tetap dapat dicocokkan utuh
  return q.trim();
}

/**
 * Melakukan retrieval qosidah hybrid dari koleksi dinamis qosidahs context.
 */
export function retrieveQosidahs(
  rawQuery: string,
  qosidahs: Qosidah[],
  options: QosidahRetrievalOptions = {}
): RetrievalResult<Qosidah>[] {
  const limit = options.limit ?? 5;
  const minThreshold = options.minThreshold ?? 0.5;
  const enableContentSearch = options.enableContentSearch ?? true;

  if (!qosidahs || qosidahs.length === 0) return [];

  const rawTrimmed = rawQuery.trim().replace(/^[?"'«»“”…\s]+|[?"'«»“”…\s]+$/g, '');
  if (rawTrimmed.length < 2) return [];

  const normRaw = normalizeText(rawTrimmed).toLowerCase();
  const cleaned = cleanQosidahQuery(rawTrimmed);
  const normQuery = normalizeText(cleaned).toLowerCase();

  // Varian query tanpa kata awalan "qosidah"/"sholawat" jika ada
  const strippedPrefix = normRaw.replace(/^(qosidah|qasidah|sholawat|salawat|syair|lirik|lagu)\s+/i, '').trim();

  const normArabicQuery = normalizeArabic(rawTrimmed);
  const isQueryArabic = /[\u0600-\u06FF]/.test(rawTrimmed);

  const results: RetrievalResult<Qosidah>[] = [];

  for (const q of qosidahs) {
    if (!q || !q.title) continue;

    const evidences: MatchEvidence[] = [];
    let topScore = 0;
    let topStrategy: RetrievalStrategy = 'fuzzy_title';

    const rawTitle = q.title || '';
    const normTitle = normalizeText(rawTitle).toLowerCase();
    const rawAlt = q.alternate_title || '';
    const normAlt = normalizeText(rawAlt).toLowerCase();
    const rawArabic = q.arabic_text || '';
    const normArabic = normalizeArabic(rawArabic);
    const rawLatin = q.latin_text || '';
    const normLatin = normalizeText(rawLatin).toLowerCase();
    const categoryName = q.category_name || '';
    const normCategory = normalizeText(categoryName).toLowerCase();
    const tags = Array.isArray(q.tags) ? q.tags : [];
    const translation = q.translation || '';
    const normTranslation = normalizeText(translation).toLowerCase();

    // 1. EXACT TITLE MATCH (Prioritas Terkuat)
    if (normRaw === normTitle || normQuery === normTitle || (strippedPrefix.length >= 2 && strippedPrefix === normTitle)) {
      const score = 1.0;
      evidences.push({
        field: 'title',
        strategy: 'exact_title',
        score,
        matchedTerm: rawTitle,
        snippet: rawTitle,
      });
      topScore = Math.max(topScore, score);
      topStrategy = 'exact_title';
    }

    // 2. EXACT ALTERNATE TITLE MATCH
    if (rawAlt && (normRaw === normAlt || normQuery === normAlt || (strippedPrefix.length >= 2 && strippedPrefix === normAlt))) {
      const score = 0.95;
      evidences.push({
        field: 'alternate_title',
        strategy: 'exact_alias',
        score,
        matchedTerm: rawAlt,
        snippet: rawAlt,
      });
      topScore = Math.max(topScore, score);
      if (topStrategy !== 'exact_title') topStrategy = 'exact_alias';
    }

    // 3. NORMALIZED ARABIC MATCH (Dengan atau Tanpa Harakat)
    if (isQueryArabic && normArabicQuery.length >= 2) {
      const normArabicTitle = normalizeArabic(rawTitle);
      if (normArabicQuery === normArabicTitle || normArabicQuery === normArabic) {
        const score = 0.95;
        evidences.push({
          field: 'arabic_text',
          strategy: 'arabic_normalized',
          score,
          matchedTerm: rawTrimmed,
          snippet: rawArabic.slice(0, 50),
        });
        topScore = Math.max(topScore, score);
        topStrategy = 'arabic_normalized';
      } else if (normArabic.includes(normArabicQuery) || normArabicQuery.includes(normArabic)) {
        const score = 0.85;
        evidences.push({
          field: 'arabic_text',
          strategy: 'arabic_normalized',
          score,
          matchedTerm: rawTrimmed,
          snippet: rawArabic.slice(0, 50),
        });
        topScore = Math.max(topScore, score);
        if (topStrategy !== 'exact_title' && topStrategy !== 'exact_alias') {
          topStrategy = 'arabic_normalized';
        }
      }
    }

    // 4. CATEGORY MATCHING (Jika mencari nama kategori seperti "Qosidah Jawa")
    if (normCategory) {
      if (normRaw === normCategory || normQuery === normCategory) {
        const score = 0.90;
        evidences.push({
          field: 'category_name',
          strategy: 'category_match',
          score,
          matchedTerm: categoryName,
          snippet: `Kategori cocok persis: "${categoryName}"`,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'category_match';
      } else if (normRaw.length >= 4 && (normCategory.includes(normRaw) || normRaw.includes(normCategory))) {
        const score = 0.75;
        evidences.push({
          field: 'category_name',
          strategy: 'category_match',
          score,
          matchedTerm: categoryName,
          snippet: `Kategori terkait: "${categoryName}"`,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'category_match';
      }
    }

    // 5. PREFIX MATCH & SUBSTRING MATCH PADA TITLE / ALT
    const queryVariants = [normQuery, normRaw, strippedPrefix].filter((v) => v.length >= 2);
    for (const qv of queryVariants) {
      if (normTitle.startsWith(qv)) {
        const ratio = qv.length / normTitle.length;
        const score = 0.85 + ratio * 0.1;
        evidences.push({
          field: 'title',
          strategy: 'prefix_title',
          score,
          matchedTerm: qv,
          snippet: rawTitle,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'prefix_title';
      } else if (rawAlt && normAlt.startsWith(qv)) {
        const ratio = qv.length / normAlt.length;
        const score = 0.82 + ratio * 0.1;
        evidences.push({
          field: 'alternate_title',
          strategy: 'prefix_title',
          score,
          matchedTerm: qv,
          snippet: rawAlt,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'prefix_title';
      } else if (qv.length >= 3 && normTitle.includes(qv)) {
        const ratio = qv.length / normTitle.length;
        const score = 0.80 + ratio * 0.1;
        evidences.push({
          field: 'title',
          strategy: 'prefix_title',
          score,
          matchedTerm: qv,
          snippet: rawTitle,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'prefix_title';
      }
    }

    // 6. FUZZY MATCHING (Hanya jika query > 3 karakter agar konservatif)
    const effectiveQuery = strippedPrefix.length >= 3 ? strippedPrefix : normQuery;
    if (effectiveQuery.length > 3) {
      // Damerau-Levenshtein pada Judul Utama
      const distTitle = damerauLevenshtein(effectiveQuery, normTitle);
      if (distTitle <= 1) {
        const score = 0.88;
        evidences.push({
          field: 'title',
          strategy: 'fuzzy_title',
          score,
          matchedTerm: rawTitle,
          snippet: `Typo 1 edit: "${effectiveQuery}" vs "${normTitle}"`,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'fuzzy_title';
      } else if (distTitle === 2 && effectiveQuery.length >= 6) {
        const score = 0.78;
        evidences.push({
          field: 'title',
          strategy: 'fuzzy_title',
          score,
          matchedTerm: rawTitle,
          snippet: `Typo 2 edit: "${effectiveQuery}" vs "${normTitle}"`,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'fuzzy_title';
      }

      // Damerau-Levenshtein pada Alternate Title
      if (rawAlt) {
        const distAlt = damerauLevenshtein(effectiveQuery, normAlt);
        if (distAlt <= 1) {
          const score = 0.85;
          evidences.push({
            field: 'alternate_title',
            strategy: 'fuzzy_title',
            score,
            matchedTerm: rawAlt,
            snippet: `Typo 1 edit: "${effectiveQuery}" vs "${normAlt}"`,
          });
          topScore = Math.max(topScore, score);
          if (topScore === score) topStrategy = 'fuzzy_title';
        } else if (distAlt === 2 && effectiveQuery.length >= 6) {
          const score = 0.75;
          evidences.push({
            field: 'alternate_title',
            strategy: 'fuzzy_title',
            score,
            matchedTerm: rawAlt,
            snippet: `Typo 2 edit: "${effectiveQuery}" vs "${normAlt}"`,
          });
          topScore = Math.max(topScore, score);
          if (topScore === score) topStrategy = 'fuzzy_title';
        }
      }

      // N-Gram Character Dice Similarity
      const charNgramScore = ngramSimilarity(effectiveQuery, normTitle, 3);
      if (charNgramScore >= 0.7) {
        const score = Math.min(0.85, charNgramScore * 0.9);
        evidences.push({
          field: 'title',
          strategy: 'ngram_title',
          score,
          matchedTerm: rawTitle,
          snippet: `N-gram Dice: ${(charNgramScore * 100).toFixed(0)}%`,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'ngram_title';
      }
    }

    // 7. TAGS MATCHING
    for (const tag of tags) {
      const normTag = normalizeText(tag).toLowerCase();
      if (normTag === normQuery || normTag === normRaw || (strippedPrefix.length >= 2 && normTag === strippedPrefix)) {
        const score = 0.82;
        evidences.push({
          field: 'tags',
          strategy: 'tag_match',
          score,
          matchedTerm: tag,
          snippet: `Tag cocok persis: "${tag}"`,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'tag_match';
      } else if (normQuery.length >= 4 && normTag.includes(normQuery)) {
        const score = 0.72;
        evidences.push({
          field: 'tags',
          strategy: 'tag_match',
          score,
          matchedTerm: tag,
          snippet: `Tag mengandung kata kunci: "${tag}"`,
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'tag_match';
      }
    }

    // 8. CONTENT LATIN & TRANSLATION MATCHING (Jika Diaktifkan)
    if (enableContentSearch && effectiveQuery.length >= 4) {
      if (normLatin.includes(effectiveQuery)) {
        const score = 0.68;
        const index = normLatin.indexOf(effectiveQuery);
        const snippet = rawLatin.slice(Math.max(0, index - 20), index + effectiveQuery.length + 30);
        evidences.push({
          field: 'latin_text',
          strategy: 'content_latin',
          score,
          matchedTerm: effectiveQuery,
          snippet: snippet.trim(),
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'content_latin';
      }

      if (normTranslation && normTranslation.includes(effectiveQuery)) {
        const score = 0.65;
        const index = normTranslation.indexOf(effectiveQuery);
        const snippet = translation.slice(Math.max(0, index - 20), index + effectiveQuery.length + 30);
        evidences.push({
          field: 'translation',
          strategy: 'content_translation',
          score,
          matchedTerm: effectiveQuery,
          snippet: snippet.trim(),
        });
        topScore = Math.max(topScore, score);
        if (topScore === score) topStrategy = 'content_translation';
      }
    }

    // Simpan hasil jika melewati ambang batas
    if (topScore >= minThreshold && evidences.length > 0) {
      results.push({
        item: q,
        score: topScore,
        confidence: topScore >= 0.85 ? 'high' : topScore >= 0.7 ? 'medium' : 'low',
        strategy: topStrategy,
        evidence: evidences,
      });
    }
  }

  // Urutkan berdasarkan skor tertinggi (descending)
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
