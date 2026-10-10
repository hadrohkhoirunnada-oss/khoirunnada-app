import type { Qosidah, Job, Profile } from '@/lib/types';

import type { AIConversationMemory, EntityReference } from "./ai/memory-types.ts";
import { processWithSecurityGate } from "./ai/security-gateway.ts";
import { damerauLevenshtein } from './ai/matcher.ts';
import { STATIC_KNOWLEDGE_ARTICLES } from './ai/static-knowledge.ts';

export interface AIContext {
  currentUser?: Profile;
  qosidahs?: Qosidah[];
  categories?: import('@/lib/types').QosidahCategory[];
  jobs?: Job[];
  favorites?: string[];
  memory?: AIConversationMemory;
  enableV2Engine?: boolean;
}

export interface ProcessAIOptions {
  enableV2Engine?: boolean;
  timeZone?: string;
  referenceDate?: Date;
  seed?: number;
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
  visualization?: 'organization-chart';
}

export interface AIResponse {
  text: string;
  actions?: AIAction[];
  isDeepSearch?: boolean;
  intent?: string;
  targetEntity?: EntityReference;
  visualization?: 'organization-chart';
}

// Basis Pengetahuan Internal Hadroh Khoirunnada (KNOWLEDGE BASE)
// Tanpa simbol * sama sekali
const KNOWLEDGE_SEJARAH = 'Informasi mengenai sejarah Hadroh Khoirunnada sedang disusun dan diverifikasi dengan baik oleh developer.';

const KNOWLEDGE_STRUKTUR = `Struktur Organisasi Hadroh Khoirunnada:
- Penanggung Jawab: Muhammad Abi Dzarin
- Ketua: Anwarul Mu'arif
- Bendahara: Restu
- Sekretaris: Haniyah
- Pendamping: Muhammad Ali Mutohar`;

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
Aplikasi web resmi Hadroh Khoirunnada dirancang, dibangun, dan dikembangkan secara mandiri oleh Muhammad Abi Dzarin.

Muhammad Abi Dzarin merupakan Co-Founder Nexarin By-Rins yang berdedikasi dalam pengembangan inovasi teknologi digital dan solusi perangkat lunak.

Di dalam Hadroh Khoirunnada, beliau mengemban amanah sebagai Penanggung Jawab Khoirunnada yang bertanggung jawab penuh atas kepemimpinan grup, arah kebijakan organisasi, serta transformasi inovasi digital demi kemudahan seluruh personel dan pecinta sholawat.`;

const KNOWLEDGE_DZARIN_PROFILE = `Hasil Penelusuran Profil Publik:
Berdasarkan data yang dihimpun dari beberapa sumber website dan direktori publik melalui penelusuran Google, berikut adalah informasi resmi mengenai Muhammad Abi Dzarin:

Biodata Pribadi:
- Nama Lengkap: Muhammad Abi Dzarin
- Nama Panggilan: Dzarin
- Tempat, Tanggal Lahir: Kotanagaya, 15 September 2006
- Profesi: Software Engineer, Technopreneur, dan Pimpinan Organisasi

Kiprah Profesional & Rekam Jejak:
- Co-Founder Nexarin By-Rins: Berperan aktif dalam merancang dan mengembangkan inovasi produk teknologi digital, perancangan perangkat lunak, serta solusi kreatif berbasis web.
- Penanggung Jawab Khoirunnada: Memegang amanah kepemimpinan tertinggi dan penanggung jawab utama dalam membina grup seni hadroh, tata kelola manajemen personel, sekaligus arsitek utama di balik sistem digital Khoirunnada.

Bidang Keahlian & Fokus:
- Fullstack Web & Application Engineering
- Desain Antarmuka & Pengalaman Pengguna (UI/UX Design)
- Manajemen Kepemimpinan Pemuda & Dakwah Seni Budaya Islami

Rangkuman profil ini dihimpun secara objektif dari jejaring web publik di Google guna memberikan informasi yang akurat, transparan, dan profesional.`;

// Helper untuk memastikan tidak ada simbol asterik (*) sama sekali
function sanitize(result: AIResponse): AIResponse {
  return {
    ...result,
    text: result.text.replace(/\*/g, ''),
    actions: result.actions?.map((a) => ({
      ...a,
      label: a.label.replace(/\*/g, ''),
      promptText: a.promptText ? a.promptText.replace(/\*/g, '') : undefined,
    })),
  };
}

function normalizeGreetingInput(input: string): string {
  return input
    .normalize('NFC')
    .toLocaleLowerCase('id-ID')
    .replace(/[.!?,;:'"`~()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildOpeningResponse(userInput: string, context: AIContext): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const words = query.split(' ').filter(Boolean);
  const greetingWords = new Set([
    'halo', 'hello', 'hallo', 'hai', 'hi', 'hey', 'assalamualaikum',
    'assalamu alaikum', 'assalamuallaikum', 'assalamualaikum wr wb',
    'assalamu alaikum wr wb', 'kulonuwun', 'pagi', 'siang', 'sore', 'malam',
  ]);
  const isGreeting = greetingWords.has(query) ||
    (words.length <= 4 && /^(hai|hi|hey|halo|hello|hallo)( ai| khoirunnada)?$/.test(query));

  if (isGreeting) {
    const isIslamicGreeting = query.startsWith('assalam');
    const userName = context.currentUser?.name ? `, ${context.currentUser.name}` : '';
    return sanitize({
      text: isIslamicGreeting
        ? `Wa'alaikumussalam warahmatullahi wabarakatuh${userName}! Saya Khoirunnada AI. Ada yang bisa saya bantu?`
        : `Halo${userName}! Saya Khoirunnada AI. Ada yang bisa saya bantu hari ini?`,
      actions: [
        { label: '📖 Cari Qosidah', promptText: 'Carikan saya qosidah' },
        { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
      ],
    });
  }

  return undefined;
}

function buildDeveloperSupportResponse(userInput: string): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const asksForChangeOrReportsProblem =
    /\b(bug|error|eror|kesalahan|bermasalah|masalah|gangguan|rusak|tidak berfungsi|gagal|tidak bisa|nggak bisa|gabisa|fitur baru|tambah(?:kan)? fitur|menambahkan fitur|permintaan fitur|usul(?:an)? fitur|saran fitur|perbaiki|dibetulkan|koreksi|salah lirik|liriknya salah|tambah(?:kan)? qosidah|qosidah baru|lagu baru)\b/.test(query);

  return asksForChangeOrReportsProblem
    ? sanitize({
        text: 'Untuk melaporkan bug atau masalah aplikasi, mengusulkan fitur baru, atau meminta penambahan maupun koreksi qosidah, silakan hubungi developer/pengembang aplikasi melalui kontak berikut:\n\nWhatsApp: 085173057576\nEmail: nexarinbyrins@gmail.com\n\nSertakan detail kendala atau permintaan agar dapat ditindaklanjuti.',
        actions: [{ label: '👨‍💻 Informasi Developer', promptText: 'Siapa developer aplikasi Khoirunnada?' }],
      })
    : undefined;
}

function buildAssistantIdentityResponse(userInput: string): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const asksAssistantIdentity =
    /\b(kamu siapa|siapa kamu|anda siapa|siapa anda|kamu itu siapa|kamu ini siapa|anda itu siapa|anda ini siapa|siapa sih kamu|kamu sebenarnya siapa|siapa dirimu|identitas kamu|identitas anda|tentang kamu|tentang khoirunnada ai|khoirunnada ai itu siapa|apa itu khoirunnada ai|apa tugas kamu|apa tugas anda|tugas kamu apa|tugas anda apa|fungsi kamu|fungsi anda|peran kamu|peran anda|kamu bisa apa|anda bisa apa|kamu ini ai apa)\b/.test(query);

  if (!asksAssistantIdentity) return undefined;

  return sanitize({
    text: `Saya Khoirunnada AI, asisten digital resmi Hadroh Khoirunnada. Saya dirancang untuk membantu personel memperoleh informasi dan menggunakan layanan yang tersedia di aplikasi dengan lebih mudah.

Yang dapat saya bantu antara lain:
- Menemukan qosidah dalam katalog dan membantu membuka lirik yang tersedia.
- Memberikan informasi jadwal job yang tercatat di aplikasi.
- Menjelaskan panduan penggunaan dan fitur aplikasi.
- Menyampaikan informasi umum tentang Hadroh Khoirunnada yang tersedia dalam basis pengetahuan saya.

Jawaban saya mengacu pada data aplikasi dan informasi yang telah disediakan. Jika informasi belum tersedia atau pertanyaan masih belum jelas, saya akan meminta penjelasan atau menyarankan langkah yang sesuai, bukan mengarang jawaban. Untuk melaporkan bug, meminta fitur baru, atau mengusulkan penambahan maupun koreksi data qosidah, silakan hubungi developer/pengembang aplikasi melalui kanal resmi yang tersedia.`,
    actions: [
      { label: '📖 Cari Qosidah', promptText: 'Carikan saya qosidah' },
      { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
      { label: '💡 Panduan Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
    ],
  });
}

function buildHistoryStatusResponse(userInput: string): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const words = query.match(/[\p{L}\p{N}]+/gu) || [];
  const historyTerms = ['sejarah', 'histori', 'asal', 'usul', 'latar', 'berdiri', 'didirikan'];
  const organizationTerms = ['khoirunnada', 'hadroh', 'hadrah', 'organisasi'];
  const typoDistance = (word: string, candidates: string[]) => {
    if (word.length < 5) return Number.POSITIVE_INFINITY;
    return Math.min(...candidates.map((candidate) => damerauLevenshtein(word, candidate)));
  };
  const exactHistoryQuestion = words.some((word) => historyTerms.includes(word));
  const historyTypo = words.some((word) => typoDistance(word, historyTerms) > 0 && typoDistance(word, historyTerms) <= 2);
  const exactOrganizationMention = words.some((word) => organizationTerms.includes(word)) ||
    /\b(grup kami|grup ini|organisasi ini)\b/.test(query);
  const organizationTypo = words.some((word) => typoDistance(word, organizationTerms) > 0 && typoDistance(word, organizationTerms) <= 2);
  const mentionsKhoirunnada = exactOrganizationMention || organizationTypo;
  const namesAnotherHistoryTopic = /\b(islam|indonesia|dunia|nabi|rasul|kerajaan|perang|peradaban)\b/.test(query);
  const isShortUnspecifiedHistoryQuestion = words.length <= 5;
  const refersToHistory = exactHistoryQuestion || historyTypo;

  if (!refersToHistory || (!mentionsKhoirunnada && (namesAnotherHistoryTopic || !isShortUnspecifiedHistoryQuestion))) {
    return undefined;
  }

  if (historyTypo || organizationTypo) {
    return sanitize({
      text: 'Maaf, saya belum yakin dengan maksud pertanyaan Anda. Apakah yang Anda tanyakan adalah sejarah Hadroh Khoirunnada? Silakan konfirmasi atau tulis ulang pertanyaannya agar saya tidak salah memahami.',
      actions: [{ label: '📜 Tanya Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' }],
    });
  }

  return sanitize({
    text: 'Informasi mengenai sejarah Hadroh Khoirunnada sedang disusun dan diverifikasi dengan baik oleh developer. Setelah materi sejarahnya siap, informasi tersebut akan tersedia agar dapat disampaikan secara akurat. Terima kasih atas pengertiannya.',
    actions: [{ label: '👨‍💻 Hubungi Developer', promptText: 'Siapa developer aplikasi Khoirunnada?' }],
  });
}

function buildDomainTypoResponse(userInput: string, context: AIContext): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const words = query.match(/[\p{L}\p{N}]+/gu) || [];
  const coreTerms = [
    'khoirunnada', 'hadroh', 'hadrah', 'qosidah', 'qasidah', 'sholawat', 'jadwal', 'job',
    'manggung', 'agenda', 'latihan', 'favorit', 'lirik', 'syair', 'terjemahan', 'sejarah',
    'histori', 'struktur', 'organisasi', 'bagan', 'pengurus', 'bendahara', 'personel', 'anggota',
    'panduan', 'tutorial', 'aplikasi', 'fitur', 'manfaat', 'kegunaan', 'developer',
    'pengembang', 'pembuat', 'profil', 'keuangan', 'kas', 'booking', 'lokasi', 'terdekat',
    'berapa', 'apakah', 'bagaimana', 'kapan', 'siapa', 'carikan', 'cari', 'tampilkan',
    'berikan', 'tolong', 'jelaskan', 'sebutkan', 'makna', 'arti', 'lagu', 'qosidah',
    'jawa', 'indonesia', 'arobiah', 'arab', 'kategori', 'jumlah', 'semua', 'seluruh', 'daftar', 'koleksi',
  ];
  const articleTerms = STATIC_KNOWLEDGE_ARTICLES.flatMap((article) => [article.title, ...article.keywords]);
  const qosidahTerms = (context.qosidahs || []).flatMap((qosidah) => [
    qosidah.title,
    qosidah.alternate_title || '',
    qosidah.category_name || '',
    ...(qosidah.tags || []),
  ]);
  const commonWords = new Set([
    'saya', 'kami', 'kamu', 'anda', 'yang', 'ini', 'itu', 'ada', 'bisa', 'akan', 'untuk',
    'dari', 'pada', 'dengan', 'oleh', 'atau', 'juga', 'saja', 'mana', 'dong', 'sih',
    'jawa', 'indonesia', 'arab', 'arobiah', 'kategori', 'jumlah', 'semua', 'seluruh', 'daftar', 'koleksi',
  ]);
  const domainTerms = [...coreTerms, ...articleTerms, ...qosidahTerms]
    .flatMap((term) => term.toLocaleLowerCase('id-ID').match(/[\p{L}\p{N}]+/gu) || [])
    .filter((term) => !['organissasi', 'caraa', 'kembang'].includes(term))
    .filter((term) => term.length >= 4);
  const uniqueTerms = [...new Set(domainTerms)];
  const coreTermSet = new Set(coreTerms);
  const isWithinDomain = words.some((word) => coreTermSet.has(word)) ||
    words.some((word) => uniqueTerms.some((term) => {
      if (word === term || word.length < 4 || commonWords.has(word)) return false;
      const distance = damerauLevenshtein(word, term);
      return distance > 0 && distance <= (Math.max(word.length, term.length) >= 9 ? 2 : 1);
    }));

  if (!isWithinDomain) return undefined;

  const typoCandidates = words.flatMap((word) => {
    if (word.length < 4 || commonWords.has(word) || uniqueTerms.includes(word)) return [];
    const matches = uniqueTerms
      .map((term) => ({ term, distance: damerauLevenshtein(word, term) }))
      .filter(({ term, distance }) => distance > 0 && distance <= (Math.max(word.length, term.length) >= 9 ? 2 : 1))
      .sort((a, b) => a.distance - b.distance);
    if (matches.length === 0) return [];
    const bestDistance = matches[0].distance;
    const bestTerms = [...new Set(matches.filter((match) => match.distance === bestDistance).map((match) => match.term))];
    return [{ word, suggestion: bestTerms.length === 1 ? bestTerms[0] : undefined }];
  });

  if (typoCandidates.length === 0) return undefined;

  const firstTypo = typoCandidates[0];
  const clarification = firstTypo.suggestion
    ? `Saya mendeteksi kemungkinan salah ketik pada "${firstTypo.word}". Apakah yang Anda maksud "${firstTypo.suggestion}"? Mohon konfirmasi atau tulis ulang pertanyaannya agar saya tidak salah memahami.`
    : `Saya mendeteksi kemungkinan salah ketik pada "${firstTypo.word}" dan belum yakin kata yang dimaksud. Mohon tulis ulang atau jelaskan pertanyaan Anda agar saya dapat membantu dengan tepat.`;

  return sanitize({
    text: clarification,
    actions: [{ label: '✍️ Tulis Ulang Pertanyaan', promptText: 'Saya ingin menulis ulang pertanyaan saya.' }],
  });
}

function buildQosidahCatalogResponse(userInput: string, context: AIContext): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const containsQosidahTerm = /\b(qosidah|qasidah|sholawat|syair)\b/.test(query);
  const hasRecentList = [...(context.memory?.turns || [])].some((turn) =>
    /\b(qosidah|qasidah|sholawat)\b/.test(normalizeGreetingInput(turn.userQuery)) &&
    /\b(semua|seluruh|daftar|list|tampilkan|judul|cari|carikan)\b/.test(normalizeGreetingInput(turn.userQuery))
  );
  const asksForLyrics = /\b(lirik|liriknya|teks|bait|arti|artinya|terjemahan|makna)\b/.test(query);
  const qosidahs = context.qosidahs ?? [];
  const normalizedQuery = ` ${query.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
  const mentionsSong = qosidahs.some((song) => [song.title, song.alternate_title || ''].some((title) => {
    const normalizedTitle = normalizeGreetingInput(title).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    return normalizedTitle.length >= 3 && normalizedQuery.includes(` ${normalizedTitle} `);
  }));
  if (!containsQosidahTerm && !(asksForLyrics && (hasRecentList || mentionsSong))) return undefined;

  const categories = context.categories ?? [...new Map(qosidahs.filter((song) => song.category_id && song.category_name).map((song) => [song.category_id, { id: song.category_id, name: song.category_name! }])).values()];
  if (asksForLyrics) {
    const normalizeTitle = (value: string) => normalizeGreetingInput(value).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const selected = new Map<string, Qosidah>();
    for (const song of qosidahs) {
      const titleVariants = [song.title, song.alternate_title || '']
        .map(normalizeTitle)
        .filter((title) => title.length >= 3);
      if (titleVariants.some((title) => ` ${query} `.includes(` ${title} `))) selected.set(song.id, song);
    }

    const recentListQuery = [...(context.memory?.turns || [])]
      .reverse()
      .find((turn) => /\b(qosidah|qasidah|sholawat)\b/.test(normalizeGreetingInput(turn.userQuery)) && /\b(semua|seluruh|daftar|list|tampilkan|judul|cari|carikan)\b/.test(normalizeGreetingInput(turn.userQuery)));
    const ordinalNumbers = query.match(/\b\d+\b/g)?.map(Number) || [];
    if (recentListQuery && ordinalNumbers.length > 0) {
      const previousQuery = normalizeGreetingInput(recentListQuery.userQuery);
      const previousCategory = categories.find((item) => {
        const name = normalizeTitle(item.name);
        return previousQuery.includes(name) || (item.id === 'qosidah-arobiah' && /\b(arobiah|arab|arabiah)\b/.test(previousQuery));
      });
      const orderedSongs = previousCategory
        ? qosidahs.filter((song) => song.category_id === previousCategory.id)
        : qosidahs;
      for (const ordinal of ordinalNumbers) {
        const song = orderedSongs[ordinal - 1];
        if (song) selected.set(song.id, song);
      }
    }

    if (selected.size === 0) {
      return sanitize({
        text: 'Tentu, saya bisa menampilkan lirik lengkap dan artinya. Saya belum dapat memastikan judul qosidah yang dimaksud. Silakan tulis judul qosidahnya, atau sebutkan nomor dari daftar yang baru saja ditampilkan.',
        actions: [{ label: '📚 Lihat Daftar Qosidah', href: '/app/qosidah' }],
        intent: 'clarify_qosidah_lyrics',
      });
    }

    const lyricSections = [...selected.values()].map((song) => [
      `${song.title}${song.category_name ? ` — ${song.category_name}` : ''}`,
      'Teks Arab:',
      song.arabic_text || 'Teks Arab tidak tersedia dalam data.',
      'Lirik Latin:',
      song.latin_text || 'Lirik Latin tidak tersedia dalam data.',
      'Arti / Terjemahan:',
      song.translation || 'Terjemahan belum tersedia dalam data.',
    ].join('\n'));
    const primarySong = selected.size === 1 ? [...selected.values()][0] : undefined;
    return sanitize({
      text: `Berikut lirik lengkap dan arti dari ${selected.size === 1 ? 'qosidah yang Anda pilih' : `${selected.size} qosidah yang Anda pilih`}, berdasarkan data katalog resmi:\n\n${lyricSections.join('\n\n────────────────────\n\n')}`,
      intent: 'get_qosidah_lyrics',
      targetEntity: primarySong ? { type: 'qosidah', id: primarySong.id, name: primarySong.title, category: primarySong.category_name } : undefined,
      actions: [{ label: '📖 Buka Katalog Qosidah', href: '/app/qosidah' }],
    });
  }

  const category = categories.find((item) => {
    const words = item.name.toLocaleLowerCase('id-ID').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    return query.includes(words) || (item.id === 'qosidah-arobiah' && /\b(arobiah|arab|arabiah)\b/.test(query));
  });
  const wantsCount = /\b(berapa|jumlah|banyak|total)\b/.test(query);
  const wantsList = /\b(semua|seluruh|daftar|list|tampilkan|sebutkan|judul|cari|carikan)\b/.test(query);
  const isFullLibraryRequest = /\b(semua|seluruh|daftar|list|tampilkan|sebutkan)\b/.test(query);
  const isGenericCatalog = !category && !isFullLibraryRequest && /\b(cari|carikan|kategori|apa saja|apa aja)\b/.test(query);

  if (isGenericCatalog) {
    const categoryLines = categories.map((item) => {
      const count = qosidahs.filter((song) => song.category_id === item.id).length;
      return `• ${item.name}: ${count} qosidah`;
    });
    return sanitize({
      text: `Berikut semua kategori qosidah yang tersedia di katalog Khoirunnada (${qosidahs.length} judul):\n\n${categoryLines.join('\n')}\n\nSebutkan kategori yang ingin Anda lihat, atau minta “tampilkan semua qosidah” untuk melihat seluruh judul.`,
      actions: categories.slice(0, 4).map((item) => ({ label: `📚 ${item.name}`, promptText: `Tampilkan semua qosidah kategori ${item.name}` })),
    });
  }

  if (!category) {
    if (/\b(semua|seluruh|daftar|list|tampilkan)\b/.test(query)) {
      const grouped = categories.map((item) => {
        const songs = qosidahs.filter((song) => song.category_id === item.id);
        return `${item.name} (${songs.length}):\n${songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n') || 'Belum ada qosidah.'}`;
      });
      return sanitize({ text: `Berikut seluruh ${qosidahs.length} qosidah dalam data katalog resmi, dikelompokkan berdasarkan kategori:\n\n${grouped.join('\n\n')}`, actions: [{ label: '📖 Buka Katalog Qosidah', href: '/app/qosidah' }] });
    }
    return undefined;
  }

  const songs = qosidahs.filter((song) => song.category_id === category.id);
  if (wantsCount && !wantsList) {
    return sanitize({ text: `Kategori ${category.name} memiliki ${songs.length} qosidah dalam data katalog resmi Khoirunnada.`, actions: [{ label: `📚 Lihat ${category.name}`, promptText: `Tampilkan semua qosidah kategori ${category.name}` }] });
  }
  if (wantsList) {
    const titles = songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n');
    return sanitize({ text: `Berikut seluruh ${songs.length} qosidah kategori ${category.name} sesuai data katalog resmi:\n\n${titles || 'Belum ada qosidah pada kategori ini.'}`, actions: [{ label: '📖 Buka Katalog Qosidah', href: '/app/qosidah' }] });
  }
  return undefined;
}

function buildOutOfScopeResponse(userInput: string): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const explicitlyOutsideDomain =
    /\b(politik|politikus|pemilu|pilpres|pileg|presiden|wakil presiden|partai politik|kampanye|pemerintahan|parlemen|dpr|dprd|demokrasi|kebijakan negara|kurs|saham|cuaca|resep masakan|rumus matematika)\b/.test(query);

  if (!explicitlyOutsideDomain) return undefined;

  return sanitize({
    text: 'Maaf, pertanyaan tersebut berada di luar lingkup informasi resmi Khoirunnada AI. Saya berfokus membantu personel terkait informasi Hadroh Khoirunnada dan data yang tersedia di aplikasi, seperti qosidah, jadwal job, panduan aplikasi, serta organisasi.',
    actions: [
      { label: '📖 Cari Qosidah', promptText: 'Carikan saya qosidah' },
      { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
    ],
  });
}

function buildOrganizationChartResponse(userInput: string): AIResponse | undefined {
  const query = normalizeGreetingInput(userInput);
  const asksForOrganizationStructure =
    /\b(struktur|organisasi|kepengurusan|susunan pengurus|susunan organisasi|bagan|organigram|ketua|ketum|pengurus|bendahara|penanggung jawab|personel resmi)\b/.test(query);

  if (!asksForOrganizationStructure) return undefined;

  return sanitize({
    text: 'Berikut bagan struktur organisasi Hadroh Khoirunnada berdasarkan informasi yang tersedia:',
    visualization: 'organization-chart',
    actions: [{ label: '📜 Informasi Sejarah', promptText: 'Bagaimana sejarah Khoirunnada?' }],
  });
}

// Fungsi Pemrosesan Bahasa Alami (NLP Engine Internal Khoirunnada)
export function processKhoirunnadaAI(
  userInput: string,
  context: AIContext,
  options?: ProcessAIOptions
): AIResponse {
  const openingResponse = buildOpeningResponse(userInput, context);
  if (openingResponse) return openingResponse;

  // FASE 7: CONTROLLED INTEGRATION ADAPTER
  // Feature flag default: OFF (false).
  // Hanya aktif jika options.enableV2Engine === true atau context.enableV2Engine === true.
  const isV2Enabled = Boolean(options?.enableV2Engine ?? context?.enableV2Engine ?? false);

  if (isV2Enabled) {
    try {
      const gateResult = processWithSecurityGate(userInput, context, {
        timeZone: options?.timeZone,
        referenceDate: options?.referenceDate,
        seed: options?.seed,
      });

      if (gateResult && gateResult.response && typeof gateResult.response.text === 'string') {
        // Jika keputusan keamanan menolak (DENY / UNAUTHORIZED),
        // kembalikan penolakan v2 langsung (dilarang fallback ke legacy agar tidak membypass security gateway)
        const isAmbiguous = gateResult.decision === 'CLARIFY' || Boolean(gateResult.reasoningResult?.isAmbiguous);
        const topEntity = isAmbiguous || gateResult.decision === 'DENY' ? undefined : gateResult.reasoningResult?.targetEntity;
        const intent = gateResult.reasoningResult?.intent || gateResult.reasoningResult?.operationsExecuted?.[0]?.type;
        if (gateResult.decision !== 'DENY') {
          const typoResponse = buildDomainTypoResponse(userInput, context);
          if (typoResponse) return typoResponse;
          const qosidahCatalogResponse = buildQosidahCatalogResponse(userInput, context);
          if (qosidahCatalogResponse) return qosidahCatalogResponse;
          const outOfScopeResponse = buildOutOfScopeResponse(userInput);
          if (outOfScopeResponse) return outOfScopeResponse;
          const organizationChartResponse = buildOrganizationChartResponse(userInput);
          if (organizationChartResponse) return organizationChartResponse;
          const historyResponse = buildHistoryStatusResponse(userInput);
          if (historyResponse) return historyResponse;
          const identityResponse = buildAssistantIdentityResponse(userInput);
          if (identityResponse) return identityResponse;
          const supportResponse = buildDeveloperSupportResponse(userInput);
          if (supportResponse) return supportResponse;
        }
        return sanitize({
          ...gateResult.response,
          intent,
          targetEntity: topEntity,
        });
      }
    } catch {
      // Fallback aman jika terjadi anomali tak terduga pada v2
      return sanitize({
        text: 'Afwan, sistem sedang memproses permintaan Anda dengan perlindungan aman. Silakan coba tanyakan kembali seputar qosidah atau jadwal job Hadroh Khoirunnada.',
        actions: [
          { label: '📖 Cari Qosidah', promptText: 'Carikan saya qosidah' },
          { label: '📅 Cek Jadwal Job', promptText: 'Ada jadwal job apa saja?' },
        ],
      });
    }
  }

  const typoResponse = buildDomainTypoResponse(userInput, context);
  if (typoResponse) return typoResponse;

  const qosidahCatalogResponse = buildQosidahCatalogResponse(userInput, context);
  if (qosidahCatalogResponse) return qosidahCatalogResponse;

  const outOfScopeResponse = buildOutOfScopeResponse(userInput);
  if (outOfScopeResponse) return outOfScopeResponse;

  const organizationChartResponse = buildOrganizationChartResponse(userInput);
  if (organizationChartResponse) return organizationChartResponse;

  const historyResponse = buildHistoryStatusResponse(userInput);
  if (historyResponse) return historyResponse;

  const identityResponse = buildAssistantIdentityResponse(userInput);
  if (identityResponse) return identityResponse;

  const supportResponse = buildDeveloperSupportResponse(userInput);
  if (supportResponse) return supportResponse;

  // --- LEGACY ENGINE (DEFAULT: enableV2Engine = false) ---
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

  // 2. Profil Khusus: Siapa Dzarin (Deep Search Mode ~10 Detik)
  if (
    query === 'siapa dzarin' ||
    query === 'siapa dzarin?' ||
    query.includes('siapa dzarin') ||
    query.includes('siapa abi dzarin') ||
    query.includes('siapa muhammad abi dzarin') ||
    query.includes('profil dzarin') ||
    query.includes('biodata dzarin') ||
    query.includes('tentang dzarin') ||
    query.includes('nexarin') ||
    query.includes('by-rins')
  ) {
    return sanitize({
      text: KNOWLEDGE_DZARIN_PROFILE,
      isDeepSearch: true,
      actions: [
        { label: '👨‍💻 Pembuat Aplikasi', promptText: 'Siapa yang membuat dan mengembangkan aplikasi ini?' },
        { label: '🏛️ Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
        { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
      ],
    });
  }

  // 3. Siapa yang membuat / Pengembang aplikasi
  if (
    query.includes('siapa yang membuat') ||
    query.includes('siapa yang kembang') ||
    query.includes('siapa buat') ||
    query.includes('siapa bikin') ||
    query.includes('pembuat') ||
    query.includes('developer') ||
    query.includes('pengembang')
  ) {
    return sanitize({
      text: KNOWLEDGE_DEVELOPER,
      actions: [
        { label: '👤 Siapa Dzarin?', promptText: 'Siapa Dzarin?' },
        { label: '🏛️ Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
        { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
      ],
    });
  }

  // 4. Cara Menggunakan Aplikasi
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

  // 5. Manfaat Aplikasi
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
        { label: '👨‍💻 Pembuat Aplikasi', promptText: 'Siapa yang membuat dan mengembangkan aplikasi ini?' },
      ],
    });
  }

  // 6. Sejarah Khoirunnada
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

  // 7. Struktur Organisasi Khoirunnada
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

  // 8. Jadwal Job & Penugasan
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
            timeZone: options?.timeZone || 'Asia/Makassar',
          })}\n   - Lokasi: ${j.location || 'Menunggu konfirmasi'}\n   - Status: ${j.status.toUpperCase()}`
      )
      .join('\n\n');

    return sanitize({
      text: `Berikut adalah jadwal job Hadroh Khoirunnada terdekat:\n\n${jobsText}\n\nUntuk detail penugasan personel dan kelengkapan alat, silakan buka menu Jadwal Job.`,
      actions: [{ label: '📅 Buka Semua Jadwal Job', href: '/app/jobs' }],
    });
  }

  // 9. Qosidah Favorit Pengguna
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

  // 10. Pencarian Qosidah (Semantic & Fuzzy Search dari 73 Lagu)
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

  // 11. Pertanyaan Umum Lainnya seputar Khoirunnada / Hadroh
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

  // 12. Ucapan Terima Kasih
  if (query.includes('makasih') || query.includes('terima kasih') || query.includes('syukron')) {
    return sanitize({
      text: `Sama-sama! Senang bisa membantu Anda. Jangan ragu bertanya lagi jika butuh bantuan seputar Hadroh Khoirunnada. Berkah selalu untuk Anda dan keluarga!`,
      actions: [
        { label: '📖 Cari Qosidah Lain', href: '/app/qosidah' },
        { label: '📅 Cek Jadwal Job', href: '/app/jobs' },
      ],
    });
  }

  // 13. Fallback Respons Cerdas
  return sanitize({
    text: `Maaf, pertanyaan tersebut belum dapat saya pahami atau berada di luar lingkup informasi resmi Khoirunnada AI. Saya berfokus membantu personel terkait data Hadroh Khoirunnada yang tersedia, seperti pencarian qosidah, jadwal job, panduan aplikasi, profil pengembang, dan informasi organisasi. Jika maksud Anda berkaitan dengan Khoirunnada tetapi ada salah ketik, silakan tulis ulang atau jelaskan pertanyaannya agar saya tidak salah menjawab.`,
    actions: [
      { label: '💡 Cara Pakai Aplikasi', promptText: 'Bagaimana cara menggunakan aplikasi ini?' },
      { label: '🏆 Manfaat Aplikasi', promptText: 'Apa saja manfaat aplikasi ini?' },
      { label: '📜 Sejarah Khoirunnada', promptText: 'Bagaimana sejarah Khoirunnada?' },
      { label: '👥 Struktur Organisasi', promptText: 'Bagaimana struktur organisasi Khoirunnada?' },
    ],
  });
}
