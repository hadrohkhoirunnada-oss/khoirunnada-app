/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - CONVERSATION MEMORY ADAPTER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Adapter memori percakapan sesi aman (FASE 7).
 * Mengelola siklus hidup memori sesi per-pengguna tanpa state global bersama,
 * mendukung reset percakapan, validasi TTL inaktivitas, dan pembersihan data privat.
 */

import type { AIConversationMemory, EntityReference } from './memory-types.ts';
import {
  createMemory,
  updateMemory,
  isMemoryExpired,
  resetMemory,
  validateMemoryUser,
  DEFAULT_MEMORY_TTL_MS,
  DEFAULT_MAX_TURNS,
  DEFAULT_MAX_ENTITIES,
} from './memory-lifecycle.ts';
import { redactSensitiveText } from './data-sanitizer.ts';

export interface MemorySessionOptions {
  ttlMs?: number;
  maxTurns?: number;
  maxEntities?: number;
  currentTime?: number;
}

/**
 * Membuat sesi memori percakapan baru untuk pengguna aktif.
 */
export function createMemorySession(
  userId?: string,
  sessionId?: string,
  currentTime = Date.now()
): AIConversationMemory {
  return createMemory(sessionId, userId, currentTime);
}

/**
 * Memvalidasi apakah sesi memori masih valid dan aman digunakan untuk pengguna aktif saat ini.
 */
export function isMemorySessionValid(
  memory: AIConversationMemory | undefined | null,
  currentUserId?: string,
  options: MemorySessionOptions = {}
): boolean {
  if (!memory) return false;
  const now = options.currentTime ?? Date.now();
  const ttl = options.ttlMs ?? DEFAULT_MEMORY_TTL_MS;

  // 1. Cek kedaluwarsa waktu (Inactivity TTL)
  if (isMemoryExpired(memory, ttl, now)) {
    return false;
  }

  // 2. Cek isolasi akun pengguna (User ID mismatch prevention)
  if (!validateMemoryUser(memory, currentUserId)) {
    return false;
  }

  return true;
}

/**
 * Mencatat giliran percakapan secara aman dan meminimalkan penyimpanan teks mentah.
 */
export function recordSessionTurn(
  memory: AIConversationMemory,
  userQuery: string,
  intent?: string,
  entity?: EntityReference,
  options: MemorySessionOptions = {}
): AIConversationMemory {
  const now = options.currentTime ?? Date.now();

  // Minimalkan raw query: sensor nomor telepon/email dan batasi panjang
  const safeQuerySnippet = redactSensitiveText(userQuery).slice(0, 100);

  return updateMemory(
    memory,
    {
      userQuery: safeQuerySnippet,
      intent,
      entity,
    },
    {
      ttlMs: options.ttlMs,
      maxTurns: options.maxTurns ?? DEFAULT_MAX_TURNS,
      maxEntities: options.maxEntities ?? DEFAULT_MAX_ENTITIES,
      currentTime: now,
    }
  );
}

/**
 * Mereset sesi memori percakapan (saat pengguna menekan tombol reset chat).
 */
export function resetMemorySession(
  currentUserId?: string,
  currentTime = Date.now()
): AIConversationMemory {
  return resetMemory(undefined, currentUserId, currentTime);
}
