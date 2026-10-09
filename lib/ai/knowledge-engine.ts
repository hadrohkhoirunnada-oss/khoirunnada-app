/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - KNOWLEDGE ENGINE (FACADE)
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Agregator utama Modular Knowledge & Retrieval Engine (FASE 2).
 * Mengintegrasikan pencarian qosidah, jadwal job, favorit, dan artikel pengetahuan statis
 * ke dalam struktur data terpadu (UnifiedKnowledgeResult) yang siap digunakan untuk FASE 4 (Reasoning).
 */

import type { AIContext } from '../ai-engine.ts';
import type { UnifiedKnowledgeResult } from './retrieval-types.ts';
import { retrieveQosidahs } from './qosidah-retriever.ts';
import { getUpcomingJobs, getNearestJob, searchJobs } from './job-retriever.ts';
import { resolveFavorites } from './favorites-retriever.ts';
import { searchStaticKnowledge } from './static-knowledge.ts';

export interface KnowledgeQueryOptions {
  referenceDate?: Date;
  limitQosidah?: number;
  minThreshold?: number;
}

/**
 * Melakukan penelusuran fakta terpadu dari AIContext dinamis dan basis pengetahuan statis.
 */
export function queryKnowledge(
  userInput: string,
  context: AIContext,
  options: KnowledgeQueryOptions = {}
): UnifiedKnowledgeResult {
  const query = userInput.trim();
  const qosidahs = context.qosidahs || [];
  const jobs = context.jobs || [];
  const favoriteIds = context.favorites || [];
  const refDate = options.referenceDate || new Date();

  // 1. Eksekusi pencarian qosidah
  const qosidahMatches = retrieveQosidahs(query, qosidahs, {
    limit: options.limitQosidah || 5,
    minThreshold: options.minThreshold || 0.5,
  });

  // 2. Eksekusi pencarian jadwal job & penjadwalan
  const jobMatches = searchJobs(query, jobs, options.minThreshold || 0.5);
  const upcomingJobs = getUpcomingJobs(jobs, refDate);
  const nearestJob = getNearestJob(jobs, refDate);

  // 3. Resolusi favorit pengguna
  const favoriteQosidahs = resolveFavorites(favoriteIds, qosidahs);

  // 4. Pencarian artikel pengetahuan statis
  const staticMatches = searchStaticKnowledge(query, options.minThreshold || 0.5);

  // 5. Menentukan topMatchDomain berdasarkan skor tertinggi
  let topMatchDomain: 'qosidah' | 'job' | 'favorite' | 'static' | 'none' = 'none';
  let highestScore = 0;

  if (qosidahMatches.length > 0 && qosidahMatches[0].score > highestScore) {
    highestScore = qosidahMatches[0].score;
    topMatchDomain = 'qosidah';
  }

  if (staticMatches.length > 0 && staticMatches[0].score > highestScore) {
    highestScore = staticMatches[0].score;
    topMatchDomain = 'static';
  }

  if (jobMatches.length > 0 && jobMatches[0].score > highestScore) {
    highestScore = jobMatches[0].score;
    topMatchDomain = 'job';
  }

  // Jika query menyebut kata kunci favorit
  const normQuery = query.toLowerCase();
  if (
    normQuery.includes('favorit') ||
    normQuery.includes('lagu saya') ||
    normQuery.includes('koleksi saya')
  ) {
    topMatchDomain = 'favorite';
  }

  const hasHighConfidenceMatch = highestScore >= 0.85;

  return {
    query,
    qosidahMatches,
    jobMatches,
    upcomingJobs,
    nearestJob,
    favoriteQosidahs,
    staticMatches,
    topMatchDomain,
    hasHighConfidenceMatch,
  };
}
