/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - RESPONSE STYLE SELECTOR
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Modul untuk mendeteksi preferensi gaya bahasa pengguna (FASE 5).
 * Mendukung gaya: concise (singkat), informative (standar santun), dan detailed (rinci).
 */

import type { ResponseStyle } from './composer-types.ts';

const CONCISE_TRIGGERS: RegExp[] = [
  /\b(singkat|ringkas|pendek|to the point|point[- ]point)\b/i,
  /\b(secara singkat|singkat saja|ringkas saja|jangan panjang|jangan bertele[- ]tele)\b/i,
];

const DETAILED_TRIGGERS: RegExp[] = [
  /\b(detail|rinci|lengkap|mendalam|komprehensif|panjang lebar)\b/i,
  /\b(secara detail|secara rinci|jelaskan detail|jelaskan secara detail|lebih jelas|selengkapnya)\b/i,
];

/**
 * Mendeteksi preferensi gaya penyusunan respons berdasarkan kueri pengguna.
 */
export function detectResponseStyle(
  userInput?: string,
  explicitStyle?: ResponseStyle
): ResponseStyle {
  if (explicitStyle) {
    return explicitStyle;
  }

  if (!userInput) {
    return 'informative';
  }

  const query = userInput.toLowerCase().trim();

  // Cek pemicu gaya ringkas
  for (const regex of CONCISE_TRIGGERS) {
    if (regex.test(query)) {
      return 'concise';
    }
  }

  // Cek pemicu gaya terperinci
  for (const regex of DETAILED_TRIGGERS) {
    if (regex.test(query)) {
      return 'detailed';
    }
  }

  // Default: gaya informatif santun khas Hadroh Khoirunnada
  return 'informative';
}
