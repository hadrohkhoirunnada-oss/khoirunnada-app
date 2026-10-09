/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - OUTPUT SANITIZER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Modul pembersihan dan perlindungan respons akhir (FASE 5).
 * Memastikan Zero Asterisk (*), bebas HTML berbahaya, bebas jejak debug internal,
 * dan menjaga integritas teks Arab & harakat.
 */

import type { AIResponse, AIAction } from '../ai-engine.ts';

// Regex untuk mendeteksi tag HTML yang berpotensi berbahaya
const UNSAFE_HTML_REGEX = /<\/?(script|iframe|style|object|embed|applet|form|input|button|link|meta)[^>]*>/gi;
const ON_EVENT_HANDLER_REGEX = /\bon[a-z]+\s*=\s*['"][^'"]*['"]/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /javascript\s*:\s*/gi;

// Regex untuk mendeteksi jejak debug internal sistem
const INTERNAL_DEBUG_TRACES: RegExp[] = [
  /\b(Error:\s+|at\s+[\w$.]+\s+\([^)]+\)|at\s+async\s+|\bnode_modules\b)/gi,
  /\b(TypeError|ReferenceError|SyntaxError|RangeError):[^\n]*/gi,
  /\[object\s+Object\]/g,
  /\bundefined\b(?!\w)/g,
  /\bnull\b(?!\w)/g,
];

// Regex kebocoran nomor telepon / credential
const LEAKED_PHONE_REGEX = /(\+?62|08)[0-9\- ]{8,15}/g;

/**
 * Membersihkan teks tunggal dari karakter terlarang dan risiko injeksi.
 */
export function sanitizeOutputText(input?: string | null): string {
  if (typeof input !== 'string') {
    return '';
  }

  let text = input;

  // 1. ATURAN MUTLAK: Zero Asterisk (*) - Hapus seluruh karakter asterisk
  text = text.replace(/\*/g, '');

  // 2. Bersihkan tag HTML berbahaya & event handler
  text = text.replace(UNSAFE_HTML_REGEX, '');
  text = text.replace(ON_EVENT_HANDLER_REGEX, '');
  text = text.replace(JAVASCRIPT_PROTOCOL_REGEX, '');

  // 3. Bersihkan jejak debugging internal
  for (const regex of INTERNAL_DEBUG_TRACES) {
    text = text.replace(regex, '');
  }

  // 4. Bersihkan potensi kebocoran kontak sensitif
  text = text.replace(LEAKED_PHONE_REGEX, '[KONTAK_DIRAHSIAKAN]');

  // 5. Normalisasi newline berlebih (maksimal 2 baris kosong berturut-turut)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Membersihkan objek AIAction secara menyeluruh.
 */
export function sanitizeAction(action: AIAction): AIAction {
  const sanitizedLabel = sanitizeOutputText(action.label);
  const sanitizedPrompt = action.promptText ? sanitizeOutputText(action.promptText) : undefined;

  let sanitizedHref = action.href;
  if (sanitizedHref) {
    sanitizedHref = sanitizedHref.replace(JAVASCRIPT_PROTOCOL_REGEX, '').replace(/\*/g, '').trim();
    // Validasi whitelist rute internal aplikasi Khoirunnada
    if (!sanitizedHref.startsWith('/app/') && !sanitizedHref.startsWith('#')) {
      sanitizedHref = undefined;
    }
  }

  return {
    label: sanitizedLabel || 'Tindakan',
    href: sanitizedHref,
    promptText: sanitizedPrompt,
  };
}

/**
 * Sanitasi lengkap untuk seluruh objek AIResponse.
 */
export function sanitizeResponse(response: AIResponse): AIResponse {
  const text = sanitizeOutputText(response.text);

  let actions: AIAction[] | undefined;
  if (Array.isArray(response.actions)) {
    actions = response.actions
      .map(sanitizeAction)
      .filter((a) => a.label && (a.href || a.promptText));
  }

  return {
    text,
    actions: actions && actions.length > 0 ? actions : undefined,
    isDeepSearch: Boolean(response.isDeepSearch),
  };
}
