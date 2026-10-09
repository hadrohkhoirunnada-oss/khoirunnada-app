/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - MATCHER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Algoritma pencocokan Damerau-Levenshtein, N-Gram similarity, dan token overlap.
 */

import { extractCharNgrams } from './tokenizer.ts';

/**
 * Menghitung Damerau-Levenshtein Distance antara dua string.
 * Mendukung 4 operasi: insertion, deletion, substitution, dan transposition (tukar huruf berdampingan).
 * Kompleksitas: O(M * N) dengan alokasi memori terkendali.
 */
export function damerauLevenshtein(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const len1 = s1.length;
  const len2 = s2.length;

  // Batas alokasi matriks (maksimal 100x100 untuk performa browser yang sangat cepat)
  if (len1 > 100 || len2 > 100) {
    const sub1 = s1.slice(0, 100);
    const sub2 = s2.slice(0, 100);
    return damerauLevenshtein(sub1, sub2);
  }

  // Matriks alokasi berdimensi (len1 + 2) x (len2 + 2)
  const d: number[][] = Array.from({ length: len1 + 2 }, () =>
    new Array(len2 + 2).fill(0)
  );

  const maxDist = len1 + len2;
  d[0][0] = maxDist;

  for (let i = 0; i <= len1; i++) {
    d[i + 1][0] = maxDist;
    d[i + 1][1] = i;
  }
  for (let j = 0; j <= len2; j++) {
    d[0][j + 1] = maxDist;
    d[1][j + 1] = j;
  }

  // Map posisi terakhir kemunculan karakter
  const lastCharRow: Record<string, number> = {};

  for (let i = 1; i <= len1; i++) {
    let lastCharCol = 0;
    const char1 = s1[i - 1];

    for (let j = 1; j <= len2; j++) {
      const char2 = s2[j - 1];
      const i1 = lastCharRow[char2] || 0;
      const j1 = lastCharCol;

      const cost = char1 === char2 ? 0 : 1;
      if (cost === 0) {
        lastCharCol = j;
      }

      d[i + 1][j + 1] = Math.min(
        d[i][j + 1] + 1, // deletion
        d[i + 1][j] + 1, // insertion
        d[i][j] + cost, // substitution
        d[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1) // transposition
      );
    }

    lastCharRow[char1] = i;
  }

  return d[len1 + 1][len2 + 1];
}

/**
 * Menghitung kemiripan string berbasis Damerau-Levenshtein normalisasi (0.0 s/d 1.0).
 */
export function stringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const dist = damerauLevenshtein(s1, s2);
  const sim = 1.0 - dist / maxLen;
  return Math.max(0, Math.min(1.0, sim));
}

/**
 * Menghitung kemiripan Character N-Gram menggunakan Dice Coefficient (0.0 s/d 1.0).
 * Sangat tangguh mendeteksi kemiripan meskipun ada typo di tengah kata atau penambahan imbuhan.
 */
export function ngramSimilarity(s1: string, s2: string, n: number = 2): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const grams1 = extractCharNgrams(s1, n);
  const grams2 = extractCharNgrams(s2, n);

  if (!grams1.length || !grams2.length) return 0.0;

  const set2Count = new Map<string, number>();
  for (const g of grams2) {
    set2Count.set(g, (set2Count.get(g) || 0) + 1);
  }

  let matches = 0;
  for (const g of grams1) {
    const count = set2Count.get(g) || 0;
    if (count > 0) {
      matches++;
      set2Count.set(g, count - 1);
    }
  }

  return (2.0 * matches) / (grams1.length + grams2.length);
}

/**
 * Menghitung overlap/Jaccard similarity antar kumpulan token kata.
 */
export function tokenOverlapScore(tokens1: string[], tokens2: string[]): number {
  if (!tokens1.length || !tokens2.length) return 0.0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersection = 0;
  for (const t of set1) {
    if (set2.has(t)) {
      intersection++;
    }
  }

  const union = new Set([...tokens1, ...tokens2]).size;
  return union === 0 ? 0.0 : intersection / union;
}

export interface FuzzyMatchResult {
  matched: boolean;
  score: number;
  method: 'exact' | 'contains' | 'ngram' | 'levenshtein' | 'none';
}

/**
 * Fuzzy matcher gabungan multi-strategi (Exact -> Substring -> N-Gram -> Levenshtein).
 */
export function fuzzyMatch(
  query: string,
  target: string,
  threshold: number = 0.72
): FuzzyMatchResult {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (q === t) {
    return { matched: true, score: 1.0, method: 'exact' };
  }

  if (t.includes(q) || q.includes(t)) {
    const ratio = Math.min(q.length, t.length) / Math.max(q.length, t.length);
    const score = Math.max(0.85, 0.75 + 0.25 * ratio);
    return { matched: true, score, method: 'contains' };
  }

  // Cek N-Gram Trigram/Bigram
  const ngScore = ngramSimilarity(q, t, 2);
  if (ngScore >= threshold) {
    return { matched: true, score: ngScore, method: 'ngram' };
  }

  // Cek Damerau-Levenshtein jika panjang kata mirip
  if (Math.abs(q.length - t.length) <= 3) {
    const dlScore = stringSimilarity(q, t);
    if (dlScore >= threshold) {
      return { matched: true, score: dlScore, method: 'levenshtein' };
    }
  }

  return { matched: false, score: Math.max(ngScore, 0), method: 'none' };
}
