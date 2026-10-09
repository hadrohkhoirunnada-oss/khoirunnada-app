import type { Qosidah, QosidahCategory } from '@/lib/types';

// ==============================================================================
// 1. DAFTAR KATEGORI QOSIDAH HADROH KHOIRUNNADA
// ==============================================================================
export const QOSIDAH_CATEGORIES: QosidahCategory[] = [
  {
    id: 'pembukaan',
    name: 'Pembukaan',
    slug: 'pembukaan',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'sholawat',
    name: 'Sholawat',
    slug: 'sholawat',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'mahalul-qiyam',
    name: 'Mahalul Qiyam',
    slug: 'mahalul-qiyam',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'qosidah-inti',
    name: 'Qosidah Inti',
    slug: 'qosidah-inti',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'penutup',
    name: 'Penutup',
    slug: 'penutup',
    sort_order: 5,
    is_active: true,
  },
];

// ==============================================================================
// 2. DAFTAR LIRIK QOSIDAH RESMI (TERTULIS LANGSUNG DALAM KODE)
// ==============================================================================
export const QOSIDAH_LIST: Qosidah[] = [
  {
    id: '218e45bd-56c2-4c95-be82-d9cd5cae038f',
    title: 'Sholawat Nahdliyah',
    alternate_title: 'Allahumma Sholli ‘Ala Sayyidina Muhammad',
    category_id: 'sholawat',
    category_name: 'Sholawat',
    arabic_text: `اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ
صَلَاةً تُغَيِّرُ بِهَا حَالَنَا إِلَى أَحْسَنِ حَالٍ
وَتَجْعَلُنَا بِهَا مِنْ عِبَادِكَ الصَّالِحِينَ
وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ

اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ
صَلَاةً تَرْزُقُنَا بِهَا عِلْمًا نَافِعًا
وَتُوَفِّقُنَا بِهَا لِخِدْمَةِ الدِّينِ وَالْوَطَنِ
بِجَاهِ نَبِيِّكَ الْأَمِينِ`,
    latin_text: `Allahumma sholli 'alaa sayyidinaa Muhammad
Sholaatan tughayyiru bihaa haalanaa ilaa ahsanil haal
Wa taj'alunaa bihaa min 'ibaadikas shoolihiin
Wa 'alaa aalihii wa shohbihii wa sallim

Allahumma sholli 'alaa sayyidinaa Muhammad
Sholaatan tarzuqunaa bihaa 'ilman naafi'aa
Wa tuwaffiqunaa bihaa li khidmatid diini wal wathan
Bi jaahi nabiyyikal amiin`,
    translation: 'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, ubahlah keadaan kami menjadi sebaik-baik keadaan, dan jadikan kami termasuk hamba-Mu yang shalih.',
    tags: ['Nahdliyah', 'Wajib', 'Semangat', 'Banjari'],
    notes: 'Bawakan dengan tempo sedang, ritme terbang Banjari rancak penuh semangat.',
    is_active: true,
    sort_order: 1,
    created_at: '2026-10-04T00:00:00Z',
  },
  {
    id: '43b48f3e-f883-4993-a62f-d26db88790e4',
    title: 'Ya Thoybah',
    alternate_title: 'Yaa Thoybah Yaa Dawal ‘Ayaana',
    category_id: 'qosidah-inti',
    category_name: 'Qosidah Inti',
    arabic_text: `يَا طَيْبَةْ يَا طَيْبَةْ يَا دَوَا الْعَيَانَا
اِشْتَقْنَا لِكْ وَالْهَوَى نَدَانَا
وَالْهَوَى نَدَانَا

سَيِّدِي يَا أَبَا بَكْرٍ حُبُّكُمْ فِي الْقَلْبِ حَلَّ
يَا عُمَرُ اقْضِ لِي أَمْرِي وَعَلِيُّ مَعَ عُثْمَانَا

يَا حَسَنُ مَعَ حُسَيْنٍ لِلنَّبِيِّ قُرَّةُ عَيْنٍ
يَا شَبَابَ الْجَنَّتَيْنِ جَدُّكُمْ صَاحِبُ الْقُرْآنَا`,
    latin_text: `Yaa Thoybah yaa Thoybah yaa dawal 'ayaanaa
Isytaqnaalik wal hawaa nadaanaa
Wal hawaa nadaanaa

Sayyidii yaa Abaa Bakrin hubbukum fil qalbi halla
Yaa 'Umaruqdhi lii amrii wa 'Aliyyun ma'a 'Utsmaanaa

Yaa Hasan ma'a Husainin lin-nabiyyi qurratu 'ainin
Yaa syabaaball jannataini jaddukum shoohibul Qur'aanaa`,
    translation: 'Wahai Madinah Thoybah, penyembuh dahaga kerinduan kami. Kami merindukanmu dan gelora cinta telah memanggil kami.',
    tags: ['Klasik', 'Favorit', 'Madinah', 'Rancak'],
    notes: 'Vokal 1 dan Vokal 2 bersahut-sahutan di bait kedua. Pukulan golong serempak saat reff.',
    is_active: true,
    sort_order: 2,
    created_at: '2026-10-04T00:00:00Z',
  },
  {
    id: 'b7513308-3992-44a2-8ade-d0e2a6a39e12',
    title: 'Mahalul Qiyam (Simthud Duror)',
    alternate_title: 'Yaa Nabi Salaam ‘Alaika',
    category_id: 'mahalul-qiyam',
    category_name: 'Mahalul Qiyam',
    arabic_text: `يَا نَبِي سَلَامٌ عَلَيْكَ
يَا رَسُول سَلَامٌ عَلَيْكَ
يَا حَبِيب سَلَامٌ عَلَيْكَ
صَلَوَاتُ اللَّهِ عَلَيْكَ

أَشْرَقَ الْبَدْرُ عَلَيْنَا
فَاخْتَفَتْ مِنْهُ الْبُدُورُ
مِثْلَ حُسْنِكْ مَا رَأَيْنَا
قَطُّ يَا وَجْهَ السُّرُورِ

أَنْتَ شَمْسٌ أَنْتَ بَدْرٌ
أَنْتَ نُورٌ فَوْقَ نُورٍ
أَنْتَ إِكْسِيرٌ وَغَالِي
أَنْتَ مِصْبَاحُ الصُّدُورِ

يَا حَبِيبِي يَا مُحَمَّد
يَا عَرُوسَ الْخَافِقَيْنِ
يَا مُؤَيَّد يَا مُمَجَّد
يَا إِمَامَ الْقِبْلَتَيْنِ`,
    latin_text: `Yaa Nabii salaam 'alaika
Yaa Rasuul salaam 'alaika
Yaa Habiib salaam 'alaika
Sholawaatullaah 'alaika

Asyraqal badru 'alainaa
Fakhtafat minhul buduuru
Mitsla husnik maa ra-ainaa
Qotthu yaa wajhas suruuri

Anta syamsun anta badrun
Anta nuurun fauqa nuuri
Anta iksiirun wa ghaalii
Anta mishbaahus shuduuri

Yaa Habiibii yaa Muhammad
Yaa 'Aruusal khaafiqaini
Yaa Mu-ayyad yaa Mumajjad
Yaa Imaamal qiblataini`,
    translation: 'Wahai Nabi, Rasul, dan Kekasih Allah, salam sejahtera dan sholawat Allah tercurah kepadamu. Engkau laksana matahari, purnama, dan cahaya di atas segala cahaya.',
    tags: ['Sakral', 'Berdiri', 'Maulid', 'Wajib'],
    notes: 'Posisi seluruh hadirin dan pemain berdiri tegak penuh adab, tabuhan bass lembut dan ritmis bersahaja.',
    is_active: true,
    sort_order: 3,
    created_at: '2026-10-04T00:00:00Z',
  },
  {
    id: '3402e8fb-0c0a-48d4-8ad8-28b6b8eba1f8',
    title: 'Rouhi Fidak',
    alternate_title: 'Maddad Yaa Rasulallah',
    category_id: 'qosidah-inti',
    category_name: 'Qosidah Inti',
    arabic_text: `رُوحِي فِدَاكَ يَا رَسُولَ اللَّهِ
يَا خَيْرَ خَلْقِ اللَّهِ كُلِّهِمِ
مَالِي سِوَاكَ أَرْتَجِي مَدَدًا
عِنْدَ الشَّدَائِدِ وَالْكُرَبِ الْعِظَامِ

أَنْتَ الشَّفِيعُ لِكُلِّ مُذْنِبٍ
يَوْمَ الْقِيَامَةِ فِي الْمَحْشَرِ
فَاغْفِرْ لَنَا يَا رَبَّنَا زَلَلًا
بِجَاهِ أَحْمَدَ خَيْرِ مَنْ وَطِئَ الثَّرَى`,
    latin_text: `Rouhii fidaaka yaa Rasuulallaah
Yaa khaira khalqillaahi kullihimi
Maalii siwaaka artajii madadan
'Indasy-syadaa-idi wal kurabil 'izhaam

Antasy-syafii'u likulli mudznibin
Yaumal qiyaamati fil mahsyari
Faghfir lanaa yaa Rabbanaa zalalan
Bi jaahi Ahmada khairi man wathi-ats-tsaraa`,
    translation: 'Jiwaku sebagai tebusan untukmu wahai Rasulullah, wahai sebaik-baik seluruh makhluk ciptaan Allah. Tiada bagiku selain engkau tempat berharap pertolongan.',
    tags: ['Mahabbah', 'Rancak', 'Modern', 'Populer'],
    notes: 'Pukulan keprak rapat saat masuk chorus kedua. Naikkan dinamika suara di akhir bait.',
    is_active: true,
    sort_order: 4,
    created_at: '2026-10-04T00:00:00Z',
  },
  {
    id: 'a305cfe1-9aed-4de4-8774-0d073cfc8a9c',
    title: 'Busyro Lana',
    alternate_title: 'Nilnal Munaa Zaalal ‘Anaa',
    category_id: 'sholawat',
    category_name: 'Sholawat',
    arabic_text: `بُشْرَى لَنَا نِلْنَا الْمُنَى
زَالَ الْعَنَا وَافَى الْهَنَا
وَالدَّهْرُ أَنْجَزَ وَعْدَهُ
وَالْبِشْرُ أَضْحَى مُعْلَنَا

يَا نَفْسُ طِيبِي بِاللِّقَا
يَا عَيْنُ قَرِّي أَعْيُنَا
هَذَا جَمَالُ الْمُصْطَفَى
أَنْوَارُهُ لَاحَتْ لَنَا`,
    latin_text: `Busyraa lanaa nilnal munaa
Zaalal 'anaa waafal hanaa
Waddahru anjaza wa'dahu
Wal bisyru adl-haa mu'lanaa

Yaa nafsu thiibii bil liqaa
Yaa 'ainu qarrii a'yunaa
Haadzaa jamaalul Mushthafaa
Anwaaruhuu laahat lanaa`,
    translation: 'Kabar gembira bagi kita, kita telah mencapai harapan. Hilanglah segala kesulitan dan datanglah kebahagiaan. Inilah keindahan sang Nabi terpilih yang cahayanya bersinar bagi kita.',
    tags: ['Gembira', 'Pernikahan', 'Walimah', 'Favorit'],
    notes: 'Sangat cocok untuk pembuka acara pernikahan atau walimatul ursy. Ritme ceria dan harmonis.',
    is_active: true,
    sort_order: 5,
    created_at: '2026-10-04T00:00:00Z',
  },
  {
    id: 'f367b3e2-e359-4b37-be6c-15334be4bee3',
    title: 'Qosidah Burdah (Maula ya sholli)',
    alternate_title: 'Mawlaaya Sholli wa Sallim Daa-iman Abadaa',
    category_id: 'pembukaan',
    category_name: 'Pembukaan',
    arabic_text: `مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا
عَلَى حَبِيبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ

هُوَ الْحَبِيبُ الَّذِي تُرْجَى شَفَاعَتُهُ
لِكُلِّ هَوْلٍ مِنَ الْأَهْوَالِ مُقْتَحَمِ

يَا رَبِّ بِالْمُصْطَفَى بَلِّغْ مَقَاصِدَنَا
وَاغْفِرْ لَنَا مَا مَضَى يَا وَاسِعَ الْكَرَمِ`,
    latin_text: `Mawlaaya sholli wa sallim daa-iman abadaa
'Alaa Habiibika khairil khalqi kullihimi

Huwal Habiibul ladzii turjaa syafaa'atuhu
Likulli haulin minal ahwaali muqtahami

Yaa Rabbi bil Mushthafaa balligh maqaashidanaa
Waghfir lanaa maa madhaa yaa Waasi'al Karami`,
    translation: 'Wahai Tuhanku, limpahkanlah sholawat dan salam selama-lamanya kepada Kekasih-Mu, sebaik-baik seluruh ciptaan. Dialah sang Kekasih yang diharapkan syafaatnya dalam setiap kesulitan.',
    tags: ['Imam Bushiri', 'Berkah', 'Adab', 'Pembuka'],
    notes: 'Bawakan bait istighfar dengan khusyuk di awal. Tempo stabil dan syahdu.',
    is_active: true,
    sort_order: 6,
    created_at: '2026-10-04T00:00:00Z',
  },
  {
    id: 'e819f2a1-7c9b-4e12-b9e3-82a938d10001',
    title: 'Al-Qolbu Mutayyam',
    alternate_title: 'Bi Thohannabi Al-Amin',
    category_id: 'qosidah-inti',
    category_name: 'Qosidah Inti',
    arabic_text: `الْقَلْبُ مُتَيَّمْ بِطَهَ النَّبِي
وَصَلَّى وَسَلَّمْ عَلَى الْمُجْتَبَى

نَبِيٌّ عَظِيمٌ شَفِيعُ الْوَرَى
كَرِيمُ السَّجَايَا بَهِيُّ الضِّيَا

فَيَا رَبِّ صَلِّ عَلَى الْمُصْطَفَى
وَسَلِّمْ عَلَيْهِ بِكُلِّ الدُّعَا`,
    latin_text: `Al-Qolbu mutayyam bi Thohan-Nabii
Wa shollaa wa sallam 'alal Mujtabaa

Nabiyyun 'azhiimun syafii'ul waraa
Kariimus sajaayaa bahiyyudh dhiyaa

Fa yaa Robbi sholli 'alal Mushthafaa
Wa sallim 'alaihi bi kullid du'aa`,
    translation: 'Hati ini terpikat dan rindu mendalam kepada Thoha sang Nabi, sholawat dan salam tercurah kepada hamba pilihan-Nya.',
    tags: ['Rindu', 'Hati', 'Syahdu', 'Mahabbah'],
    notes: 'Awali dengan solo vokal lembut sebelum masuk tabuhan terbang penuh.',
    is_active: true,
    sort_order: 7,
    created_at: '2026-10-04T00:00:00Z',
  },
  {
    id: 'a546c9f1-496e-4b89-86b0-59f605a40004',
    title: 'Doa Penutup Majelis',
    alternate_title: 'Subhanakallahumma wa Bihamdika',
    category_id: 'penutup',
    category_name: 'Penutup',
    arabic_text: `سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ
أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ
أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ

رَبَّنَا انْفَعْنَا بِمَا عَلَّمْتَنَا
رَبِّ عَلِّمْنَا الَّذِي يَنْفَعُنَا
وَارْزُقْنَا فِقْهًا فِي دِينِنَا`,
    latin_text: `Subhaanakallaahumma wa bihamdika
Asyhadu allaa ilaaha illaa Anta
Astaghfiruka wa atuubu ilaik

Rabbananfa'naa bimaa 'allamtanaa
Rabbi 'allimnal ladzii yanfa'unaa
Warzuqnaa fiqhan fii diininaa`,
    translation: 'Maha Suci Engkau ya Allah dan dengan memuji-Mu. Aku bersaksi tiada Tuhan selain Engkau, aku memohon ampun dan bertaubat kepada-Mu. Ya Tuhan berilah kami manfaat dari apa yang Kau ajarkan.',
    tags: ['Doa', 'Kaffaratul Majelis', 'Barokah', 'Penutup'],
    notes: 'Seluruh anggota majelis menengadahkan tangan mengamini doa penutup dengan khidmat.',
    is_active: true,
    sort_order: 8,
    created_at: '2026-10-04T00:00:00Z',
  },
];

// ==============================================================================
// 3. FUNGSI PEMBANTU (HELPER FUNCTIONS)
// ==============================================================================
export function getAllQosidahs(): Qosidah[] {
  return QOSIDAH_LIST;
}

export function getAllCategories(): QosidahCategory[] {
  return QOSIDAH_CATEGORIES;
}

export function getQosidahById(id: string): Qosidah | undefined {
  return QOSIDAH_LIST.find((q) => q.id === id);
}

export function getQosidahsByCategory(categoryId: string): Qosidah[] {
  if (categoryId === 'all') return QOSIDAH_LIST;
  return QOSIDAH_LIST.filter((q) => q.category_id === categoryId);
}
