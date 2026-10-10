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
import { normalizeText, detectNegation } from './normalizer.ts';
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

  // 10a. Kueri Arti / Terjemahan / Makna / Lirik Spesifik Qosidah
  const isAskingMeaning =
    normQuery.includes('arti') ||
    normQuery.includes('artinya') ||
    normQuery.includes('terjemah') ||
    normQuery.includes('terjemahan') ||
    normQuery.includes('makna') ||
    normQuery.includes('maknanya') ||
    normQuery.includes('maksud');

  const isAskingLyrics =
    normQuery.includes('lirik') ||
    normQuery.includes('syair') ||
    normQuery.includes('teks arab') ||
    normQuery.includes('lirik arab');

  const PRONOUN_TERMS = new Set(['itu', 'ini', 'tadi', 'tersebut', 'lagu ini', 'qosidah ini', 'acara ini', 'job ini']);

  if ((isAskingMeaning || isAskingLyrics) && (hasQosidahClues || normQuery.includes('padhang') || normQuery.includes('busyro') || normQuery.includes('mughrom') || normQuery.includes('sluku') || normQuery.includes('turi') || normQuery.includes('hijrotu'))) {
    const candidateTitle = extractQosidahTitleFromAttributeQuery(query);
    if (candidateTitle && candidateTitle.length >= 2 && !PRONOUN_TERMS.has(candidateTitle.toLowerCase())) {
      const attr = isAskingMeaning ? 'translation' : 'lyrics';
      return {
        query,
        intent: `get_${attr}`,
        operations: [
          {
            id: 'op-find-attr-target',
            type: 'FIND_QOSIDAH',
            params: { titleQuery: candidateTitle, limit: 1 },
            explanation: `Mencari qosidah "${candidateTitle}" untuk mengambil ${attr}`,
          },
          {
            id: 'op-get-attr',
            type: 'GET_ATTRIBUTE',
            params: { attribute: attr },
            dependsOn: 'op-find-attr-target',
            explanation: `Mengambil ${attr} qosidah "${candidateTitle}"`,
          },
        ],
        isMultiStep: true,
        isFollowUp: false,
        isSupported: true,
      };
    }
  }

  if (hasQosidahClues) {
    // Deteksi batasan jumlah qosidah (misal: "3 qosidah", "4 qosidah", "5 qosidah", "8 qosidah")
    let targetLimit = 5;
    const numMatch = normQuery.match(/\b(\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|dua belas|tiga belas|empat belas|lima belas|dua puluh)\b/);
    if (numMatch) {
      const wordMap: Record<string, number> = {
        '1': 1, 'satu': 1,
        '2': 2, 'dua': 2,
        '3': 3, 'tiga': 3,
        '4': 4, 'empat': 4,
        '5': 5, 'lima': 5,
        '6': 6, 'enam': 6,
        '7': 7, 'tujuh': 7,
        '8': 8, 'delapan': 8,
        '9': 9, 'sembilan': 9,
        '10': 10, 'sepuluh': 10,
        '11': 11, 'sebelas': 11,
        '12': 12, 'dua belas': 12,
        '13': 13, 'tiga belas': 13,
        '14': 14, 'empat belas': 14,
        '15': 15, 'lima belas': 15,
        '20': 20, 'dua puluh': 20,
      };
      const n = wordMap[numMatch[1].toLowerCase()] || parseInt(numMatch[1], 10);
      if (n && !isNaN(n)) {
        targetLimit = Math.max(1, Math.min(50, n));
      }
    }

    let cleaned = cleanQosidahQuery(query);
    cleaned = cleaned.replace(/^(\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|dua belas|tiga belas|empat belas|lima belas|dua puluh)\s*(qosidah|sholawat|lagu|syair|tembang)?/i, '').trim();

    // Deteksi kategori spesifik (jawa / arobiah / indonesia)
    const isArabicCatalogQuery = query.includes('قصيدة عربية') || normQuery.includes('qosidah arab') || normQuery.includes('qosidah arobiah');
    const isJawaCatalogQuery = normQuery.includes('jawa') || normQuery.includes('jowo');
    const isArobiahCatalogQuery = isArabicCatalogQuery || normQuery.includes('arobiah') || normQuery.includes('arab') || normQuery.includes('arob');
    const isIndonesiaCatalogQuery = normQuery.includes('indonesia') || normQuery.includes('indo') || normQuery.includes('nasional');

    const hasSpecificTitle =
      normQuery.includes('busyro') ||
      normQuery.includes('basyiro') ||
      normQuery.includes('busro') ||
      normQuery.includes('mughrom') ||
      normQuery.includes('mugrom') ||
      normQuery.includes('padhang') ||
      normQuery.includes('padang') ||
      normQuery.includes('sluku') ||
      normQuery.includes('turi') ||
      normQuery.includes('ilir') ||
      normQuery.includes('hijrotu') ||
      normQuery.includes('hijrah') ||
      normQuery.includes('thoybah') ||
      normQuery.includes('robbahu') ||
      normQuery.includes('rukhban') ||
      normQuery.includes('sahar') ||
      normQuery.includes('dzikro') ||
      normQuery.includes('hannit') ||
      normQuery.includes('ajzil') ||
      normQuery.includes('quran') ||
      normQuery.includes('asro') ||
      normQuery.includes('gorrid') ||
      normQuery.includes('ghorrid') ||
      normQuery.includes('syiblal') ||
      normQuery.includes('dunya') ||
      normQuery.includes('asmaun') ||
      normQuery.includes('ghuroba') ||
      normQuery.includes('yasin') ||
      normQuery.includes('assalamu') ||
      normQuery.includes('madad') ||
      normQuery.includes('khuzuni') ||
      normQuery.includes('tidad') ||
      normQuery.includes('ibni') ||
      normQuery.includes('rojauna') ||
      normQuery.includes('sallimna') ||
      normQuery.includes('baitalloh') ||
      normQuery.includes('matahari') ||
      normQuery.includes('santri') ||
      normQuery.includes('rindu') ||
      normQuery.includes('pengantin') ||
      (/[؀-ۿ]/.test(query) && !isArabicCatalogQuery);

    const negation = detectNegation(normQuery);
    if (!hasSpecificTitle && !negation.hasNegation) {
      if (isJawaCatalogQuery) {
        cleaned = 'jawa';
      } else if (isArobiahCatalogQuery) {
        cleaned = 'arobiah';
      } else if (isIndonesiaCatalogQuery) {
        cleaned = 'indonesia';
      } else if (!cleaned || /^\d+$/.test(cleaned) || cleaned === 'qosidah' || cleaned === 'sholawat') {
        cleaned = 'qosidah';
      }
    }

    return {
      query,
      intent: 'find_qosidah',
      operations: [
        {
          id: 'op-find-single',
          type: 'FIND_QOSIDAH',
          params: { titleQuery: cleaned || query, limit: targetLimit },
          explanation: `Mencari ${targetLimit} qosidah "${cleaned || query}"`,
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
/**
 * Mengekstrak judul qosidah dari pertanyaan atribut spesifik (misal: "Apa arti qosidah Padhang Bulan?")
 */
function extractQosidahTitleFromAttributeQuery(raw: string): string {
  let clean = raw.trim();
  clean = clean.replace(/[?.,!]+$/, '').trim();
  clean = clean.replace(/^(apa|bagaimana|tolong|coba|mohon)?\s*(sih|ya|dong)?\s*/i, '');
  clean = clean.replace(/^(arti|artinya|terjemahan|terjemah|makna|maknanya|maksud|maksudnya)\s+(dari\s+|tentang\s+)?/i, '');
  clean = clean.replace(/^(lirik|syair|bacaan|teks\s+arab|teks\s+latin|teks)\s+(dari\s+|tentang\s+)?/i, '');
  clean = clean.replace(/^(qosidah|sholawat|lagu|tembang|kidung|syair)\s+/i, '');
  clean = clean.replace(/\s+(itu\s+apa|apa\s+sih|apa\s+artinya|apa|artinya|dong|ya)$/i, '');
  return clean.trim();
}

function cleanQosidahQuery(raw: string): string {
  let clean = raw.trim();
  clean = clean.replace(/^(jelaskan\s+(secara\s+detail\s+)?(tentang\s+)?)/i, '');
  clean = clean.replace(/^(suruh\s+)?(carikan|cariin|cari|buka|lihat|bacakan|golekno|padosaken)\s+(saya\s+|dong\s+|in\s+)?/i, '');
  clean = clean.replace(/^(\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|dua belas|tiga belas|empat belas|lima belas|dua puluh)\s+(qosidah\s+|sholawat\s+|lagu\s+|syair\s+|lirik\s+|tembang\s+)?/i, '');
  clean = clean.replace(/^(qosidah|sholawat|lagu|syair|lirik|tembang)\s+/i, '');
  return clean.trim();
}
