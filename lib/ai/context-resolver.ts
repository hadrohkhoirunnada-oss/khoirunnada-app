/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - CONTEXT RESOLVER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Algoritma inferensi resolusi konteks percakapan:
 * Menangani anaphora ("itu", "yang tadi"), atribut lanjutan ("apa artinya", "di mana lokasinya"),
 * pemisahan follow-up vs new topic, koreksi entitas, ambiguitas, dan pengecekan integritas data aktif.
 */

import type { AIContext } from '../ai-engine.ts';
import type {
  AIConversationMemory,
  ContextResolutionResult,
  EntityReference,
  FollowUpAttribute,
} from './memory-types.ts';
import { isMemoryExpired, validateMemoryUser } from './memory-lifecycle.ts';
import { normalizeText, detectNegation } from './normalizer.ts';

// Pola kata rujukan percakapan bahasa Indonesia
const PRONOUN_REFERENCE_REGEX =
  /\b(itu|yang tadi|tadi|tersebut|yang ini|lagu ini|jadwal ini|acara ini|yg tadi|lagu itu|qosidah itu|qosidah tersebut|jadwal itu|acara itu|yang satu lagi|yang satunya)\b/i;

// Pola pertanyaan atribut lanjutan
const TRANSLATION_QUERY_REGEX = /\b(artinya|apa artinya|artinya apa|terjemahan|maknanya|maksudnya|terjemahannya)\b/i;
const LYRICS_QUERY_REGEX = /\b(lirik|liriknya|bagaimana liriknya|teks|syair|bacaan|bacaannya|teks latin|teks arab)\b/i;
const LOCATION_QUERY_REGEX = /\b(di mana|dimana|lokasi|lokasinya|tempatnya|tempat|di mana lokasinya|alamat|alamatnya)\b/i;
const DATE_QUERY_REGEX = /\b(kapan|tanggal berapa|jam berapa|waktunya|kapan jadwalnya|hari apa)\b/i;
const NEXT_ITEM_QUERY_REGEX = /\b(berikutnya|selanjutnya|yang berikutnya|yang selanjutnya|setelah itu)\b/i;

// Pola koreksi topik / entitas
const CORRECTION_REGEX = /\b(bukan yang tadi|bukan itu|bukan lagu itu|bukan jadwal itu|yang satunya|bukan yang ini)\b/i;

// Pola pergantian topik jelas (independent intents)
const NEW_TOPIC_REGEX =
  /^(assalamu|halo|hai|pagi|siang|malam|siapa dzarin|profil dzarin|siapa yang membuat|developer|cara pakai|tutorial|manfaat|sejarah|struktur organisasi|ada jadwal job|lagu favorit|terima kasih|syukron)/i;

/**
 * Memeriksa apakah teks kueri mengandung indikasi rujukan kontekstual.
 */
export function isContextDependentQuery(rawQuery: string): boolean {
  const norm = normalizeText(rawQuery).toLowerCase().trim();
  if (norm.length === 0) return false;

  return (
    PRONOUN_REFERENCE_REGEX.test(norm) ||
    TRANSLATION_QUERY_REGEX.test(norm) ||
    LYRICS_QUERY_REGEX.test(norm) ||
    LOCATION_QUERY_REGEX.test(norm) ||
    DATE_QUERY_REGEX.test(norm) ||
    NEXT_ITEM_QUERY_REGEX.test(norm) ||
    CORRECTION_REGEX.test(norm)
  );
}

/**
 * Melakukan resolusi konteks percakapan secara cerdas dan aman.
 */
export function resolveConversationContext(
  userInput: string,
  memory: AIConversationMemory | undefined | null,
  context: AIContext,
  options: { ttlMs?: number; currentTime?: number } = {}
): ContextResolutionResult {
  const query = userInput.trim();
  const normQuery = normalizeText(query).toLowerCase();
  const currentUserId = context.currentUser?.id;
  const currentTime = options.currentTime ?? Date.now();

  // 1. Cek pergantian topik yang eksplisit
  if (NEW_TOPIC_REGEX.test(normQuery)) {
    return {
      status: 'NEW_TOPIC',
      isFollowUp: false,
      resolvedQuery: query,
      confidence: 'high',
      explanation: 'Pengguna memulai topik pembicaraan baru yang independen.',
    };
  }

  const isContextDependent = isContextDependentQuery(query);

  // 2. Cek ketersediaan memori sesi
  if (!memory || memory.turns.length === 0) {
    if (isContextDependent) {
      return {
        status: 'NO_CONTEXT',
        isFollowUp: false,
        resolvedQuery: query,
        confidence: 'low',
        explanation: 'Pertanyaan merujuk pada konteks sebelumnya, tetapi belum ada riwayat percakapan.',
      };
    }
    return {
      status: 'NEW_TOPIC',
      isFollowUp: false,
      resolvedQuery: query,
      confidence: 'medium',
      explanation: 'Pertanyaan mandiri tanpa memori sesi terdahulu.',
    };
  }

  // 3. Cek kedaluwarsa memori
  if (isMemoryExpired(memory, options.ttlMs, currentTime)) {
    if (isContextDependent) {
      return {
        status: 'EXPIRED',
        isFollowUp: false,
        resolvedQuery: query,
        confidence: 'low',
        explanation: 'Konteks percakapan sebelumnya telah kedaluwarsa karena inaktivitas.',
      };
    }
    return {
      status: 'NEW_TOPIC',
      isFollowUp: false,
      resolvedQuery: query,
      confidence: 'medium',
      explanation: 'Memori sesi lama telah kedaluwarsa; memproses sebagai topik baru.',
    };
  }

  // 4. Cek isolasi pengguna (berganti akun)
  if (!validateMemoryUser(memory, currentUserId)) {
    return {
      status: 'EXPIRED',
      isFollowUp: false,
      resolvedQuery: query,
      confidence: 'low',
      explanation: 'Identitas pengguna berbeda dengan pemilik sesi memori sebelumnya.',
    };
  }

  // 5. Cek koreksi entitas ("bukan yang tadi, yang satunya")
  if (CORRECTION_REGEX.test(normQuery)) {
    if (memory.recentEntities && memory.recentEntities.length >= 2) {
      const alternativeEntity = memory.recentEntities[1];
      let requestedAttribute: FollowUpAttribute = 'general_details';
      if (TRANSLATION_QUERY_REGEX.test(normQuery)) {
        requestedAttribute = 'translation';
      } else if (LYRICS_QUERY_REGEX.test(normQuery)) {
        requestedAttribute = 'lyrics';
      } else if (LOCATION_QUERY_REGEX.test(normQuery)) {
        requestedAttribute = 'location';
      } else if (DATE_QUERY_REGEX.test(normQuery)) {
        requestedAttribute = 'date';
      } else if (NEXT_ITEM_QUERY_REGEX.test(normQuery)) {
        requestedAttribute = 'next_item';
      }

      return {
        status: 'CORRECTION',
        isFollowUp: true,
        resolvedQuery: `${query} (${alternativeEntity.name})`,
        targetEntity: alternativeEntity,
        targetDomain: alternativeEntity.type,
        requestedAttribute,
        isCorrection: true,
        confidence: 'high',
        explanation: `Pengguna mengoreksi rujukan ke entitas alternatif sebelumnya: "${alternativeEntity.name}".`,
      };
    }
    return {
      status: 'AMBIGUOUS',
      isFollowUp: true,
      resolvedQuery: query,
      isAmbiguous: true,
      confidence: 'low',
      explanation: 'Pengguna melakukan koreksi, tetapi tidak ada entitas alternatif yang tercatat.',
    };
  }

  // Jika kueri bukan kueri kontekstual dan tidak ada rujukan eksplisit
  if (!isContextDependent) {
    return {
      status: 'NEW_TOPIC',
      isFollowUp: false,
      resolvedQuery: query,
      confidence: 'high',
      explanation: 'Kueri diperlakukan sebagai pertanyaan baru yang tidak bergantung pada konteks.',
    };
  }

  // 6. Ambil entitas aktif dari memori
  const activeEntity = memory.lastEntity;
  if (!activeEntity) {
    return {
      status: 'NO_CONTEXT',
      isFollowUp: false,
      resolvedQuery: query,
      confidence: 'low',
      explanation: 'Tidak ada entitas aktif yang tersimpan dalam memori sesi.',
    };
  }

  // 7. Verifikasi apakah entitas masih tersedia di data aktif (mencegah data usang / terhapus)
  if (activeEntity.type === 'qosidah' && activeEntity.id) {
    const qosidahs = context.qosidahs || [];
    const exists = qosidahs.some((q) => q.id === activeEntity.id);
    if (!exists && qosidahs.length > 0) {
      return {
        status: 'ENTITY_NOT_FOUND',
        isFollowUp: true,
        resolvedQuery: query,
        targetEntity: activeEntity,
        confidence: 'low',
        explanation: `Qosidah "${activeEntity.name}" yang dibahas sebelumnya sudah tidak ditemukan dalam katalog data aktif.`,
      };
    }
  } else if (activeEntity.type === 'job' && activeEntity.id) {
    const jobs = context.jobs || [];
    const exists = jobs.some((j) => j.id === activeEntity.id);
    if (!exists && jobs.length > 0) {
      return {
        status: 'ENTITY_NOT_FOUND',
        isFollowUp: true,
        resolvedQuery: query,
        targetEntity: activeEntity,
        confidence: 'low',
        explanation: `Jadwal job "${activeEntity.name}" yang dibahas sebelumnya sudah tidak ditemukan dalam data aktif.`,
      };
    }
  }

  // 8. Tentukan atribut yang ditanyakan
  let requestedAttribute: FollowUpAttribute = 'general_details';
  if (TRANSLATION_QUERY_REGEX.test(normQuery)) {
    requestedAttribute = 'translation';
  } else if (LYRICS_QUERY_REGEX.test(normQuery)) {
    requestedAttribute = 'lyrics';
  } else if (LOCATION_QUERY_REGEX.test(normQuery)) {
    requestedAttribute = 'location';
  } else if (DATE_QUERY_REGEX.test(normQuery)) {
    requestedAttribute = 'date';
  } else if (NEXT_ITEM_QUERY_REGEX.test(normQuery)) {
    requestedAttribute = 'next_item';
  }

  // Format resolved query yang jelas dan mandiri
  const resolvedQuery = `${query} mengenai ${activeEntity.name}`;

  return {
    status: 'RESOLVED',
    isFollowUp: true,
    resolvedQuery,
    targetEntity: activeEntity,
    targetDomain: activeEntity.type,
    requestedAttribute,
    confidence: 'high',
    explanation: `Berhasil meresolusi rujukan kontekstual ke entitas "${activeEntity.name}" (${activeEntity.type}) untuk atribut "${requestedAttribute}".`,
  };
}
