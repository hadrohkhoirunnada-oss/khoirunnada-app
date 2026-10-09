/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - REASONING & QUERY PLANNING TYPES
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Definisi tipe data untuk Query Planner dan Deterministic Reasoning Engine (FASE 4).
 */

import type { EntityReference } from './memory-types.ts';
import type { MatchEvidence, SafeJob } from './retrieval-types.ts';
import type { Qosidah } from '../types.ts';

export type PlanOperationType =
  | 'FIND_QOSIDAH'
  | 'RESOLVE_ENTITY'
  | 'GET_ATTRIBUTE'
  | 'SEARCH_JOBS'
  | 'GET_NEAREST_JOB'
  | 'GET_UPCOMING_JOBS'
  | 'GET_PAST_JOBS'
  | 'FILTER_JOBS_TEMPORAL'
  | 'RESOLVE_FAVORITES'
  | 'COUNT_RESULTS'
  | 'GET_STATIC_KNOWLEDGE'
  | 'RESOLVE_REFERENCE'
  | 'OUT_OF_SCOPE';

export interface PlanOperation {
  id: string;
  type: PlanOperationType;
  params: Record<string, any>;
  dependsOn?: string; // id operasi yang hasilnya dibutuhkan
  explanation: string;
}

export interface QueryPlan {
  query: string;
  intent: string;
  operations: PlanOperation[];
  targetEntity?: EntityReference;
  isMultiStep: boolean;
  isFollowUp: boolean;
  temporalConstraint?: {
    type: 'today' | 'tomorrow' | 'yesterday' | 'this_week' | 'next_week' | 'this_month' | 'next_month' | 'this_year' | 'nearest' | 'past' | 'upcoming';
    startDate?: string;
    endDate?: string;
  };
  isSupported: boolean;
}

export type ReasoningStatus =
  | 'SUCCESS'
  | 'DATA_NOT_FOUND'
  | 'AMBIGUOUS'
  | 'OUT_OF_SCOPE'
  | 'NEED_CONTEXT'
  | 'UNAUTHORIZED';

export interface ExecutedOperation {
  operationId: string;
  type: PlanOperationType;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  explanation: string;
}

export interface SafeReasoningData {
  qosidahs?: Qosidah[];
  jobs?: SafeJob[];
  nearestJob?: SafeJob | null;
  count?: number;
  attributeName?: string;
  attributeValue?: string;
  staticContent?: string;
  resolvedEntity?: EntityReference;
}

export interface ReasoningResult {
  status: ReasoningStatus;
  intent: string;
  plan: QueryPlan;
  operationsExecuted: ExecutedOperation[];
  targetEntity?: EntityReference;
  data: SafeReasoningData;
  evidence: MatchEvidence[];
  isAmbiguous?: boolean;
  ambiguousCandidates?: any[];
  failureReason?: string;
  summary: string;
}
