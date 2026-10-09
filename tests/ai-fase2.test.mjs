import assert from 'node:assert/strict';
import test from 'node:test';

import {
  retrieveQosidahs,
  cleanQosidahQuery,
} from '../lib/ai/qosidah-retriever.ts';

import {
  toSafeJob,
  getUpcomingJobs,
  getPastJobs,
  getNearestJob,
  filterJobsByStatus,
  filterJobsByMonth,
  searchJobs,
  parseJobDate,
} from '../lib/ai/job-retriever.ts';

import {
  resolveFavorites,
  searchInFavorites,
} from '../lib/ai/favorites-retriever.ts';

import {
  searchStaticKnowledge,
  STATIC_KNOWLEDGE_ARTICLES,
} from '../lib/ai/static-knowledge.ts';

import { queryKnowledge } from '../lib/ai/knowledge-engine.ts';

// Data Mock Sintetis Terverifikasi untuk Pengujian
const mockQosidahs = [
  {
    id: 'qos-busyro',
    title: 'Busyro Lana',
    alternate_title: 'Basyiro Lana',
    arabic_text: 'بُشْرَى لَنَا نِلْنَا المُنَى',
    latin_text: 'Busyro lana nilnal muna\nZalal ana wa fal hana',
    translation: 'Kebahagiaan milik kita telah datang',
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['sholawat', 'kebahagiaan', 'busyro'],
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
    tags: ['cinta', 'rosul', 'mughrom'],
    is_active: true,
    sort_order: 2,
    created_at: '2026-01-01',
  },
  {
    id: 'qos-padhang',
    title: 'Padhang Bulan',
    arabic_text: 'يا رسول الله سلام عليك',
    latin_text: 'Yo pra konco dolanan neng njobo\nPadhang wulan padhange koyo rino',
    translation: 'Ayo kawan bermain di luar, rembulan terang benderang',
    category_id: 'cat-jawa',
    category_name: 'Qosidah Jawa',
    tags: ['jawa', 'nasihat', 'bulan'],
    is_active: true,
    sort_order: 3,
    created_at: '2026-01-01',
  },
  {
    id: 'qos-thoybah',
    title: 'Ya Thoybah',
    arabic_text: 'يا طيبة يا طيبة يا دوا العيانا',
    latin_text: 'Ya thoybah ya thoybah ya dawal ayana',
    translation: 'Wahai kota Thoybah (Madinah), wahai penawar duka',
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['madinah', 'thoybah'],
    is_active: true,
    sort_order: 4,
    created_at: '2026-01-01',
  },
];

const mockJobs = [
  {
    id: 'job-1',
    booking_id: 'bk-secret-101',
    title: 'Walimatul Ursy Ahmad & Fatimah',
    event_type: 'Pernikahan',
    customer_name: 'H. Sulaiman Rahasia',
    customer_phone: '081234567899', // Data sensitif yang dilarang bocor
    event_date: '2026-10-25T19:30:00Z',
    gather_time: '18:30',
    start_time: '19:30',
    location: 'Gedung Al-Barokah',
    maps_url: 'https://maps.google.com/test',
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
    title: 'Khitanan Ananda Rayhan',
    event_type: 'Khitanan',
    customer_name: 'Bpk. Hendra',
    customer_phone: '085555555555',
    event_date: '2026-09-15T10:00:00Z', // Masa lalu
    gather_time: '09:00',
    start_time: '10:00',
    location: 'Kediaman Bpk. Hendra',
    maps_url: '',
    status: 'completed',
    created_by: 'usr-admin',
    created_at: '2026-09-01',
  },
  {
    id: 'job-4',
    booking_id: 'bk-secret-104',
    title: 'Haflah Akhirussanah',
    event_type: 'Wisuda',
    customer_name: 'Panitia Wisuda',
    customer_phone: '087777777777',
    event_date: '2026-10-30T08:00:00Z',
    gather_time: '07:30',
    start_time: '08:00',
    location: 'Pesantren',
    maps_url: '',
    status: 'cancelled', // Dibatalkan
    created_by: 'usr-admin',
    created_at: '2026-10-03',
  },
];

const referenceDate = new Date('2026-10-10T00:00:00Z');

// ==========================================
// 25 UNIT TESTS WAJIB FASE 2
// ==========================================

test('1. Pencarian judul persis (Exact title match)', () => {
  const res = retrieveQosidahs('Busyro Lana', mockQosidahs);
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-busyro');
  assert.equal(res[0].strategy, 'exact_title');
  assert.equal(res[0].score, 1.0);
  assert.equal(res[0].confidence, 'high');
});

test('2. Alternate title / Alias match', () => {
  const res = retrieveQosidahs('Basyiro Lana', mockQosidahs);
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-busyro');
  assert.equal(res[0].strategy, 'exact_alias');
  assert.ok(res[0].score >= 0.95);
});

test('3. Typo satu karakter (Damerau-Levenshtein 1 edit)', () => {
  const res = retrieveQosidahs('Busyro Lano', mockQosidahs); // Typo 'o' di akhir
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-busyro');
  assert.equal(res[0].strategy, 'fuzzy_title');
  assert.ok(res[0].score >= 0.85);
});

test('4. Typo dua karakter / Transposisi huruf berdampingan', () => {
  const res = retrieveQosidahs('Mughorm', mockQosidahs); // 'ro' ditukar 'or' (transposisi)
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-mughrom');
  assert.ok(res[0].score >= 0.75);
});

test('5. Tags matching', () => {
  const res = retrieveQosidahs('kebahagiaan', mockQosidahs);
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-busyro');
  assert.equal(res[0].strategy, 'tag_match');
});

test('6. Teks latin snippet search', () => {
  const res = retrieveQosidahs('dolanan neng njobo', mockQosidahs);
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-padhang');
  assert.equal(res[0].strategy, 'content_latin');
});

test('7. Teks Arab dengan harakat lengkap', () => {
  const res = retrieveQosidahs('بُشْرَى لَنَا', mockQosidahs);
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-busyro');
  assert.equal(res[0].strategy, 'arabic_normalized');
});

test('8. Teks Arab gundul tanpa harakat', () => {
  const res = retrieveQosidahs('بشرى لنا', mockQosidahs);
  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-busyro');
  assert.equal(res[0].strategy, 'arabic_normalized');
});

test('9. Category matching', () => {
  const res = retrieveQosidahs('Qosidah Jawa', mockQosidahs);
  assert.ok(res.length > 0);
  const javaSong = res.find((r) => r.item.id === 'qos-padhang');
  assert.ok(javaSong);
  assert.equal(javaSong.strategy, 'category_match');
});

test('10. Hasil ambigu (mengembalikan kandidat relevan)', () => {
  // Kata 'ya' atau 'qosidah' yang cocok ke beberapa item
  const res = retrieveQosidahs('ya rosul', mockQosidahs, { limit: 5 });
  assert.ok(res.length > 0);
  assert.ok(res.every((r) => r.item && r.item.id));
});

test('11. Penanganan data kosong secara aman', () => {
  const resEmptyQos = retrieveQosidahs('Busyro', []);
  assert.deepEqual(resEmptyQos, []);

  const resEmptyJobs = getUpcomingJobs([], referenceDate);
  assert.deepEqual(resEmptyJobs, []);

  const resEmptyFavs = resolveFavorites([], mockQosidahs);
  assert.deepEqual(resEmptyFavs, []);
});

test('12. Penanganan optional fields yang kosong / undefined', () => {
  const incompleteSong = [
    {
      id: 'qos-inc',
      title: 'Sholawat Badar',
      arabic_text: '',
      latin_text: '',
      translation: '',
      tags: [],
      category_id: 'cat-1',
      is_active: true,
      sort_order: 1,
      created_at: '2026-01-01',
    },
  ];

  const res = retrieveQosidahs('Sholawat Badar', incompleteSong);
  assert.equal(res.length, 1);
  assert.equal(res[0].item.id, 'qos-inc');
  assert.equal(res[0].strategy, 'exact_title');
});

test('13. Favorites dengan ID yang tidak ditemukan di katalog', () => {
  const favIds = ['qos-busyro', 'non-existent-id-999', 'qos-padhang'];
  const resolved = resolveFavorites(favIds, mockQosidahs);

  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].id, 'qos-busyro');
  assert.equal(resolved[1].id, 'qos-padhang');
});

test('14. Perubahan context dinamis (tidak ada stale cache)', () => {
  const datasetA = [mockQosidahs[0]];
  const datasetB = [mockQosidahs[1]];

  const resA = retrieveQosidahs('Busyro Lana', datasetA);
  assert.equal(resA.length, 1);

  // Ganti context ke dataset B
  const resB = retrieveQosidahs('Busyro Lana', datasetB);
  assert.equal(resB.length, 0); // Bersih, tidak ada data usang
});

test('15. Filtering jadwal masa depan (Upcoming Jobs)', () => {
  const upcoming = getUpcomingJobs(mockJobs, referenceDate);
  // job-1 (25 Okt) dan job-2 (10 Nov) aktif. job-3 (Sept) masa lalu, job-4 cancelled.
  assert.equal(upcoming.length, 2);
  assert.equal(upcoming[0].id, 'job-1');
  assert.equal(upcoming[1].id, 'job-2');
  assert.ok(upcoming[0].isUpcoming);
});

test('16. Filtering jadwal masa lalu (Past Jobs)', () => {
  const past = getPastJobs(mockJobs, referenceDate);
  assert.equal(past.length, 1);
  assert.equal(past[0].id, 'job-3');
  assert.equal(past[0].isUpcoming, false);
});

test('17. Jadwal terdekat (Nearest Job)', () => {
  const nearest = getNearestJob(mockJobs, referenceDate);
  assert.ok(nearest !== null);
  assert.equal(nearest.id, 'job-1'); // 25 Okt adalah yang paling dekat
  assert.equal(nearest.title, 'Walimatul Ursy Ahmad & Fatimah');
});

test('18. Validasi tanggal dan format zona waktu Indonesia', () => {
  const nearest = getNearestJob(mockJobs, referenceDate);
  assert.ok(nearest);
  assert.ok(nearest.formattedDate.includes('2026'));
  assert.ok(nearest.formattedDate.includes('Oktober'));

  // Cek penanganan string tanggal tidak valid
  const invalidDate = parseJobDate('bukan-tanggal-valid');
  assert.equal(invalidDate, null);
});

test('19. Favorites resolution ke objek Qosidah lengkap', () => {
  const favIds = ['qos-mughrom'];
  const resolved = resolveFavorites(favIds, mockQosidahs);
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].title, 'Mughrom');
  assert.equal(resolved[0].category_name, "Qosidah 'Arobiah");
});

test('20. Pencegahan duplikasi ID pada favorites', () => {
  const duplicatedIds = ['qos-busyro', 'qos-busyro', 'qos-padhang', 'qos-busyro'];
  const resolved = resolveFavorites(duplicatedIds, mockQosidahs);
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].id, 'qos-busyro');
  assert.equal(resolved[1].id, 'qos-padhang');
});

test('21. Immutability: Pencarian tidak mengubah source data', () => {
  const originalQos = [...mockQosidahs];
  const originalJobs = [...mockJobs];
  const originalFavs = ['qos-busyro'];

  retrieveQosidahs('Busyro', originalQos);
  searchJobs('Ahmad', originalJobs);
  searchInFavorites('Busyro', originalFavs, originalQos);

  assert.equal(originalQos.length, 4);
  assert.equal(originalJobs.length, 4);
  assert.equal(originalFavs.length, 1);
});

test('22. Pencegahan kebocoran data sensitif (Privacy Protection)', () => {
  const safe = toSafeJob(mockJobs[0], referenceDate);

  // Pastikan properti sensitif tidak ada pada safe object
  assert.equal('customer_phone' in safe, false);
  assert.equal('booking_id' in safe, false);
  assert.equal('created_by' in safe, false);

  // Pastikan nomor HP tidak bocor di searchJobs
  const searchRes = searchJobs('Ahmad', mockJobs);
  assert.ok(searchRes.length > 0);
  assert.equal('customer_phone' in searchRes[0].item, false);
  const serialized = JSON.stringify(searchRes);
  assert.equal(serialized.includes('081234567899'), false, 'Nomor HP privat tidak boleh bocor!');
});

test('23. Konservatif pada input pendek (<= 2 karakter)', () => {
  const resSingle = retrieveQosidahs('a', mockQosidahs);
  assert.deepEqual(resSingle, [], 'Query 1 karakter harus menghasilkan empty list');

  const resTwoChars = retrieveQosidahs('xy', mockQosidahs);
  assert.deepEqual(resTwoChars, [], 'Query 2 karakter acak tidak boleh memicu fuzzy match liar');
});

test('24. Penanganan input aneh, karakter spesial, dan whitespace', () => {
  const weirdQueries = [
    '   ???   ',
    '!!!@@@###',
    '\n\t\r',
    'qosidah????',
    'carikan saya qosidah', // Frasa kosong setelah dibersihkan
  ];

  for (const w of weirdQueries) {
    const res = retrieveQosidahs(w, mockQosidahs);
    assert.ok(Array.isArray(res), `Harus mengembalikan array untuk input "${w}"`);
  }
});

test('25. Uji performa & skalabilitas dataset besar (Stress Test 100+ Data)', () => {
  const largeQosidahs = [];
  for (let i = 1; i <= 150; i++) {
    largeQosidahs.push({
      id: `qos-stress-${i}`,
      title: `Qosidah Judul Uji Coba Ke ${i}`,
      alternate_title: `Alias Lagu ${i}`,
      arabic_text: 'يا رسول الله سلام عليك',
      latin_text: `Syair bait pertama lagu ${i} hadroh khoirunnada`,
      translation: `Arti dari syair lagu ke ${i}`,
      category_id: i % 2 === 0 ? 'cat-arobiah' : 'cat-jawa',
      category_name: i % 2 === 0 ? "Qosidah 'Arobiah" : 'Qosidah Jawa',
      tags: ['stress', `tag-${i}`],
      is_active: true,
      sort_order: i,
      created_at: '2026-01-01',
    });
  }

  const start = performance.now();
  const res = retrieveQosidahs('Judul Uji Coba Ke 100', largeQosidahs);
  const duration = performance.now() - start;

  assert.ok(res.length > 0);
  assert.equal(res[0].item.id, 'qos-stress-100');
  assert.ok(duration < 50, `Pencarian 150 data harus < 50ms, aktual: ${duration.toFixed(2)}ms`);
});
