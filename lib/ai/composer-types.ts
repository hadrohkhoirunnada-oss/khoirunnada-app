/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - NATURAL RESPONSE COMPOSER TYPES
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Definisi tipe data untuk Natural Response Composer (FASE 5).
 */

import type { AIAction, AIResponse } from '../ai-engine.ts';
import type { ReasoningResult, ReasoningStatus } from './plan-types.ts';

export type ResponseStyle = 'concise' | 'informative' | 'detailed';

export interface ComposerOptions {
  style?: ResponseStyle;
  seed?: number; // Nilai seed untuk variasi deterministik (cocok untuk unit test)
  referenceDate?: Date;
  timeZone?: string;
  maxActions?: number;
  userName?: string;
}

export interface ExtractedQosidahFact {
  id: string;
  title: string;
  category?: string;
  snippet?: string;
  translation?: string;
  arabic?: string;
}

export interface ExtractedJobFact {
  id: string;
  title: string;
  formattedDate: string;
  location: string;
  status: string;
}

export interface ExtractedCandidateFact {
  id: string;
  name: string;
  type?: 'qosidah' | 'job' | 'general';
}

export interface ExtractedFacts {
  status: ReasoningStatus;
  intent: string;
  entityName?: string;
  entityType?: string;
  entityId?: string;
  qosidahs: ExtractedQosidahFact[];
  jobs: ExtractedJobFact[];
  nearestJob?: ExtractedJobFact | null;
  count?: number;
  attributeName?: string;
  attributeValue?: string;
  staticContent?: string;
  isAmbiguous?: boolean;
  ambiguousCandidates?: ExtractedCandidateFact[];
  failureReason?: string;
}

export interface ComposedResponse {
  response: AIResponse;
  style: ResponseStyle;
  factsUsed: string[];
  reasoningStatus: ReasoningStatus;
  isConsistent: boolean;
}
