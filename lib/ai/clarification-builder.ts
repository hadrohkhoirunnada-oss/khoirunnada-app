/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - NATURAL CLARIFICATION BUILDER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Modul untuk menyusun pesan klarifikasi alami, penanganan ambiguitas,
 * data tidak ditemukan, dan batas lingkup domain (FASE 5).
 */

import type { ExtractedFacts, ResponseStyle } from './composer-types.ts';

/**
 * Membangun pesan klarifikasi atau penjelasan saat status reasoning bukan SUCCESS.
 */
export function buildClarificationMessage(
  facts: ExtractedFacts,
  style: ResponseStyle = 'informative'
): string {
  switch (facts.status) {
    case 'AMBIGUOUS': {
      if (facts.ambiguousCandidates && facts.ambiguousCandidates.length > 0) {
        const candidateNames = facts.ambiguousCandidates.map((c) => c.name).join(', ');
        if (style === 'concise') {
          return `Ditemukan beberapa kemungkinan: ${candidateNames}. Silakan pilih salah satu.`;
        }
        if (style === 'detailed') {
          const list = facts.ambiguousCandidates.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
          return `Pencarian Anda memiliki beberapa kemiripan dalam arsip Hadroh Khoirunnada:\n\n${list}\n\nSilakan tentukan judul yang Anda maksud menggunakan tombol tindakan di bawah.`;
        }
        return `Saya menemukan beberapa pilihan yang mirip dengan pencarian Anda: ${candidateNames}. Apakah yang Anda maksud salah satu di antaranya?`;
      }
      return 'Rujukan pencarian masih kurang spesifik. Mohon sebutkan judul atau kata kunci yang lebih jelas.';
    }

    case 'DATA_NOT_FOUND': {
      if (facts.attributeName === 'translation') {
        const entityLabel = facts.entityName ? `qosidah ${facts.entityName}` : 'qosidah ini';
        if (style === 'concise') {
          return `Terjemahan untuk ${entityLabel} belum tersedia dalam database.`;
        }
        return `Afwan, terjemahan bahasa Indonesia untuk ${entityLabel} saat ini belum tersedia di basis data kami. Anda tetap dapat membaca teks Arab dan syair Latin yang telah disediakan.`;
      }

      if (facts.intent.includes('job') || facts.intent.includes('nearest_job')) {
        if (style === 'concise') {
          return 'Saat ini belum ada jadwal job aktif yang diagendakan.';
        }
        return 'Saat ini belum ada jadwal job terdekat yang diagendakan di sistem. Pengurus hadroh akan memperbarui halaman Jadwal Job segera setelah ada konfirmasi undangan baru.';
      }

      if (facts.intent.includes('favorite')) {
        if (style === 'concise') {
          return 'Anda belum memiliki koleksi qosidah favorit.';
        }
        return 'Anda belum memiliki koleksi qosidah favorit. Buka katalog Qosidah, pilih lagu yang Anda sukai, lalu ketuk ikon tanda hati agar tersimpan di koleksi pribadi Anda!';
      }

      if (facts.failureReason) {
        return facts.failureReason;
      }

      return 'Maaf, data yang Anda cari belum ditemukan dalam katalog Hadroh Khoirunnada.';
    }

    case 'NEED_CONTEXT': {
      if (style === 'concise') {
        return 'Pertanyaan membutuhkan rujukan qosidah atau jadwal sebelumnya.';
      }
      return 'Pertanyaan ini membutuhkan rujukan qosidah atau jadwal dari percakapan sebelumnya. Silakan sebutkan judul qosidah atau topik yang Anda maksud terlebih dahulu.';
    }

    case 'OUT_OF_SCOPE': {
      if (style === 'concise') {
        return 'Pertanyaan di luar cakupan informasi Hadroh Khoirunnada.';
      }
      return 'Maaf, pertanyaan tersebut di luar lingkup informasi resmi Hadroh Khoirunnada. Saya adalah asisten cerdas yang siap membantu Anda seputar katalog qosidah, jadwal job, profil pengembang, dan panduan Hadroh Khoirunnada.';
    }

    case 'UNAUTHORIZED': {
      if (style === 'concise') {
        return 'Akses data privat tidak diizinkan.';
      }
      return 'Afwan, informasi tersebut bersifat privat dan administratif internal sehingga tidak dapat diakses secara publik demi menjaga keamanan dan privasi.';
    }

    default:
      return 'Permintaan belum dapat diproses.';
  }
}
