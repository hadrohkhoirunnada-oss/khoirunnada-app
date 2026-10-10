import assert from 'node:assert/strict';
import test from 'node:test';
import { processKhoirunnadaAI } from '../lib/ai-engine.ts';

// Mock Context Baseline
const mockUser = {
  id: 'usr-1',
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

const mockQosidahs = [
  {
    id: 'qos-1',
    title: 'Busyro Lana',
    alternate_title: 'Basyiro Lana',
    arabic_text: 'بشرى لنا نلنا المنى',
    latin_text: 'Busyro lana nilnal muna\nZalal ana wa fal hana',
    translation: 'Kebahagiaan milik kita',
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['busyro', 'lana', 'sholawat'],
    is_active: true,
    sort_order: 1,
    created_at: '2026-01-01',
  },
  {
    id: 'qos-2',
    title: 'Mughrom',
    alternate_title: 'Mughrom Qolbi',
    arabic_text: 'مغرم قلبي بحبك',
    latin_text: 'Mughrom qolbi bihubbika ya Rosulalloh',
    translation: 'Tergila-gila hatiku dengan cintamu',
    category_id: 'cat-arobiah',
    category_name: "Qosidah 'Arobiah",
    tags: ['mughrom', 'cinta', 'rosul'],
    is_active: true,
    sort_order: 2,
    created_at: '2026-01-01',
  },
  {
    id: 'qos-3',
    title: 'Padhang Bulan',
    arabic_text: 'يا رسول الله سلام عليك',
    latin_text: 'Yo pra konco dolanan neng njobo',
    translation: 'Ayo kawan bermain di luar',
    category_id: 'cat-jawa',
    category_name: 'Qosidah Jawa',
    tags: ['jawa', 'padhang bulan'],
    is_active: true,
    sort_order: 3,
    created_at: '2026-01-01',
  },
];

const mockJobs = [
  {
    id: 'job-1',
    title: 'Walimatul Ursy Ahmad & Fatimah',
    event_type: 'Pernikahan',
    customer_name: 'H. Sulaiman',
    customer_phone: '08123456789',
    event_date: '2026-10-25T19:30:00Z',
    gather_time: '18:30',
    start_time: '19:30',
    location: 'Gedung Al-Barokah',
    maps_url: '',
    status: 'upcoming',
    created_by: 'usr-1',
    created_at: '2026-10-01',
  },
];

const mockFavorites = ['qos-1', 'qos-2'];

const baseContext = {
  currentUser: mockUser,
  qosidahs: mockQosidahs,
  jobs: mockJobs,
  favorites: mockFavorites,
};

// Helper: Verifikasi mutlak bahwa tidak ada satupun simbol * dalam teks output
function assertNoAsterisks(text) {
  assert.equal(text.includes('*'), false, `Teks mengandung simbol * terlarang: ${text}`);
}

test('1. Salam Islami & Sapaan Pengguna', () => {
  const res = processKhoirunnadaAI("Assalamu'alaikum", baseContext);
  assert.ok(res.text.includes("Wa'alaikumussalam"));
  assert.ok(res.text.includes('Dzarin'));
  assert.ok(Array.isArray(res.actions) && res.actions.length > 0);
  assertNoAsterisks(res.text);
});

test('2. Profil Khusus: Siapa Dzarin (Deep Search Mode ~10 Detik)', () => {
  const res = processKhoirunnadaAI('Siapa Dzarin?', baseContext);
  assert.equal(res.isDeepSearch, true);
  assert.ok(res.text.includes('Muhammad Abi Dzarin'));
  assert.ok(res.text.includes('Nexarin By-Rins'));
  assert.ok(res.text.includes('Kotanagaya, 15 September 2006'));
  assert.ok(res.text.includes('Penanggung Jawab Khoirunnada') || res.text.includes('Penanggung Jawab'));
  assertNoAsterisks(res.text);
});

test('3. Pembuat / Pengembang Aplikasi (Memiliki Opsi Siapa Dzarin?)', () => {
  const res = processKhoirunnadaAI('Siapa yang membuat dan mengembangkan aplikasi ini?', baseContext);
  assert.ok(res.text.includes('Muhammad Abi Dzarin'));
  assert.ok(res.text.includes('Penanggung Jawab Khoirunnada') || res.text.includes('Penanggung Jawab'));
  const hasDzarinAction = res.actions?.some((a) => a.promptText === 'Siapa Dzarin?');
  assert.ok(hasDzarinAction, 'Harus menyediakan opsi tindak lanjut Siapa Dzarin?');
  assertNoAsterisks(res.text);
});

test('4. Panduan & Cara Menggunakan Aplikasi', () => {
  const res = processKhoirunnadaAI('Bagaimana cara menggunakan aplikasi ini?', baseContext);
  assert.ok(res.text.includes('Panduan Cara Menggunakan Aplikasi'));
  assert.ok(res.text.includes('Katalog Qosidah'));
  const hasQosidahHref = res.actions?.some((a) => a.href === '/app/qosidah');
  assert.ok(hasQosidahHref);
  assertNoAsterisks(res.text);
});

test('5. Manfaat Aplikasi Hadroh Khoirunnada', () => {
  const res = processKhoirunnadaAI('Apa saja manfaat aplikasi ini?', baseContext);
  assert.ok(res.text.includes('Manfaat Aplikasi'));
  assert.ok(res.text.includes('Praktis'));
  assertNoAsterisks(res.text);
});

test('6. Sejarah & Makna Nama Khoirunnada', () => {
  const res = processKhoirunnadaAI('Bagaimana sejarah Khoirunnada?', baseContext);
  assert.ok(res.text.includes('Sejarah Hadroh Khoirunnada'));
  assert.ok(res.text.includes('Nada Kebaikan / Suara Kebaikan'));
  assertNoAsterisks(res.text);
});

test('7. Struktur Organisasi Kepengurusan', () => {
  const res = processKhoirunnadaAI('Bagaimana struktur organisasi Khoirunnada?', baseContext);
  assert.ok(res.text.includes('Struktur Kepengurusan'));
  assert.ok(res.text.includes('Muhammad Abi Dzarin'));
  assertNoAsterisks(res.text);
});

test('8. Jadwal Job Hadroh (Ada Jadwal vs Kosong)', () => {
  const resWithJobs = processKhoirunnadaAI('Ada jadwal job apa saja?', baseContext);
  assert.ok(resWithJobs.text.includes('Walimatul Ursy'));
  assertNoAsterisks(resWithJobs.text);

  const resNoJobs = processKhoirunnadaAI('Ada jadwal job apa saja?', { ...baseContext, jobs: [] });
  assert.ok(resNoJobs.text.includes('belum ada jadwal job'));
  assertNoAsterisks(resNoJobs.text);
});

test('9. Qosidah Favorit (Tersimpan vs Belum Ada)', () => {
  const resWithFavs = processKhoirunnadaAI('Lagu favorit saya', baseContext);
  assert.ok(resWithFavs.text.includes('2 Qosidah Favorit'));
  assertNoAsterisks(resWithFavs.text);

  const resNoFavs = processKhoirunnadaAI('Lagu favorit saya', { ...baseContext, favorites: [] });
  assert.ok(resNoFavs.text.includes('belum memiliki koleksi qosidah favorit'));
  assertNoAsterisks(resNoFavs.text);
});

test('10. Pencarian Judul Qosidah Spesifik & Tautan Aksi', () => {
  const res = processKhoirunnadaAI('Carikan saya qosidah Busyro Lana', baseContext);
  assert.ok(res.text.includes('Busyro Lana'));
  const hasLink = res.actions?.some((a) => a.href === '/app/qosidah/qos-1');
  assert.ok(hasLink, 'Harus menyediakan tautan langsung ke qosidah yang ditemukan');
  assertNoAsterisks(res.text);
});

test('11. Koleksi Umum Qosidah Hadroh', () => {
  const res = processKhoirunnadaAI('Koleksi qosidah hadroh', baseContext);
  assert.ok(res.text.includes("Qosidah 'Arobiah"));
  assert.ok(res.text.includes('Qosidah Jawa'));
  assertNoAsterisks(res.text);
});

test('12. Ucapan Terima Kasih', () => {
  const res = processKhoirunnadaAI('Terima kasih banyak AI', baseContext);
  assert.ok(res.text.includes('Sama-sama'));
  assertNoAsterisks(res.text);
});

test('13. Fallback Respons Cerdas di Luar Domain', () => {
  const res = processKhoirunnadaAI('Berapa kurs dollar hari ini?', baseContext);
  assert.ok(res.text.includes('belum memahami pertanyaan Anda secara spesifik'));
  assert.ok(Array.isArray(res.actions) && res.actions.length > 0);
  assertNoAsterisks(res.text);
});
