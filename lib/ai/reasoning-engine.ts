/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - REASONING ENGINE
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mesin penalaran deterministik berbasis aturan eksplisit (Rule-Based Reasoning Engine).
 * Menjalankan operasi terencana secara berurutan, aman, dan tanpa kode dinamis (eval).
 */

import type { AIContext } from '../ai-engine.ts';
import type {
  QueryPlan,
  ReasoningResult,
  ReasoningStatus,
  ExecutedOperation,
  SafeReasoningData,
} from './plan-types.ts';
import type { EntityReference } from './memory-types.ts';
import type { MatchEvidence, SafeJob } from './retrieval-types.ts';
import type { Qosidah } from '../types.ts';

import { planQuery, type PlannerOptions } from './query-planner.ts';
import { retrieveQosidahs } from './qosidah-retriever.ts';
import {
  getUpcomingJobs,
  getPastJobs,
  getNearestJob,
  searchJobs,
} from './job-retriever.ts';
import { filterJobsByTemporalWindow } from './temporal-reasoner.ts';
import { resolveFavorites } from './favorites-retriever.ts';
import { searchStaticKnowledge } from './static-knowledge.ts';
import { resolveEntityData } from './contextual-memory.ts';

// Batas aman eksekusi operasi per kueri untuk perlindungan browser
export const MAX_REASONING_OPERATIONS = 10;

/**
 * Menjalankan penalaran deterministik terstruktur dari kueri pengguna dan konteks aktif.
 */
export function executeReasoning(
  rawQuery: string,
  context: AIContext,
  options: PlannerOptions = {}
): ReasoningResult {
  const plan = planQuery(rawQuery, context, options);
  return executePlan(plan, context, options);
}

/**
 * Menjalankan QueryPlan yang sudah disusun menjadi ReasoningResult akhir.
 */
export function executePlan(
  plan: QueryPlan,
  context: AIContext,
  options: PlannerOptions = {}
): ReasoningResult {
  const refDate = options.referenceDate || new Date();
  const operationsExecuted: ExecutedOperation[] = [];
  const evidences: MatchEvidence[] = [];

  let status: ReasoningStatus = 'SUCCESS';
  let targetEntity: EntityReference | undefined = plan.targetEntity;
  let failureReason: string | undefined;

  const data: SafeReasoningData = {};
  const opResultsMap = new Map<string, any>();

  // Validasi batas operasi (mencegah loop / serangan DoS)
  const opsToRun = plan.operations.slice(0, MAX_REASONING_OPERATIONS);

  for (const op of opsToRun) {
    const startTime = performance.now();
    let opStatus: 'SUCCESS' | 'FAILED' | 'SKIPPED' = 'SUCCESS';
    let opExplanation = op.explanation;

    try {
      switch (op.type) {
        case 'FIND_QOSIDAH': {
          const qosidahs = context.qosidahs || [];
          const matches = retrieveQosidahs(op.params.titleQuery, qosidahs, { limit: 5 });
          if (matches.length > 0) {
            data.qosidahs = matches.map((m) => m.item);
            targetEntity = {
              type: 'qosidah',
              id: matches[0].item.id,
              name: matches[0].item.title,
              category: matches[0].item.category_name,
            };
            matches.forEach((m) => evidences.push(...m.evidence));
            opResultsMap.set(op.id, data.qosidahs);
            opExplanation = `Ditemukan ${matches.length} qosidah yang cocok dengan "${op.params.titleQuery}".`;
          } else {
            data.qosidahs = [];
            status = 'DATA_NOT_FOUND';
            failureReason = `Tidak ditemukan qosidah untuk kueri "${op.params.titleQuery}".`;
            opStatus = 'FAILED';
          }
          break;
        }

        case 'RESOLVE_ENTITY': {
          const entityRef: EntityReference = {
            type: op.params.entityType,
            id: op.params.entityId,
            name: op.params.entityName,
          };
          const entityData = resolveEntityData(entityRef, context);
          if (entityData) {
            targetEntity = entityRef;
            data.resolvedEntity = entityRef;
            opResultsMap.set(op.id, entityData);
            opExplanation = `Berhasil menyelesaikan data entitas ${entityRef.name}.`;
          } else {
            status = 'DATA_NOT_FOUND';
            failureReason = `Entitas "${entityRef.name}" sudah tidak ditemukan dalam data aktif.`;
            opStatus = 'FAILED';
          }
          break;
        }

        case 'GET_ATTRIBUTE': {
          const attr = op.params.attribute;
          data.attributeName = attr;

          // Ambil dari hasil operasi dependensi atau dari targetEntity
          let sourceEntityData: any = null;
          if (op.dependsOn && opResultsMap.has(op.dependsOn)) {
            const depResult = opResultsMap.get(op.dependsOn);
            sourceEntityData = Array.isArray(depResult) ? depResult[0] : depResult;
          } else if (targetEntity) {
            sourceEntityData = resolveEntityData(targetEntity, context);
          }

          if (sourceEntityData) {
            if (attr === 'translation') {
              data.attributeValue = sourceEntityData.translation || '';
            } else if (attr === 'lyrics') {
              data.attributeValue = sourceEntityData.latin_text || sourceEntityData.arabic_text || '';
            } else if (attr === 'location') {
              data.attributeValue = sourceEntityData.location || '';
            } else if (attr === 'date') {
              data.attributeValue = sourceEntityData.formattedDate || sourceEntityData.event_date || '';
            } else {
              data.attributeValue = sourceEntityData[attr] || '';
            }

            if (!data.attributeValue) {
              opExplanation = `Atribut ${attr} kosong atau belum tersedia pada entitas ini.`;
            } else {
              opExplanation = `Berhasil mengambil nilai atribut ${attr}.`;
            }
          } else {
            data.attributeValue = '';
            status = 'DATA_NOT_FOUND';
            failureReason = 'Tidak ada entitas aktif untuk mengambil atribut.';
            opStatus = 'FAILED';
          }
          break;
        }

        case 'GET_UPCOMING_JOBS': {
          const jobs = context.jobs || [];
          const upcoming = getUpcomingJobs(jobs, refDate);
          data.jobs = upcoming;
          opResultsMap.set(op.id, upcoming);
          if (upcoming.length > 0) {
            opExplanation = `Ditemukan ${upcoming.length} jadwal job mendatang.`;
          } else {
            opExplanation = 'Saat ini belum ada jadwal job aktif yang diagendakan.';
          }
          break;
        }

        case 'GET_NEAREST_JOB': {
          const jobs = context.jobs || [];
          const nearest = getNearestJob(jobs, refDate);
          data.nearestJob = nearest;
          data.jobs = nearest ? [nearest] : [];
          opResultsMap.set(op.id, nearest);
          if (nearest) {
            targetEntity = {
              type: 'job',
              id: nearest.id,
              name: nearest.title,
            };
            opExplanation = `Jadwal terdekat adalah "${nearest.title}".`;
          } else {
            opExplanation = 'Tidak ada jadwal job terdekat yang aktif.';
          }
          break;
        }

        case 'GET_PAST_JOBS': {
          const jobs = context.jobs || [];
          const past = getPastJobs(jobs, refDate);
          data.jobs = past;
          opResultsMap.set(op.id, past);
          opExplanation = `Ditemukan ${past.length} jadwal job yang telah selesai.`;
          break;
        }

        case 'FILTER_JOBS_TEMPORAL': {
          const jobs = context.jobs || [];
          const window = op.params.window;
          const filtered = filterJobsByTemporalWindow(jobs, window, refDate);
          data.jobs = filtered;
          opResultsMap.set(op.id, filtered);
          opExplanation = `Ditemukan ${filtered.length} jadwal job untuk periode ${window.type}.`;
          break;
        }

        case 'RESOLVE_FAVORITES': {
          const qosidahs = context.qosidahs || [];
          const favorites = context.favorites || [];
          const resolved = resolveFavorites(favorites, qosidahs);
          data.qosidahs = resolved;
          opResultsMap.set(op.id, resolved);
          opExplanation = `Berhasil mengambil ${resolved.length} qosidah favorit.`;
          break;
        }

        case 'COUNT_RESULTS': {
          let count = 0;
          if (op.dependsOn && opResultsMap.has(op.dependsOn)) {
            const depResult = opResultsMap.get(op.dependsOn);
            count = Array.isArray(depResult) ? depResult.length : depResult ? 1 : 0;
          } else if (data.qosidahs) {
            count = data.qosidahs.length;
          } else if (data.jobs) {
            count = data.jobs.length;
          }
          data.count = count;
          opExplanation = `Hasil perhitungan jumlah: ${count}.`;
          break;
        }

        case 'GET_STATIC_KNOWLEDGE': {
          const matches = searchStaticKnowledge(op.params.query);
          if (matches.length > 0) {
            data.staticContent = matches[0].item.content;
            targetEntity = {
              type: 'general',
              id: matches[0].item.id,
              name: matches[0].item.title,
            };
            matches.forEach((m) => evidences.push(...m.evidence));
            opExplanation = `Ditemukan artikel pengetahuan resmi: "${matches[0].item.title}".`;
          } else {
            status = 'DATA_NOT_FOUND';
            failureReason = 'Tidak ditemukan artikel pengetahuan statis yang sesuai.';
            opStatus = 'FAILED';
          }
          break;
        }

        case 'OUT_OF_SCOPE': {
          if (op.params.reason === 'NO_CONTEXT' || op.params.reason === 'EXPIRED') {
            status = 'NEED_CONTEXT';
            failureReason = 'Pertanyaan memerlukan konteks percakapan sebelumnya yang aktif.';
          } else if (op.params.reason === 'AMBIGUOUS') {
            status = 'AMBIGUOUS';
            failureReason = 'Konteks rujukan ambigu dan memerlukan klarifikasi.';
          } else if (op.params.reason === 'ENTITY_NOT_FOUND') {
            status = 'DATA_NOT_FOUND';
            failureReason = 'Entitas yang dirujuk tidak ditemukan dalam data aktif.';
          } else {
            status = 'OUT_OF_SCOPE';
            failureReason = 'Pertanyaan berada di luar domain pengetahuan Hadroh Khoirunnada.';
          }
          opExplanation = failureReason;
          break;
        }
      }
    } catch (err: any) {
      opStatus = 'FAILED';
      status = 'DATA_NOT_FOUND';
      failureReason = `Gagal mengeksekusi operasi: ${err?.message || 'Unknown error'}`;
      opExplanation = failureReason;
    }

    operationsExecuted.push({
      operationId: op.id,
      type: op.type,
      status: opStatus,
      durationMs: Math.max(0.1, performance.now() - startTime),
      explanation: opExplanation,
    });

    if (opStatus === 'FAILED' && status !== 'SUCCESS') {
      break; // Berhenti jika operasi prasyarat gagal
    }
  }

  // Buat ringkasan penalaran yang ringkas dan aman (tanpa data sensitif)
  const summary = generateReasoningSummary(plan.intent, status, data);

  return {
    status,
    intent: plan.intent,
    plan,
    operationsExecuted,
    targetEntity,
    data,
    evidence: evidences,
    failureReason,
    summary,
  };
}

/**
 * Membuat ringkasan penalaran yang bersih untuk FASE 5 (Response Composer).
 */
function generateReasoningSummary(
  intent: string,
  status: ReasoningStatus,
  data: SafeReasoningData
): string {
  if (status === 'OUT_OF_SCOPE') return 'Permintaan di luar domain resmi Khoirunnada.';
  if (status === 'NEED_CONTEXT') return 'Membutuhkan konteks percakapan sebelumnya.';
  if (status === 'DATA_NOT_FOUND') return 'Fakta yang dicari tidak ditemukan dalam database.';
  if (status === 'AMBIGUOUS') return 'Rujukan tidak jelas dan memerlukan klarifikasi.';

  if (intent.includes('count')) {
    return `Ditemukan ${data.count ?? 0} item yang relevan.`;
  }
  if (intent.includes('translate') || intent.includes('translation')) {
    return data.attributeValue ? 'Terjemahan berhasil diambil.' : 'Terjemahan belum tersedia.';
  }
  if (intent.includes('nearest_job')) {
    return data.nearestJob ? `Jadwal terdekat adalah ${data.nearestJob.title}.` : 'Belum ada jadwal terdekat.';
  }
  if (intent.includes('jobs')) {
    return `Tersedia ${(data.jobs || []).length} jadwal job.`;
  }
  if (intent.includes('qosidah')) {
    return `Tersedia ${(data.qosidahs || []).length} qosidah yang cocok.`;
  }
  if (intent.includes('static')) {
    return 'Artikel pengetahuan resmi ditemukan.';
  }

  return 'Penalaran berhasil dieksekusi.';
}
