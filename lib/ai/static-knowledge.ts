/**
 * KHOIRUNNADA BRAIN ENGINE v2.0 - STATIC KNOWLEDGE BASE
 * Pure TypeScript Intelligence - Zero AI API Cost
 *
 * Pengetahuan statis resmi dan terverifikasi mengenai Hadroh Khoirunnada,
 * kepengurusan, panduan aplikasi, profil pengembang, sapaan islami, dan ucapan terima kasih.
 * Dipisahkan dari algoritma retrieval sesuai prinsip Modular Knowledge Base (FASE 2).
 * Bebas dari simbol asteris (*) mutlak.
 */

import type { StaticKnowledgeArticle, RetrievalResult } from './retrieval-types.ts';
import { normalizeText } from './normalizer.ts';
import { stringSimilarity } from './matcher.ts';

export const STATIC_KNOWLEDGE_ARTICLES: StaticKnowledgeArticle[] = [
  {
    id: 'static-greeting',
    title: 'Sapaan & Salam Islami Hadroh Khoirunnada',
    category: 'salam',
    keywords: [
      'assalamu',
      'assalamualaikum',
      'kulonuwun',
      'kulo nuwun',
      'halo',
      'hai',
      'bro',
      'hay',
      'hay ai',
      'hei',
      'oy',
      'hi',
      'hello',
      'hallo',
      'halo min',
      'halo ai',
      'halo bro',
      'pagi bro',
      'siang bro',
      'malam bro',
      'pagi',
      'siang',
      'malam',
      'sugeng enjang',
      'sugeng',
      'salam',
      'ass wr wb',
      'asslmualaikum',
      'السلام عليكم',
      'السلام عليكم ورحمة الله وبركاته',
    ],
    content: `Wa'alaikumussalam warahmatullah wabarakatuh! \n\nSaya Khoirunnada AI, asisten cerdas resmi Hadroh Khoirunnada. Ada yang bisa saya bantu hari ini seputar qosidah, jadwal job, panduan aplikasi, atau organisasi?`,
    actions: [
      { label: '📖 Cari Qosidah', promptText: 'Carikan saya qosidah' },
      { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
      { label: '🏛️ Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' },
    ],
  },
  {
    id: 'static-gratitude',
    title: 'Ucapan Terima Kasih & Doa Berkah',
    category: 'syukron',
    keywords: [
      'terima kasih',
      'terimakasih',
      'makasih',
      'makaci',
      'syukron',
      'matur nuwun',
      'matur suwun',
      'thanks',
      'jazakallah',
      'barakallah',
      'syukron jazakallah',
      'شكرا',
      'شكرا جزيلا',
      'بارك الله فيكم',
    ],
    content: `Sama-sama! Senang bisa membantu Anda. Jangan ragu bertanya lagi jika butuh bantuan seputar Hadroh Khoirunnada. Berkah selalu untuk Anda dan keluarga!`,
    actions: [
      { label: '📖 Cari Qosidah Lain', href: '/app/qosidah' },
      { label: '📅 Cek Jadwal Job', href: '/app/jobs' },
    ],
  },
  {
    id: 'static-sejarah',
    title: 'Sejarah & Makna Nama Hadroh Khoirunnada',
    category: 'sejarah',
    keywords: [
      'sejarah',
      'sejarh',
      'asal usul',
      'latar belakang',
      'kapan berdiri',
      'didirikan',
      'kapan didirikan',
      'arti nama',
      'makna nama',
      'arti dan makna',
      'nada kebaikan',
      'suara kebaikan',
      'histori',
      'kilas balik',
      'critane',
      'sejarahipun',
      'berdirinya grup',
      'pembentukan hadroh',
      'تاريخ',
      'تاريخ خير الندى',
    ],
    content: `Sejarah Hadroh Khoirunnada:
Grup seni hadroh Khoirunnada didirikan sebagai wadah syiar dakwah Islamiyah melalui alunan musik rebana dan qosidah sholawat. Nama "Khoirunnada" bermakna "Nada Kebaikan / Suara Kebaikan".

Berangkat dari kebersamaan dan kecintaan para pemuda terhadap sholawat Nabi Muhammad SAW, Hadroh Khoirunnada aktif melayani undangan majelis maulid, peringatan hari besar Islam (PHBI), walimatul 'ursy, serta pengajian akbar dengan perpaduan qosidah klasik 'Arobiah dan tembang sholawat Jawa.`,
    actions: [
      { label: '👥 Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
      { label: '📖 Daftar Qosidah', href: '/app/qosidah' },
    ],
  },
  {
    id: 'static-struktur',
    title: 'Struktur Organisasi Kepengurusan Hadroh Khoirunnada',
    category: 'organisasi',
    keywords: [
      'struktur',
      'organisasi',
      'kepengurusan',
      'susunan struktur',
      'ketua',
      'ketua umum',
      'ketum',
      'siapa ketua',
      'pengurus',
      'bendahara',
      'personel',
      'vokal',
      'terbang',
      'darbuka',
      'pimpinan',
      'pimpinan tertinggi',
      'nakhoda',
      'sopo sing dadi pimpinan',
      'organissasi',
      'administrasi dan booking',
      'booking job',
    ],
    content: `Struktur Kepengurusan Hadroh Khoirunnada:
- Ketua Umum: Muhammad Abi Dzarin (Penanggung jawab umum, arah kebijakan grup, dan pengembangan digital)
- Pengurus Admin: Bertanggung jawab atas administrasi, manajemen jadwal booking acara, dan koordinasi personel
- Bendahara: Mengatur tata kelola kas hadroh, transparansi keuangan, dan operasional perlengkapan
- Personel Resmi: Tim vokal, penabuh terbang, bass, tam, dan darbuka yang berdedikasi menjaga harmoni setiap penampilan.`,
    actions: [
      { label: '📜 Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' },
      { label: '👤 Profil Saya', href: '/app/profile' },
    ],
  },
  {
    id: 'static-cara-pakai',
    title: 'Panduan Cara Menggunakan Aplikasi Khoirunnada',
    category: 'aplikasi',
    keywords: [
      'cara pakai',
      'caraa pake',
      'cara mengguna',
      'bagaimana pakai',
      'bagaimana cara menggunakan',
      'tutorial',
      'panduan',
      'bisa apa aja',
      'fitur',
      'menu',
      'aplikasi',
      'pwa',
      'install',
      'install aplikasi pwa',
      'tutor',
      'nganggo',
      'kepriye carane',
      'pengoperasian',
      'petunjuk operasional',
      'menyimpan qosidah ke dalam daftar koleksi',
    ],
    content: `Panduan Cara Menggunakan Aplikasi Khoirunnada:
1. Beranda: Pantau ringkasan job terdekat, pengumuman hadroh, dan status keaktifan Anda.
2. Katalog Qosidah: Buka tab Qosidah untuk membaca 73 lirik syair qosidah ('Arobiah & Jawa) lengkap teks Arab, Latin, dan terjemahan. Anda dapat menandai bintang favorit.
3. Jadwal Job: Lihat tanggal, lokasi panggung, dan daftar personel yang ditugaskan pada setiap acara.
4. Profil: Atur nama/username, ganti foto profil akun Anda, dan lihat daftar qosidah favorit.
5. Install PWA: Aplikasi dapat dipasang langsung di layar utama smartphone tanpa perlu download dari PlayStore.`,
    actions: [
      { label: '📖 Buka Qosidah', href: '/app/qosidah' },
      { label: '📅 Buka Jadwal Job', href: '/app/jobs' },
      { label: '👤 Pengaturan Profil', href: '/app/profile' },
    ],
  },
  {
    id: 'static-manfaat',
    title: 'Manfaat & Keunggulan Aplikasi Khoirunnada',
    category: 'aplikasi',
    keywords: [
      'manfaat',
      'manffaat',
      'kegunaan',
      'keuntungan',
      'fungsi aplikasi',
      'tujuan',
      'keunggulan',
      'manfaat aplikasi',
      'faedah',
      'gunanya',
      'opo manfaate',
      'nilai guna',
      'keuntungan menggunakan',
      'fungsi utama',
      'manfaat strategis',
    ],
    content: `Manfaat Aplikasi Hadroh Khoirunnada:
- Praktis & Lengkap: Tidak perlu lagi membawa kertas lirik manual; seluruh 73 qosidah siap dibaca kapan saja.
- Koordinasi Cepat: Personel langsung mengetahui jadwal job dan pembagian tugas tanpa miskomunikasi.
- Transparansi Organisasi: Pengelolaan administrasi dan kas hadroh tercatat rapi dan profesional.
- Identitas Digital: Menjadi portal resmi yang memperkuat eksistensi grup seni Hadroh Khoirunnada.`,
    actions: [
      { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
      { label: '👨‍💻 Pembuat Aplikasi', promptText: 'Siapa yang membuat dan mengembangkan aplikasi ini?' },
    ],
  },
  {
    id: 'static-developer',
    title: 'Pengembang & Pembuat Aplikasi Hadroh Khoirunnada',
    category: 'pengembang',
    keywords: [
      'siapa yang membuat',
      'siapa yang kembang',
      'siapa buat',
      'siapa bikin',
      'pembuat',
      'developer',
      'pengembang',
      'pngembang',
      'arsitek',
      'engineer',
      'dev',
      'sing nggawe',
      'arsitek perangkat lunak',
      'pembuat dan pengembang',
      'di balik aplikasi',
    ],
    content: `Pengembang & Pembuat Aplikasi:
Aplikasi web resmi Hadroh Khoirunnada dirancang, dibangun, dan dikembangkan secara mandiri oleh Muhammad Abi Dzarin.

Muhammad Abi Dzarin merupakan Co-Founder Nexarin By-Rins yang berdedikasi dalam pengembangan inovasi teknologi digital dan solusi perangkat lunak.

Di dalam Hadroh Khoirunnada, beliau mengemban amanah sebagai Ketua Umum Hadroh Khoirunnada yang bertanggung jawab penuh atas kepemimpinan grup, arah kebijakan organisasi, serta transformasi inovasi digital demi kemudahan seluruh personel dan pecinta sholawat.`,
    actions: [
      { label: '👤 Siapa Dzarin?', promptText: 'Siapa Dzarin?' },
      { label: '🏛️ Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
      { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
    ],
  },
  {
    id: 'static-dzarin-profile',
    title: 'Profil Publik Resmi Muhammad Abi Dzarin',
    category: 'profil_dzarin',
    isDeepSearch: true,
    keywords: [
      'siapa dzarin',
      'siapa abi dzarin',
      'siapa muhammad abi dzarin',
      'profil dzarin',
      'biodata dzarin',
      'tentang dzarin',
      'nexarin',
      'by-rins',
      'kotanagaya',
      '15 september 2006',
      'dzzarin',
      'muhammad abi dzarin',
      'abi dzarin',
      'dzarin ketua umum',
      'profil lengkap dzarin',
      'محمد أبي ذرين',
      'من هو محمد أبي ذرين',
    ],
    content: `Hasil Penelusuran Profil Publik:
Berdasarkan data yang dihimpun dari beberapa sumber website dan direktori publik melalui penelusuran Google, berikut adalah informasi resmi mengenai Muhammad Abi Dzarin:

Biodata Pribadi:
- Nama Lengkap: Muhammad Abi Dzarin
- Nama Panggilan: Dzarin
- Tempat, Tanggal Lahir: Kotanagaya, 15 September 2006
- Profesi: Software Engineer, Technopreneur, dan Pimpinan Organisasi

Kiprah Profesional & Rekam Jejak:
- Co-Founder Nexarin By-Rins: Berperan aktif dalam merancang dan mengembangkan inovasi produk teknologi digital, perancangan perangkat lunak, serta solusi kreatif berbasis web.
- Ketua Umum Hadroh Khoirunnada: Memegang amanah kepemimpinan tertinggi dalam membina grup seni hadroh, tata kelola manajemen personel, sekaligus arsitek utama (lead engineer) di balik sistem digital Khoirunnada.

Bidang Keahlian & Fokus:
- Fullstack Web & Application Engineering
- Desain Antarmuka & Pengalaman Pengguna (UI/UX Design)
- Manajemen Kepemimpinan Pemuda & Dakwah Seni Budaya Islami

Rangkuman profil ini dihimpun secara objektif dari jejaring web publik di Google guna memberikan informasi yang akurat, transparan, dan profesional.`,
    actions: [
      { label: '👨‍💻 Pembuat Aplikasi', promptText: 'Siapa yang membuat dan mengembangkan aplikasi ini?' },
      { label: '🏛️ Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
      { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
    ],
  },
  {
    id: 'static-keuangan',
    title: 'Informasi Kas & Keuangan Hadroh Khoirunnada',
    category: 'organisasi',
    keywords: [
      'uang kas',
      'kas hadroh',
      'keuangan',
      'saldo kas',
      'catatan kas',
      'laporan kas',
      'laporan keuangan',
      'transparansi keuangan',
      'kas masuk',
      'kas keluar',
      'duit kas',
      'keuangan hadroh',
    ],
    content: `Pengelolaan Kas & Keuangan Hadroh Khoirunnada:
Tata kelola keuangan dan kas Hadroh Khoirunnada dikelola secara amanah, tertib, dan transparan oleh Bendahara Hadroh Khoirunnada.

Pencatatan kas mencakup pemasukan (kas masuk) dari bisyaroh penampilan majelis, infaq, serta pengeluaran operasional (perawatan alat hadroh, perlengkapan, dan operasional majelis).

Seluruh rekapitulasi transaksi kas dapat dipantau langsung melalui modul Keuangan pada aplikasi ini oleh personel dan pengurus yang berwenang.`,
    actions: [
      { label: '?? Modul Keuangan', href: '/app/finance' },
      { label: '?? Struktur Pengurus', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
      { label: '?? Cek Jadwal Job', href: '/app/jobs' },
    ],
  },
];

/**
 * Mencari artikel pengetahuan statis berdasarkan kecocokan keyword dan judul.
 */
export function searchStaticKnowledge(
  rawQuery: string,
  minThreshold = 0.5
): RetrievalResult<StaticKnowledgeArticle>[] {
  const normQuery = normalizeText(rawQuery).toLowerCase().trim();
  if (normQuery.length < 2) return [];

  const results: RetrievalResult<StaticKnowledgeArticle>[] = [];

  for (const article of STATIC_KNOWLEDGE_ARTICLES) {
    let bestScore = 0;
    let bestStrategy = 'keyword_match';
    let matchedKeyword = '';

    for (const kw of article.keywords) {
      const normKw = normalizeText(kw).toLowerCase().trim();

      // 1. Exact match dengan query
      if (normQuery === normKw) {
        bestScore = 1.0;
        bestStrategy = 'exact_title';
        matchedKeyword = kw;
        break;
      }

      // 2. Query mengandung keyword utuh (dengan batas kata jika keyword pendek)
      const hasWord = normKw.length <= 3 
        ? new RegExp(`(?:^|\\s)${normKw}(?:$|\\s)`, 'i').test(normQuery)
        : normQuery.includes(normKw);

      if (hasWord) {
        // Bobot ditingkatkan sesuai kepanjangan frasa spesifik
        const score = 0.85 + Math.min(0.14, normKw.length * 0.01);
        if (score > bestScore) {
          bestScore = score;
          bestStrategy = 'phrase_match';
          matchedKeyword = kw;
        }
      } else if (normKw.includes(normQuery) && normQuery.length >= 4) {
        const score = 0.75 + Math.min(0.1, normQuery.length * 0.01);
        if (score > bestScore) {
          bestScore = score;
          bestStrategy = 'prefix_title';
          matchedKeyword = kw;
        }
      } else {
        // 3. String similarity
        const sim = stringSimilarity(normQuery, normKw);
        if (sim > bestScore && sim >= 0.72) {
          bestScore = sim;
          bestStrategy = 'fuzzy_title';
          matchedKeyword = kw;
        }
      }
    }

    if (bestScore >= minThreshold) {
      results.push({
        item: article,
        score: Math.min(1.0, bestScore),
        confidence: bestScore >= 0.85 ? 'high' : bestScore >= 0.7 ? 'medium' : 'low',
        strategy: bestStrategy,
        evidence: [
          {
            field: 'keywords',
            strategy: bestStrategy,
            score: bestScore,
            matchedTerm: matchedKeyword,
            snippet: article.title,
          },
        ],
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
