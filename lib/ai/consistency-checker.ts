/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - RESPONSE CONSISTENCY CHECKER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Pengecek konsistensi ringan untuk memvalidasi kesesuaian antara fakta
 * yang diekstrak dengan kalimat akhir yang dihasilkan oleh composer (FASE 5).
 */

import type { ExtractedFacts } from './composer-types.ts';

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  discrepancies: string[];
}

/**
 * Memvalidasi apakah teks respons akhir konsisten dengan fakta sumber.
 */
export function checkResponseConsistency(
  text: string,
  facts: ExtractedFacts
): ConsistencyCheckResult {
  const discrepancies: string[] = [];
  const lowerText = text.toLowerCase();

  // 1. Validasi Status DATA_NOT_FOUND tidak boleh mengklaim penemuan sukses
  if (facts.status === 'DATA_NOT_FOUND') {
    if (lowerText.includes('alhamdulillah, saya menemukan') || lowerText.includes('berikut adalah rincian data')) {
      discrepancies.push('Teks mengklaim penemuan berhasil padahal status adalah DATA_NOT_FOUND.');
    }
  }

  // 2. Validasi Nama Qosidah jika sukses ditemukan (Hanya untuk kueri daftar/pencarian qosidah, bukan COUNT)
  if (
    facts.status === 'SUCCESS' &&
    facts.qosidahs.length > 0 &&
    !facts.intent.includes('count') &&
    !facts.intent.includes('favorite')
  ) {
    const topTitle = facts.qosidahs[0].title.toLowerCase();
    if (!lowerText.includes(topTitle)) {
      discrepancies.push(`Judul qosidah "${facts.qosidahs[0].title}" tidak ditemukan dalam teks respons.`);
    }
  }

  // 3. Validasi Konsistensi Angka Perhitungan (COUNT)
  if (facts.status === 'SUCCESS' && typeof facts.count === 'number' && (facts.intent.includes('count') || facts.intent.includes('favorite'))) {
    const countStr = facts.count.toString();
    if (!lowerText.includes(countStr)) {
      discrepancies.push(`Jumlah data (${countStr}) tidak tercantum dalam teks respons.`);
    }
  }

  // 4. Validasi Keberadaan Atribut Nilai
  if (facts.status === 'SUCCESS' && facts.attributeName && facts.attributeValue) {
    const snippetVal = facts.attributeValue.slice(0, 15).toLowerCase();
    if (snippetVal && !lowerText.includes(snippetVal)) {
      discrepancies.push(`Nilai atribut "${facts.attributeName}" tidak ditemukan dalam teks respons.`);
    }
  }

  return {
    isConsistent: discrepancies.length === 0,
    discrepancies,
  };
}
