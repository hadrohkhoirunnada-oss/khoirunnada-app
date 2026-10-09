/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - MEMORY LIFECYCLE
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Pengelolaan siklus hidup memori sesi: pembuatan, pembaruan, kedaluwarsa,
 * pemangkasan kapasitas (sliding window), validasi isolasi pengguna, dan reset.
 */

import type { AIConversationMemory, ConversationTurn, EntityReference } from './memory-types.ts';

// Batas waktu inaktivitas sesi sebelum kedaluwarsa (Default: 15 menit)
export const DEFAULT_MEMORY_TTL_MS = 15 * 60 * 1000;

// Batas riwayat percakapan yang disimpan (Sliding window max 5 turns)
export const DEFAULT_MAX_TURNS = 5;

// Batas riwayat entitas yang diingat (Max 3 entitas terakhir)
export const DEFAULT_MAX_ENTITIES = 3;

/**
 * Membuat objek memori percakapan sesi baru yang bersih dan terisolasi.
 */
export function createMemory(sessionId?: string, userId?: string, currentTime = Date.now()): AIConversationMemory {
  return {
    sessionId: sessionId || `sess-${currentTime}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    turns: [],
    recentEntities: [],
    createdAt: currentTime,
    updatedAt: currentTime,
    isExpired: false,
  };
}

/**
 * Memeriksa apakah memori sesi sudah kedaluwarsa berdasarkan inaktivitas.
 */
export function isMemoryExpired(
  memory: AIConversationMemory | undefined | null,
  ttlMs = DEFAULT_MEMORY_TTL_MS,
  currentTime = Date.now()
): boolean {
  if (!memory) return true;
  if (memory.isExpired) return true;
  const elapsed = currentTime - memory.updatedAt;
  return elapsed > ttlMs;
}

/**
 * Memvalidasi apakah memori milik pengguna yang sama (mencegah kebocoran saat ganti akun).
 */
export function validateMemoryUser(
  memory: AIConversationMemory | undefined | null,
  currentUserId?: string
): boolean {
  if (!memory) return false;
  // Jika memori memiliki userId dan user aktif berbeda, memori tidak valid untuk user ini
  if (memory.userId && currentUserId && memory.userId !== currentUserId) {
    return false;
  }
  return true;
}

/**
 * Memangkas memori agar tidak tumbuh melebihi batas kapasitas peramban (Sliding Window).
 */
export function pruneMemory(
  memory: AIConversationMemory,
  maxTurns = DEFAULT_MAX_TURNS,
  maxEntities = DEFAULT_MAX_ENTITIES
): AIConversationMemory {
  const prunedTurns = memory.turns.slice(-maxTurns);
  const prunedEntities = memory.recentEntities.slice(-maxEntities);

  return {
    ...memory,
    turns: prunedTurns,
    recentEntities: prunedEntities,
  };
}

export interface UpdateMemoryInput {
  userQuery: string;
  intent?: string;
  entity?: EntityReference;
  topic?: string;
}

/**
 * Memperbarui memori percakapan secara immutable dengan giliran baru.
 */
export function updateMemory(
  memory: AIConversationMemory,
  input: UpdateMemoryInput,
  options: { ttlMs?: number; maxTurns?: number; maxEntities?: number; currentTime?: number } = {}
): AIConversationMemory {
  const currentTime = options.currentTime ?? Date.now();
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const maxEntities = options.maxEntities ?? DEFAULT_MAX_ENTITIES;

  const newTurn: ConversationTurn = {
    id: `turn-${currentTime}`,
    userQuery: input.userQuery,
    intent: input.intent,
    entity: input.entity,
    timestamp: currentTime,
  };

  const updatedTurns = [...memory.turns, newTurn].slice(-maxTurns);

  // Perbarui recentEntities: entitas baru ditaruh di depan, hindari duplikasi ID
  let updatedEntities = [...memory.recentEntities];
  if (input.entity) {
    const existingIndex = updatedEntities.findIndex(
      (e) => (e.id && e.id === input.entity?.id) || e.name.toLowerCase() === input.entity?.name.toLowerCase()
    );
    if (existingIndex !== -1) {
      updatedEntities.splice(existingIndex, 1);
    }
    updatedEntities = [input.entity, ...updatedEntities].slice(0, maxEntities);
  }

  return {
    ...memory,
    lastIntent: input.intent || memory.lastIntent,
    lastTopic: input.topic || memory.lastTopic,
    lastEntity: input.entity || memory.lastEntity,
    recentEntities: updatedEntities,
    turns: updatedTurns,
    updatedAt: currentTime,
    isExpired: false,
  };
}

/**
 * Mereset memori percakapan (digunakan saat tombol reset chat ditekan).
 */
export function resetMemory(sessionId?: string, userId?: string, currentTime = Date.now()): AIConversationMemory {
  return createMemory(sessionId, userId, currentTime);
}
