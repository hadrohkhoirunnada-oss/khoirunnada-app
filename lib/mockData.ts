import {
  Profile,
  Booking,
  Job,
  JobAttendance,
  JobAssignment,
  Qosidah,
  QosidahCategory,
  FinanceCategory,
  FinanceTransaction,
  AppNotification,
  AuditLog,
} from './types';

export const initialProfiles: Profile[] = [
  {
    id: 'user-admin',
    auth_user_id: 'auth-user-admin',
    name: 'Admin & Bendahara Hadroh',
    email: 'admin.khoirunnada@gmail.com',
    avatar_url: '/logo-khoirunnada-192.png',
    phone: '081234567890',
    role_title: 'Pengurus Admin & Bendahara',
    status: 'active',
    is_member: false,
    is_treasurer: true,
    is_admin: true,
    created_at: '2026-01-01T08:00:00Z',
    approved_at: '2026-01-01T08:00:00Z',
    approved_by: 'System',
  },
  {
    id: 'user-treasurer',
    auth_user_id: 'auth-user-treasurer',
    name: 'Ahmad Fauzi Rahman',
    email: 'fauzi.rahman@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '081298765432',
    role_title: 'Bendahara & Penabuh Bass',
    status: 'active',
    is_member: true,
    is_treasurer: true,
    is_admin: false,
    created_at: '2026-01-05T09:30:00Z',
    approved_at: '2026-01-05T10:00:00Z',
    approved_by: 'user-admin',
  },
  {
    id: 'user-member',
    auth_user_id: 'auth-user-member',
    name: 'Muhammad Dzarin',
    email: 'dzarin.hadroh@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '082155667788',
    role_title: 'Penabuh Terbang 1',
    status: 'active',
    is_member: true,
    is_treasurer: false,
    is_admin: false,
    created_at: '2026-01-10T14:15:00Z',
    approved_at: '2026-01-11T09:00:00Z',
    approved_by: 'user-admin',
  },
  {
    id: 'user-member-2',
    auth_user_id: 'auth-user-member-2',
    name: 'Rizky Ramadhan',
    email: 'rizky.rama@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    phone: '085712349988',
    role_title: 'Penabuh Tam & Keprak',
    status: 'active',
    is_member: true,
    is_treasurer: false,
    is_admin: false,
    created_at: '2026-01-15T11:00:00Z',
    approved_at: '2026-01-16T08:00:00Z',
    approved_by: 'user-admin',
  },
  {
    id: 'user-pending',
    auth_user_id: 'auth-user-pending',
    name: 'Budi Santoso',
    email: 'budi.santoso99@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    phone: '087811223344',
    role_title: 'Calon Anggota (Vokal)',
    status: 'pending',
    is_member: false,
    is_treasurer: false,
    is_admin: false,
    created_at: '2026-10-02T16:20:00Z',
  },
];

export const initialCategories: QosidahCategory[] = [
  { id: 'cat-pembukaan', name: 'Pembukaan', slug: 'pembukaan', sort_order: 1, is_active: true },
  { id: 'cat-sholawat', name: 'Sholawat', slug: 'sholawat', sort_order: 2, is_active: true },
  { id: 'cat-mahalul-qiyam', name: 'Mahalul Qiyam', slug: 'mahalul-qiyam', sort_order: 3, is_active: true },
  { id: 'cat-inti', name: 'Qosidah Inti', slug: 'qosidah-inti', sort_order: 4, is_active: true },
  { id: 'cat-penutup', name: 'Penutup', slug: 'penutup', sort_order: 5, is_active: true },
];

export const initialQosidahs: Qosidah[] = [
  {
    id: 'qos-1',
    title: 'Sholawat Nahdliyah',
    alternate_title: 'Allahumma Sholli ‘Ala Sayyidina Muhammad',
    category_id: 'cat-sholawat',
    category_name: 'Sholawat',
    tags: ['Nahdliyah', 'Wajib', 'Semangat'],
    notes: 'Bawakan dengan tempo sedang, ritme terbang Banjari rancak.',
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
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
    translation: `Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, rahmat yang dengannya Engkau ubah keadaan kami menjadi sebaik-baik keadaan, dan jadikanlah kami termasuk hamba-hamba-Mu yang shalih, serta limpahkanlah keselamatan kepada keluarga dan sahabat beliau.`,
    verses: [
      {
        arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُغَيِّرُ بِهَا حَالَنَا إِلَى أَحْسَنِ حَالٍ',
        latin: 'Allahumma sholli \'alaa sayyidinaa Muhammad, sholaatan tughayyiru bihaa haalanaa ilaa ahsanil haal',
        translation: 'Ya Allah limpahkanlah sholawat kepada junjungan kami Nabi Muhammad, sholawat yang merubah keadaan kami menuju sebaik-baik keadaan.',
      },
      {
        arabic: 'وَتَجْعَلُنَا بِهَا مِنْ عِبَادِكَ الصَّالِحِينَ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
        latin: 'Wa taj\'alunaa bihaa min \'ibaadikas shoolihiin, wa \'alaa aalihii wa shohbihii wa sallim',
        translation: 'Dan jadikanlah kami dengannya hamba-hamba-Mu yang sholeh, serta keluarga dan para sahabat beliau.',
      },
    ],
  },
  {
    id: 'qos-2',
    title: 'Ya Thoybah',
    alternate_title: 'Yaa Thoybah Yaa Dawal \'Ayaana',
    category_id: 'cat-inti',
    category_name: 'Qosidah Inti',
    tags: ['Klasik', 'Favorit', 'Madinah'],
    notes: 'Vokal 1 dan Vokal 2 bersahut-sahutan di bait kedua.',
    sort_order: 2,
    is_active: true,
    created_at: '2026-01-02T00:00:00Z',
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
    translation: `Wahai Madinah Thoybah, penyembuh dahaga kerinduan kami. Kami begitu merindukanmu dan gelora cinta telah memanggil kami kepada sang Baginda. Wahai junjungan kami Abu Bakar, kecintaan kepadamu menetap di hati. Wahai Umar, bantulah urusanku, serta Ali bersama Utsman. Wahai Hasan dan Husain, penyejuk pandangan sang Nabi, wahai pemuda penghuni surga, kakek kalian adalah pembawa Al-Qur'an.`,
  },
  {
    id: 'qos-3',
    title: 'Mahalul Qiyam (Simthud Duror)',
    alternate_title: 'Yaa Nabi Salaam \'Alaika',
    category_id: 'cat-mahalul-qiyam',
    category_name: 'Mahalul Qiyam',
    tags: ['Sakral', 'Berdiri', 'Maulid'],
    notes: 'Posisi berdiri tegak penuh adab, tabuhan bass lembut dan ritmis.',
    sort_order: 3,
    is_active: true,
    created_at: '2026-01-03T00:00:00Z',
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
أَنْتَ مِصْبَاحُ الصُّدُورِ`,
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
Anta mishbaahus shuduuri`,
    translation: `Wahai Nabi, salam sejahtera untukmu. Wahai Rasul, salam sejahtera untukmu. Wahai Kekasih Allah, salam sejahtera untukmu. Sholawat dari Allah tercurah kepadamu. Telah terbit bulan purnama menyinari kami, maka tenggelamlah semua rembulan karena keindahanmu. Tak pernah kami melihat keelokan laksana dirimu wahai wajah kegembiraan. Engkaulah mentari, engkaulah purnama, engkaulah cahaya di atas segala cahaya.`,
  },
  {
    id: 'qos-4',
    title: 'Rouhi Fidak',
    alternate_title: 'Maddad Yaa Rasulallah',
    category_id: 'cat-inti',
    category_name: 'Qosidah Inti',
    tags: ['Mahabbah', 'Rancak', 'Modern'],
    notes: 'Pukulan keprak rapat saat masuk chorus kedua.',
    sort_order: 4,
    is_active: true,
    created_at: '2026-01-04T00:00:00Z',
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
    translation: `Jiwaku sebagai tebusan untukmu wahai Rasulullah, wahai sebaik-baik seluruh makhluk ciptaan Allah. Tiada bagiku selain dirimu tempat memohon pertolongan di saat masa-masa sulit dan duka yang mendalam. Engkaulah pemberi syafaat bagi setiap pendosa di padang mahsyar hari kiamat. Ampunilah kekhilafan kami ya Tuhan kami dengan kemuliaan Nabi Ahmad.`,
  },
  {
    id: 'qos-5',
    title: 'Busyro Lana',
    alternate_title: 'Nilnal Munaa Zaalal \'Anaa',
    category_id: 'cat-sholawat',
    category_name: 'Sholawat',
    tags: ['Gembira', 'Pernikahan', 'Walimah'],
    notes: 'Sangat cocok untuk pembuka acara pernikahan atau walimatul ursy.',
    sort_order: 5,
    is_active: true,
    created_at: '2026-01-05T00:00:00Z',
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
    translation: `Kabar gembira bagi kita, kita telah mencapai harapan kita. Hilanglah segala kesulitan dan datanglah kebahagiaan. Zaman telah menepati janjinya dan sukacita menjadi nyata. Wahai jiwa berbahagialah dengan perjumpaan ini, wahai mata bersenang-hatilah. Inilah keindahan sang kekasih terpilih Al-Musthafa, cahaya-cahaya kemuliaannya telah bersinar bagi kita.`,
  },
  {
    id: 'qos-6',
    title: 'Qosidah Burdah (Maula ya sholli)',
    alternate_title: 'Mawlaaya Sholli wa Sallim Daa-iman Abadaa',
    category_id: 'cat-pembukaan',
    category_name: 'Pembukaan',
    tags: ['Imam Bushiri', 'Berkah', 'Adab'],
    notes: 'Bawakan bait istighfar dengan khusyuk di awal.',
    sort_order: 6,
    is_active: true,
    created_at: '2026-01-06T00:00:00Z',
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
    translation: `Wahai Tuhanku, limpahkanlah sholawat dan salam selalu selama-lamanya kepada Kekasih-Mu sebaik-baik seluruh ciptaan. Dialah sang Kekasih yang diharapkan syafaatnya dalam menghadapi setiap ketakutan dari huru-hara yang mencekam. Ya Tuhan kami, dengan kemuliaan Al-Musthafa sampaikanlah maksud tujuan kami, dan ampunilah dosa-dosa kami yang telah lalu, wahai Yang Maha Luas Kemurahan-Nya.`,
  },
];

export const initialBookings: Booking[] = [
  {
    id: 'bk-1',
    booking_code: 'KN-2026-00125',
    customer_name: 'H. Sulaiman Al-Manshur',
    customer_phone: '081234987611',
    event_type: 'Pernikahan',
    event_name: 'Walimatul Ursy Sarah & Fajar',
    event_date: '2026-10-10',
    event_time: '19:30',
    location: 'Gedung Graha Sakinah',
    location_detail: 'Jl. Ahmad Yani No. 45, Lantai 2 Grand Ballroom',
    notes: 'Mohon hadir membawakan lagu pembuka Sholawat Nahdliyah dan Busyro Lana.',
    status: 'confirmed',
    admin_notes: 'Sudah deal paket lengkap 12 personel, DP 1.5jt sudah masuk ke rekening bendahara.',
    created_at: '2026-09-20T10:00:00Z',
    converted_job_id: 'job-1',
  },
  {
    id: 'bk-2',
    booking_code: 'KN-2026-00126',
    customer_name: 'Ibu Hj. Maryam Qanita',
    customer_phone: '085722334455',
    event_type: 'Maulid Nabi',
    event_name: 'Peringatan Maulid Nabi Muhammad SAW',
    event_date: '2026-10-17',
    event_time: '20:00',
    location: 'Masjid Jami\' Baiturrahman',
    location_detail: 'Komp. Melati Indah Blok C, Panggung Utama Lapangan Masjid',
    notes: 'Acara majelis umum ba\'da Isya, durasi kurang lebih 2 jam.',
    status: 'contacted',
    admin_notes: 'Sudah dihubungi via WA, menunggu konfirmasi kepastian jam mulai dari DKM.',
    created_at: '2026-09-25T14:30:00Z',
  },
  {
    id: 'bk-3',
    booking_code: 'KN-2026-00127',
    customer_name: 'Bapak Hendra Wijaya',
    customer_phone: '081988776655',
    event_type: 'Aqiqah',
    event_name: 'Tasyakuran Aqiqah Ananda Zaidan',
    event_date: '2026-10-24',
    event_time: '16:00',
    location: 'Kediaman Sohibul Hajat',
    location_detail: 'Jl. Mawar No. 12 RT 04/02 (Belakang Puskesmas)',
    notes: 'Rombongan hadroh 8 orang vokal dan terbang, pembacaan Barzanji singkat.',
    status: 'new',
    admin_notes: 'Permintaan booking baru masuk dari link QR brosur.',
    created_at: '2026-10-02T08:15:00Z',
  },
  {
    id: 'bk-4',
    booking_code: 'KN-2026-00128',
    customer_name: 'Drs. H. Mulyadi',
    customer_phone: '081399881122',
    event_type: 'Acara Instansi',
    event_name: 'Haflah Milad Yayasan Pendidikan Islam',
    event_date: '2026-11-05',
    event_time: '09:00',
    location: 'Auditorium Kampus YPI',
    location_detail: 'Gedung Rektorat Lt. 3',
    notes: 'Penyambutan tamu kehormatan dan selingan tausiyah.',
    status: 'negotiation',
    admin_notes: 'Menunggu kesepakatan surat undangan resmi dari panitia.',
    created_at: '2026-09-28T16:00:00Z',
  },
];

export const initialJobs: Job[] = [
  {
    id: 'job-1',
    booking_id: 'bk-1',
    title: 'Walimatul Ursy Sarah & Fajar',
    event_type: 'Pernikahan',
    customer_name: 'H. Sulaiman Al-Manshur',
    customer_phone: '081234987611',
    event_date: '2026-10-10',
    gather_time: '18:30 WITA',
    start_time: '19:30 WITA',
    location: 'Gedung Graha Sakinah, Lantai 2',
    maps_url: 'https://maps.google.com/?q=Gedung+Graha+Sakinah',
    dress_code: 'Gamis Putih Bersih, Jas Hitam Khoirunnada, Peci Hitam Polos',
    transport_info: 'Kumpul bersama di Markaz Khoirunnada pukul 18:00 untuk berangkat rombongan mini bus.',
    notes: 'Harap membawa sound wireless mic grup dan alat rebana lengkap. Pastikan hadir tepat waktu.',
    status: 'upcoming',
    created_by: 'user-admin',
    created_at: '2026-09-22T11:00:00Z',
  },
  {
    id: 'job-2',
    title: 'Peringatan Maulid Akbar Majelis Ta\'lim',
    event_type: 'Maulid Nabi',
    customer_name: 'Ust. Zulkifli Syihab',
    customer_phone: '085712345678',
    event_date: '2026-10-15',
    gather_time: '19:00 WITA',
    start_time: '20:00 WITA',
    location: 'Lapangan Masjid Agung Baitul Mukminin',
    maps_url: 'https://maps.google.com/?q=Masjid+Agung+Baitul+Mukminin',
    dress_code: 'Baju Koko Hijau Zamrud Khoirunnada, Sarung BHS Samarinda',
    transport_info: 'Langsung menuju lokasi, parkir khusus kendaraan grup di sayap timur masjid.',
    notes: 'Akan mengiringi Mahalul Qiyam Simthud Duror dan 4 Qosidah inti.',
    status: 'upcoming',
    created_by: 'user-admin',
    created_at: '2026-09-26T15:00:00Z',
  },
  {
    id: 'job-3',
    title: 'Khitanan Ananda Rayhan Al-Fatih',
    event_type: 'Khitan',
    customer_name: 'Bpk. Ridwan Hakim',
    customer_phone: '081288990011',
    event_date: '2026-09-28',
    gather_time: '15:30 WITA',
    start_time: '16:30 WITA',
    location: 'Kediaman Bpk. Ridwan, Jl. Cempaka Putih No. 18',
    maps_url: 'https://maps.google.com/?q=Jl+Cempaka+Putih+No+18',
    dress_code: 'Batik Khoirunnada Edisi 2025',
    transport_info: 'Kendaraan pribadi masing-masing anggota.',
    notes: 'Alhamdulillah acara berjalan lancar dan penuh keberkahan.',
    status: 'completed',
    created_by: 'user-admin',
    created_at: '2026-09-15T09:00:00Z',
  },
];

export const initialAttendances: JobAttendance[] = [
  {
    id: 'att-1',
    job_id: 'job-1',
    user_id: 'user-admin',
    user_name: 'Ustadz Hilman Ash-Shiddiq',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'attending',
    note: 'InsyaAllah hadir memimpin vokal.',
    updated_at: '2026-09-23T08:00:00Z',
  },
  {
    id: 'att-2',
    job_id: 'job-1',
    user_id: 'user-treasurer',
    user_name: 'Ahmad Fauzi Rahman',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'attending',
    note: 'Siap pegang bass dan bawa inventaris transport.',
    updated_at: '2026-09-23T08:30:00Z',
  },
  {
    id: 'att-3',
    job_id: 'job-1',
    user_id: 'user-member',
    user_name: 'Muhammad Dzarin',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'attending',
    note: 'Hadir, terbang 1 aman.',
    updated_at: '2026-09-23T09:15:00Z',
  },
  {
    id: 'att-4',
    job_id: 'job-1',
    user_id: 'user-member-2',
    user_name: 'Rizky Ramadhan',
    user_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    status: 'maybe',
    note: 'Masih menunggu jadwal lembur kantor, diusahakan hadir.',
    updated_at: '2026-09-24T12:00:00Z',
  },
];

export const initialAssignments: JobAssignment[] = [
  {
    id: 'asg-1',
    job_id: 'job-1',
    user_id: 'user-admin',
    user_name: 'Ustadz Hilman Ash-Shiddiq',
    role_name: 'Vokal Utama',
    notes: 'Koor & Pembacaan Sholawat',
    created_at: '2026-09-23T10:00:00Z',
  },
  {
    id: 'asg-2',
    job_id: 'job-1',
    user_id: 'user-treasurer',
    user_name: 'Ahmad Fauzi Rahman',
    role_name: 'Penabuh Bass',
    notes: 'Bass Habib Syech & Logistik',
    created_at: '2026-09-23T10:00:00Z',
  },
  {
    id: 'asg-3',
    job_id: 'job-1',
    user_id: 'user-member',
    user_name: 'Muhammad Dzarin',
    role_name: 'Penabuh Terbang 1',
    notes: 'Rombongan Banjari',
    created_at: '2026-09-23T10:00:00Z',
  },
  {
    id: 'asg-4',
    job_id: 'job-1',
    user_id: 'user-member-2',
    user_name: 'Rizky Ramadhan',
    role_name: 'Penabuh Tam & Keprak',
    notes: 'Pengatur tempo irama',
    created_at: '2026-09-23T10:00:00Z',
  },
];

export const initialFinanceCategories: FinanceCategory[] = [
  { id: 'fcat-job', name: 'Pembayaran Job', type: 'income', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'fcat-kas', name: 'Iuran Kas Anggota', type: 'income', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'fcat-donasi', name: 'Donasi Jamaah', type: 'income', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'fcat-alat', name: 'Perawatan & Beli Alat', type: 'expense', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'fcat-transport', name: 'Transportasi Job', type: 'expense', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'fcat-konsumsi', name: 'Konsumsi Latihan & Tampil', type: 'expense', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'fcat-seragam', name: 'Pengadaan Seragam', type: 'expense', is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

export const initialTransactions: FinanceTransaction[] = [
  {
    id: 'trx-1',
    type: 'income',
    category_id: 'fcat-job',
    category_name: 'Pembayaran Job',
    amount: 1500000,
    transaction_date: '2026-09-21',
    description: 'Penerimaan DP Booking Walimatul Ursy Sarah & Fajar (KN-2026-00125)',
    job_id: 'job-1',
    job_title: 'Walimatul Ursy Sarah & Fajar',
    attachment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    created_by: 'user-treasurer',
    created_by_name: 'Ahmad Fauzi Rahman',
    created_at: '2026-09-21T11:00:00Z',
  },
  {
    id: 'trx-2',
    type: 'income',
    category_id: 'fcat-kas',
    category_name: 'Iuran Kas Anggota',
    amount: 450000,
    transaction_date: '2026-09-25',
    description: 'Iuran kas bulanan September dari 15 anggota aktif Khoirunnada',
    created_by: 'user-treasurer',
    created_by_name: 'Ahmad Fauzi Rahman',
    created_at: '2026-09-25T19:00:00Z',
  },
  {
    id: 'trx-3',
    type: 'expense',
    category_id: 'fcat-alat',
    category_name: 'Perawatan & Beli Alat',
    amount: 350000,
    transaction_date: '2026-09-26',
    description: 'Penggantian kulit terbang Habib Syech ukuran 32cm dan pasang kancing kuningan',
    attachment_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80',
    created_by: 'user-treasurer',
    created_by_name: 'Ahmad Fauzi Rahman',
    created_at: '2026-09-26T14:20:00Z',
  },
  {
    id: 'trx-4',
    type: 'expense',
    category_id: 'fcat-konsumsi',
    category_name: 'Konsumsi Latihan & Tampil',
    amount: 120000,
    transaction_date: '2026-09-27',
    description: 'Konsumsi air mineral galon dan snack latihan persiapan Maulid Akbar',
    created_by: 'user-treasurer',
    created_by_name: 'Ahmad Fauzi Rahman',
    created_at: '2026-09-27T21:00:00Z',
  },
  {
    id: 'trx-5',
    type: 'income',
    category_id: 'fcat-donasi',
    category_name: 'Donasi Jamaah',
    amount: 500000,
    transaction_date: '2026-09-29',
    description: 'Donasi shodaqoh jariyah dari Hamba Allah untuk operasional dakwah Hadroh',
    created_by: 'user-admin',
    created_by_name: 'Ustadz Hilman Ash-Shiddiq',
    created_at: '2026-09-29T10:00:00Z',
  },
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Job Baru Dikonfirmasi!',
    message: 'Walimatul Ursy Sarah & Fajar pada Sabtu, 10 Oktober 2026 telah dikonfirmasi. Mohon segera isi konfirmasi kehadiran Anda.',
    type: 'job_new',
    target_type: 'all',
    target_url: '/app/jobs/job-1',
    is_read: false,
    created_at: '2026-09-22T11:05:00Z',
  },
  {
    id: 'notif-2',
    title: 'Pengumuman Latihan Rutin',
    message: 'Latihan rutin hadroh mingguan akan diadakan Kamis malam ba\'da Isya di Markaz Khoirunnada. Membawa kitab sholawat masing-masing.',
    type: 'announcement',
    target_type: 'all',
    target_url: '/app',
    is_read: false,
    created_at: '2026-09-27T17:00:00Z',
  },
  {
    id: 'notif-3',
    title: 'Laporan Kas Kas Masuk',
    message: 'Bendahara telah mencatat penerimaan DP Job sebesar Rp 1.500.000 ke dalam kas internal Khoirunnada.',
    type: 'finance',
    target_type: 'treasurer',
    target_url: '/app/finance',
    is_read: true,
    created_at: '2026-09-21T11:02:00Z',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'user-admin',
    user_name: 'Ustadz Hilman Ash-Shiddiq',
    action: 'CONFIRM_BOOKING_TO_JOB',
    entity_type: 'BOOKING',
    entity_id: 'bk-1',
    description: 'Mengonversi booking KN-2026-00125 menjadi Job Walimatul Ursy Sarah & Fajar',
    created_at: '2026-09-22T11:00:00Z',
  },
  {
    id: 'log-2',
    user_id: 'user-treasurer',
    user_name: 'Ahmad Fauzi Rahman',
    action: 'CREATE_TRANSACTION',
    entity_type: 'FINANCE',
    entity_id: 'trx-1',
    description: 'Menambahkan pemasukan DP Rp 1.500.000 terkait Job Walimatul Ursy',
    created_at: '2026-09-21T11:00:00Z',
  },
];
