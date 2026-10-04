insert into public.qosidah (
  title, alternate_title, arabic_text, latin_text, translation,
  category_id, tags, notes, sort_order
)
select
  seed.title, seed.alternate_title, seed.arabic_text, seed.latin_text,
  seed.translation, category.id, seed.tags, seed.notes, seed.sort_order
from (
  values
  (
    'Sholawat Nahdliyah',
    'Allahumma Sholli ‘Ala Sayyidina Muhammad',
    E'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ\nصَلَاةً تُغَيِّرُ بِهَا حَالَنَا إِلَى أَحْسَنِ حَالٍ\nوَتَجْعَلُنَا بِهَا مِنْ عِبَادِكَ الصَّالِحِينَ\nوَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ\n\nاللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ\nصَلَاةً تَرْزُقُنَا بِهَا عِلْمًا نَافِعًا\nوَتُوَفِّقُنَا بِهَا لِخِدْمَةِ الدِّينِ وَالْوَطَنِ\nبِجَاهِ نَبِيِّكَ الْأَمِينِ',
    E'Allahumma sholli ''alaa sayyidinaa Muhammad\nSholaatan tughayyiru bihaa haalanaa ilaa ahsanil haal\nWa taj''alunaa bihaa min ''ibaadikas shoolihiin\nWa ''alaa aalihii wa shohbihii wa sallim\n\nAllahumma sholli ''alaa sayyidinaa Muhammad\nSholaatan tarzuqunaa bihaa ''ilman naafi''aa\nWa tuwaffiqunaa bihaa li khidmatid diini wal wathan\nBi jaahi nabiyyikal amiin',
    'Ya Allah, limpahkanlah rahmat kepada junjungan kami Nabi Muhammad, ubahlah keadaan kami menjadi sebaik-baik keadaan, dan jadikan kami termasuk hamba-Mu yang shalih.',
    'sholawat', array['Nahdliyah', 'Wajib', 'Semangat']::text[],
    'Bawakan dengan tempo sedang, ritme terbang Banjari rancak.', 1
  ),
  (
    'Ya Thoybah',
    'Yaa Thoybah Yaa Dawal ‘Ayaana',
    E'يَا طَيْبَةْ يَا طَيْبَةْ يَا دَوَا الْعَيَانَا\nاِشْتَقْنَا لِكْ وَالْهَوَى نَدَانَا\nوَالْهَوَى نَدَانَا\n\nسَيِّدِي يَا أَبَا بَكْرٍ حُبُّكُمْ فِي الْقَلْبِ حَلَّ\nيَا عُمَرُ اقْضِ لِي أَمْرِي وَعَلِيُّ مَعَ عُثْمَانَا\n\nيَا حَسَنُ مَعَ حُسَيْنٍ لِلنَّبِيِّ قُرَّةُ عَيْنٍ\nيَا شَبَابَ الْجَنَّتَيْنِ جَدُّكُمْ صَاحِبُ الْقُرْآنَا',
    E'Yaa Thoybah yaa Thoybah yaa dawal ''ayaanaa\nIsytaqnaalik wal hawaa nadaanaa\nWal hawaa nadaanaa\n\nSayyidii yaa Abaa Bakrin hubbukum fil qalbi halla\nYaa ''Umaruqdhi lii amrii wa ''Aliyyun ma''a ''Utsmaanaa\n\nYaa Hasan ma''a Husainin lin-nabiyyi qurratu ''ainin\nYaa syabaaball jannataini jaddukum shoohibul Qur''aanaa',
    'Wahai Madinah Thoybah, penyembuh dahaga kerinduan kami. Kami merindukanmu dan gelora cinta telah memanggil kami.',
    'qosidah-inti', array['Klasik', 'Favorit', 'Madinah']::text[],
    'Vokal 1 dan Vokal 2 bersahut-sahutan di bait kedua.', 2
  ),
  (
    'Mahalul Qiyam (Simthud Duror)',
    'Yaa Nabi Salaam ‘Alaika',
    E'يَا نَبِي سَلَامٌ عَلَيْكَ\nيَا رَسُول سَلَامٌ عَلَيْكَ\nيَا حَبِيب سَلَامٌ عَلَيْكَ\nصَلَوَاتُ اللَّهِ عَلَيْكَ\n\nأَشْرَقَ الْبَدْرُ عَلَيْنَا\nفَاخْتَفَتْ مِنْهُ الْبُدُورُ\nمِثْلَ حُسْنِكْ مَا رَأَيْنَا\nقَطُّ يَا وَجْهَ السُّرُورِ\n\nأَنْتَ شَمْسٌ أَنْتَ بَدْرٌ\nأَنْتَ نُورٌ فَوْقَ نُورٍ\nأَنْتَ إِكْسِيرٌ وَغَالِي\nأَنْتَ مِصْبَاحُ الصُّدُورِ',
    E'Yaa Nabii salaam ''alaika\nYaa Rasuul salaam ''alaika\nYaa Habiib salaam ''alaika\nSholawaatullaah ''alaika\n\nAsyraqal badru ''alainaa\nFakhtafat minhul buduuru\nMitsla husnik maa ra-ainaa\nQotthu yaa wajhas suruuri\n\nAnta syamsun anta badrun\nAnta nuurun fauqa nuuri\nAnta iksiirun wa ghaalii\nAnta mishbaahus shuduuri',
    'Wahai Nabi, Rasul, dan Kekasih Allah, salam sejahtera dan sholawat Allah tercurah kepadamu.',
    'mahalul-qiyam', array['Sakral', 'Berdiri', 'Maulid']::text[],
    'Posisi berdiri tegak penuh adab, tabuhan bass lembut dan ritmis.', 3
  ),
  (
    'Rouhi Fidak',
    'Maddad Yaa Rasulallah',
    E'رُوحِي فِدَاكَ يَا رَسُولَ اللَّهِ\nيَا خَيْرَ خَلْقِ اللَّهِ كُلِّهِمِ\nمَالِي سِوَاكَ أَرْتَجِي مَدَدًا\nعِنْدَ الشَّدَائِدِ وَالْكُرَبِ الْعِظَامِ\n\nأَنْتَ الشَّفِيعُ لِكُلِّ مُذْنِبٍ\nيَوْمَ الْقِيَامَةِ فِي الْمَحْشَرِ\nفَاغْفِرْ لَنَا يَا رَبَّنَا زَلَلًا\nبِجَاهِ أَحْمَدَ خَيْرِ مَنْ وَطِئَ الثَّرَى',
    E'Rouhii fidaaka yaa Rasuulallaah\nYaa khaira khalqillaahi kullihimi\nMaalii siwaaka artajii madadan\n''Indasy-syadaa-idi wal kurabil ''izhaam\n\nAntasy-syafii''u likulli mudznibin\nYaumal qiyaamati fil mahsyari\nFaghfir lanaa yaa Rabbanaa zalalan\nBi jaahi Ahmada khairi man wathi-ats-tsaraa',
    'Jiwaku sebagai tebusan untukmu wahai Rasulullah, wahai sebaik-baik seluruh makhluk ciptaan Allah.',
    'qosidah-inti', array['Mahabbah', 'Rancak', 'Modern']::text[],
    'Pukulan keprak rapat saat masuk chorus kedua.', 4
  ),
  (
    'Busyro Lana',
    'Nilnal Munaa Zaalal ‘Anaa',
    E'بُشْرَى لَنَا نِلْنَا الْمُنَى\nزَالَ الْعَنَا وَافَى الْهَنَا\nوَالدَّهْرُ أَنْجَزَ وَعْدَهُ\nوَالْبِشْرُ أَضْحَى مُعْلَنَا\n\nيَا نَفْسُ طِيبِي بِاللِّقَا\nيَا عَيْنُ قَرِّي أَعْيُنَا\nهَذَا جَمَالُ الْمُصْطَفَى\nأَنْوَارُهُ لَاحَتْ لَنَا',
    E'Busyraa lanaa nilnal munaa\nZaalal ''anaa waafal hanaa\nWaddahru anjaza wa''dahu\nWal bisyru adl-haa mu''lanaa\n\nYaa nafsu thiibii bil liqaa\nYaa ''ainu qarrii a''yunaa\nHaadzaa jamaalul Mushthafaa\nAnwaaruhuu laahat lanaa',
    'Kabar gembira bagi kita, kita telah mencapai harapan. Hilanglah segala kesulitan dan datanglah kebahagiaan.',
    'sholawat', array['Gembira', 'Pernikahan', 'Walimah']::text[],
    'Sangat cocok untuk pembuka acara pernikahan atau walimatul ursy.', 5
  ),
  (
    'Qosidah Burdah (Maula ya sholli)',
    'Mawlaaya Sholli wa Sallim Daa-iman Abadaa',
    E'مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا\nعَلَى حَبِيبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ\n\nهُوَ الْحَبِيبُ الَّذِي تُرْجَى شَفَاعَتُهُ\nلِكُلِّ هَوْلٍ مِنَ الْأَهْوَالِ مُقْتَحَمِ\n\nيَا رَبِّ بِالْمُصْطَفَى بَلِّغْ مَقَاصِدَنَا\nوَاغْفِرْ لَنَا مَا مَضَى يَا وَاسِعَ الْكَرَمِ',
    E'Mawlaaya sholli wa sallim daa-iman abadaa\n''Alaa Habiibika khairil khalqi kullihimi\n\nHuwal Habiibul ladzii turjaa syafaa''atuhu\nLikulli haulin minal ahwaali muqtahami\n\nYaa Rabbi bil Mushthafaa balligh maqaashidanaa\nWaghfir lanaa maa madhaa yaa Waasi''al Karami',
    'Wahai Tuhanku, limpahkanlah sholawat dan salam selama-lamanya kepada Kekasih-Mu, sebaik-baik seluruh ciptaan.',
    'pembukaan', array['Imam Bushiri', 'Berkah', 'Adab']::text[],
    'Bawakan bait istighfar dengan khusyuk di awal.', 6
  )
) as seed(title, alternate_title, arabic_text, latin_text, translation, category_slug, tags, notes, sort_order)
join public.qosidah_categories category on category.slug = seed.category_slug
where not exists (
  select 1 from public.qosidah existing where existing.title = seed.title
);
