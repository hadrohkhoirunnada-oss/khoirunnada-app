/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - INTENT SCORER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Sistem pembobotan intent multi-faktor dengan output yang transparan & dapat dijelaskan (explainable).
 */

import { extractWords } from './tokenizer.ts';
import { normalizeText, detectNegation } from './normalizer.ts';
import { fuzzyMatch, tokenOverlapScore } from './matcher.ts';

export interface IntentDefinition {
  id: string;
  phrases?: string[];
  keywords: string[];
  negativeKeywords?: string[];
  weight?: number; // default: 1.0
}

export interface ScoredIntent {
  intentId: string;
  score: number; // 0.0 s/d 1.0
  confidence: 'high' | 'medium' | 'low';
  matchedFeatures: string[];
  explanation: string;
}

/**
 * Menghitung skor kecocokan antara input pengguna dengan sebuah definisi intent.
 */
export function scoreIntent(userInput: string, intent: IntentDefinition): ScoredIntent {
  if (!userInput || !userInput.trim()) {
    return {
      intentId: intent.id,
      score: 0.0,
      confidence: 'low',
      matchedFeatures: [],
      explanation: 'Input kosong',
    };
  }

  const normalizedInput = normalizeText(userInput);
  const userWords = extractWords(normalizedInput);
  const negation = detectNegation(normalizedInput);

  let score = 0.0;
  const matchedFeatures: string[] = [];
  const explanations: string[] = [];

  // 1. Evaluasi Frasa Lengkap (Exact / Substring Phrase Match)
  if (intent.phrases && intent.phrases.length > 0) {
    for (const phrase of intent.phrases) {
      const normPhrase = normalizeText(phrase);
      if (normalizedInput === normPhrase) {
        score += 0.85;
        matchedFeatures.push(`exact_phrase:"${phrase}"`);
        explanations.push(`Kecocokan frasa persis ("${phrase}")`);
        break;
      } else if (normalizedInput.includes(normPhrase) || normPhrase.includes(normalizedInput)) {
        score += 0.65;
        matchedFeatures.push(`substring_phrase:"${phrase}"`);
        explanations.push(`Kecocokan frasa sebagian ("${phrase}")`);
        break;
      }
    }
  }

  // 2. Evaluasi Kata Kunci (Keywords Match & Fuzzy Typo Tolerance)
  let matchedKeywordCount = 0;
  for (const keyword of intent.keywords) {
    const normKeyword = normalizeText(keyword);

    // Cek apakah keyword masuk dalam konteks negasi
    if (negation.hasNegation && negation.negatedTerms.includes(normKeyword)) {
      matchedFeatures.push(`negated_keyword:"${keyword}"`);
      explanations.push(`Kata kunci diabaikan karena negasi ("${keyword}")`);
      continue;
    }

    let keywordFound = false;

    // A. Substring keyword langsung
    if (normalizedInput.includes(normKeyword)) {
      matchedKeywordCount++;
      matchedFeatures.push(`keyword:"${keyword}"`);
      keywordFound = true;
    } else {
      // B. Fuzzy matching terhadap token kata pengguna
      for (const uWord of userWords) {
        const fm = fuzzyMatch(uWord, normKeyword, 0.78);
        if (fm.matched) {
          matchedKeywordCount++;
          matchedFeatures.push(`fuzzy_keyword:"${keyword}"~${uWord}`);
          explanations.push(`Kecocokan kata serupa/typo ("${uWord}" mirip "${keyword}")`);
          keywordFound = true;
          break;
        }
      }
    }

    if (keywordFound && score < 0.6) {
      score += 0.25;
    }
  }

  // Tambahkan kontribusi rasio kata kunci yang cocok
  if (intent.keywords.length > 0 && matchedKeywordCount > 0) {
    const kwRatio = matchedKeywordCount / Math.min(intent.keywords.length, 3);
    score += Math.min(0.35, kwRatio * 0.35);
    explanations.push(`${matchedKeywordCount} kata kunci relevan ditemukan`);
  }

  // 3. Evaluasi Token Overlap (Jaccard Similarity)
  const intentWords = intent.keywords.map((k) => k.toLowerCase());
  const overlap = tokenOverlapScore(userWords, intentWords);
  if (overlap > 0) {
    score += overlap * 0.15;
    matchedFeatures.push(`token_overlap:${overlap.toFixed(2)}`);
  }

  // 4. Penalti Negative Keywords
  if (intent.negativeKeywords && intent.negativeKeywords.length > 0) {
    for (const negKw of intent.negativeKeywords) {
      if (normalizedInput.includes(negKw.toLowerCase())) {
        score -= 0.50;
        matchedFeatures.push(`penalty_neg_kw:"${negKw}"`);
        explanations.push(`Penalti kata negatif ("${negKw}")`);
      }
    }
  }

  // Terapkan bobot prioritas intent (jika ada)
  const weight = intent.weight ?? 1.0;
  score = score * weight;

  // Batasi rentang skor 0.0 s/d 1.0
  const finalScore = Math.max(0.0, Math.min(1.0, score));

  // Tentukan tingkat keyakinan (Confidence Level)
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (finalScore >= 0.65) {
    confidence = 'high';
  } else if (finalScore >= 0.38) {
    confidence = 'medium';
  }

  return {
    intentId: intent.id,
    score: Number(finalScore.toFixed(3)),
    confidence,
    matchedFeatures,
    explanation: explanations.join('; ') || 'Skor berbasis pola kata',
  };
}

/**
 * Menghitung skor seluruh intent dan mengurutkannya dari yang tertinggi.
 */
export function scoreAllIntents(userInput: string, intents: IntentDefinition[]): ScoredIntent[] {
  return intents
    .map((intent) => scoreIntent(userInput, intent))
    .sort((a, b) => b.score - a.score);
}

/**
 * Mengambil intent terbaik jika melewati ambang batas minimum.
 */
export function getBestIntent(
  userInput: string,
  intents: IntentDefinition[],
  minThreshold: number = 0.40
): ScoredIntent | null {
  const ranked = scoreAllIntents(userInput, intents);
  if (ranked.length > 0 && ranked[0].score >= minThreshold) {
    return ranked[0];
  }
  return null;
}
