/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - DATA PRIVACY & ACCESS CONTROL SANITIZER
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Lapisan isolasi data dan pencegahan kebocoran informasi privat (FASE 6).
 * Memproyeksikan AIContext menjadi bentuk aman (Allowlist Projection) sebelum
 * disentuh oleh Knowledge Retriever, Reasoning Engine, atau Memory.
 */

import type { AIContext } from '../ai-engine.ts';
import type { SafeJob } from './retrieval-types.ts';
import type { Job, Profile } from '../types.ts';
import { toSafeJob } from './job-retriever.ts';

// Regex perlindungan data sensitif (telepon & email)
const SENSITIVE_PHONE_REGEX = /(\+?62|08)[0-9\- ]{8,15}/g;
const SENSITIVE_EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Sensor string dari nomor telepon atau email privat secara aman dan defensif.
 */
export function redactSensitiveText(text?: string | null | any): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(SENSITIVE_PHONE_REGEX, '[KONTAK_DIRAHSIAKAN]')
    .replace(SENSITIVE_EMAIL_REGEX, '[EMAIL_DIRAHSIAKAN]');
}

/**
 * Proyeksi objek Job mentah menjadi SafeJob yang aman bagi publik.
 * Membuang data privat: customer_phone, booking_id, created_by, notes internal.
 */
export function projectSafeJob(job: Job, referenceDate: Date = new Date()): SafeJob {
  const safe = toSafeJob(job, referenceDate);
  return {
    ...safe,
    title: redactSensitiveText(safe.title),
    location: redactSensitiveText(safe.location),
  };
}

/**
 * Proyeksi profil pengguna menjadi profil publik aman tanpa auth_user_id / email privat.
 */
export function projectSafeProfile(profile?: Profile): Profile | undefined {
  if (!profile) return undefined;

  return {
    id: profile.id,
    auth_user_id: '[PROTECTED_AUTH_ID]',
    name: redactSensitiveText(profile.name),
    email: '[PROTECTED_EMAIL]',
    avatar_url: profile.avatar_url,
    role_title: profile.role_title,
    status: profile.status,
    is_member: profile.is_member,
    is_treasurer: profile.is_treasurer,
    is_admin: profile.is_admin,
    created_at: profile.created_at,
  };
}

/**
 * Membersihkan AIContext secara menyeluruh sebelum diproses oleh sistem penalaran.
 */
export function sanitizeContextForAI(
  context: AIContext,
  referenceDate: Date = new Date()
): {
  sanitizedContext: AIContext;
  redactedCount: number;
} {
  let redactedCount = 0;

  // 1. Sanitasi Jobs (Buang nomor telepon, booking_id, dan customer_name jika ada)
  const safeJobs: SafeJob[] = (context.jobs || []).map((j: Job) => {
    if (j.customer_phone) redactedCount++;
    if (j.booking_id) redactedCount++;
    return projectSafeJob(j, referenceDate);
  });

  // 2. Sanitasi Profile Aktif
  const safeProfile = context.currentUser ? projectSafeProfile(context.currentUser) : undefined;
  if (context.currentUser?.email || context.currentUser?.phone) {
    redactedCount++;
  }

  // 3. Sanitasi Memori (Pastikan userQuery di turn masa lalu tidak memuat nomor privat)
  let safeMemory = context.memory;
  if (safeMemory && Array.isArray(safeMemory.turns)) {
    const cleanTurns = safeMemory.turns.map((t) => ({
      ...t,
      userQuery: typeof t.userQuery === 'string' ? redactSensitiveText(t.userQuery).slice(0, 100) : '',
    }));
    safeMemory = {
      ...safeMemory,
      turns: cleanTurns,
    };
  }

  const sanitizedContext: AIContext = {
    ...context,
    jobs: safeJobs as any,
    currentUser: safeProfile,
    memory: safeMemory,
  };

  return {
    sanitizedContext,
    redactedCount,
  };
}
