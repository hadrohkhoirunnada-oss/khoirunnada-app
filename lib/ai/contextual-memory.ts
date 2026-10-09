/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - CONTEXTUAL MEMORY (FACADE)
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Titik masuk terpadu Contextual Memory Engine (FASE 3).
 * Menyatukan Memory Lifecycle dan Context Resolver.
 */

import type { AIContext } from '../ai-engine.ts';
import type {
  AIConversationMemory,
  ContextResolutionResult,
  EntityReference,
} from './memory-types.ts';
import {
  createMemory,
  updateMemory,
  isMemoryExpired,
  resetMemory,
  pruneMemory,
  validateMemoryUser,
} from './memory-lifecycle.ts';
import { resolveConversationContext, isContextDependentQuery } from './context-resolver.ts';

export * from './memory-types.ts';
export * from './memory-lifecycle.ts';
export * from './context-resolver.ts';

export interface MemoryManagerOptions {
  ttlMs?: number;
  maxTurns?: number;
  maxEntities?: number;
}

/**
 * Mencatat giliran percakapan baru ke dalam memori sesi dengan entitas dari hasil retrieval.
 */
export function recordTurn(
  memory: AIConversationMemory | undefined,
  userQuery: string,
  intent?: string,
  entity?: EntityReference,
  options: MemoryManagerOptions = {}
): AIConversationMemory {
  const currentMem = memory || createMemory();
  return updateMemory(
    currentMem,
    {
      userQuery,
      intent,
      entity,
    },
    options
  );
}

/**
 * Membantu menyelesaikan atribut entitas langsung dari sumber data aktif tanpa duplikasi data.
 */
export function resolveEntityData(
  entity: EntityReference | undefined,
  context: AIContext
): Record<string, any> | null {
  if (!entity || !entity.id) return null;

  if (entity.type === 'qosidah') {
    const qosidahs = context.qosidahs || [];
    const found = qosidahs.find((q) => q.id === entity.id);
    if (!found) return null;
    return {
      id: found.id,
      title: found.title,
      alternate_title: found.alternate_title,
      arabic_text: found.arabic_text,
      latin_text: found.latin_text,
      translation: found.translation,
      category_name: found.category_name,
      tags: found.tags,
    };
  }

  if (entity.type === 'job') {
    const jobs = context.jobs || [];
    const found = jobs.find((j) => j.id === entity.id);
    if (!found) return null;
    return {
      id: found.id,
      title: found.title,
      event_type: found.event_type,
      event_date: found.event_date,
      location: found.location,
      status: found.status,
    };
  }

  return null;
}
