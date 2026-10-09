import assert from 'node:assert/strict';
import test from 'node:test';

import {
  tokenize,
  extractWords,
  extractNgrams,
  extractCharNgrams,
  MAX_INPUT_LENGTH,
} from '../lib/ai/tokenizer.ts';

import {
  normalizeSlang,
  detectNegation,
  normalizeArabic,
  normalizeText,
} from '../lib/ai/normalizer.ts';

import {
  damerauLevenshtein,
  stringSimilarity,
  ngramSimilarity,
  tokenOverlapScore,
  fuzzyMatch,
} from '../lib/ai/matcher.ts';

import {
  scoreIntent,
  scoreAllIntents,
  getBestIntent,
} from '../lib/ai/intent-scorer.ts';

// ==========================================
// 1. TOKENIZER TESTS
// ==========================================
test('Tokenizer: Pemecahan teks Bahasa Indonesia & kata berapostrof', () => {
  const text = "Assalamu'alaikum akhi, qosidah 'Arobiah nomor 1!";
  const tokens = tokenize(text);

  assert.ok(tokens.length >= 6);
  const words = extractWords(text);
  assert.ok(words.includes("assalamu'alaikum"));
  assert.ok(words.includes("'arobiah") || words.includes("arobiah"));
  assert.ok(words.includes('1'));
});

test('Tokenizer: Pengenalan teks Arab & harakat (Unicode-aware)', () => {
  const arabicText = 'بُشْرَى لَنَا نِلْنَا الْمُنَى';
  const tokens = tokenize(arabicText);

  assert.ok(tokens.length > 0);
  assert.equal(tokens[0].kind, 'arabic');
  assert.ok(tokens[0].text.length > 0);
});

test('Tokenizer: Perlindungan batas panjang input (Browser Safety)', () => {
  const giantInput = 'a'.repeat(800);
  const tokens = tokenize(giantInput);
  // Total karakter yang diproses tidak melebihi MAX_INPUT_LENGTH
  const totalLength = tokens.reduce((acc, t) => acc + t.text.length, 0);
  assert.ok(totalLength <= MAX_INPUT_LENGTH);
});

test('Tokenizer: Ekstraksi N-Gram kata dan karakter', () => {
  const words = ['hadroh', 'khoirunnada', 'indonesia'];
  const bigrams = extractNgrams(words, 2);
  assert.deepEqual(bigrams, ['hadroh khoirunnada', 'khoirunnada indonesia']);

  const charTrigrams = extractCharNgrams('busyro', 3);
  assert.ok(charTrigrams.includes('bus'));
  assert.ok(charTrigrams.includes('usy'));
  assert.ok(charTrigrams.includes('yro'));
});

// ==========================================
// 2. NORMALIZER TESTS
// ==========================================
test('Normalizer: Normalisasi slang, singkatan, dan ejaan domain', () => {
  const raw = 'sy mau cari qosida & kpn ada jadual manggung?';
  const normalized = normalizeSlang(raw);

  assert.ok(normalized.includes('saya'));
  assert.ok(normalized.includes('qosidah'));
  assert.ok(normalized.includes('kapan'));
  assert.ok(normalized.includes('jadwal'));
  assert.ok(normalized.includes('job'));
});

test('Normalizer: Deteksi negasi Bahasa Indonesia', () => {
  const negQuery = 'saya bukan mencari jadwal job melainkan lirik';
  const analysis = detectNegation(negQuery);

  assert.equal(analysis.hasNegation, true);
  assert.ok(analysis.negatedTerms.includes('mencari'));
  assert.ok(analysis.negatedTerms.includes('jadwal'));

  const posQuery = 'carikan saya jadwal job terdekat';
  const posAnalysis = detectNegation(posQuery);
  assert.equal(posAnalysis.hasNegation, false);
});

test('Normalizer: Normalisasi teks Arab (Strip Harakat & Varian Huruf)', () => {
  const withHarakat = 'بُشْرَىٰ لَنَا أَلْفَ مَبْرُوكٍ';
  const stripped = normalizeArabic(withHarakat, true);

  // Harakat hilang, alif ternormalisasi
  assert.ok(!stripped.includes('\u064F')); // dhommah hilang
  assert.ok(!stripped.includes('\u0652')); // sukun hilang
  assert.ok(stripped.includes(normalizeArabic('بشرى'))); // pencarian konsisten
  assert.ok(stripped.includes('الف')); // alif hamzah ternormalisasi
  assert.ok(stripped.includes('مبروك')); // tanwin hilang
});

test('Normalizer: Normalisasi teks utuh', () => {
  const raw = '  Sy Mau Qosida   Basyiro  ';
  const res = normalizeText(raw);
  assert.equal(res, 'saya mau qosidah basyiro');
});

// ==========================================
// 3. MATCHER TESTS
// ==========================================
test('Matcher: Damerau-Levenshtein Distance & Transposition', () => {
  // Transposisi dua huruf berdampingan dihitung 1 langkah
  assert.equal(damerauLevenshtein('mughrom', 'mughorm'), 1);
  // Substitusi satu huruf
  assert.equal(damerauLevenshtein('busyro', 'basyro'), 1);
  // Persis
  assert.equal(damerauLevenshtein('khoirunnada', 'khoirunnada'), 0);
});

test('Matcher: N-Gram similarity untuk typo tengah kata', () => {
  const sim = ngramSimilarity('khoyrunnada', 'khoirunnada', 2);
  assert.ok(sim >= 0.70, `N-gram similarity harus tinggi untuk typo kecil (dapat ${sim})`);
});

test('Matcher: Token overlap (Jaccard)', () => {
  const t1 = ['hadroh', 'khoirunnada', 'official'];
  const t2 = ['hadroh', 'khoirunnada', 'app'];
  const score = tokenOverlapScore(t1, t2);
  assert.ok(score >= 0.50);
});

test('Matcher: Fuzzy match multi-strategi', () => {
  const exact = fuzzyMatch('Busyro Lana', 'Busyro Lana');
  assert.equal(exact.matched, true);
  assert.equal(exact.score, 1.0);

  const typo = fuzzyMatch('bsyro', 'busyro');
  assert.equal(typo.matched, true);
  assert.ok(typo.score >= 0.70);
});

// ==========================================
// 4. INTENT SCORER TESTS
// ==========================================
test('Intent Scorer: Skoring intent dengan frasa persis & kata kunci', () => {
  const sampleIntents = [
    {
      id: 'ask_history',
      phrases: ['Bagaimana sejarah Khoirunnada?', 'sejarah hadroh'],
      keywords: ['sejarah', 'khoirunnada', 'asal usul', 'makna nama'],
    },
    {
      id: 'ask_schedule',
      phrases: ['Ada jadwal job apa saja?'],
      keywords: ['jadwal', 'job', 'manggung', 'agenda'],
    },
  ];

  const resultHistory = scoreIntent('Bagaimana sejarah Khoirunnada?', sampleIntents[0]);
  assert.equal(resultHistory.confidence, 'high');
  assert.ok(resultHistory.score >= 0.80);
  assert.ok(resultHistory.explanation.length > 0);

  const bestIntent = getBestIntent('kpn ada jadwal manggung', sampleIntents);
  assert.ok(bestIntent !== null);
  assert.equal(bestIntent.intentId, 'ask_schedule');
});

test('Intent Scorer: Penalti negasi mencegah salah klasifikasi', () => {
  const scheduleIntent = {
    id: 'ask_schedule',
    phrases: ['Ada jadwal job apa saja?'],
    keywords: ['jadwal', 'job'],
  };

  const normalQuery = 'mau lihat jadwal job';
  const negatedQuery = 'bukan jadwal job tapi qosidah';

  const normalScore = scoreIntent(normalQuery, scheduleIntent);
  const negatedScore = scoreIntent(negatedQuery, scheduleIntent);

  assert.ok(
    normalScore.score > negatedScore.score,
    `Pertanyaan negasi (${negatedScore.score}) harus memiliki skor lebih rendah dari pertanyaan biasa (${normalScore.score})`
  );
});

test('Intent Scorer: Explainability & Matched Features', () => {
  const developerIntent = {
    id: 'ask_developer',
    keywords: ['pembuat', 'developer', 'pengembang', 'dzarin'],
  };

  const result = scoreIntent('siapa developer aplikasi ini', developerIntent);
  assert.ok(result.matchedFeatures.length > 0);
  assert.ok(result.explanation.length > 0);
});
