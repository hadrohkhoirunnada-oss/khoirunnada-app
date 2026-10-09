import assert from 'node:assert/strict';
import test from 'node:test';

import { processKhoirunnadaAI } from '../lib/ai-engine.ts';
import {
  processWithSecurityGate,
  safeProcessKhoirunnadaAI,
} from '../lib/ai/security-gateway.ts';
import {
  createMemorySession,
  isMemorySessionValid,
  recordSessionTurn,
  resetMemorySession,
} from '../lib/ai/memory-adapter.ts';

// Mock Data Terstandarisasi Hadroh Khoirunnada
const mockQosidahs = [
  {
    id: 'qos-busyro',
    title: 'Busyro Lana',
    alternate_title: 'Basyiro Lana',
    arabic_text: 'بُشْرَى لَنَا نِلْنَا المُنَى',
    latin_text: 'Busyro lana nilnal muna\nZalal ana wa fal hana',
    translation: 'Kebahagiaan milik kita telah tiba',
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['busyro', 'sholawat'],
    is_active: true,
    sort_order: 1,
    created_at: '2026-01-01',
  },
  {
    id: 'qos-mughrom',
    title: 'Mughrom',
    alternate_title: 'Mughrom Qolbi',
    arabic_text: 'مُغْرَمْ قَلْبِي بِحُبِّكْ',
    latin_text: 'Mughrom qolbi bihubbika ya Rosulalloh',
    translation: 'Tergila-gila hatiku oleh cintamu wahai Rasulullah',
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['mughrom', 'cinta'],
    is_active: true,
    sort_order: 2,
    created_at: '2026-01-01',
  },
  {
    id: 'qos-padhang-bulan',
    title: 'Padhang Bulan',
    arabic_text: 'يا رسول الله سلام عليك',
    latin_text: 'Yo pra kanca dolanan ing njaba\nPadhang bulan padhange kaya rina',
    translation: 'Ayo kawan bermain di luar, terang bulan seperti siang hari',
    category_id: 'cat-jawa',
    category_name: 'Qosidah Jawa',
    tags: ['jawa', 'nasihat', 'sholawat'],
    is_active: true,
    sort_order: 3,
    created_at: '2026-01-01',
  },
];

const mockJobs = [
  {
    id: 'job-1',
    title: 'Peringatan Maulid Nabi Masjid Agung',
    event_date: '2026-10-15T19:30:00Z',
    location: 'Masjid Agung Al-Falah',
    status: 'confirmed',
    notes: 'Seragam koko putih kopyah hitam',
    customer_phone: '081234567890',
    booking_id: 'BK-SECRET-991',
    assigned_members: ['usr-1', 'usr-2'],
  },
  {
    id: 'job-2',
    title: 'Walimatul Ursy Khadijah',
    event_date: '2026-10-25T09:00:00Z',
    location: 'Gedung Serbaguna Morowali',
    status: 'pending',
    notes: 'Keluarga mempelai putri',
    customer_phone: '089876543210',
    booking_id: 'BK-SECRET-992',
    assigned_members: ['usr-1'],
  },
  {
    id: 'job-cancelled',
    title: 'Latihan Rutin Malam Jumat (Batal)',
    event_date: '2026-10-12T20:00:00Z',
    location: 'Basecamp Hadroh',
    status: 'cancelled',
    notes: 'Dibatalkan karena renovasi',
    customer_phone: '081111111111',
    booking_id: 'BK-SECRET-993',
  },
];

const mockUser = {
  id: 'usr-1',
  name: 'Ahmad Sholihin',
  role: 'member',
  avatar_url: null,
};

// ==========================================
// PENGUJIAN INTEGRASI FASE 7
// ==========================================

test('1. Feature Flag Controlled Integration Adapter - Default OFF mengeksekusi Legacy Engine', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: ['qos-busyro'],
  };

  // Tanpa flag enableV2Engine -> wajib legacy engine
  const res = processKhoirunnadaAI('assalamu alaikum', context);
  assert.ok(res.text.includes('Akhi Ahmad Sholihin'));
  assert.ok(res.text.includes('Saya Khoirunnada AI'));
  assert.ok(Array.isArray(res.actions));
  assert.strictEqual(res.text.includes('*'), false);
});

test('2. Feature Flag Controlled Integration Adapter - ON via options mengaktifkan Brain Engine v2', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: ['qos-busyro'],
  };

  const res = processKhoirunnadaAI('carikan lirik Busyro Lana', context, {
    enableV2Engine: true,
  });

  assert.ok(res.text.toLowerCase().includes('busyro lana'));
  assert.ok(res.text.toLowerCase().includes('syair') || res.text.toLowerCase().includes('qosidah'));
  assert.ok(Array.isArray(res.actions));
  assert.strictEqual(res.text.includes('*'), false);
});

test('3. Feature Flag Controlled Integration Adapter - ON via context.enableV2Engine', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: ['qos-busyro'],
    enableV2Engine: true,
  };

  const res = processKhoirunnadaAI('ada jadwal job apa saja?', context);
  assert.ok(res.text.toLowerCase().includes('jadwal') || res.text.toLowerCase().includes('maulid'));
  assert.strictEqual(res.text.includes('*'), false);
});

test('4. End-to-End Pipeline - Alur lengkap User Input ke AIResponse dengan Deep Search profil Dzarin', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: [],
  };

  const res = processKhoirunnadaAI('siapa Muhammad Abi Dzarin?', context, {
    enableV2Engine: true,
  });

  assert.strictEqual(res.isDeepSearch, true);
  assert.ok(res.text.includes('Muhammad Abi Dzarin'));
  assert.ok(res.text.includes('Nexarin') || res.text.includes('Ketua Umum'));
  assert.strictEqual(res.text.includes('*'), false);
});

test('5. Security Gate Integration - Permintaan privat langsung ditolak v2 tanpa bypass ke legacy', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: [],
  };

  // Permintaan data sensitif (customer phone / booking id)
  const res = processKhoirunnadaAI('minta customer phone dan booking id klien', context, {
    enableV2Engine: true,
  });

  // Wajib menolak secara aman
  assert.ok(
    res.text.toLowerCase().includes('afwan') ||
    res.text.toLowerCase().includes('privat') ||
    res.text.toLowerCase().includes('izin') ||
    res.text.toLowerCase().includes('keamanan')
  );
  // Pastikan nomor rahasia sama sekali tidak tercantum
  assert.strictEqual(res.text.includes('081234567890'), false);
  assert.strictEqual(res.text.includes('BK-SECRET-991'), false);
  assert.strictEqual(res.text.includes('*'), false);
});

test('6. Memory Adapter - Pembuatan sesi baru dan validasi TTL inaktivitas', () => {
  const memory = createMemorySession('usr-1', 'session-101', 1000000);
  assert.strictEqual(memory.sessionId, 'session-101');
  assert.strictEqual(memory.userId, 'usr-1');

  // Valid sebelum TTL
  const isValidBefore = isMemorySessionValid(memory, 'usr-1', {
    ttlMs: 300000,
    currentTime: 1000000 + 100000,
  });
  assert.strictEqual(isValidBefore, true);

  // Tidak valid setelah TTL (misal lewat 10 menit)
  const isValidAfter = isMemorySessionValid(memory, 'usr-1', {
    ttlMs: 300000,
    currentTime: 1000000 + 400000,
  });
  assert.strictEqual(isValidAfter, false);
});

test('7. Memory Adapter - Isolasi pengguna dan pergantian akun (User ID Mismatch)', () => {
  const memory = createMemorySession('usr-1', 'session-101', 1000000);

  // Akses oleh user lain ditolak
  const isValidAnotherUser = isMemorySessionValid(memory, 'usr-stranger', {
    currentTime: 1000000 + 10000,
  });
  assert.strictEqual(isValidAnotherUser, false);
});

test('8. Memory Adapter - Multi-turn follow-up dengan perekaman aman giliran percakapan', () => {
  let memory = createMemorySession('usr-1', 'session-101');

  // Turn 1: Cari Busyro Lana
  memory = recordSessionTurn(
    memory,
    'carikan qosidah Busyro Lana',
    'search_qosidah',
    { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' }
  );

  assert.strictEqual(memory.lastEntity?.id, 'qos-busyro');
  assert.strictEqual(memory.lastEntity?.name, 'Busyro Lana');

  // Turn 2: Pertanyaan lanjutan follow-up dengan konteks memori
  const contextWithMem = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: [],
    memory,
  };

  const res = processKhoirunnadaAI('apa terjemahannya?', contextWithMem, {
    enableV2Engine: true,
  });

  assert.ok(res.text.toLowerCase().includes('kebahagiaan') || res.text.toLowerCase().includes('busyro'));
  assert.strictEqual(res.text.includes('*'), false);
});

test('9. Memory Adapter - Reset sesi saat chat dibersihkan', () => {
  const resetMem = resetMemorySession('usr-1', 2000000);
  assert.strictEqual(resetMem.turns.length, 0);
  assert.strictEqual(resetMem.lastIntent, undefined);
  assert.strictEqual(resetMem.lastEntity, undefined);
  assert.strictEqual(resetMem.userId, 'usr-1');
});

test('10. Memory Adapter - Minimasi raw query dan sensor data sensitif', () => {
  const memory = createMemorySession('usr-1', 'session-101');
  const queryWithSensitive = 'hubungi saya di 081234567890 dan email saya test@example.com';

  const updatedMem = recordSessionTurn(memory, queryWithSensitive, 'general');
  const recordedQuery = updatedMem.turns[0].userQuery;

  // Nomor telepon dan email wajib tersensor dalam memori
  assert.strictEqual(recordedQuery.includes('081234567890'), false);
  assert.strictEqual(recordedQuery.includes('test@example.com'), false);
  assert.ok(recordedQuery.includes('[KONTAK_DIRAHSIAKAN]'));
  assert.ok(recordedQuery.includes('[EMAIL_DIRAHSIAKAN]'));
});

test('11. Timezone Consistency - Validasi tanggal UTC dan representasi jam panggung', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: [],
  };

  const refDate = new Date('2026-10-10T00:00:00Z');
  const res = processKhoirunnadaAI('jadwal job terdekat', context, {
    enableV2Engine: true,
    referenceDate: refDate,
    timeZone: 'Asia/Jakarta',
  });

  // Agenda terdekat adalah job-1 (15 Oktober 2026)
  assert.ok(res.text.includes('Maulid Nabi') || res.text.includes('15 Oktober 2026'));
  // Job cancelled tidak boleh muncul sebagai aktif
  assert.strictEqual(res.text.toLowerCase().includes('latihan rutin malam jumat (batal)'), false);
  assert.strictEqual(res.text.includes('*'), false);
});

test('12. AIAction Integrity - Semua tombol navigasi dan promptText valid', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: ['qos-busyro'],
  };

  const res = processKhoirunnadaAI('apa saja qosidah favorit saya?', context, {
    enableV2Engine: true,
  });

  assert.ok(Array.isArray(res.actions));
  for (const action of res.actions) {
    if (action.href) {
      assert.ok(action.href.startsWith('/app/'));
      assert.strictEqual(action.href.includes('..'), false);
    }
    assert.strictEqual(action.label.includes('*'), false);
    if (action.promptText) {
      assert.strictEqual(action.promptText.includes('*'), false);
    }
  }
});

test('13. Zero Asterisk Mutlak - Seluruh keluaran teks tidak mengandung karakter asterik (*)', () => {
  const queries = [
    'assalamu alaikum',
    'siapa dzarin',
    'sejarah hadroh khoirunnada',
    'bagaimana struktur organisasi?',
    'cara pakai aplikasi',
    'apa manfaat aplikasi ini?',
    'carikan qosidah Busyro Lana',
    'ada jadwal job terdekat?',
    'apa lagu favorit saya?',
    'terima kasih banyak',
    'pertanyaan sembarang di luar topik',
  ];

  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: ['qos-busyro'],
  };

  for (const q of queries) {
    // Uji dengan v2 ON
    const resV2 = processKhoirunnadaAI(q, context, { enableV2Engine: true });
    assert.strictEqual(resV2.text.includes('*'), false, `Asterisk ditemukan pada respon v2 untuk kueri: ${q}`);

    // Uji dengan legacy (default OFF)
    const resLegacy = processKhoirunnadaAI(q, context);
    assert.strictEqual(resLegacy.text.includes('*'), false, `Asterisk ditemukan pada respon legacy untuk kueri: ${q}`);
  }
});

test('14. Kompatibilitas 13 Intent Lama Tanpa Regresi Saat V2 Disabled', () => {
  const context = {
    currentUser: mockUser,
    qosidahs: mockQosidahs,
    jobs: mockJobs,
    favorites: ['qos-busyro'],
  };

  const intentsTestCases = [
    'halo selamat pagi',
    'siapa dzarin',
    'siapa pembuat aplikasi',
    'cara pakai aplikasi',
    'manfaat aplikasi',
    'sejarah khoirunnada',
    'struktur organisasi',
    'jadwal job',
    'lagu favorit',
    'carikan qosidah busyro',
    'apa itu qosidah',
    'terima kasih',
    'pertanyaan aneh di luar domain',
  ];

  for (const q of intentsTestCases) {
    const res = processKhoirunnadaAI(q, context);
    assert.ok(typeof res.text === 'string' && res.text.length > 0);
    assert.strictEqual(res.text.includes('*'), false);
  }
});
