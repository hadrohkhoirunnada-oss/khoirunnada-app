/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - TOKENIZER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mendukung pemecahan token Unicode-aware untuk Bahasa Indonesia dan Teks Arab.
 */

export type TokenKind = 'word' | 'arabic' | 'number' | 'punctuation' | 'whitespace';

export interface Token {
  text: string;
  normalized: string;
  kind: TokenKind;
  startIndex: number;
  endIndex: number;
}

export interface TokenizerOptions {
  maxLength?: number;
  includeWhitespace?: boolean;
  includePunctuation?: boolean;
}

// Batas input aman untuk browser guna mencegah DoS / ReDoS
export const MAX_INPUT_LENGTH = 500;

// Blok Unicode Teks Arab (termasuk Harakat / Tashkeel)
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Regex pemecah token Unicode dengan penjagaan apostrof internal (misal: "wa'alaikumussalam", "'arobiah")
const TOKEN_PATTERN = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)|([a-zA-Z0-9]+(?:['’][a-zA-Z0-9]+)*)|(\d+(?:[.,]\d+)*)|(\s+)|([^\s\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu;

/**
 * Tokenize teks input secara Unicode-aware dan aman untuk browser.
 */
export function tokenize(input: string, options: TokenizerOptions = {}): Token[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const maxLength = options.maxLength ?? MAX_INPUT_LENGTH;
  const safeText = input.slice(0, maxLength);
  const includeWhitespace = options.includeWhitespace ?? false;
  const includePunctuation = options.includePunctuation ?? false;

  const tokens: Token[] = [];
  const matches = safeText.matchAll(TOKEN_PATTERN);

  for (const match of matches) {
    const raw = match[0];
    const startIndex = match.index ?? 0;
    const endIndex = startIndex + raw.length;

    let kind: TokenKind = 'word';

    if (ARABIC_REGEX.test(raw)) {
      kind = 'arabic';
    } else if (/^\d+(?:[.,]\d+)*$/.test(raw)) {
      kind = 'number';
    } else if (/^\s+$/.test(raw)) {
      kind = 'whitespace';
    } else if (/^[^\s\w]$/.test(raw)) {
      kind = 'punctuation';
    }

    if (kind === 'whitespace' && !includeWhitespace) {
      continue;
    }
    if (kind === 'punctuation' && !includePunctuation) {
      continue;
    }

    tokens.push({
      text: raw,
      normalized: raw.toLowerCase().trim(),
      kind,
      startIndex,
      endIndex,
    });
  }

  return tokens;
}

/**
 * Mengambil daftar kata (terms) yang relevan (hanya word, arabic, dan number).
 */
export function extractWords(input: string, maxLength: number = MAX_INPUT_LENGTH): string[] {
  return tokenize(input, { maxLength, includeWhitespace: false, includePunctuation: false })
    .map((t) => t.normalized)
    .filter((t) => t.length > 0);
}

/**
 * Membuat n-gram dari daftar token kata (misal: bi-gram, tri-gram).
 */
export function extractNgrams(words: string[], n: number = 2): string[] {
  if (n <= 0 || words.length < n) {
    return [];
  }

  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Membuat character n-gram (default n=3 / trigram) untuk fuzzy matching.
 */
export function extractCharNgrams(text: string, n: number = 3): string[] {
  const clean = text.toLowerCase().replace(/\s+/g, ' ').trim();
  if (clean.length < n) {
    return [clean];
  }

  const grams: string[] = [];
  for (let i = 0; i <= clean.length - n; i++) {
    grams.push(clean.slice(i, i + n));
  }
  return grams;
}
