/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - ACTION COMPOSER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Modul untuk menyusun tombol tindakan interaktif (AIAction) secara dinamis,
 * aman, dan terverifikasi dari rute internal aplikasi Khoirunnada (FASE 5).
 */

import type { AIAction } from '../ai-engine.ts';
import type { ExtractedFacts } from './composer-types.ts';
import { sanitizeAction } from './output-sanitizer.ts';

// Whitelist pola rute internal yang diizinkan
const ALLOWED_ROUTE_PATTERNS = [
  /^\/app\/qosidah$/,
  /^\/app\/qosidah\/[a-zA-Z0-9_\-]+$/,
  /^\/app\/jobs$/,
  /^\/app\/profile$/,
  /^\/app\/profile\/favorites$/,
];

/**
 * Validasi apakah URL tujuan merupakan rute internal aplikasi yang aman.
 */
export function isValidInternalRoute(href?: string): boolean {
  if (!href) return false;
  return ALLOWED_ROUTE_PATTERNS.some((pattern) => pattern.test(href));
}

/**
 * Validasi keabsahan entity ID (tidak kosong, bebas karakter berbahaya).
 */
export function isValidEntityId(id?: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_\-]+$/.test(id.trim());
}

/**
 * Menyusun daftar AIAction yang relevan berdasarkan fakta terverifikasi.
 */
export function composeActions(
  facts: ExtractedFacts,
  options: { maxActions?: number } = {}
): AIAction[] {
  const maxActions = Math.min(4, Math.max(1, options.maxActions || 3));
  const rawActions: AIAction[] = [];

  // 1. Kasus Klarifikasi Ambigu: Buat tombol untuk setiap kandidat
  if (facts.isAmbiguous && facts.ambiguousCandidates && facts.ambiguousCandidates.length > 0) {
    facts.ambiguousCandidates.slice(0, maxActions).forEach((cand) => {
      if (isValidEntityId(cand.id)) {
        rawActions.push({
          label: `📖 Buka ${cand.name}`,
          href: `/app/qosidah/${cand.id}`,
          promptText: `Carikan qosidah ${cand.name}`,
        });
      }
    });
    return rawActions.map(sanitizeAction);
  }

  // 2. Kasus Koleksi Favorit: Prioritaskan tombol favorit
  if (facts.intent.includes('favorite') || facts.intent.includes('favorit')) {
    rawActions.push({
      label: '❤️ Buka Qosidah Favorit',
      href: '/app/profile/favorites',
    });
    rawActions.push({
      label: '📖 Cari Qosidah Lain',
      href: '/app/qosidah',
    });
  }

  // 3. Kasus Jadwal Job Ditemukan
  if (facts.nearestJob || facts.jobs.length > 0 || facts.intent.includes('job')) {
    rawActions.push({
      label: '📅 Buka Semua Jadwal Job',
      href: '/app/jobs',
    });

    const activeJob = facts.nearestJob || facts.jobs[0];
    if (activeJob && !facts.attributeName?.includes('location')) {
      rawActions.push({
        label: '📍 Di Mana Lokasinya?',
        promptText: `Di mana lokasi ${activeJob.title}?`,
      });
    }
  }

  // 4. Kasus Qosidah Ditemukan
  if (facts.qosidahs.length > 0 && !facts.intent.includes('favorite')) {
    const topQosidah = facts.qosidahs[0];
    if (isValidEntityId(topQosidah.id)) {
      rawActions.push({
        label: `📖 Buka ${topQosidah.title}`,
        href: `/app/qosidah/${topQosidah.id}`,
      });
    }

    // Jika belum ada terjemahan pada fakta yang ditampilkan, tawarkan follow-up
    if (!facts.attributeName?.includes('translation') && topQosidah.translation) {
      rawActions.push({
        label: '🌐 Apa Artinya?',
        promptText: `Apa arti qosidah ${topQosidah.title}?`,
      });
    }

    // Jika ada qosidah kedua yang cocok
    if (facts.qosidahs.length > 1 && isValidEntityId(facts.qosidahs[1].id)) {
      rawActions.push({
        label: `📖 Buka ${facts.qosidahs[1].title}`,
        href: `/app/qosidah/${facts.qosidahs[1].id}`,
      });
    }
  }

  // 5. Kasus DATA_NOT_FOUND atau NEED_CONTEXT atau OUT_OF_SCOPE
  if (facts.status === 'DATA_NOT_FOUND' || facts.status === 'NEED_CONTEXT') {
    rawActions.push({
      label: '📖 Jelajahi Katalog Qosidah',
      href: '/app/qosidah',
    });
    rawActions.push({
      label: '📅 Cek Jadwal Job',
      href: '/app/jobs',
    });
  }

  if (facts.status === 'OUT_OF_SCOPE') {
    rawActions.push({
      label: '📖 Cari Qosidah',
      promptText: 'Carikan saya qosidah',
    });
    rawActions.push({
      label: '📅 Cek Jadwal Job',
      promptText: 'Ada jadwal job apa saja?',
    });
    rawActions.push({
      label: '🏛️ Sejarah Khoirunnada',
      promptText: 'Bagaimana sejarah Khoirunnada?',
    });
  }

  // Filter rute aman, buang duplikat label, dan batasi jumlah
  const uniqueActions: AIAction[] = [];
  const seenLabels = new Set<string>();

  for (const action of rawActions) {
    if (seenLabels.has(action.label)) continue;
    seenLabels.add(action.label);

    // Verifikasi keamanan rute jika ada href
    if (action.href && !isValidInternalRoute(action.href)) {
      continue;
    }

    uniqueActions.push(sanitizeAction(action));
    if (uniqueActions.length >= maxActions) break;
  }

  return uniqueActions;
}
