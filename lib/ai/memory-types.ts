/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - CONTEXTUAL MEMORY TYPES
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Definisi tipe data memori percakapan sesi dan resolusi konteks (FASE 3).
 */

export type EntityType = 'qosidah' | 'job' | 'profile' | 'general';

export interface EntityReference {
  type: EntityType;
  id?: string;
  name: string;
  category?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ConversationTurn {
  id: string;
  userQuery: string;
  intent?: string;
  entity?: EntityReference;
  timestamp: number;
}

export interface AIConversationMemory {
  sessionId: string;
  userId?: string;
  lastIntent?: string;
  lastTopic?: string;
  lastEntity?: EntityReference;
  recentEntities: EntityReference[];
  turns: ConversationTurn[];
  createdAt: number;
  updatedAt: number;
  isExpired?: boolean;
}

export type ContextResolutionStatus =
  | 'RESOLVED'
  | 'NEW_TOPIC'
  | 'NO_CONTEXT'
  | 'AMBIGUOUS'
  | 'EXPIRED'
  | 'ENTITY_NOT_FOUND'
  | 'CORRECTION';

export type FollowUpAttribute =
  | 'translation'
  | 'lyrics'
  | 'date'
  | 'location'
  | 'general_details'
  | 'next_item';

export interface ContextResolutionResult {
  status: ContextResolutionStatus;
  isFollowUp: boolean;
  resolvedQuery: string;
  intent?: string;
  targetEntity?: EntityReference;
  targetDomain?: EntityType;
  requestedAttribute?: FollowUpAttribute;
  confidence: 'high' | 'medium' | 'low';
  isAmbiguous?: boolean;
  ambiguousCandidates?: EntityReference[];
  isCorrection?: boolean;
  explanation: string;
}
