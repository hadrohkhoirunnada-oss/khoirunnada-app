import assert from 'node:assert/strict';
import test from 'node:test';

import { planQuery } from '../lib/ai/query-planner.ts';
import { executeReasoning, executePlan, MAX_REASONING_OPERATIONS } from '../lib/ai/reasoning-engine.ts';
import { extractTemporalWindow, getDayBounds, DEFAULT_TIMEZONE } from '../lib/ai/temporal-reasoner.ts';
import { createMemory, recordTurn } from '../lib/ai/contextual-memory.ts';
import { processKhoirunnadaAI } from '../lib/ai-engine.ts';

// Mock Context untuk Pengujian
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
    id: 'qos-no-trans',
    title: 'Qosidah Tanpa Terjemahan',
    arabic_text: 'يا نبي سلام عليك',
    latin_text: 'Ya Nabi Salam Alaika',
    translation: '', // Sengaja kosong untuk uji missing attribute
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
    customer_phone: '081234567899', // Data sensitif yang dilarang bocor
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
  {
    id: 'job-3',
    booking_id: 'bk-secret-103',
    title: 'Haflah Akhirussanah Dibatalkan',
    event_type: 'Wisuda',
    customer_name: 'Panitia',
    customer_phone: '087777777777',
    event_date: '2026-10-20T08:00:00Z',
    gather_time: '07:30',
    start_time: '08:00',
    location: 'Pesantren',
    maps_url: '',
    status: 'cancelled', // Dibatalkan!
    created_by: 'usr-admin',
    created_at: '2026-10-03',
  },
];

const mockUser = {
  id: 'usr-test-1',
  auth_user_id: 'auth-1',
  name: 'Dzarin',
  email: 'dzarin@khoirunnada.com',
  avatar_url: '',
  status: 'active',
  is_member: true,
  is_treasurer: false,
  is_admin: true,
  created_at: '2026-01-01',
};

const referenceDate = new Date('2026-10-10T00:00:00Z');

const baseContext = {
  currentUser: mockUser,
  qosidahs: mockQosidahs,
  jobs: mockJobs,
  favorites: ['qos-busyro', 'qos-mughrom'],
};

// ==========================================
// 26 UNIT TESTS WAJIB FASE 4
// ==========================================

test('1. Intent tunggal (Single intent query planning)', () => {
  const plan = planQuery('Carikan qosidah Busyro Lana', baseContext, { referenceDate });
  assert.equal(plan.intent, 'find_qosidah');
  assert.equal(plan.operations.length, 1);
  assert.equal(plan.operations[0].type, 'FIND_QOSIDAH');
  assert.equal(plan.isMultiStep, false);
});

test('2. Beberapa intent dalam satu kalimat (Multi-step planning)', () => {
  const plan = planQuery('Carikan qosidah Busyro Lana dan tampilkan artinya', baseContext, { referenceDate });
  assert.equal(plan.intent, 'find_and_translate_qosidah');
  assert.equal(plan.operations.length, 2);
  assert.equal(plan.operations[0].type, 'FIND_QOSIDAH');
  assert.equal(plan.operations[1].type, 'GET_ATTRIBUTE');
  assert.equal(plan.operations[1].dependsOn, 'op-find-qos');
  assert.equal(plan.isMultiStep, true);
});

test('3. Pencarian qosidah dan pengambilan terjemahan (Execution)', () => {
  const res = executeReasoning('Carikan qosidah Busyro Lana dan tampilkan artinya', baseContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.data.attributeName, 'translation');
  assert.equal(res.data.attributeValue, 'Kebahagiaan milik kita telah tiba');
  assert.equal(res.targetEntity?.id, 'qos-busyro');
});

test('4. Pencarian favorit dan penghitungan jumlah', () => {
  const res = executeReasoning('Berapa jumlah qosidah favorit saya?', baseContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.data.count, 2);
  assert.equal(res.operationsExecuted.length, 2);
});

test('5. Pencarian jadwal terdekat', () => {
  const res = executeReasoning('Ada jadwal job terdekat apa saja?', baseContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  assert.ok(res.data.nearestJob !== null);
  assert.equal(res.data.nearestJob?.id, 'job-1'); // 25 Okt adalah yang paling dekat
  assert.equal(res.data.nearestJob?.title, 'Walimatul Ursy Ahmad & Fatimah');
});

test('6. Filter jadwal temporal (Bulan depan)', () => {
  const res = executeReasoning('Jadwal job bulan depan', baseContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  // Referensi Oktober -> Bulan depan adalah November -> job-2 (10 Nov 2026)
  assert.ok(res.data.jobs && res.data.jobs.length >= 1);
  assert.equal(res.data.jobs[0].id, 'job-2');
});

test('7. Pengurutan jadwal mendatang secara kronologis', () => {
  const res = executeReasoning('Jadwal job apa saja yang akan datang', baseContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  const jobs = res.data.jobs || [];
  assert.equal(jobs.length, 2);
  // job-1 (25 Okt) harus mendahului job-2 (10 Nov)
  assert.equal(jobs[0].id, 'job-1');
  assert.equal(jobs[1].id, 'job-2');
});

test('8. COUNT pada data kosong', () => {
  const emptyContext = { ...baseContext, favorites: [] };
  const res = executeReasoning('Berapa jumlah qosidah favorit saya?', emptyContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.data.count, 0);
});

test('9. GET_ATTRIBUTE pada data yang tidak tersedia (Atribut kosong)', () => {
  const res = executeReasoning('Carikan Qosidah Tanpa Terjemahan dan tampilkan artinya', baseContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.data.attributeValue, ''); // Tidak throw, menghasilkan empty string
  assert.ok(res.summary.includes('belum tersedia'));
});

test('10. Pertanyaan multi-turn contextual reasoning', () => {
  // Sesi: pengguna sebelumnya mencari Busyro Lana
  let mem = createMemory('sess-fase4', 'usr-test-1', referenceDate.getTime());
  mem = recordTurn(mem, 'Carikan Busyro Lana', 'search_qosidah', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  }, { currentTime: referenceDate.getTime() });

  const ctxWithMemory = { ...baseContext, memory: mem };
  const res = executeReasoning('Apa artinya?', ctxWithMemory, { referenceDate });

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.targetEntity?.id, 'qos-busyro');
  assert.equal(res.data.attributeValue, 'Kebahagiaan milik kita telah tiba');
});

test('11. Konteks kedaluwarsa (Expired Context)', () => {
  const oldTime = referenceDate.getTime() - (20 * 60 * 1000); // 20 menit lalu
  const mem = createMemory('sess-old', 'usr-test-1', oldTime);
  mem.updatedAt = oldTime;
  mem.lastEntity = { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' };
  mem.turns.push({ id: 't-1', userQuery: 'Busyro', timestamp: oldTime });

  const ctxExpired = { ...baseContext, memory: mem };
  const res = executeReasoning('Apa artinya?', ctxExpired, { referenceDate });

  assert.equal(res.status, 'NEED_CONTEXT');
});

test('12. Koreksi topik ("bukan yang tadi, yang satunya")', () => {
  let mem = createMemory('sess-corr', 'usr-test-1', referenceDate.getTime());
  mem = recordTurn(mem, 'Busyro Lana', 'search', { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' }, { currentTime: referenceDate.getTime() });
  mem = recordTurn(mem, 'Mughrom', 'search', { type: 'qosidah', id: 'qos-mughrom', name: 'Mughrom' }, { currentTime: referenceDate.getTime() });

  const ctxWithMemory = { ...baseContext, memory: mem };
  const res = executeReasoning('Bukan yang tadi, yang satunya apa artinya?', ctxWithMemory, { referenceDate });

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.targetEntity?.id, 'qos-busyro');
  assert.equal(res.data.attributeValue, 'Kebahagiaan milik kita telah tiba');
});

test('13. Entitas ambigu (Koreksi tanpa entitas kedua)', () => {
  let mem = createMemory('sess-single', 'usr-test-1', referenceDate.getTime());
  mem = recordTurn(mem, 'Busyro Lana', 'search', { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' }, { currentTime: referenceDate.getTime() });

  const ctxWithMemory = { ...baseContext, memory: mem };
  const res = executeReasoning('Bukan yang tadi, yang satunya', ctxWithMemory, { referenceDate });

  assert.equal(res.status, 'AMBIGUOUS');
});

test('14. Entitas tidak ditemukan (Telah dihapus dari context)', () => {
  let mem = createMemory('sess-del', 'usr-test-1', referenceDate.getTime());
  mem = recordTurn(mem, 'Lagu Hilang', 'search', { type: 'qosidah', id: 'qos-deleted-404', name: 'Lagu Hilang' }, { currentTime: referenceDate.getTime() });

  const ctxWithMemory = { ...baseContext, memory: mem };
  const res = executeReasoning('Apa artinya?', ctxWithMemory, { referenceDate });

  assert.equal(res.status, 'DATA_NOT_FOUND');
});

test('15. Query tidak didukung (Out of Scope)', () => {
  const res = executeReasoning('Berapa kurs dollar hari ini?', baseContext, { referenceDate });
  assert.equal(res.status, 'OUT_OF_SCOPE');
  assert.equal(res.plan.isSupported, false);
});

test('16. Data privat tidak dapat diakses (Customer phone tidak bocor)', () => {
  const res = executeReasoning('Ada jadwal job apa saja?', baseContext, { referenceDate });
  assert.equal(res.status, 'SUCCESS');
  const serialized = JSON.stringify(res);
  assert.equal(serialized.includes('081234567899'), false, 'Nomor HP privat dilarang bocor!');
  assert.equal(serialized.includes('bk-secret'), false, 'Booking ID internal dilarang bocor!');
});

test('17. Validasi input aneh / karakter khusus', () => {
  const weirdQueries = ['???@@@###', '     \n\t   ', 'dan dan dan'];
  for (const w of weirdQueries) {
    const res = executeReasoning(w, baseContext, { referenceDate });
    assert.ok(res.status);
    assert.ok(Array.isArray(res.operationsExecuted));
  }
});

test('18. Rencana operasi tidak valid ditangani secara aman', () => {
  const dummyPlan = {
    query: 'test',
    intent: 'test',
    operations: [{ id: 'op-invalid', type: 'INVALID_TYPE', params: {}, explanation: 'test' }],
    isMultiStep: false,
    isFollowUp: false,
    isSupported: true,
  };
  const res = executePlan(dummyPlan, baseContext, { referenceDate });
  assert.ok(res);
  assert.equal(res.operationsExecuted.length, 1);
});

test('19. Tanggal batas hari (Day bounds)', () => {
  const bounds = getDayBounds(referenceDate, 0, DEFAULT_TIMEZONE);
  assert.ok(bounds.start.getTime() < bounds.end.getTime());
  assert.equal(bounds.end.getTime() - bounds.start.getTime(), 24 * 60 * 60 * 1000 - 1);
});

test('20. Tanggal lintas tahun (Desember ke Januari)', () => {
  const decDate = new Date('2026-12-15T00:00:00Z');
  const window = extractTemporalWindow('Jadwal bulan depan', { referenceDate: decDate, timeZone: DEFAULT_TIMEZONE });
  assert.ok(window);
  assert.equal(window.type, 'next_month');
  assert.equal(window.startDate.getUTCFullYear(), 2027);
  assert.equal(window.startDate.getUTCMonth(), 0); // Januari 2027
});

test('21. Perhitungan timezone eksplisit', () => {
  const windowJakarta = extractTemporalWindow('Jadwal hari ini', { referenceDate, timeZone: 'Asia/Jakarta' });
  const windowMakassar = extractTemporalWindow('Jadwal hari ini', { referenceDate, timeZone: 'Asia/Makassar' });
  assert.equal(windowJakarta?.timeZone, 'Asia/Jakarta');
  assert.equal(windowMakassar?.timeZone, 'Asia/Makassar');
});

test('22. Status agenda cancelled tidak dianggap aktif', () => {
  const res = executeReasoning('Ada jadwal job apa saja?', baseContext, { referenceDate });
  const jobIds = (res.data.jobs || []).map((j) => j.id);
  assert.equal(jobIds.includes('job-3'), false, 'Job cancelled (job-3) tidak boleh masuk ke jadwal aktif!');
});

test('23. Batas operasi maksimum (Max 10 operations bounds check)', () => {
  const manyOps = [];
  for (let i = 0; i < 20; i++) {
    manyOps.push({ id: `op-${i}`, type: 'GET_UPCOMING_JOBS', params: {}, explanation: `op ${i}` });
  }
  const heavyPlan = {
    query: 'heavy',
    intent: 'heavy',
    operations: manyOps,
    isMultiStep: true,
    isFollowUp: false,
    isSupported: true,
  };
  const res = executePlan(heavyPlan, baseContext, { referenceDate });
  assert.equal(res.operationsExecuted.length, MAX_REASONING_OPERATIONS);
});

test('24. Immutability sumber data', () => {
  const qosLengthBefore = baseContext.qosidahs.length;
  const jobsLengthBefore = baseContext.jobs.length;
  const favsLengthBefore = baseContext.favorites.length;

  executeReasoning('Carikan Busyro Lana dan tampilkan artinya', baseContext, { referenceDate });
  executeReasoning('Berapa jumlah qosidah favorit saya?', baseContext, { referenceDate });

  assert.equal(baseContext.qosidahs.length, qosLengthBefore);
  assert.equal(baseContext.jobs.length, jobsLengthBefore);
  assert.equal(baseContext.favorites.length, favsLengthBefore);
});

test('25. Performa pada dataset besar (150+ data)', () => {
  const largeQos = [];
  for (let i = 1; i <= 150; i++) {
    largeQos.push({
      id: `qos-${i}`,
      title: `Judul Qosidah ${i}`,
      arabic_text: 'يا رسول الله',
      latin_text: `Syair lagu ${i}`,
      translation: `Terjemahan lagu ${i}`,
      tags: ['sholawat'],
      category_id: 'cat-1',
      is_active: true,
      sort_order: i,
      created_at: '2026-01-01',
    });
  }
  const largeContext = { ...baseContext, qosidahs: largeQos };

  const start = performance.now();
  const res = executeReasoning('Carikan Judul Qosidah 100 dan tampilkan artinya', largeContext, { referenceDate });
  const duration = performance.now() - start;

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.data.attributeValue, 'Terjemahan lagu 100');
  assert.ok(duration < 50, `Eksekusi reasoning 150 data harus < 50ms, aktual: ${duration.toFixed(2)}ms`);
});

test('26. Tidak ada regresi pada 13 intent lama', () => {
  const queries = [
    "Assalamu'alaikum",
    'Siapa Dzarin?',
    'Siapa yang membuat aplikasi ini?',
    'Bagaimana cara menggunakan aplikasi ini?',
    'Apa saja manfaat aplikasi ini?',
    'Bagaimana sejarah Khoirunnada?',
    'Bagaimana struktur organisasi Khoirunnada?',
    'Ada jadwal job apa saja?',
    'Lagu favorit saya',
    'Carikan saya qosidah Busyro Lana',
    'Koleksi qosidah hadroh',
    'Terima kasih banyak AI',
    'Pertanyaan di luar domain',
  ];

  for (const q of queries) {
    const res = processKhoirunnadaAI(q, baseContext);
    assert.ok(res.text && res.text.length > 0);
    assert.equal(res.text.includes('*'), false, `Teks tidak boleh mengandung * untuk query: ${q}`);
  }
});
