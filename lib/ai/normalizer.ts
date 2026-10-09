/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - NORMALIZER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Menormalkan slang Indonesia, variasi kata domain, negasi, dan teks Arab.
 */

import { tokenize } from './tokenizer.ts';

// Kamus sinonim & normalisasi slang bahasa Indonesia dan domain Hadroh
const SLANG_DICTIONARY: Record<string, string> = {
  // Kata ganti & umum
  sy: 'saya',
  aq: 'saya',
  gw: 'saya',
  gua: 'saya',
  km: 'kamu',
  kmu: 'kamu',
  lu: 'kamu',
  kpn: 'kapan',
  gmn: 'bagaimana',
  gimana: 'bagaimana',
  bgmn: 'bagaimana',
  yg: 'yang',
  dgn: 'dengan',
  utk: 'untuk',
  sdh: 'sudah',
  udh: 'sudah',
  udah: 'sudah',
  blm: 'belum',
  blom: 'belum',
  jg: 'juga',
  jga: 'juga',
  tp: 'tapi',
  bgt: 'sangat',
  bener: 'benar',
  bisaapa: 'fitur',
  bisaapaaja: 'fitur',

  // Ungkapan kesopanan
  makasih: 'terima kasih',
  thx: 'terima kasih',
  trims: 'terima kasih',
  syukron: 'terima kasih',
  sukron: 'terima kasih',
  'matur nuwun': 'terima kasih',

  // Typo & sinonim domain Hadroh Khoirunnada
  qosida: 'qosidah',
  qasidah: 'qosidah',
  kasidah: 'qosidah',
  qosidat: 'qosidah',
  qosidahmu: 'qosidah',
  sholawat: 'sholawat',
  selawat: 'sholawat',
  shalawat: 'sholawat',
  solawat: 'sholawat',
  salawat: 'sholawat',
  jadual: 'jadwal',
  manggung: 'job',
  tampil: 'job',
  agenda: 'job',
  oraganisasi: 'organisasi',
  organissai: 'organisasi',
  sturktur: 'struktur',
  pencipta: 'pembuat',
  bikin: 'pembuat',
  developer: 'pembuat',
  pengembang: 'pembuat',
  kodinator: 'koordinator',
};

// Partikel negasi bahasa Indonesia
const NEGATION_WORDS = new Set([
  'tidak',
  'bukan',
  'jangan',
  'tak',
  'ga',
  'gak',
  'nggak',
  'tanpa',
  'nda',
  'ndak',
]);

export interface NegationAnalysis {
  hasNegation: boolean;
  negatedTerms: string[];
  cleanNonNegatedQuery: string;
}

/**
 * Normalisasi slang, singkatan, dan ejaan umum bahasa Indonesia.
 */
export function normalizeSlang(input: string): string {
  if (!input) return '';

  const tokens = tokenize(input, { includeWhitespace: true, includePunctuation: true });
  const result: string[] = [];

  for (const token of tokens) {
    if (token.kind === 'word') {
      const lower = token.normalized;
      if (SLANG_DICTIONARY[lower]) {
        result.push(SLANG_DICTIONARY[lower]);
        continue;
      }
    }
    result.push(token.text);
  }

  return result.join('');
}

/**
 * Analisis negasi: mendeteksi kata yang dinegasikan agar tidak salah paham arti.
 * Contoh: "bukan jadwal job" -> negatedTerms: ["jadwal", "job"]
 */
export function detectNegation(input: string): NegationAnalysis {
  const words = input.toLowerCase().split(/\s+/).filter(Boolean);
  const negatedTerms: string[] = [];
  const nonNegatedWords: string[] = [];
  let isNegating = false;
  let wordsUnderNegationCount = 0;

  for (const word of words) {
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');

    if (NEGATION_WORDS.has(cleanWord)) {
      isNegating = true;
      wordsUnderNegationCount = 0;
      continue;
    }

    if (isNegating) {
      negatedTerms.push(cleanWord);
      wordsUnderNegationCount++;
      // Cakupan negasi lokal biasanya 1-2 kata terdekat
      if (wordsUnderNegationCount >= 2) {
        isNegating = false;
      }
    } else {
      nonNegatedWords.push(cleanWord);
    }
  }

  return {
    hasNegation: negatedTerms.length > 0,
    negatedTerms,
    cleanNonNegatedQuery: nonNegatedWords.join(' '),
  };
}

/**
 * Normalisasi teks Arab:
 * - Menghilangkan harakat/tashkeel (fathah, kasrah, dhommah, sukun, tasydid, tanwin)
 * - Menyatukan varian alif (alif wasla, hamzah di atas/bawah)
 * - Menyatukan ta marbuta dan alif maqsura
 * - Menghilangkan tatweel / kashida (_)
 */
export function normalizeArabic(text: string, stripHarakat: boolean = true): string {
  if (!text) return '';

  let res = text;

  // Hapus tatweel
  res = res.replace(/\u0640/g, '');

  if (stripHarakat) {
    // Hapus Tashkeel (harakat): \u064B s/d \u065F dan \u0670
    res = res.replace(/[\u064B-\u065F\u0670]/g, '');
  }

  // Normalisasi Alif (أ, إ, آ, ٱ -> ا)
  res = res.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');

  // Normalisasi Ta Marbuta (ة -> ه)
  res = res.replace(/\u0629/g, '\u0647');

  // Normalisasi Alif Maqsura (ى -> ي)
  res = res.replace(/\u0649/g, '\u064A');

  return res.trim();
}

/**
 * Normalisasi teks penuh: gabungan pembersihan spasi, slang, dan lowercasing.
 */
export function normalizeText(input: string): string {
  if (!input) return '';
  const slangReplaced = normalizeSlang(input.trim());
  return slangReplaced.replace(/\s+/g, ' ').toLowerCase();
}
