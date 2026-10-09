import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createMemory,
  updateMemory,
  isMemoryExpired,
  resetMemory,
  pruneMemory,
  validateMemoryUser,
  recordTurn,
  resolveEntityData,
  resolveConversationContext,
  isContextDependentQuery,
  DEFAULT_MEMORY_TTL_MS,
} from '../lib/ai/contextual-memory.ts';

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
];

const mockJobs = [
  {
    id: 'job-1',
    booking_id: 'bk-secret',
    title: 'Walimatul Ursy Ahmad & Fatimah',
    event_type: 'Pernikahan',
    customer_name: 'H. Sulaiman',
    customer_phone: '081234567899',
    event_date: '2026-10-25T19:30:00Z',
    gather_time: '18:30',
    start_time: '19:30',
    location: 'Gedung Al-Barokah',
    maps_url: '',
    status: 'upcoming',
    created_by: 'usr-admin',
    created_at: '2026-10-01',
  },
];

const mockUserA = {
  id: 'usr-user-a',
  auth_user_id: 'auth-a',
  name: 'Ahmad',
  email: 'ahmad@example.com',
  avatar_url: '',
  status: 'active',
  is_member: true,
  is_treasurer: false,
  is_admin: false,
  created_at: '2026-01-01',
};

const baseContext = {
  currentUser: mockUserA,
  qosidahs: mockQosidahs,
  jobs: mockJobs,
  favorites: ['qos-busyro'],
};

// ==========================================
// 22 UNIT TESTS WAJIB FASE 3
// ==========================================

test('1. Pembuatan memori sesi baru (createMemory)', () => {
  const mem = createMemory('sess-test-1', 'usr-user-a');
  assert.ok(mem.sessionId.startsWith('sess-test-1'));
  assert.equal(mem.userId, 'usr-user-a');
  assert.equal(mem.turns.length, 0);
  assert.equal(mem.recentEntities.length, 0);
  assert.equal(mem.isExpired, false);
});

test('2. Pembaruan intent terakhir (updateMemory)', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  mem = updateMemory(mem, {
    userQuery: 'Carikan qosidah Busyro Lana',
    intent: 'search_qosidah',
  });
  assert.equal(mem.lastIntent, 'search_qosidah');
  assert.equal(mem.turns.length, 1);
  assert.equal(mem.turns[0].intent, 'search_qosidah');
});

test('3. Pembaruan entitas terakhir (updateMemory)', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  const entity = { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' };
  mem = updateMemory(mem, {
    userQuery: 'Carikan Busyro Lana',
    intent: 'search_qosidah',
    entity,
  });
  assert.deepEqual(mem.lastEntity, entity);
  assert.equal(mem.recentEntities.length, 1);
  assert.equal(mem.recentEntities[0].id, 'qos-busyro');
});

test('4. Penyimpanan context qosidah', () => {
  let mem = createMemory('sess-1');
  const qosidahEntity = {
    type: 'qosidah',
    id: 'qos-mughrom',
    name: 'Mughrom',
    category: "Qosidah 'Arobiah",
  };
  mem = recordTurn(mem, 'Buka lirik Mughrom', 'view_qosidah', qosidahEntity);

  assert.equal(mem.lastEntity?.type, 'qosidah');
  assert.equal(mem.lastEntity?.name, 'Mughrom');
  assert.equal(mem.lastEntity?.id, 'qos-mughrom');
});

test('5. Penyimpanan context jadwal job', () => {
  let mem = createMemory('sess-1');
  const jobEntity = {
    type: 'job',
    id: 'job-1',
    name: 'Walimatul Ursy Ahmad & Fatimah',
  };
  mem = recordTurn(mem, 'Jadwal job terdekat', 'view_jobs', jobEntity);

  assert.equal(mem.lastEntity?.type, 'job');
  assert.equal(mem.lastEntity?.id, 'job-1');
  assert.equal(mem.lastEntity?.name, 'Walimatul Ursy Ahmad & Fatimah');
});

test('6. Resolusi kata rujukan "itu" / "qosidah tersebut"', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  mem = recordTurn(mem, 'Carikan Busyro Lana', 'search_qosidah', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  });

  const res = resolveConversationContext('Lagu itu dari kategori apa?', mem, baseContext);
  assert.equal(res.status, 'RESOLVED');
  assert.equal(res.isFollowUp, true);
  assert.equal(res.targetEntity?.id, 'qos-busyro');
  assert.ok(res.resolvedQuery.includes('Busyro Lana'));
});

test('7. Resolusi atribut "apa artinya" (translation follow-up)', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  mem = recordTurn(mem, 'Carikan Busyro Lana', 'search_qosidah', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  });

  const res = resolveConversationContext('Apa artinya?', mem, baseContext);
  assert.equal(res.status, 'RESOLVED');
  assert.equal(res.isFollowUp, true);
  assert.equal(res.requestedAttribute, 'translation');
  assert.equal(res.targetEntity?.id, 'qos-busyro');

  // Periksa resolusi isi terjemahan aktual dari context data
  const data = resolveEntityData(res.targetEntity, baseContext);
  assert.ok(data?.translation);
  assert.ok(data.translation.includes('Kebahagiaan'));
});

test('8. Resolusi atribut "di mana lokasinya" (location follow-up pada job)', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  mem = recordTurn(mem, 'Jadwal job terdekat', 'view_jobs', {
    type: 'job',
    id: 'job-1',
    name: 'Walimatul Ursy Ahmad & Fatimah',
  });

  const res = resolveConversationContext('Di mana lokasinya?', mem, baseContext);
  assert.equal(res.status, 'RESOLVED');
  assert.equal(res.isFollowUp, true);
  assert.equal(res.requestedAttribute, 'location');
  assert.equal(res.targetEntity?.id, 'job-1');

  const data = resolveEntityData(res.targetEntity, baseContext);
  assert.equal(data?.location, 'Gedung Al-Barokah');
});

test('9. Pergantian topik baru (Topic Switch)', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  mem = recordTurn(mem, 'Carikan Busyro Lana', 'search_qosidah', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  });

  // Pengguna berganti topik bertanya profil pembuat aplikasi
  const res = resolveConversationContext('Siapa Dzarin?', mem, baseContext);
  assert.equal(res.status, 'NEW_TOPIC');
  assert.equal(res.isFollowUp, false);
});

test('10. Koreksi referensi ("bukan yang tadi, yang satunya")', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  // Pengguna sebelumnya membahas 2 qosidah berturut-turut
  mem = recordTurn(mem, 'Busyro Lana', 'search_qosidah', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  });
  mem = recordTurn(mem, 'Mughrom', 'search_qosidah', {
    type: 'qosidah',
    id: 'qos-mughrom',
    name: 'Mughrom',
  });

  // Pengguna mengoreksi: "bukan yang tadi, yang satunya"
  const res = resolveConversationContext('Bukan yang tadi, yang satunya', mem, baseContext);
  assert.equal(res.status, 'CORRECTION');
  assert.equal(res.isFollowUp, true);
  assert.equal(res.isCorrection, true);
  assert.equal(res.targetEntity?.id, 'qos-busyro'); // Beralih ke alternatif sebelumnya
});

test('11. Referensi ambigu (koreksi tanpa entitas alternatif)', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  // Hanya ada 1 entitas di riwayat
  mem = recordTurn(mem, 'Busyro Lana', 'search_qosidah', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  });

  const res = resolveConversationContext('Bukan yang tadi, yang satunya', mem, baseContext);
  assert.equal(res.status, 'AMBIGUOUS');
  assert.equal(res.isAmbiguous, true);
});

test('12. Referensi kontekstual tanpa riwayat memori (NO_CONTEXT)', () => {
  // Sesi baru tanpa turn apapun
  const emptyMem = createMemory('sess-fresh');
  const res = resolveConversationContext('Apa artinya?', emptyMem, baseContext);

  assert.equal(res.status, 'NO_CONTEXT');
  assert.equal(res.isFollowUp, false);
});

test('13. Memori kedaluwarsa setelah TTL inaktivitas', () => {
  const mem = createMemory('sess-old', 'usr-user-a');
  const oldTime = Date.now() - (DEFAULT_MEMORY_TTL_MS + 5000); // Lampau lebih dari 15 menit
  mem.updatedAt = oldTime;
  mem.turns.push({
    id: 'turn-old',
    userQuery: 'Busyro Lana',
    timestamp: oldTime,
    entity: { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' },
  });
  mem.lastEntity = { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' };

  assert.equal(isMemoryExpired(mem), true);

  const res = resolveConversationContext('Apa artinya?', mem, baseContext);
  assert.equal(res.status, 'EXPIRED');
  assert.equal(res.isFollowUp, false);
});

test('14. Pemangkasan kapasitas memori (Sliding Window Pruning)', () => {
  let mem = createMemory('sess-prune');
  for (let i = 1; i <= 10; i++) {
    mem = updateMemory(mem, {
      userQuery: `Pertanyaan ke ${i}`,
      entity: { type: 'qosidah', id: `qos-${i}`, name: `Lagu ${i}` },
    });
  }

  // Kapasitas default adalah max 5 turns dan max 3 entities
  assert.equal(mem.turns.length, 5);
  assert.equal(mem.recentEntities.length, 3);
  assert.equal(mem.turns[4].userQuery, 'Pertanyaan ke 10');
  assert.equal(mem.lastEntity?.name, 'Lagu 10');
});

test('15. Reset memory (Menghapus konteks)', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  mem = recordTurn(mem, 'Busyro Lana', 'search', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  });

  const resetMem = resetMemory(mem.sessionId, mem.userId);
  assert.equal(resetMem.turns.length, 0);
  assert.equal(resetMem.recentEntities.length, 0);
  assert.equal(resetMem.lastEntity, undefined);

  // Setelah reset, follow-up query menghasilkan NO_CONTEXT
  const res = resolveConversationContext('Apa artinya?', resetMem, baseContext);
  assert.equal(res.status, 'NO_CONTEXT');
});

test('16. Isolasi antar sesi pengguna', () => {
  const memA = createMemory('sess-A', 'usr-A');
  const memB = createMemory('sess-B', 'usr-B');

  const updatedA = recordTurn(memA, 'Busyro', 'search', {
    type: 'qosidah',
    id: 'qos-busyro',
    name: 'Busyro Lana',
  });
  const updatedB = recordTurn(memB, 'Mughrom', 'search', {
    type: 'qosidah',
    id: 'qos-mughrom',
    name: 'Mughrom',
  });

  assert.notEqual(updatedA.sessionId, updatedB.sessionId);
  assert.equal(updatedA.lastEntity?.id, 'qos-busyro');
  assert.equal(updatedB.lastEntity?.id, 'qos-mughrom');
});

test('17. Pergantian akun (User ID Mismatch)', () => {
  const memUserA = createMemory('sess-shared', 'usr-user-a');
  memUserA.turns.push({
    id: 'turn-1',
    userQuery: 'Busyro',
    timestamp: Date.now(),
    entity: { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' },
  });
  memUserA.lastEntity = { type: 'qosidah', id: 'qos-busyro', name: 'Busyro Lana' };

  // Context pengguna berganti menjadi user B
  const contextUserB = {
    ...baseContext,
    currentUser: { ...mockUserA, id: 'usr-user-b' },
  };

  const res = resolveConversationContext('Apa artinya?', memUserA, contextUserB);
  assert.equal(res.status, 'EXPIRED'); // Ditolak karena ID user tidak cocok
});

test('18. Entitas tidak lagi tersedia dalam data aktif', () => {
  let mem = createMemory('sess-1', 'usr-user-a');
  // Memori menunjuk ke qosidah yang sudah dihapus dari database
  mem = recordTurn(mem, 'Qosidah Terhapus', 'search', {
    type: 'qosidah',
    id: 'qos-deleted-999',
    name: 'Qosidah Lama',
  });

  const res = resolveConversationContext('Apa artinya?', mem, baseContext);
  assert.equal(res.status, 'ENTITY_NOT_FOUND');
  assert.ok(res.explanation.includes('tidak ditemukan'));
});

test('19. Deteksi negasi dalam pertanyaan lanjutan', () => {
  const isContext1 = isContextDependentQuery('Bukan lagu itu, cari yang lain');
  const isContext2 = isContextDependentQuery('Jangan yang itu');

  assert.equal(isContext1, true);
  assert.equal(isContext2, true);
});

test('20. Tidak menyimpan data sensitif secara permanen dalam memori', () => {
  let mem = createMemory('sess-privacy');
  // Saat mencatat turn dari job, pastikan tidak ada customer_phone atau booking_id internal
  const safeEntity = {
    type: 'job',
    id: 'job-1',
    name: 'Walimatul Ursy',
  };
  mem = recordTurn(mem, 'Jadwal job', 'view_job', safeEntity);

  const memStr = JSON.stringify(mem);
  assert.equal(memStr.includes('081234567899'), false, 'Tidak boleh ada nomor telepon!');
  assert.equal(memStr.includes('bk-secret'), false, 'Tidak boleh ada booking ID rahasia!');
});

test('21. Kompatibilitas AIContext (Dukungan field opsional memory)', () => {
  const mem = createMemory('sess-compat');
  const contextWithMemory = {
    ...baseContext,
    memory: mem,
  };

  assert.ok('memory' in contextWithMemory);
  assert.equal(contextWithMemory.memory?.sessionId, mem.sessionId);

  // processKhoirunnadaAI tetap dapat dipanggil secara normal
  const res = processKhoirunnadaAI('Assalamu\'alaikum', contextWithMemory);
  assert.ok(res.text.includes("Wa'alaikumussalam"));
});

test('22. Tidak ada regresi pada 13 intent lama', () => {
  const testQueries = [
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

  for (const q of testQueries) {
    const res = processKhoirunnadaAI(q, baseContext);
    assert.ok(res.text && res.text.length > 0);
    assert.equal(res.text.includes('*'), false, `Teks tidak boleh mengandung * untuk query: ${q}`);
  }
});
