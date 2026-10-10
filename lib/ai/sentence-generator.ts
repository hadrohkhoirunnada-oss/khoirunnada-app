/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - GRAMMAR-BASED SENTENCE GENERATOR
 * Pure TypeScript & JavaScript Built-in - Zero AI API Cost
 *
 * Generator kalimat alami bahasa Indonesia berbasis aturan tata bahasa dan template modular (FASE 5).
 * Mendukung gaya: concise, informative, dan detailed, serta variasi deterministik.
 */

import type { ExtractedFacts, ResponseStyle } from './composer-types.ts';

/**
 * Pemilih variasi kalimat secara deterministik berdasarkan seed atau hashing konten.
 */
function pickVariation<T>(list: T[], seed?: number, salt: number = 0): T {
  if (list.length === 0) throw new Error('Variation list cannot be empty');
  if (list.length === 1) return list[0];

  const effectiveSeed = typeof seed === 'number' ? Math.abs(seed + salt) : 0;
  const index = effectiveSeed % list.length;
  return list[index];
}

/**
 * Menyusun kalimat pembuka percakapan berdasarkan gaya dan intent.
 */
function buildOpener(_facts: ExtractedFacts, _style: ResponseStyle, _seed?: number): string {
  return '';
}

/**
 * Menyusun kalimat penutup percakapan yang santun.
 */
function buildCloser(_facts: ExtractedFacts, _style: ResponseStyle, _seed?: number): string {
  return '';
}

/**
 * Format qosidah tunggal atau daftar qosidah.
 */
function formatQosidahBody(facts: ExtractedFacts, style: ResponseStyle): string {
  const qosidahs = facts.qosidahs;
  if (qosidahs.length === 0) return '';

  if (qosidahs.length === 1) {
    const q = qosidahs[0];
    const cat = q.category ? ` (${q.category})` : '';

    if (style === 'concise') {
      const snippetPart = q.snippet ? ` Bait awalan: "${q.snippet}".` : '';
      return `Qosidah: ${q.title}${cat}.${snippetPart}`;
    }

    if (style === 'detailed') {
      const lines = [
        `Judul: ${q.title}`,
        q.category ? `Kategori: ${q.category}` : '',
        q.arabic ? `Teks Arab:\n${q.arabic}` : '',
        q.snippet ? `Bait Awalan Latin:\n"${q.snippet}..."` : '',
        q.translation ? `Terjemahan Singkat:\n"${q.translation}"` : '',
      ].filter(Boolean);

      return lines.join('\n\n');
    }

    // Informative (default)
    const arabicSnippet = q.arabic ? `\n\nTeks Arab:\n${q.arabic.split('\n').slice(0, 2).join('\n')}` : '';
    const preview = q.snippet ? `\n\nBait Awalan Latin:\n"${q.snippet}..."` : '';
    const transPart = q.translation ? `\n\nArti Singkat:\n"${q.translation}"` : '';
    return `Berikut qosidah ${q.title}${cat}:${arabicSnippet}${preview}${transPart}`;
  }

  // Multi-match (2 atau lebih qosidah)
  if (style === 'concise') {
    const names = qosidahs.map((q) => q.title).join(', ');
    return `Ditemukan ${qosidahs.length} qosidah: ${names}.`;
  }

  const listText = qosidahs
    .map((q, idx) => {
      const cat = q.category ? ` (${q.category})` : '';
      const firstArabicLine = q.arabic ? q.arabic.split('\n').filter(Boolean)[0] : '';
      const arabicSnippet = firstArabicLine ? `\n   Arab: ${firstArabicLine}` : '';
      const preview = q.snippet ? `\n   Bait awalan: "${q.snippet}..."` : '';
      return `${idx + 1}. ${q.title}${cat}${arabicSnippet}${preview}`;
    })
    .join('\n\n');

  const countHeader =
    facts.requestedCount && qosidahs.length < facts.requestedCount
      ? `Dalam arsip Hadroh Khoirunnada saat ini tersedia ${qosidahs.length} qosidah yang cocok:`
      : `Ditemukan ${qosidahs.length} qosidah sholawat yang cocok:`;

  if (style === 'detailed') {
    return `${countHeader}\n\n${listText}\n\nAnda dapat memilih salah satu qosidah untuk membaca teks lengkap dan terjemahan.`;
  }

  return `${countHeader}\n\n${listText}`;
}

/**
 * Format agenda job atau nearest job.
 */
function formatJobBody(facts: ExtractedFacts, style: ResponseStyle): string {
  if (facts.nearestJob) {
    const j = facts.nearestJob;
    if (style === 'concise') {
      return `Jadwal terdekat: ${j.title}, ${j.formattedDate} di ${j.location}. Status: ${j.status}.`;
    }

    if (style === 'detailed') {
      return `Rincian Agenda Terdekat:\n- Acara: ${j.title}\n- Waktu Pelaksanaan: ${j.formattedDate}\n- Lokasi Acara: ${j.location}\n- Status Konfirmasi: ${j.status}`;
    }

    return `Jadwal job Hadroh Khoirunnada terdekat adalah "${j.title}" pada ${j.formattedDate} yang berlokasi di ${j.location}.`;
  }

  if (facts.jobs.length > 0) {
    if (style === 'concise') {
      const titles = facts.jobs.map((j) => `${j.title} (${j.formattedDate})`).join(', ');
      return `Jadwal job: ${titles}.`;
    }

    const listText = facts.jobs
      .slice(0, 3)
      .map((j, idx) => {
        return `${idx + 1}. ${j.title}\n   - Tanggal: ${j.formattedDate}\n   - Lokasi: ${j.location}\n   - Status: ${j.status}`;
      })
      .join('\n\n');

    if (style === 'detailed') {
      return `Daftar Jadwal Job Aktif:\n\n${listText}\n\nPastikan seluruh perlengkapan dan seragam hadroh sudah dipersiapkan sesuai arahan pimpinan.`;
    }

    return `Berikut adalah jadwal job Hadroh Khoirunnada mendatang:\n\n${listText}`;
  }

  // Jika tidak ada job aktif
  if (style === 'concise') {
    return 'Saat ini belum ada jadwal job aktif yang diagendakan.';
  }

  return `Saat ini belum ada jadwal job terdekat yang diagendakan di sistem.\n\nPengurus hadroh akan memperbarui halaman Jadwal Job segera setelah ada konfirmasi undangan baru.`;
}

/**
 * Format jawaban atribut tertentu (terjemahan, lirik, lokasi, tanggal).
 */
function formatAttributeBody(facts: ExtractedFacts, style: ResponseStyle): string {
  const attr = facts.attributeName;
  const val = facts.attributeValue;
  const entity = facts.entityName || (facts.qosidahs.length > 0 ? facts.qosidahs[0].title : 'entitas ini');

  if (!val) {
    if (attr === 'translation') {
      if (style === 'concise') {
        return `Terjemahan untuk ${entity} belum tersedia.`;
      }
      return `Afwan, terjemahan bahasa Indonesia untuk qosidah ${entity} saat ini belum tersedia di basis data kami. Anda tetap dapat membaca teks Arab dan syair Latin yang telah disediakan.`;
    }
    if (attr === 'lyrics') {
      if (style === 'concise') {
        return `Syair untuk ${entity} belum tersedia.`;
      }
      return `Afwan, syair lengkap untuk ${entity} belum tercatat di sistem kami.`;
    }
    return `Atribut ${attr} untuk ${entity} belum tersedia.`;
  }

  if (attr === 'translation') {
    const q = facts.qosidahs.find((item) => item.title.toLowerCase() === entity.toLowerCase()) || facts.qosidahs[0];
    const cat = q?.category ? ` (${q.category})` : '';
    const arabicPart = q?.arabic ? `Teks Arab:\n${q.arabic}\n\n` : '';
    const latinPart = q?.snippet ? `Bait Latin:\n"${q.snippet}..."\n\n` : '';

    if (style === 'concise') {
      return `Terjemahan ${entity}:\n"${val}"`;
    }
    if (style === 'detailed') {
      return `Berikut adalah rincian teks dan makna qosidah ${entity}${cat}:\n\n${arabicPart}${latinPart}Artinya:\n"${val}"`;
    }
    return `Berikut arti dan terjemahan qosidah ${entity}${cat}:\n\n${arabicPart}${latinPart}Artinya:\n"${val}"`;
  }

  if (attr === 'lyrics') {
    const q = facts.qosidahs.find((item) => item.title.toLowerCase() === entity.toLowerCase()) || facts.qosidahs[0];
    const cat = q?.category ? ` (${q.category})` : '';
    const arabicPart = q?.arabic ? `Teks Arab:\n${q.arabic}\n\n` : '';

    if (style === 'concise') {
      return `Syair ${entity}:\n${val}`;
    }
    return `Berikut syair qosidah ${entity}${cat}:\n\n${arabicPart}Syair Latin:\n"${val}"`;
  }

  if (attr === 'location') {
    if (style === 'concise') {
      return `Lokasi ${entity}: ${val}.`;
    }
    return `Lokasi untuk ${entity} bertempat di ${val}.`;
  }

  if (attr === 'date') {
    if (style === 'concise') {
      return `Tanggal ${entity}: ${val}.`;
    }
    return `Agenda untuk ${entity} dijadwalkan pada ${val}.`;
  }

  return `${entity} (${attr}): ${val}`;
}

/**
 * Format jawaban perhitungan (COUNT).
 */
function formatCountBody(facts: ExtractedFacts, style: ResponseStyle): string {
  const count = facts.count ?? 0;

  if (facts.intent.includes('favorite')) {
    if (count === 0) {
      if (style === 'concise') return 'Anda belum memiliki qosidah favorit.';
      return 'Anda belum memiliki koleksi qosidah favorit.';
    }
    if (style === 'concise') {
      return `Total qosidah favorit: ${count}.`;
    }
    if (style === 'detailed') {
      return `Berdasarkan data akun Anda, tercatat sebanyak ${count} qosidah yang tersimpan dalam koleksi favorit pribadi Anda.`;
    }
    return `Alhamdulillah, Anda telah menyimpan ${count} Qosidah Favorit di akun Anda. Anda dapat membuka dan melantunkannya kapan saja!`;
  }

  if (style === 'concise') {
    return `Total ditemukan: ${count} item.`;
  }

  return `Ditemukan sebanyak ${count} data yang sesuai dengan pencarian Anda.`;
}

/**
 * Membangun kalimat jawaban utuh dari fakta yang diekstrak.
 */
export function generateSentence(
  facts: ExtractedFacts,
  style: ResponseStyle = 'informative',
  seed?: number
): string {
  const parts: string[] = [];

  const opener = buildOpener(facts, style, seed);
  if (opener) parts.push(opener);

  // 1. Kasus Atribut Spesifik (misal: Terjemahan, Lirik, Lokasi)
  if (facts.attributeName) {
    parts.push(formatAttributeBody(facts, style));
  }
  // 2. Kasus Perhitungan (COUNT)
  else if (typeof facts.count === 'number' && (facts.intent.includes('count') || facts.intent.includes('favorite'))) {
    parts.push(formatCountBody(facts, style));
  }
  // 3. Kasus Jadwal Job (Jadwal Terdekat, Mendatang, atau Kosong)
  else if (
    facts.nearestJob ||
    facts.jobs.length > 0 ||
    facts.intent.includes('job') ||
    facts.intent.includes('upcoming')
  ) {
    parts.push(formatJobBody(facts, style));
  }
  // 4. Kasus Qosidah Ditemukan
  else if (facts.qosidahs.length > 0) {
    parts.push(formatQosidahBody(facts, style));
  }
  // 5. Kasus Pengetahuan Statis Resmi
  else if (facts.staticContent) {
    parts.push(facts.staticContent);
  }

  const closer = buildCloser(facts, style, seed);
  if (closer) parts.push(closer);

  return parts.filter(Boolean).join('\n\n');
}