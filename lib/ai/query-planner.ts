/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - QUERY PLANNER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mengubah kueri pengguna menjadi rencana operasi penalaran terstruktur (QueryPlan).
 * Memecah kueri multi-langkah dan menghubungkan konteks percakapan secara deterministik.
 */

import type { AIContext } from '../ai-engine.ts';
import type { QueryPlan, PlanOperation } from './plan-types.ts';
import { resolveConversationContext, isContextDependentQuery } from './context-resolver.ts';
import { extractTemporalWindow } from './temporal-reasoner.ts';
import { normalizeText } from './normalizer.ts';
import { cleanQosidahQuery } from './qosidah-retriever.ts';

export interface PlannerOptions {
  referenceDate?: Date;
  timeZone?: string;
}

/**
 * Menyusun rencana eksekusi penalaran terstruktur berdasarkan kueri dan konteks aktif.
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

  // 1. Kueri Multi-Langkah Mandiri: "Carikan [qosidah] dan tampilkan artinya / terjemahannya"
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

  // 2. Kueri Multi-Langkah Mandiri: "Berapa jumlah qosidah favorit..."
  if (normQuery.includes('berapa') && (normQuery.includes('favorit') || normQuery.includes('koleksi'))) {
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

  // 3. Kueri Follow-Up Kontekstual (Membutuhkan memori dari FASE 3)
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

  // 4. Kueri Temporal Jadwal Job (Hanya jika menanyakan jadwal/job/acara/manggung)
  const isJobQuery =
    normQuery.includes('jadwal') ||
    normQuery.includes('job') ||
    normQuery.includes('manggung') ||
    normQuery.includes('agenda') ||
    normQuery.includes('acara') ||
    normQuery.includes('tampil');

  const temporalWindow = extractTemporalWindow(normQuery, { referenceDate: refDate, timeZone: tz });
  if (temporalWindow && isJobQuery) {
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

  // 5. Kueri Jadwal Terdekat
  if (
    isJobQuery &&
    (normQuery.includes('terdekat') ||
      normQuery.includes('job berikutnya') ||
      normQuery.includes('kapan manggung'))
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

  // 6. Kueri Jadwal Umum
  if (isJobQuery) {
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

  // 7. Kueri Favorit Umum
  if (normQuery.includes('favorit')) {
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

  // 8. Kueri Statis (Sejarah, Struktur, Dzarin, Cara Pakai, Manfaat, Developer)
  if (
    normQuery.includes('sejarah') ||
    normQuery.includes('struktur') ||
    normQuery.includes('dzarin') ||
    normQuery.includes('cara pakai') ||
    normQuery.includes('tutorial') ||
    normQuery.includes('manfaat') ||
    normQuery.includes('pembuat') ||
    normQuery.includes('developer')
  ) {
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

  // 9. Kueri Pencarian Qosidah Spesifik
  if (
    normQuery.includes('qosidah') ||
    normQuery.includes('sholawat') ||
    normQuery.includes('lagu') ||
    normQuery.includes('lirik') ||
    normQuery.includes('carikan') ||
    normQuery.includes('cari')
  ) {
    const cleaned = cleanQosidahQuery(query);
    if (cleaned.length >= 2) {
      return {
        query,
        intent: 'find_qosidah',
        operations: [
          {
            id: 'op-find-single',
            type: 'FIND_QOSIDAH',
            params: { titleQuery: cleaned },
            explanation: `Mencari qosidah "${cleaned}"`,
          },
        ],
        isMultiStep: false,
        isFollowUp: false,
        isSupported: true,
      };
    }
  }

  // 10. Pertanyaan Out of Scope
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
