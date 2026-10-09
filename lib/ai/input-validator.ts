/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - INPUT VALIDATOR & ABUSE PROTECTION
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Modul firewall masukan dan perlindungan serangan (FASE 6).
 * Memvalidasi teks mentah pengguna, memblokir upaya injeksi, penolakan probing rahasia,
 * dan membersihkan karakter kontrol/panjang berlebih.
 */

import type { InputValidationResult } from './confidence-types.ts';

// Karakter kontrol terlarang (selain newline \n dan tab \t)
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Deteksi & pembersihan tag skrip beserta isi dalamnya secara utuh
const SCRIPT_FULL_TAG_REGEX = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const STYLE_FULL_TAG_REGEX = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
const GENERIC_HTML_TAGS_REGEX = /<\/?(iframe|object|embed|applet|meta|form|input)[^>]*>/gi;
const JAVASCRIPT_EVENT_REGEX = /\b(on\w+|javascript\s*:)\s*=[^>\s]*/gi;

// Deteksi manipulasi path traversal dan URL eksternal berbahaya
const PATH_TRAVERSAL_REGEX = /(\.\.[\/\\]|[a-z0-9]+:\/\/|\/etc\/passwd|c:\\windows)/i;

// Deteksi probing data rahasia / administratif privat
const PRIVATE_DATA_PROBE_REGEX =
  /\b(tampilkan\s+password|kata\s+sandi|nomor\s+hp\s+pelanggan|no\s+telepon\s+customer|booking\s+id\s+rahasia|token\s+auth|kunci\s+rahasia|admin\s+secret|db_password)\b/i;

// Deteksi instruksi pembatalan aturan (System override / jailbreak attempt)
const SYSTEM_OVERRIDE_REGEX =
  /\b(abaikan\s+(semua\s+)?(aturan|instruksi)|ignore\s+(all\s+)?previous\s+instructions|system\s+prompt|tampilkan\s+prompt\s+asli|bocorkan\s+instruksi)\b/i;

export const DEFAULT_MAX_INPUT_LENGTH = 500;

/**
 * Memvalidasi dan membersihkan input pengguna sebelum diproses oleh Brain Engine.
 */
export function validateUserInput(
  rawInput?: string | null,
  maxLength = DEFAULT_MAX_INPUT_LENGTH
): InputValidationResult {
  if (typeof rawInput !== 'string') {
    return {
      isValid: false,
      sanitizedQuery: '',
      isAbusiveOrProhibited: false,
      violationReason: 'Input kosong atau bukan bertipe string.',
    };
  }

  // 1. Normalisasi Unicode (NFC) untuk menangani variasi komposisi karakter
  let text = rawInput.normalize('NFC').trim();

  // 2. Cek apakah string kosong setelah di-trim
  if (text.length === 0) {
    return {
      isValid: false,
      sanitizedQuery: '',
      isAbusiveOrProhibited: false,
      violationReason: 'Input hanya berupa spasi kosong.',
    };
  }

  // 3. Batasi panjang input demi keamanan memori peramban
  if (text.length > maxLength) {
    text = text.slice(0, maxLength);
  }

  // 4. Deteksi percobaan manipulasi aturan sistem (Jailbreak / System Override)
  if (SYSTEM_OVERRIDE_REGEX.test(text)) {
    return {
      isValid: false,
      sanitizedQuery: text,
      isAbusiveOrProhibited: true,
      violationReason: 'Percobaan override instruksi atau ekstraksi sistem prompt terdeteksi.',
    };
  }

  // 5. Deteksi permohonan data privat/kredensial
  if (PRIVATE_DATA_PROBE_REGEX.test(text)) {
    return {
      isValid: false,
      sanitizedQuery: text,
      isAbusiveOrProhibited: true,
      violationReason: 'Permintaan akses data privat atau informasi rahasia dilarang.',
    };
  }

  // 6. Deteksi serangan path traversal atau routing berbahaya
  if (PATH_TRAVERSAL_REGEX.test(text)) {
    return {
      isValid: false,
      sanitizedQuery: text,
      isAbusiveOrProhibited: true,
      violationReason: 'Percobaan path traversal atau navigasi URL eksternal terdeteksi.',
    };
  }

  // 7. Bersihkan seluruh blok script, style, dan event handler berbahaya
  text = text.replace(SCRIPT_FULL_TAG_REGEX, '');
  text = text.replace(STYLE_FULL_TAG_REGEX, '');
  text = text.replace(GENERIC_HTML_TAGS_REGEX, '');
  text = text.replace(JAVASCRIPT_EVENT_REGEX, '');
  text = text.replace(CONTROL_CHARS_REGEX, '');

  return {
    isValid: true,
    sanitizedQuery: text.trim(),
    isAbusiveOrProhibited: false,
  };
}
