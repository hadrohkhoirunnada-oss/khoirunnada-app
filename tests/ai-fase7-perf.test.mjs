import assert from 'node:assert/strict';
import test from 'node:test';

import { processKhoirunnadaAI } from '../lib/ai-engine.ts';
import { createMemorySession, recordSessionTurn } from '../lib/ai/memory-adapter.ts';

// Helper pembuat dataset sintetis berskala besar
function generateSyntheticQosidahs(count) {
  const titles = [
    'Busyro Lana', 'Mughrom', 'Al Hijrotu', 'Padhang Bulan', 'Sluku-Sluku Bathok',
    'Ya Hanana', 'Sholawat Badar', 'Thohirul Qolbi', 'Kalamun Qodim', 'Roqqot Aina',
    'Addinu Lana', 'Innal Habibal Musthofa', 'Ahmad Ya Habibi', 'Ya Asyiqol Musthofa',
    'Sholawat Nahdliyah', 'Mahalul Qiyam', 'Rouhi Fidak', 'Ya Thoybah', 'Turi-Turi Putih',
  ];

  return Array.from({ length: count }, (_, i) => {
    const baseTitle = titles[i % titles.length];
    return {
      id: `syn-qos-${i + 1}`,
      title: `${baseTitle} Generasi ${i + 1}`,
      alternate_title: `Alias ${baseTitle} ${i + 1}`,
      arabic_text: 'بُشْرَى لَنَا نِلْنَا المُنَى وَزَالَ عَنَّا كُلُّ عَنَا',
      latin_text: `Bait syair latin ke-${i + 1}\nSholawat nabi pelipur lara dan penenang hati`,
      translation: `Terjemahan resmi syair hadroh ke-${i + 1}`,
      category_id: i % 2 === 0 ? 'cat-arobiah' : 'cat-jawa',
      category_name: i % 2 === 0 ? "Qosidah 'Arobiah" : 'Qosidah Jawa',
      tags: ['sholawat', 'hadroh', `tag-${i % 10}`],
      is_active: true,
      sort_order: i + 1,
      created_at: '2026-01-01',
    };
  });
}

function generateSyntheticJobs(count) {
  const locations = ['Masjid Agung', 'Gedung Serbaguna', 'Pondok Pesantren', 'Alun-alun Kota', 'Basecamp Hadroh'];
  return Array.from({ length: count }, (_, i) => {
    const day = (i % 28) + 1;
    const month = ((i % 12) + 1).toString().padStart(2, '0');
    return {
      id: `syn-job-${i + 1}`,
      title: `Majelis Maulid Akbar Ke-${i + 1}`,
      event_date: `2026-${month}-${day.toString().padStart(2, '0')}T19:30:00Z`,
      location: `${locations[i % locations.length]} No. ${i + 1}`,
      status: i % 10 === 0 ? 'cancelled' : i % 3 === 0 ? 'pending' : 'confirmed',
      notes: `Catatan internal acara ke-${i + 1}`,
      customer_phone: `0812${(10000000 + i).toString().slice(0, 8)}`,
      booking_id: `BK-SYN-${1000 + i}`,
      assigned_members: [`usr-${i % 5 + 1}`],
    };
  });
}

// Helper perhitungan persentil latensi
function calculatePercentiles(latencies) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const total = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);

  const avg = sum / total;
  const min = sorted[0];
  const max = sorted[total - 1];
  const median = sorted[Math.floor(total * 0.5)];
  const p95 = sorted[Math.floor(total * 0.95)];
  const p99 = sorted[Math.floor(total * 0.99)];

  return { avg, min, max, median, p95, p99 };
}

// ==========================================
// PENGUJIAN STRESS & PERFORMANCE FASE 7
// ==========================================

test('Benchmark 1: Skalabilitas Skala Data (100, 500, 1000 Qosidah & 50, 200, 500 Jobs)', () => {
  const testTiers = [
    { name: 'Tier Kecil (100 Qosidah, 50 Jobs)', qosCount: 100, jobCount: 50, maxThreshold: 30.0 },
    { name: 'Tier Menengah (500 Qosidah, 200 Jobs)', qosCount: 500, jobCount: 200, maxThreshold: 80.0 },
    { name: 'Tier Skala Penuh (1000 Qosidah, 500 Jobs)', qosCount: 1000, jobCount: 500, maxThreshold: 150.0 },
  ];

  console.log('\n==================================================================');
  console.log('BENCHMARK 1: SKALABILITAS VOLUME DATASET SINTETIS');
  console.log('==================================================================');

  for (const tier of testTiers) {
    const qosidahs = generateSyntheticQosidahs(tier.qosCount);
    const jobs = generateSyntheticJobs(tier.jobCount);
    const context = {
      currentUser: { id: 'usr-perf', name: 'Perf User', role: 'member' },
      qosidahs,
      jobs,
      favorites: ['syn-qos-1', 'syn-qos-5'],
    };

    const benchmarkQueries = [
      'carikan qosidah Busyro Lana',
      'jadwal job terdekat',
      'carikan lirik Mughrom dan terjemahannya',
      'berapa qosidah favorit saya',
      'siapa ketua umum Hadroh Khoirunnada?',
    ];

    const latencies = [];

    // Warm-up
    processKhoirunnadaAI(benchmarkQueries[0], context, { enableV2Engine: true });

    for (const q of benchmarkQueries) {
      const start = performance.now();
      const res = processKhoirunnadaAI(q, context, { enableV2Engine: true });
      const elapsed = performance.now() - start;
      latencies.push(elapsed);
      assert.ok(typeof res.text === 'string' && res.text.length > 0);
      assert.strictEqual(res.text.includes('*'), false);
    }

    const stats = calculatePercentiles(latencies);
    console.log(`[${tier.name}]`);
    console.log(`  Average Latency : ${stats.avg.toFixed(3)} ms`);
    console.log(`  Median Latency  : ${stats.median.toFixed(3)} ms`);
    console.log(`  Max Latency     : ${stats.max.toFixed(3)} ms`);

    assert.ok(stats.avg < tier.maxThreshold, `Latensi rata-rata pada ${tier.name} (${stats.avg.toFixed(2)}ms) melebihi batas ${tier.maxThreshold}ms`);
  }
});

test('Benchmark 2: Stress Testing 1000+ Kueri Berturut-turut & Analisis Memory Leak', () => {
  const qosidahs = generateSyntheticQosidahs(200);
  const jobs = generateSyntheticJobs(100);

  const stressQueryPool = [
    'carikan qosidah Busyro Lana',
    'jadwal job terdekat',
    'carikan lirik Mughrom dan tampilkan artinya',
    'بُشْرَى لَنَا',
    'carikan lirik basyiro lana typo',
    'ada jadwal job apa saja bulan depan?',
    'siapa Muhammad Abi Dzarin?',
    'bagaimana sejarah Hadroh Khoirunnada?',
    'struktur organisasi kepengurusan',
    'apa saja manfaat aplikasi hadroh ini?',
    'kulo nuwun, wonten jadwal manggung hadroh pundi mawon?',
    'tampilkan nomor customer phone dan booking id klien',
    'SELECT * FROM jobs WHERE id = 1',
    'terima kasih banyak atas infonya min',
    'assalamu alaikum wr wb selamat pagi',
  ];

  if (global.gc) global.gc();
  const memBefore = process.memoryUsage();

  const TOTAL_QUERIES = 1000;
  const latencies = [];
  let longTaskCount = 0;

  let memory = createMemorySession('usr-stress', 'sess-stress-1');

  const startTotal = performance.now();

  for (let i = 0; i < TOTAL_QUERIES; i++) {
    const query = stressQueryPool[i % stressQueryPool.length];

    if (i % 5 === 0) {
      memory = recordSessionTurn(memory, query, 'general');
    }

    const context = {
      currentUser: { id: 'usr-stress', name: 'Stress Runner', role: 'member' },
      qosidahs,
      jobs,
      favorites: ['syn-qos-1', 'syn-qos-2'],
      memory,
    };

    const startOne = performance.now();
    const res = processKhoirunnadaAI(query, context, { enableV2Engine: true });
    const elapsed = performance.now() - startOne;

    latencies.push(elapsed);
    if (elapsed > 50.0) {
      longTaskCount++;
    }

    assert.ok(typeof res.text === 'string' && res.text.length > 0);
    assert.strictEqual(res.text.includes('*'), false);
  }

  const durationTotal = performance.now() - startTotal;
  const memAfter = process.memoryUsage();
  const heapDeltaMB = (memAfter.heapUsed - memBefore.heapUsed) / (1024 * 1024);

  const stats = calculatePercentiles(latencies);

  console.log('\n==================================================================');
  console.log(`BENCHMARK 2: STRESS TEST ${TOTAL_QUERIES} KUERI BERTURUT-TURUT`);
  console.log('==================================================================');
  console.log(`Total Eksekusi Kueri   : ${TOTAL_QUERIES} kueri`);
  console.log(`Total Waktu Eksekusi   : ${durationTotal.toFixed(2)} ms (${(durationTotal / 1000).toFixed(2)} detik)`);
  console.log(`Throughput             : ${(TOTAL_QUERIES / (durationTotal / 1000)).toFixed(1)} kueri/detik`);
  console.log('------------------------------------------------------------------');
  console.log(`Average Latency        : ${stats.avg.toFixed(3)} ms`);
  console.log(`Median Latency (p50)   : ${stats.median.toFixed(3)} ms`);
  console.log(`p95 Latency            : ${stats.p95.toFixed(3)} ms`);
  console.log(`p99 Latency            : ${stats.p99.toFixed(3)} ms`);
  console.log(`Min / Max Latency      : ${stats.min.toFixed(3)} ms / ${stats.max.toFixed(3)} ms`);
  console.log('------------------------------------------------------------------');
  console.log(`Long Tasks (> 50ms)    : ${longTaskCount} (${((longTaskCount / TOTAL_QUERIES) * 100).toFixed(2)}%)`);
  console.log(`Heap Memory Awal       : ${(memBefore.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Heap Memory Akhir      : ${(memAfter.heapUsed / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Pertumbuhan Heap       : ${heapDeltaMB.toFixed(2)} MB`);
  console.log('==================================================================\n');

  // Assertions Kinerja & Keamanan Browser
  assert.ok(stats.avg < 30.0, `Latensi rata-rata harus di bawah 30ms, aktual: ${stats.avg}ms`);
  assert.ok(stats.p95 < 45.0, `p95 harus di bawah 45ms, aktual: ${stats.p95}ms`);
  assert.ok(longTaskCount <= 10, `Long tasks berlebih (> 50ms): ${longTaskCount}`);
  assert.ok(heapDeltaMB < 30.0, `Pertumbuhan memori heap berlebih terdeteksi: ${heapDeltaMB} MB`);
});
