/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - RETRIEVAL TYPES
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Definisi tipe data terstruktur untuk Modular Knowledge & Retrieval Engine (FASE 2).
 */

import type { Qosidah, Job, Profile } from '../types.ts';

export type RetrievalStrategy =
  | 'exact_title'
  | 'exact_alias'
  | 'prefix_title'
  | 'arabic_normalized'
  | 'fuzzy_title'
  | 'ngram_title'
  | 'tag_match'
  | 'category_match'
  | 'content_latin'
  | 'content_arabic'
  | 'content_translation'
  | 'keyword_match';

export interface MatchEvidence {
  field: string;
  strategy: RetrievalStrategy | string;
  score: number;
  snippet?: string;
  matchedTerm?: string;
}

export interface RetrievalResult<T> {
  item: T;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  strategy: RetrievalStrategy | string;
  evidence: MatchEvidence[];
}

/**
 * Representasi Job yang aman untuk publik/klien (Privacy-Preserving).
 * Data sensitif seperti customer_phone, booking_id internal, dan catatan privat disembunyikan.
 */
export interface SafeJob {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  gather_time?: string;
  start_time?: string;
  location?: string;
  maps_url?: string;
  status: string;
  isUpcoming: boolean;
  formattedDate: string;
}

export type StaticCategory =
  | 'sejarah'
  | 'organisasi'
  | 'aplikasi'
  | 'pengembang'
  | 'profil_dzarin';

export interface StaticKnowledgeArticle {
  id: string;
  title: string;
  category: StaticCategory;
  keywords: string[];
  content: string;
  isDeepSearch?: boolean;
  actions?: Array<{ label: string; href?: string; promptText?: string }>;
}

export interface UnifiedKnowledgeResult {
  query: string;
  qosidahMatches: RetrievalResult<Qosidah>[];
  jobMatches: RetrievalResult<SafeJob>[];
  upcomingJobs: SafeJob[];
  nearestJob: SafeJob | null;
  favoriteQosidahs: Qosidah[];
  staticMatches: RetrievalResult<StaticKnowledgeArticle>[];
  topMatchDomain: 'qosidah' | 'job' | 'favorite' | 'static' | 'none';
  hasHighConfidenceMatch: boolean;
}
