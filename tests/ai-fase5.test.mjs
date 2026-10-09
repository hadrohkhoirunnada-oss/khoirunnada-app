import assert from 'node:assert/strict';
import test from 'node:test';

import { executeReasoning } from '../lib/ai/reasoning-engine.ts';
import {
  composeResponse,
  composeResponseWithMeta,
} from '../lib/ai/response-composer.ts';
import { detectResponseStyle } from '../lib/ai/response-style.ts';
import { extractFacts } from '../lib/ai/fact-extractor.ts';
import { sanitizeOutputText, sanitizeResponse } from '../lib/ai/output-sanitizer.ts';
import { checkResponseConsistency } from '../lib/ai/consistency-checker.ts';
import { isValidInternalRoute, isValidEntityId } from '../lib/ai/action-composer.ts';
import { processKhoirunnadaAI } from '../lib/ai-engine.ts';

// Mock Context untuk Pengujian FASE 5
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
    latin_text: 'Mughrom qolbi bihubbika ya Rosulalloh\nAntal habibul a\'zhom',
    translation: 'Tergila-gila hatiku oleh cintamu wahai Rasulullah',
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['mughrom', 'cinta'],
    is_active: true,
    sort_order: 2,
    created_at: '2026-01-01',
  },
  {
    id: 'qos-no-trans',
    title: 'Qosidah Tanpa Terjemahan',
    arabic_text: 'يا نبي سلام عليك',
    latin_text: 'Ya Nabi Salam Alaika',
    translation: '', // Kosong untuk tes translation kosong
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['sholawat'],
    is_active: true,
    sort_order: 3,
    created_at: '2026-01-01',
  },
];

const mockJobs = [
  {
    id: 'job-1',
    booking_id: 'bk-secret-101',
    title: 'Walimatul Ursy Ahmad & Fatimah',
    event_type: 'Pernikahan',
    customer_name: 'H. Sulaiman',
    customer_phone: '081234567899', // Data privat
    event_date: '2026-10-25T19:30:00Z',
    gather_time: '18:30',
    start_time: '19:30',
    location: 'Gedung Al-Barokah',
    maps_url: '',
    status: 'upcoming',
    created_by: 'usr-admin',
    created_at: '2026-10-01',
  },
  {
    id: 'job-2',
    booking_id: 'bk-secret-102',
    title: 'Maulid Akbar Majelis Ta\'lim',
    event_type: 'Pengajian',
    customer_name: 'Ust. Abdullah',
    customer_phone: '089876543210',
    event_date: '2026-11-10T20:00:00Z',
    gather_time: '19:00',
    start_time: '20:00',
    location: 'Masjid Agung Al-Ikhlas',
    maps_url: '',
    status: 'upcoming',
    created_by: 'usr-admin',
    created_at: '2026-10-02',
  },
];

const referenceDate = new Date('2026-10-10T12:00:00Z');
const mockContext = {
  qosidahs: mockQosidahs,
  jobs: mockJobs,
  favorites: ['qos-busyro', 'qos-mughrom'],
  currentUser: {
    id: 'usr-1',
    name: 'Dzarin',
    role: 'admin',
    username: 'dzarin',
    created_at: '2026-01-01',
  },
};

test('1. Jawaban sukses qosidah', () => {
  const reasoning = executeReasoning('Carikan qosidah Busyro Lana', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('Busyro Lana'));
  assert.ok(response.actions && response.actions.length > 0);
  assert.equal(response.actions[0].href, '/app/qosidah/qos-busyro');
  assert.ok(!response.text.includes('*'));
});

test('2. Jawaban terjemahan', () => {
  const reasoning = executeReasoning('Carikan qosidah Busyro Lana dan tampilkan terjemahannya', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('Kebahagiaan milik kita telah tiba'));
  assert.ok(!response.text.includes('*'));
});

test('3. Jawaban lirik sesuai data', () => {
  const reasoning = executeReasoning('Carikan lirik Busyro Lana', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('Busyro'));
  assert.ok(!response.text.includes('*'));
});

test('4. Jawaban jumlah favorit', () => {
  const reasoning = executeReasoning('Berapa jumlah qosidah favorit saya?', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('2'));
  assert.ok(response.actions?.some((a) => a.href === '/app/profile/favorites'));
  assert.ok(!response.text.includes('*'));
});

test('5. Jawaban jadwal terdekat', () => {
  const reasoning = executeReasoning('Kapan jadwal terdekat?', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('Walimatul Ursy Ahmad & Fatimah'));
  assert.ok(response.text.includes('Gedung Al-Barokah'));
  assert.ok(response.actions?.some((a) => a.href === '/app/jobs'));
  assert.ok(!response.text.includes('*'));
});

test('6. Jawaban daftar jadwal', () => {
  const reasoning = executeReasoning('Ada jadwal apa saja bulan depan?', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('Maulid Akbar Majelis Ta\'lim'));
  assert.ok(response.actions?.some((a) => a.href === '/app/jobs'));
  assert.ok(!response.text.includes('*'));
});

test('7. Gaya concise', () => {
  const reasoning = executeReasoning('Carikan Busyro Lana', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { style: 'concise', referenceDate });

  // Gaya concise harus padat dan tanpa salam pembuka panjang
  assert.ok(!response.text.startsWith('Alhamdulillah'));
  assert.ok(response.text.includes('Busyro Lana'));
  assert.ok(response.text.length < 150);
});

test('8. Gaya informative', () => {
  const reasoning = executeReasoning('Carikan Busyro Lana', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { style: 'informative', referenceDate });

  assert.ok(response.text.includes('Busyro Lana'));
  assert.ok(response.text.length > 50);
});

test('9. Gaya detailed', () => {
  const reasoning = executeReasoning('Jelaskan secara detail qosidah Busyro Lana', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('Judul: Busyro Lana') || response.text.includes('Kategori:'));
  assert.ok(response.text.includes('بُشْرَى لَنَا نِلْنَا المُنَى'));
});

test('10. Variasi kalimat tanpa perubahan fakta', () => {
  const reasoning = executeReasoning('Carikan Busyro Lana', mockContext, { referenceDate });
  const res1 = composeResponse(reasoning, mockContext, { seed: 10, referenceDate });
  const res2 = composeResponse(reasoning, mockContext, { seed: 25, referenceDate });

  // Fakta wajib sama persis
  assert.ok(res1.text.includes('Busyro Lana'));
  assert.ok(res2.text.includes('Busyro Lana'));
  assert.ok(!res1.text.includes('*'));
  assert.ok(!res2.text.includes('*'));
});

test('11. Data kosong', () => {
  const emptyContext = { qosidahs: [], jobs: [], favorites: [] };
  const reasoning = executeReasoning('Ada jadwal apa saja?', emptyContext, { referenceDate });
  const response = composeResponse(reasoning, emptyContext, { referenceDate });

  assert.ok(response.text.includes('belum ada jadwal job'));
  assert.ok(!response.text.includes('*'));
});

test('12. Terjemahan kosong', () => {
  const reasoning = executeReasoning('Carikan qosidah Qosidah Tanpa Terjemahan dan tampilkan artinya', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('belum tersedia') || response.text.includes('kosong'));
  assert.ok(!response.text.includes('*'));
});

test('13. Multiple search results', () => {
  // Query yang cocok dengan beberapa qosidah
  const reasoning = executeReasoning('Carikan qosidah sholawat', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.ok(response.text.includes('Busyro Lana') || response.text.includes('ditemukan'));
  assert.ok(!response.text.includes('*'));
});

test('14. Status AMBIGUOUS', () => {
  const ambiguousResult = {
    status: 'AMBIGUOUS',
    intent: 'qosidah_search',
    plan: { query: 'cari', intent: 'qosidah_search', operations: [], isMultiStep: false, isFollowUp: false, isSupported: true },
    operationsExecuted: [],
    data: {},
    evidence: [],
    isAmbiguous: true,
    ambiguousCandidates: [
      { id: 'qos-busyro', name: 'Busyro Lana', type: 'qosidah' },
      { id: 'qos-mughrom', name: 'Mughrom', type: 'qosidah' },
    ],
    summary: 'Rujukan ambigu',
  };

  const response = composeResponse(ambiguousResult, mockContext);
  assert.ok(response.text.includes('Busyro Lana'));
  assert.ok(response.text.includes('Mughrom'));
  assert.ok(response.actions?.some((a) => a.promptText?.includes('Busyro Lana')));
});

test('15. Status DATA_NOT_FOUND', () => {
  const notFoundResult = {
    status: 'DATA_NOT_FOUND',
    intent: 'qosidah_search',
    plan: { query: 'qosidah antariksa', intent: 'qosidah_search', operations: [], isMultiStep: false, isFollowUp: false, isSupported: true },
    operationsExecuted: [],
    data: { qosidahs: [] },
    evidence: [],
    failureReason: 'Tidak ditemukan qosidah untuk kueri antariksa.',
    summary: 'Data tidak ditemukan',
  };

  const response = composeResponse(notFoundResult, mockContext);
  assert.ok(response.text.includes('Tidak ditemukan') || response.text.includes('belum ditemukan'));
  assert.ok(!response.text.includes('*'));
});

test('16. Status NEED_CONTEXT', () => {
  const needContextResult = {
    status: 'NEED_CONTEXT',
    intent: 'follow_up',
    plan: { query: 'apa artinya?', intent: 'follow_up', operations: [], isMultiStep: false, isFollowUp: true, isSupported: true },
    operationsExecuted: [],
    data: {},
    evidence: [],
    failureReason: 'Membutuhkan konteks percakapan sebelumnya.',
    summary: 'Butuh konteks',
  };

  const response = composeResponse(needContextResult, mockContext);
  assert.ok(response.text.includes('konteks percakapan') || response.text.includes('rujukan qosidah'));
});

test('17. Status OUT_OF_SCOPE', () => {
  const outOfScopeResult = {
    status: 'OUT_OF_SCOPE',
    intent: 'out_of_scope',
    plan: { query: 'berapa harga saham tesla?', intent: 'out_of_scope', operations: [], isMultiStep: false, isFollowUp: false, isSupported: false },
    operationsExecuted: [],
    data: {},
    evidence: [],
    failureReason: 'Pertanyaan di luar domain.',
    summary: 'Di luar lingkup',
  };

  const response = composeResponse(outOfScopeResult, mockContext);
  assert.ok(response.text.includes('luar lingkup') || response.text.includes('Hadroh Khoirunnada'));
});

test('18. Status UNAUTHORIZED', () => {
  const unauthResult = {
    status: 'UNAUTHORIZED',
    intent: 'admin_private',
    plan: { query: 'tampilkan password admin', intent: 'admin_private', operations: [], isMultiStep: false, isFollowUp: false, isSupported: true },
    operationsExecuted: [],
    data: {},
    evidence: [],
    failureReason: 'Akses data privat.',
    summary: 'Privat',
  };

  const response = composeResponse(unauthResult, mockContext);
  assert.ok(response.text.includes('privat') || response.text.includes('tidak dapat diakses'));
});

test('19. Tidak ada asterisk', () => {
  const textWithAsterisks = 'Berikut **lirik** *qosidah*: *Busyro Lana*';
  const sanitized = sanitizeOutputText(textWithAsterisks);
  assert.equal(sanitized.includes('*'), false);
  assert.equal(sanitized, 'Berikut lirik qosidah: Busyro Lana');
});

test('20. Tidak ada HTML tidak aman', () => {
  const dangerousText = '<script>alert("hacked")</script>Qosidah <iframe src="evil.com"></iframe>Busyro';
  const sanitized = sanitizeOutputText(dangerousText);
  assert.ok(!sanitized.includes('<script>'));
  assert.ok(!sanitized.includes('<iframe>'));
  assert.ok(sanitized.includes('Qosidah Busyro') || sanitized.includes('Busyro'));
});

test('21. Tidak ada data privat', () => {
  const facts = extractFacts({
    status: 'SUCCESS',
    intent: 'job_search',
    plan: { query: 'jadwal', intent: 'job_search', operations: [], isMultiStep: false, isFollowUp: false, isSupported: true },
    operationsExecuted: [],
    data: { jobs: mockJobs },
    evidence: [],
    summary: 'Jadwal job',
  });

  // Nomor telepon 081234567899 tidak boleh muncul pada list jobs yang diekstrak
  const serialized = JSON.stringify(facts);
  assert.ok(!serialized.includes('081234567899'));
  assert.ok(!serialized.includes('089876543210'));
});

test('22. Action navigasi valid', () => {
  assert.equal(isValidInternalRoute('/app/qosidah'), true);
  assert.equal(isValidInternalRoute('/app/qosidah/qos-busyro'), true);
  assert.equal(isValidInternalRoute('/app/jobs'), true);
  assert.equal(isValidInternalRoute('/app/profile/favorites'), true);
  assert.equal(isValidInternalRoute('https://malicious-site.com'), false);
  assert.equal(isValidInternalRoute('/app/../../etc/passwd'), false);
});

test('23. Action promptText valid', () => {
  const reasoning = executeReasoning('Carikan Busyro Lana', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  const promptAction = response.actions?.find((a) => a.promptText);
  if (promptAction) {
    assert.ok(promptAction.promptText.length > 3);
    assert.ok(!promptAction.promptText.includes('*'));
  }
});

test('24. Entity ID tidak ditemukan', () => {
  assert.equal(isValidEntityId(''), false);
  assert.equal(isValidEntityId(undefined), false);
  assert.equal(isValidEntityId('../malicious'), false);
  assert.equal(isValidEntityId('qos-123'), true);
});

test('25. Tanggal dan angka konsisten', () => {
  const reasoning = executeReasoning('Berapa jumlah qosidah favorit saya?', mockContext, { referenceDate });
  const meta = composeResponseWithMeta(reasoning, mockContext, { referenceDate });

  assert.equal(meta.isConsistent, true);
  assert.ok(meta.response.text.includes('2'));
});

test('26. Bahasa Arab tidak rusak', () => {
  const arabicText = 'بُشْرَى لَنَا نِلْنَا المُنَى';
  const sanitized = sanitizeOutputText(arabicText);

  // Karakter Arab dan harakat lengkap harus tetap ada
  assert.equal(sanitized, arabicText);
});

test('27. Immutability sumber data', () => {
  const originalQosidahs = JSON.parse(JSON.stringify(mockQosidahs));
  const originalJobs = JSON.parse(JSON.stringify(mockJobs));

  const reasoning = executeReasoning('Carikan Busyro Lana', mockContext, { referenceDate });
  composeResponse(reasoning, mockContext, { referenceDate });

  assert.deepEqual(mockQosidahs, originalQosidahs);
  assert.deepEqual(mockJobs, originalJobs);
});

test('28. Tidak ada exception pada input aneh', () => {
  assert.doesNotThrow(() => {
    sanitizeResponse({ text: null, actions: undefined });
    sanitizeResponse({ text: undefined });
    composeResponse({ status: 'DATA_NOT_FOUND', intent: 'unknown', data: {} }, {});
    detectResponseStyle('');
  });
});

test('29. Kompatibilitas AIResponse', () => {
  const reasoning = executeReasoning('Carikan Busyro Lana', mockContext, { referenceDate });
  const response = composeResponse(reasoning, mockContext, { referenceDate });

  assert.equal(typeof response.text, 'string');
  assert.ok(Array.isArray(response.actions) || response.actions === undefined);
  assert.equal(typeof response.isDeepSearch, 'boolean');
});

test('30. Tidak ada regresi pada 13 intent lama', () => {
  const queries = [
    'assalamu\'alaikum',
    'siapa dzarin',
    'siapa yang membuat aplikasi ini',
    'cara pakai aplikasi',
    'apa manfaat aplikasi ini',
    'bagaimana sejarah khoirunnada',
    'siapa ketua khoirunnada',
    'jadwal job terdekat',
    'qosidah favorit',
    'carikan qosidah busyro',
    'apa saja qosidah arobiah',
    'terima kasih banyak',
    'pertanyaan sembarang di luar sistem xyz',
  ];

  queries.forEach((q) => {
    const legacyRes = processKhoirunnadaAI(q, mockContext);
    assert.ok(typeof legacyRes.text === 'string' && legacyRes.text.length > 0);
    assert.ok(!legacyRes.text.includes('*'), `Legacy intent "${q}" tidak boleh mengandung *`);
  });
});
