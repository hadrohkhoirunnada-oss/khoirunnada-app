/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - FACT VALIDATOR & ACTION SAFETY
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Lapisan audit faktual dan verifikasi aksi (FASE 6).
 * Memverifikasi keselarasan antara teks respons, tombol AIAction, dan data aktif
 * untuk mencegah halusinasi, tautan rusak (broken routes), atau kebocoran data privat.
 */

import type { AIContext, AIResponse, AIAction } from '../ai-engine.ts';
import type { ReasoningResult } from './plan-types.ts';
import type { FactAuditReport } from './confidence-types.ts';
import { isValidInternalRoute, isValidEntityId } from './action-composer.ts';
import { sanitizeOutputText } from './output-sanitizer.ts';

// Regex deteksi data privat yang dilarang muncul
const LEAKED_PHONE_REGEX = /(\+?62|08)[0-9\- ]{8,15}/g;
const LEAKED_BOOKING_REGEX = /\bbk-[a-zA-Z0-9_\-]+\b/gi;

/**
 * Memvalidasi apakah respon dan aksi yang disusun benar-benar didukung data yang sah.
 */
export function auditResponseFacts(
  response: AIResponse,
  result: ReasoningResult,
  context: AIContext
): {
  auditedResponse: AIResponse;
  report: FactAuditReport;
} {
  const discrepancies: string[] = [];
  const verifiedEntityRoutes: string[] = [];
  let privateFieldsRedacted = 0;

  let text = response.text;
  const lowerText = text.toLowerCase();

  // 1. Verifikasi Kebocoran Data Privat pada Teks
  if (LEAKED_PHONE_REGEX.test(text)) {
    discrepancies.push('Ditemukan nomor telepon dalam teks respons. Dilakukan redaksi otomatis.');
    text = text.replace(LEAKED_PHONE_REGEX, '[KONTAK_DIRAHSIAKAN]');
    privateFieldsRedacted++;
  }
  if (LEAKED_BOOKING_REGEX.test(text)) {
    discrepancies.push('Ditemukan booking ID internal dalam teks respons. Dihapus.');
    text = text.replace(LEAKED_BOOKING_REGEX, '');
    privateFieldsRedacted++;
  }

  // 2. Verifikasi Nama Qosidah terhadap Katalog Aktif
  if (result.status === 'SUCCESS' && result.data.qosidahs && result.data.qosidahs.length > 0) {
    const qosidahsInContext = context.qosidahs || [];
    const matchedTitle = result.data.qosidahs[0].title;
    const existsInStore = qosidahsInContext.some(
      (q) => q.id === result.data.qosidahs![0].id || q.title.toLowerCase() === matchedTitle.toLowerCase()
    );

    if (!existsInStore) {
      discrepancies.push(`Qosidah "${matchedTitle}" tidak ditemukan dalam katalog aktif useAppStore.`);
    }
  }

  // 3. Verifikasi Konsistensi Nilai Terjemahan (Cegah Fabrikasi)
  if (result.status === 'SUCCESS' && result.data.attributeName === 'translation') {
    const activeQos = result.data.qosidahs?.[0];
    if (activeQos && !activeQos.translation && lowerText.includes('terjemahan resmi')) {
      discrepancies.push('Teks memuat klaim terjemahan resmi padahal field translation kosong di database.');
    }
  }

  // 4. Verifikasi Keabsahan AIAction (Hanya izinkan rute ke entitas yang benar-benar ada)
  const auditedActions: AIAction[] = [];
  const qosidahIdsSet = new Set((context.qosidahs || []).map((q) => q.id));

  for (const action of response.actions || []) {
    let keepAction = true;

    // Sensor label dan promptText dari nomor privat
    const cleanLabel = sanitizeOutputText(action.label).replace(LEAKED_PHONE_REGEX, '');
    const cleanPrompt = action.promptText ? sanitizeOutputText(action.promptText).replace(LEAKED_PHONE_REGEX, '') : undefined;

    if (action.href) {
      // Periksa validitas rute internal
      if (!isValidInternalRoute(action.href)) {
        discrepancies.push(`Aksi "${action.label}" mengarah ke rute tidak sah: ${action.href}`);
        keepAction = false;
      }

      // Jika rute adalah /app/qosidah/:id, pastikan ID terdaftar di store
      const qosMatch = action.href.match(/^\/app\/qosidah\/([a-zA-Z0-9_\-]+)$/);
      if (qosMatch) {
        const targetId = qosMatch[1];
        if (!qosidahIdsSet.has(targetId) && !isValidEntityId(targetId)) {
          discrepancies.push(`Aksi mengarah ke ID qosidah yang tidak ada di store: ${targetId}`);
          keepAction = false;
        } else {
          verifiedEntityRoutes.push(action.href);
        }
      } else {
        verifiedEntityRoutes.push(action.href);
      }
    }

    if (keepAction && cleanLabel) {
      auditedActions.push({
        label: cleanLabel,
        href: action.href,
        promptText: cleanPrompt,
      });
    }
  }

  const isFactuallyAccurate = discrepancies.length === 0;

  return {
    auditedResponse: {
      text: sanitizeOutputText(text),
      actions: auditedActions.length > 0 ? auditedActions : undefined,
      isDeepSearch: response.isDeepSearch,
    },
    report: {
      isFactuallyAccurate,
      verifiedEntityRoutes,
      discrepancies,
      privateFieldsRedacted,
    },
  };
}
