/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - QUERY PLANNER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mengubah pertanyaan bahasa alami pengguna menjadi rencana operasi terstruktur (QueryPlan).
 * Menentukan urutan eksekusi, dependensi antar-operasi, dan parameter tanpa eval/kode dinamis.
 */

import type { AIContext } from '../ai-engine.ts';
import type { QueryPlan, PlanOperation } from './plan-types.ts';
import { extractTemporalWindow } from './temporal-reasoner.ts';
import {
  isContextDependentQuery,
  resolveConversationContext,
} from './context-resolver.ts';
import { normalizeText } from './normalizer.ts';
import { searchStaticKnowledge } from './static-knowledge.ts';

export interface PlannerOptions {
  referenceDate?: Date;
  timeZone?: string;
}

/**
 * Menyusun rencana kueri deterministik (QueryPlan) dari input pengguna.
 */
export function planQuery(
  rawQuery: string,
  context: AIContext,
  options: PlannerOptions = {}
): QueryPlan {
  const query = rawQuery.trim();
  const normQuery = normalizeText(query).toLowerCase();
  const refDate = options.referenceDate || new Date();
  const tz = options.timeZone;

  // 1. Kueri Multi-Intent Qosidah & Jadwal Job Sekaligus ("carikan Busyro Lana dan jadwal job")
  const hasQosidahClue =
    normQuery.includes('qosidah') ||
    normQuery.includes('sholawat') ||
    normQuery.includes('syair') ||
    normQuery.includes('lirik') ||
    normQuery.includes('busyro') ||
    normQuery.includes('mughrom') ||
    normQuery.includes('padhang') ||
    normQuery.includes('hijrotu');

  const hasJobClue =
    normQuery.includes('jadwal') ||
    normQuery.includes('jadual') ||
    normQuery.includes('job') ||
    normQuery.includes('manggung') ||
    normQuery.includes('agenda');

  if (hasQosidahClue && hasJobClue && normQuery.includes('dan')) {
    const cleanedTitle = cleanQosidahQuery(
      query.replace(/\s*(dan\s+)?(tampilkan|lihat|cek|buka)?\s*(jadwal|agenda|job).*/i, '')
    );
    const op1: PlanOperation = {
      id: 'op-find-qos',
      type: 'FIND_QOSIDAH',
      params: { titleQuery: cleanedTitle || 'Busyro Lana' },
      explanation: `Mencari qosidah "${cleanedTitle}"`,
    };
    const op2: PlanOperation = {
      id: 'op-jobs',
      type: 'GET_UPCOMING_JOBS',
      params: {},
      explanation: 'Mengambil jadwal job mendatang',
    };

    return {
      query,
      intent: 'multi_intent_qosidah_and_jobs',
      operations: [op1, op2],
      isMultiStep: true,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 2. Kueri Multi-Langkah Mandiri: "Carikan [qosidah] dan tampilkan artinya / terjemahannya"
  if (
    (normQuery.includes('carikan') || normQuery.includes('cari')) &&
    (normQuery.includes('artinya') || normQuery.includes('terjemahan') || normQuery.includes('makna'))
  ) {
    const cleanedTitle = cleanQosidahQuery(
      query.replace(/\s*(dan\s+)?(tampilkan|lihat|baca)?\s*(artinya|terjemahannya|maknanya).*/i, '')
    );

    const op1: PlanOperation = {
      id: 'op-find-qos',
      type: 'FIND_QOSIDAH',
      params: { titleQuery: cleanedTitle },
      explanation: `Mencari qosidah "${cleanedTitle}"`,
    };
    const op2: PlanOperation = {
      id: 'op-attr-trans',
      type: 'GET_ATTRIBUTE',
      params: { attribute: 'translation' },
      dependsOn: 'op-find-qos',
      explanation: 'Mengambil teks terjemahan qosidah yang ditemukan',
    };

    return {
      query,
      intent: 'find_and_translate_qosidah',
      operations: [op1, op2],
      isMultiStep: true,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 3. Kueri Multi-Langkah Mandiri: "Carikan lirik [qosidah]"
  if (
    (normQuery.includes('carikan') || normQuery.includes('cari') || normQuery.includes('baca')) &&
    (normQuery.includes('lirik') || normQuery.includes('syair'))
  ) {
    const cleanedTitle = cleanQosidahQuery(
      query.replace(/\s*(dan\s+)?(tampilkan|lihat|baca)?\s*(liriknya|syairnya).*/i, '')
    );

    const op1: PlanOperation = {
      id: 'op-find-qos',
      type: 'FIND_QOSIDAH',
      params: { titleQuery: cleanedTitle },
      explanation: `Mencari qosidah "${cleanedTitle}"`,
    };
    const op2: PlanOperation = {
      id: 'op-attr-lyrics',
      type: 'GET_ATTRIBUTE',
      params: { attribute: 'lyrics' },
      dependsOn: 'op-find-qos',
      explanation: 'Mengambil teks lirik qosidah yang ditemukan',
    };

    return {
      query,
      intent: 'find_and_show_lyrics',
      operations: [op1, op2],
      isMultiStep: true,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 4. Kueri Multi-Langkah Mandiri: "Berapa jumlah qosidah favorit..."
  if (
    (normQuery.includes('berapa') || normQuery.includes('brp')) &&
    (normQuery.includes('favorit') || normQuery.includes('fav') || normQuery.includes('koleksi') || normQuery.includes('bintang'))
  ) {
    const op1: PlanOperation = {
      id: 'op-favs',
      type: 'RESOLVE_FAVORITES',
      params: {},
      explanation: 'Menyelesaikan koleksi qosidah favorit pengguna',
    };
    const op2: PlanOperation = {
      id: 'op-count',
      type: 'COUNT_RESULTS',
      params: {},
      dependsOn: 'op-favs',
      explanation: 'Menghitung jumlah qosidah favorit',
    };

    return {
      query,
      intent: 'count_favorites',
      operations: [op1, op2],
      isMultiStep: true,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 5. Cek Pengetahuan Statis Resmi Sebelum Job Query (Menangani "Siapa yang mengurus administrasi dan booking job")
  const staticKnowledgeHits = searchStaticKnowledge(query, 0.5);
  if (staticKnowledgeHits.length > 0 && staticKnowledgeHits[0].score >= 0.85) {
    return {
      query,
      intent: 'static_knowledge',
      operations: [
        {
          id: 'op-static',
          type: 'GET_STATIC_KNOWLEDGE',
          params: { query },
          explanation: 'Mencari artikel pengetahuan statis Khoirunnada',
        },
      ],
      isMultiStep: false,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 6. Kueri Jadwal Job Eksplisit
  const isJobQuery =
    normQuery.includes('jadwal') ||
    normQuery.includes('jadual') ||
    normQuery.includes('jadwall') ||
    normQuery.includes('job') ||
    normQuery.includes('manggung') ||
    normQuery.includes('agenda') ||
    normQuery.includes('agnda') ||
    normQuery.includes('panggung') ||
    normQuery.includes('konser') ||
    normQuery.includes('festival') ||
    normQuery.includes('acara') ||
    normQuery.includes('tampil') ||
    normQuery.includes('wonten jadwal') ||
    normQuery.includes('kpn job') ||
    normQuery.includes('kapan manggung') ||
    normQuery.includes('lokasi maulid') ||
    normQuery.includes('جدول');

  // Jika menyebutkan qosidah spesifik di dalam pertanyaan job (misal: "Saya ingin melantunkan qosidah Al Hijrotu pada acara maulid nanti")
  const hasSpecificQosidah =
    normQuery.includes('busyro') ||
    normQuery.includes('mughrom') ||
    normQuery.includes('padhang') ||
    normQuery.includes('sluku') ||
    normQuery.includes('hijrotu');

  if (isJobQuery && !hasSpecificQosidah) {
    // 6a. Jadwal Terdekat
    if (
      normQuery.includes('terdekat') ||
      normQuery.includes('berikutnya') ||
      normQuery.includes('paling celak') ||
      normQuery.includes('kapan manggung') ||
      normQuery.includes('kapan tampil')
    ) {
      return {
        query,
        intent: 'get_nearest_job',
        operations: [
          {
            id: 'op-nearest',
            type: 'GET_NEAREST_JOB',
            params: {},
            explanation: 'Mencari satu jadwal job aktif paling dekat dengan waktu saat ini',
          },
        ],
        isMultiStep: false,
        isFollowUp: false,
        isSupported: true,
      };
    }

    // 6b. Filter Temporal Agenda
    const temporalWindow = extractTemporalWindow(normQuery, { referenceDate: refDate, timeZone: tz });
    if (temporalWindow) {
      const op: PlanOperation = {
        id: 'op-temp-jobs',
        type: 'FILTER_JOBS_TEMPORAL',
        params: { window: temporalWindow },
        explanation: `Memfilter jadwal job untuk rentang waktu ${temporalWindow.type}`,
      };

      if (normQuery.includes('berapa')) {
        const opCount: PlanOperation = {
          id: 'op-count-jobs',
          type: 'COUNT_RESULTS',
          params: {},
          dependsOn: 'op-temp-jobs',
          explanation: 'Menghitung jumlah jadwal pada rentang waktu yang diminta',
        };
        return {
          query,
          intent: `count_jobs_${temporalWindow.type}`,
          operations: [op, opCount],
          temporalConstraint: { type: temporalWindow.type },
          isMultiStep: true,
          isFollowUp: false,
          isSupported: true,
        };
      }

      return {
        query,
        intent: `get_jobs_${temporalWindow.type}`,
        operations: [op],
        temporalConstraint: { type: temporalWindow.type },
        isMultiStep: false,
        isFollowUp: false,
        isSupported: true,
      };
    }

    // 6c. Jadwal Job Umum Mendatang
    return {
      query,
      intent: 'get_upcoming_jobs',
      operations: [
        {
          id: 'op-upcoming',
          type: 'GET_UPCOMING_JOBS',
          params: {},
          explanation: 'Mengambil seluruh jadwal job yang akan datang',
        },
      ],
      isMultiStep: false,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 7. Kueri Follow-Up Kontekstual (Membutuhkan memori dari FASE 3)
  if (isContextDependentQuery(normQuery)) {
    const contextRes = resolveConversationContext(query, context.memory, context, {
      currentTime: refDate.getTime(),
    });

    if ((contextRes.status === 'RESOLVED' || contextRes.status === 'CORRECTION') && contextRes.targetEntity) {
      const entity = contextRes.targetEntity;
      const attr = contextRes.requestedAttribute || 'general_details';

      const op1: PlanOperation = {
        id: 'op-resolve-ref',
        type: 'RESOLVE_ENTITY',
        params: { entityId: entity.id, entityType: entity.type, entityName: entity.name },
        explanation: `Menggunakan entitas dari memori percakapan: ${entity.name}`,
      };

      const op2: PlanOperation = {
        id: 'op-get-attr',
        type: 'GET_ATTRIBUTE',
        params: { attribute: attr },
        dependsOn: 'op-resolve-ref',
        explanation: `Mengambil atribut ${attr} dari entitas ${entity.name}`,
      };

      return {
        query,
        intent: `get_${attr}`,
        operations: [op1, op2],
        targetEntity: entity,
        isMultiStep: true,
        isFollowUp: true,
        isSupported: true,
      };
    }

    if (
      contextRes.status === 'NO_CONTEXT' ||
      contextRes.status === 'EXPIRED' ||
      contextRes.status === 'AMBIGUOUS' ||
      contextRes.status === 'ENTITY_NOT_FOUND'
    ) {
      return {
        query,
        intent: 'need_context',
        operations: [
          {
            id: 'op-need-ctx',
            type: 'OUT_OF_SCOPE',
            params: { reason: contextRes.status },
            explanation: contextRes.explanation,
          },
        ],
        isMultiStep: false,
        isFollowUp: true,
        isSupported: false,
      };
    }
  }

  // 8. Kueri Favorit Umum
  if (
    normQuery.includes('favorit') ||
    normQuery.includes('faforit') ||
    normQuery.includes('fav') ||
    normQuery.includes('lagu pilihan') ||
    normQuery.includes('syair pilihan') ||
    normQuery.includes('bintangin')
  ) {
    return {
      query,
      intent: 'get_favorites',
      operations: [
        {
          id: 'op-favs-all',
          type: 'RESOLVE_FAVORITES',
          params: {},
          explanation: 'Mengambil seluruh koleksi qosidah favorit pengguna',
        },
      ],
      isMultiStep: false,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 9. Cek Pengetahuan Statis Cadangan (Skor sedang >= 0.45)
  if (staticKnowledgeHits.length > 0) {
    return {
      query,
      intent: 'static_knowledge',
      operations: [
        {
          id: 'op-static',
          type: 'GET_STATIC_KNOWLEDGE',
          params: { query },
          explanation: 'Mencari artikel pengetahuan statis Khoirunnada',
        },
      ],
      isMultiStep: false,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 10. Kueri Pencarian Qosidah Spesifik
  const hasQosidahClues =
    normQuery.includes('qosidah') ||
    normQuery.includes('qasidah') ||
    normQuery.includes('sholawat') ||
    normQuery.includes('salawat') ||
    normQuery.includes('lagu') ||
    normQuery.includes('syair') ||
    normQuery.includes('lirik') ||
    normQuery.includes('tembang') ||
    normQuery.includes('kidung') ||
    normQuery.includes('carikan') ||
    normQuery.includes('cariin') ||
    normQuery.includes('cari') ||
    normQuery.includes('cr ') ||
    normQuery.includes('golekno') ||
    normQuery.includes('padosaken') ||
    normQuery.includes('buka') ||
    normQuery.includes('baca') ||
    normQuery.includes('jelaskan') ||
    normQuery.includes('قصيدة') ||
    normQuery.includes('busyro') ||
    normQuery.includes('basyiro') ||
    normQuery.includes('busro') ||
    normQuery.includes('mughrom') ||
    normQuery.includes('mugrom') ||
    normQuery.includes('padhang') ||
    normQuery.includes('padang') ||
    normQuery.includes('sluku') ||
    normQuery.includes('hijrotu') ||
    normQuery.includes('hijrah') ||
    /[\u0600-\u06FF]/.test(query);

  if (hasQosidahClues) {
    const cleaned = cleanQosidahQuery(query);
    return {
      query,
      intent: 'find_qosidah',
      operations: [
        {
          id: 'op-find-single',
          type: 'FIND_QOSIDAH',
          params: { titleQuery: cleaned || query },
          explanation: `Mencari qosidah "${cleaned || query}"`,
        },
      ],
      isMultiStep: false,
      isFollowUp: false,
      isSupported: true,
    };
  }

  // 11. Pertanyaan Out of Scope
  return {
    query,
    intent: 'out_of_scope',
    operations: [
      {
        id: 'op-oos',
        type: 'OUT_OF_SCOPE',
        params: { reason: 'UNSUPPORTED_DOMAIN' },
        explanation: 'Pertanyaan di luar cakupan domain Hadroh Khoirunnada',
      },
    ],
    isMultiStep: false,
    isFollowUp: false,
    isSupported: false,
  };
}

/**
 * Membersihkan awalan kueri pencarian qosidah agar hanya menyisakan judul/kata kunci.
 */
function cleanQosidahQuery(raw: string): string {
  let clean = raw.trim();
  clean = clean.replace(/^(jelaskan\s+(secara\s+detail\s+)?(tentang\s+)?)/i, '');
  clean = clean.replace(/^(carikan|cariin|cari|buka|lihat|bacakan|golekno|padosaken)\s+(saya\s+|dong\s+|in\s+)?(qosidah\s+|sholawat\s+|lagu\s+|syair\s+|lirik\s+|tembang\s+)?/i, '');
  clean = clean.replace(/^(qosidah|sholawat|lagu|syair|lirik|tembang)\s+/i, '');
  return clean.trim();
}
