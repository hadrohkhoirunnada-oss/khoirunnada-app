import type { Qosidah, Job, Profile } from '@/lib/types';

export interface AIContext {
  currentUser?: Profile;
  qosidahs?: Qosidah[];
  jobs?: Job[];
  favorites?: string[];
}

export interface AIAction {
  label: string;
  href?: string;
  promptText?: string;
}

export interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: AIAction[];
}

// Basis Pengetahuan Internal Hadroh Khoirunnada (KNOWLEDGE BASE)
// Tanpa simbol * sama sekali
const KNOWLEDGE_SEJARAH = `Sejarah Hadroh Khoirunnada:
Grup seni hadroh Khoirunnada didirikan sebagai wadah syiar dakwah Islamiyah melalui alunan musik rebana dan qosidah sholawat. Nama "Khoirunnada" bermakna "Nada Kebaikan / Suara Kebaikan".

Berangkat dari kebersamaan dan kecintaan para pemuda terhadap sholawat Nabi Muhammad SAW, Hadroh Khoirunnada aktif melayani undangan majelis maulid, peringatan hari besar Islam (PHBI), walimatul 'ursy, serta pengajian akbar dengan perpaduan qosidah klasik 'Arobiah dan tembang sholawat Jawa.`;

const KNOWLEDGE_STRUKTUR = `Struktur Kepengurusan Hadroh Khoirunnada:
- Ketua Umum: Dzarin (Penanggung jawab umum, arah kebijakan grup, dan pengembangan digital)
- Pengurus Admin: Bertanggung jawab atas administrasi, manajemen jadwal booking acara, dan koordinasi personel
- Bendahara: Mengatur tata kelola kas hadroh, transparansi keuangan, dan operasional perlengkapan
- Personel Resmi: Tim vokal, penabuh terbang, bass, tam, dan darbuka yang berdedikasi menjaga harmoni setiap penampilan.`;

const KNOWLEDGE_CARA_PAKAI = `Panduan Cara Menggunakan Aplikasi Khoirunnada:
1. Beranda: Pantau ringkasan job terdekat, pengumuman hadroh, dan status keaktifan Anda.
2. Katalog Qosidah: Buka tab Qosidah untuk membaca 73 lirik syair qosidah ('Arobiah & Jawa) lengkap teks Arab, Latin, dan terjemahan. Anda dapat menandai bintang favorit.
3. Jadwal Job: Lihat tanggal, lokasi panggung, dan daftar personel yang ditugaskan pada setiap acara.
4. Profil: Atur nama/username, ganti foto profil akun Anda, dan lihat daftar qosidah favorit.
5. Install PWA: Aplikasi dapat dipasang langsung di layar utama smartphone tanpa perlu download dari PlayStore.`;

const KNOWLEDGE_MANFAAT = `Manfaat Aplikasi Hadroh Khoirunnada:
- Praktis & Lengkap: Tidak perlu lagi membawa kertas lirik manual; seluruh 73 qosidah siap dibaca kapan saja.
- Koordinasi Cepat: Personel langsung mengetahui jadwal job dan pembagian tugas tanpa miskomunikasi.
- Transparansi Organisasi: Pengelolaan administrasi dan kas hadroh tercatat rapi dan profesional.
- Identitas Digital: Menjadi portal resmi yang memperkuat eksistensi grup seni Hadroh Khoirunnada.`;

const KNOWLEDGE_DEVELOPER = `Pengembang & Pembuat Aplikasi:
Aplikasi web ini dirancang, dibangun, dan dikembangkan secara mandiri oleh Dzarin (Ketua Umum Hadroh Khoirunnada) bersama tim pengurus hadroh.

Aplikasi ini dibangun menggunakan teknologi modern Next.js, React, Supabase, dan arsitektur PWA offline-ready untuk memberikan kemudahan terbaik bagi seluruh personel Khoirunnada.`;

// Helper untuk memastikan tidak ada simbol asterik (*) sama sekali
function sanitize(result: { text: string; actions?: AIAction[] }): { text: string; actions?: AIAction[] } {
  return {
    ...result,
    text: result.text.replace(/\*/g, ''),
  };
}

// Fungsi Pemrosesan Bahasa Alami (NLP Engine Internal Khoirunnada)
export function processKhoirunnadaAI(userInput: string, context: AIContext): {
  text: string;
  actions?: AIAction[];
} {
  const query = userInput.toLowerCase().trim();
  const qosidahs = context.qosidahs || [];
  const jobs = context.jobs || [];
  const currentUser = context.currentUser;
  const favorites = context.favorites || [];

  // 1. Sapaan & Salam Islami
  if (
    query.includes('assalamu') ||
    query.includes('ass') ||
    query.includes('kulonuwun') ||
    query.includes('halo') ||
    query.includes('hai') ||
    query.includes('pagi') ||
    query.includes('siang') ||
    query.includes('malam')
  ) {
    const userName = currentUser?.name ? `, Akhi ${currentUser.name}` : '';
    return sanitize({
      text: `Wa'alaikumussalam warahmatullah wabarakatuh${userName}! \n\nSaya Khoirunnada AI, asisten cerdas resmi Hadroh Khoirunnada. Ada yang bisa saya bantu hari ini seputar qosidah, jadwal job, panduan aplikasi, atau organisasi?`,
      actions: [
        { label: '📖 Cari Qosidah', promptText: 'Carikan saya qosidah' },
        { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
        { label: '🏛️ Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' },
      ],
    });
  }

  // 2. Siapa yang membuat / Pengembang aplikasi
  if (
    query.includes('siapa yang membuat') ||
    query.includes('siapa yang kembang') ||
    query.includes('siapa buat') ||
    query.includes('siapa bikin') ||
    query.includes('pembuat') ||
    query.includes('developer') ||
    query.includes('pengembang') ||
    query.includes('siapa dzarin')
  ) {
    return sanitize({
      text: KNOWLEDGE_DEVELOPER,
      actions: [
        { label: '🏛️ Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
        { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
      ],
    });
  }

  // 3. Cara Menggunakan Aplikasi
  if (
    query.includes('cara mengguna') ||
    query.includes('cara pakai') ||
    query.includes('bagaimana pakai') ||
    query.includes('tutorial') ||
    query.includes('panduan') ||
    query.includes('bisa apa aja') ||
    query.includes('fitur')
  ) {
    return sanitize({
      text: KNOWLEDGE_CARA_PAKAI,
      actions: [
        { label: '📖 Buka Qosidah', href: '/app/qosidah' },
        { label: '📅 Buka Jadwal Job', href: '/app/jobs' },
        { label: '👤 Pengaturan Profil', href: '/app/profile' },
      ],
    });
  }

  // 4. Manfaat Aplikasi
  if (
    query.includes('manfaat') ||
    query.includes('kegunaan') ||
    query.includes('keuntungan') ||
    query.includes('fungsi aplikasi') ||
    query.includes('tujuan')
  ) {
    return sanitize({
      text: KNOWLEDGE_MANFAAT,
      actions: [
        { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
        { label: 'Siapa Pembuatnya', promptText: 'Siapa yang membuat aplikasi ini?' },
      ],
    });
  }

  // 5. Sejarah Khoirunnada
  if (
    query.includes('sejarah') ||
    query.includes('asal usul') ||
    query.includes('latar belakang') ||
    query.includes('kapan berdiri') ||
    query.includes('arti nama') ||
    query.includes('makna nama')
  ) {
    return sanitize({
      text: KNOWLEDGE_SEJARAH,
      actions: [
        { label: '👥 Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
        { label: '📖 Daftar Qosidah', href: '/app/qosidah' },
      ],
    });
  }

  // 6. Struktur Organisasi Khoirunnada
  if (
    query.includes('struktur') ||
    query.includes('organisasi') ||
    query.includes('ketua') ||
    query.includes('siapa ketua') ||
    query.includes('pengurus') ||
    query.includes('bendahara')
  ) {
    return sanitize({
      text: KNOWLEDGE_STRUKTUR,
      actions: [
        { label: '📜 Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' },
        { label: '👤 Profil Saya', href: '/app/profile' },
      ],
    });
  }

  // 7. Jadwal Job & Penugasan
  if (
    query.includes('jadwal') ||
    query.includes('job') ||
    query.includes('manggung') ||
    query.includes('tampil') ||
    query.includes('agenda') ||
    query.includes('latihan')
  ) {
    if (jobs.length === 0) {
      return sanitize({
        text: `Saat ini belum ada jadwal job terdekat yang diagendakan di sistem.\n\nPengurus hadroh akan memperbarui halaman Jadwal Job segera setelah ada konfirmasi undangan baru.`,
        actions: [{ label: '📅 Lihat Halaman Jadwal', href: '/app/jobs' }],
      });
    }

    const upcomingJobs = jobs
      .filter((j) => j.status !== 'cancelled')
      .slice(0, 3);

    const jobsText = upcomingJobs
      .map(
        (j, idx) =>
          `${idx + 1}. ${j.title}\n   - Tanggal: ${new Date(j.event_date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}\n   - Lokasi: ${j.location || 'Menunggu konfirmasi'}\n   - Status: ${j.status.toUpperCase()}`
      )
      .join('\n\n');

    return sanitize({
      text: `Berikut adalah jadwal job Hadroh Khoirunnada terdekat:\n\n${jobsText}\n\nUntuk detail penugasan personel dan kelengkapan alat, silakan buka menu Jadwal Job.`,
      actions: [{ label: '📅 Buka Semua Jadwal Job', href: '/app/jobs' }],
    });
  }

  // 8. Qosidah Favorit Pengguna
  if (
    query.includes('favorit') ||
    query.includes('lagu favorit') ||
    query.includes('syair favorit')
  ) {
    const favCount = favorites.length;
    if (favCount === 0) {
      return sanitize({
        text: `Anda belum memiliki koleksi qosidah favorit.\n\nBuka katalog Qosidah, pilih lagu yang Anda sukai, lalu ketuk ikon tanda hati (Favorit) agar tersimpan di koleksi pribadi Anda!`,
        actions: [{ label: '📖 Cari Qosidah Sekarang', href: '/app/qosidah' }],
      });
    }

    return sanitize({
      text: `Alhamdulillah, Anda telah menyimpan ${favCount} Qosidah Favorit di akun Anda. Anda dapat membuka dan melantunkannya kapan saja!`,
      actions: [
        { label: '❤️ Buka Qosidah Favorit', href: '/app/profile/favorites' },
        { label: '📖 Tambah Qosidah Lain', href: '/app/qosidah' },
      ],
    });
  }

  // 9. Pencarian Qosidah (Semantic & Fuzzy Search dari 73 Lagu)
  // Menangkap pola: "carikan qosidah X", "qosidah X", "lirik X", atau pencarian judul langsung
  const cleanSearchQuery = query
    .replace(/^carikan\s+(saya\s+)?(qosidah\s+|sholawat\s+|lagu\s+|syair\s+)?/i, '')
    .replace(/^cari\s+(qosidah\s+|sholawat\s+|lagu\s+|syair\s+)?/i, '')
    .replace(/^(qosidah|sholawat|syair|lirik)\s+/i, '')
    .trim();

  if (cleanSearchQuery.length >= 2 && qosidahs.length > 0) {
    const matches = qosidahs.filter((q) => {
      const title = q.title.toLowerCase();
      const alt = (q.alternate_title || '').toLowerCase();
      const latin = q.latin_text.toLowerCase();
      const tags = (q.tags || []).join(' ').toLowerCase();

      return (
        title.includes(cleanSearchQuery) ||
        alt.includes(cleanSearchQuery) ||
        cleanSearchQuery.includes(title) ||
        tags.includes(cleanSearchQuery) ||
        latin.includes(cleanSearchQuery)
      );
    });

    if (matches.length > 0) {
      const topMatches = matches.slice(0, 3);
      const listText = topMatches
        .map((m, idx) => {
          const preview = m.latin_text.split('\n').filter(Boolean).slice(0, 2).join(' / ');
          return `${idx + 1}. ${m.title} (${m.category_name})\n   Bait awalan: "${preview}..."`;
        })
        .join('\n\n');

      return sanitize({
        text: `Alhamdulillah, saya menemukan ${matches.length} qosidah yang cocok untuk pencarian "${cleanSearchQuery}":\n\n${listText}\n\nSilakan ketuk tombol di bawah untuk langsung membuka lirik lengkapnya:`,
        actions: topMatches.map((m) => ({
          label: `📖 Buka ${m.title}`,
          href: `/app/qosidah/${m.id}`,
        })),
      });
    }
  }

  // 10. Pertanyaan Umum Lainnya seputar Khoirunnada / Hadroh
  if (query.includes('qosidah') || query.includes('sholawat') || query.includes('lagu')) {
    return sanitize({
      text: `Di aplikasi Hadroh Khoirunnada terdapat ${qosidahs.length || 73} koleksi qosidah resmi yang terbagi menjadi:\n- Qosidah 'Arobiah (syair bahasa Arab klasik dan populer)\n- Qosidah Jawa (tembang nasihat sholawat bahasa Jawa seperti Padhang Bulan, Sluku-Sluku Bathok, dll.)\n\nSebutkan judul qosidah yang ingin Anda cari (misal: Busyro Lana, Al Hijrotu, Mughrom, dll.)!`,
      actions: [
        { label: '📖 Jelajahi Semua Qosidah', href: '/app/qosidah' },
        { label: '🔍 Cari Busyro Lana', promptText: 'Carikan qosidah Busyro Lana' },
        { label: '🔍 Cari Ya Hanana', promptText: 'Carikan qosidah Ya Hanana' },
      ],
    });
  }

  // 11. Ucapan Terima Kasih
  if (query.includes('makasih') || query.includes('terima kasih') || query.includes('syukron')) {
    return sanitize({
      text: `Sama-sama! Senang bisa membantu Anda. Jangan ragu bertanya lagi jika butuh bantuan seputar Hadroh Khoirunnada. Berkah selalu untuk Anda dan keluarga!`,
      actions: [
        { label: '📖 Cari Qosidah Lain', href: '/app/qosidah' },
        { label: '📅 Cek Jadwal Job', href: '/app/jobs' },
      ],
    });
  }

  // 12. Fallback Respons Cerdas
  return sanitize({
    text: `Maaf, saya belum memahami pertanyaan Anda secara spesifik. Sebagai Khoirunnada AI, saat ini saya memiliki pengetahuan lengkap seputar:\n\n- 📖 Pencarian 73 Qosidah (misal: "Carikan qosidah Mughrom")\n- 📅 Informasi Jadwal Job Hadroh\n- 💡 Panduan & Cara Pakai Aplikasi\n- 🏆 Manfaat Aplikasi Khoirunnada\n- 👨‍💻 Pengembang Aplikasi\n- 📜 Sejarah & Makna Nama Khoirunnada\n- 👥 Struktur Organisasi\n\nSilakan pilih salah satu topik di bawah atau ketik pertanyaan lain!`,
    actions: [
      { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
      { label: '🏆 Manfaat Aplikasi', promptText: 'Apa saja manfaat aplikasi ini?' },
      { label: '📜 Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' },
      { label: '👥 Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
    ],
  });
}
