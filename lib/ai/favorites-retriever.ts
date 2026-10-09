/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - FAVORITES RETRIEVER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Mesin pencari dan resolver qosidah favorit pengguna.
 * Menangani deduplikasi, ID tidak ditemukan, dan pencarian internal favorit.
 */

import type { Qosidah } from '../types.ts';
import type { RetrievalResult } from './retrieval-types.ts';
import { retrieveQosidahs } from './qosidah-retriever.ts';

/**
 * Menyelesaikan (resolve) daftar ID favorit menjadi daftar objek Qosidah lengkap.
 * - Mencegah duplikasi ID (menggunakan Set).
 * - Menangani ID yang tidak ditemukan/sudah terhapus secara aman (graceful skip).
 * - Menjaga urutan dan integritas immutability (tidak mengubah input).
 */
export function resolveFavorites(
  favoriteIds: string[] | undefined | null,
  qosidahs: Qosidah[] | undefined | null
): Qosidah[] {
  if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) return [];
  if (!Array.isArray(qosidahs) || qosidahs.length === 0) return [];

  // Peta ID qosidah untuk lookup cepat O(1)
  const qosidahMap = new Map<string, Qosidah>();
  for (const q of qosidahs) {
    if (q && q.id) {
      qosidahMap.set(q.id, q);
    }
  }

  // Deduplikasi ID favorit dengan Set
  const uniqueIds = Array.from(new Set(favoriteIds));
  const resolved: Qosidah[] = [];

  for (const id of uniqueIds) {
    const found = qosidahMap.get(id);
    if (found) {
      resolved.push(found);
    }
  }

  return resolved;
}

/**
 * Mencari qosidah tertentu HANYA di dalam daftar koleksi favorit pengguna.
 */
export function searchInFavorites(
  rawQuery: string,
  favoriteIds: string[] | undefined | null,
  qosidahs: Qosidah[] | undefined | null,
  minThreshold = 0.5
): RetrievalResult<Qosidah>[] {
  const favoriteQosidahs = resolveFavorites(favoriteIds, qosidahs);
  if (favoriteQosidahs.length === 0) return [];

  return retrieveQosidahs(rawQuery, favoriteQosidahs, {
    minThreshold,
    limit: 5,
    enableContentSearch: true,
  });
}
