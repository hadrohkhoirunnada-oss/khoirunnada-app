# PRODUCT REQUIREMENTS DOCUMENT  
## Khoirunnada Web App

**Versi:** 1.0  
**Status:** Foundation / Locked Requirements  
**Platform:** Progressive Web App — Mobile Only  
**Frontend:** Next.js + React JSX + Tailwind CSS  
**Database & Backend Services:** Supabase  
**Hosting:** Vercel  
**Authentication:** Google OAuth  
**Produk:** Internal Management & Qosidah App untuk Grup Hadroh Khoirunnada

---

# 1. PRODUCT OVERVIEW

Khoirunnada Web App adalah aplikasi berbasis web yang dirancang khusus untuk membantu kegiatan internal Grup Hadroh Khoirunnada.

Aplikasi dibuat dengan pendekatan **mobile-only Progressive Web App (PWA)** sehingga dapat dibuka melalui browser smartphone dan dipasang ke Home Screen layaknya aplikasi native.

Aplikasi memiliki dua lingkungan utama:

### Public Area
Area yang dapat dibuka oleh masyarakat tanpa login.

Untuk versi awal, public area hanya terdiri dari:

- Halaman Booking Khoirunnada
- Halaman konfirmasi setelah booking

Public area dapat diakses melalui QR Code yang dibagikan oleh Khoirunnada.

### Internal App
Area privat yang hanya dapat digunakan oleh anggota yang telah:

1. Login menggunakan akun Google.
2. Mendapat persetujuan Admin Khoirunnada.

Internal App digunakan untuk:

- Qosidah
- Jadwal Job
- Informasi Job
- Konfirmasi kehadiran
- Notifikasi
- Keuangan
- Pengelolaan booking
- Pengelolaan anggota
- Pengelolaan Qosidah
- Pengaturan aplikasi

---

# 2. PRODUCT VISION

Membangun satu aplikasi pusat untuk seluruh aktivitas operasional Khoirunnada.

Aplikasi harus dapat digunakan ketika:

- Latihan.
- Tampil dalam suatu acara.
- Mendapat permintaan job.
- Mengatur jadwal.
- Mengelola anggota.
- Mengelola pemasukan dan pengeluaran.
- Membagikan informasi kepada seluruh anggota.

Tujuan akhirnya adalah membuat operasional Khoirunnada:

**lebih terorganisir, lebih profesional, lebih praktis, dan terdokumentasi dengan baik.**

---

# 3. CORE PRODUCT PRINCIPLES

Seluruh pengembangan aplikasi wajib mengikuti prinsip berikut.

### 3.1 Mobile First, Mobile Only

Internal App dirancang khusus untuk smartphone.

Tidak perlu membuat versi dashboard desktop penuh.

UI harus terasa seperti aplikasi mobile native.

### 3.2 Tema Desain: Premium Islamic Glassmorphism (Frosted Elegance)

Aplikasi Khoirunnada mengadopsi tema visual **Premium Islamic Glassmorphism** yang dirancang secara bespoke (handcrafted), berwibawa, dan berdisiplin tinggi.

Karakteristik Glassmorphism Khoirunnada:

- **Frosted Glass Surfaces**: Seluruh permukaan kartu, floating dock, modal, dan sheet menggunakan efek kaca buram berkualitas tinggi (`backdrop-filter: blur(12px – 20px)`) dengan tingkat opasitas yang dikalibrasi ketat.
- **Atmospheric Warmth**: Latar belakang dasar menggunakan Warm Ivory (`#F8F6F0`) pada Light Mode dengan pencahayaan ambient difus yang hangat dan lembut, memberikan pantulan cahaya tenang ke dalam lapisan kaca.
- **Specular Rim Lighting**: Setiap bidang kaca dibingkai oleh garis tipis 1px dengan pantulan cahaya specular halus (edge reflection) yang meniru sifat optik kaca fisik nyata, bukan garis tebal kartun.
- **Sacred Royal Gold & Obsidian Luminescence**: Warna emas kerajaan majelis (`#996A19` / `#B58228`) dan sentuhan obsidian pekat (`#0D100F` / `#151917`) berfungsi sebagai aksen bercahaya yang sakral, megah, dan anggun sesuai logo resmi Khoirunnada.
- **Legibility First**: Efek kaca dan blur tidak pernah diizinkan mengorbankan keterbacaan teks. Kontras tipografi adalah hukum tertinggi yang tidak dapat ditawar.

### 3.3 Disiplin Glassmorphism (Bukan Gimmick Visual)

Glassmorphism di Khoirunnada bukan sekadar tren kosmetik atau hiasan visual sesaat, melainkan arsitektur fungsional untuk menciptakan hierarki kedalaman (spatial depth) yang intuitif:

- Memisahkan konten yang sedang aktif dengan latar belakang secara elegan tanpa membebani mata pengguna.
- Memberikan konteks visual yang tenang saat digunakan di panggung majelis, sesi latihan, maupun administrasi harian.
- Mengurangi kebutuhan elemen pemisah berat (seperti drop shadow hitam tebal atau garis pemisah hitam kaku).

Prinsip utama:

**Less UI Clutter, Pure Frosted Depth, Superior Hierarchy.**

### 3.4 Utility First

Setiap halaman harus memiliki tujuan yang jelas.

Pengguna harus dapat menemukan fungsi utama dengan cepat.

### 3.5 Secure by Default

Semua data internal harus dilindungi.

Public user tidak boleh dapat mengakses data:

- Anggota.
- Qosidah internal.
- Keuangan.
- Booking management.
- Job internal.
- Notifikasi.
- Dashboard.

---

# 3.A PERATURAN KERAS ANTI-AI SLOP (10 MANDAT MUTLAK UI/UX)

Untuk mencegah aplikasi terlihat seperti template AI murahan (*AI-generated slop*), hasil *vibe-coding* ceroboh, atau tiruan SaaS generik yang tidak memiliki jiwa, seluruh pengembangan UI/UX Khoirunnada **WAJIB MEMATUHI 10 PERATURAN KERAS TANPA KOMPROMI** berikut:

---

### MANDAT I: LARANGAN MUTLAK PALET WARNA AI-SAAS CLICHÉ & CYBERPUNK NEON

1. **Dilarang Keras**: Menggunakan skema warna default template AI seperti latar belakang hitam legam pekat (#000000) yang dipadukan dengan gradasi neon ungu (purple/violet), biru elektrik, fuchsia, atau cyan glow.
2. **Dilarang Keras**: Menggunakan border pelangi RGB menyala (*rainbow glowing borders*) yang biasa ditemui di situs crypto/web3 generik.
3. **Ketetapan Mutlak**: Identitas warna Khoirunnada berakar pada ketenangan religius Islam:
   - **Primary Brand**: Royal Brand Gold (`#996A19` / `#B58228`) yang matang dan berwibawa.
   - **Base Canvas**: Warm Ivory (`#F8F6F0`) untuk Light Mode dan Obsidian Jet Black (`#0D1210`) untuk Dark Mode.
   - **Aksen Suci**: Muted Gold (`#B58A3A`) yang diterapkan secara hemat dan bernilai tinggi.

---

### MANDAT II: KETERBACAAN TEKS ADALAH HUKUM TERTINGGI (LEGIBILITY FIRST)

1. **Dilarang Keras**: Menempatkan teks dengan kontras rendah (*washed-out grey text*) di atas permukaan kaca transparan.
2. **Standar WCAG 2.1 AA/AAA**: Seluruh teks konten, judul, jadwal Job, dan teks Qosidah wajib memiliki rasio kontras minimal **4.5:1** (normal text) dan minimal **3:1** (large text) terhadap latar belakang kaca di belakangnya.
3. **Proteksi Teks Arab**: Teks Arab Qosidah tidak boleh mengalami efek blur, bayangan ganda yang mengaburkan harakat, atau transparansi yang membuat tajwid sulit dibaca oleh vokalis di atas panggung.
4. Jika latar belakang bergerak atau memiliki gambar, kaca pelindung teks **wajib memiliki tingkat opasitas dasar minimal 70%** dan blur minimal 16px untuk mengunci kontras tetap tajam.

---

### MANDAT III: LARANGAN "DRIBBLE-ONLY GLASS" & TRANSPARANSI ILEGAL

1. **Dilarang Keras**: Membuat kaca yang terlalu tembus pandang (opacity < 30%) sehingga elemen di belakangnya bertumpuk dan menimbulkan kekacauan visual (*visual noise soup*).
2. **Backdrop Tinting & Saturation Wajib**: Setiap panel Glassmorphism wajib mengkombinasikan:
   - Tint warna semi-transparan (`rgba(255, 255, 255, 0.70 - 0.85)` pada Light Mode, atau `rgba(23, 30, 26, 0.65 - 0.80)` pada Dark Mode).
   - `backdrop-filter: blur(12px - 20px) saturate(160% - 180%)`.
3. Saturation boost diperlukan untuk menjaga warna di balik kaca tetap hidup dan hangat, bukan abu-abu kotor (*muddy grey*).

---

### MANDAT IV: LARANGAN CARD NESTING SOUP & WIDGET BLOAT

1. **Dilarang Keras**: Membungkus setiap elemen kecil ke dalam card terpisah (*card inside card inside card*). Ini adalah ciri khas utama layout AI generik yang malas mengatur whitespace.
2. **Whitespace over Containers**: Pemisahan informasi wajib diprioritaskan menggunakan jarak ruang (*spatial padding*), skala tipografi, dan pembagi kaca tipis (divider), bukan dengan menumpuk kartu.
3. **Dilarang Menambahkan Widget Kosong**: Dilarang memasukkan grafik statistik buatan, meteran persentase fiktif, kartu ucapan selamat datang berlebihan, atau metrik yang tidak diminta oleh pengguna operasional Hadroh.

---

### MANDAT V: LARANGAN ELEMEN HIASAN MELAYANG (FLOATING BLOBS & SPARKLES)

1. **Dilarang Keras**: Memasang ornamen lingkaran gradasi blur yang melayang (*floating neon blur orbs*), partikel bintang/sparkle tanpa arti, atau jaring-jaring 3D mesh yang tidak memiliki fungsi interaktif.
2. **Pencahayaan Fungsional**: Gradasi dan cahaya hanya boleh hadir sebagai latar belakang ambient difus yang statis atau sangat halus, semata-mata untuk memberi materi pada kaca agar memiliki efek refraksi optik yang nyata dan menenangkan.

---

### MANDAT VI: INTEGRITAS TIPOGRAFI ARAB & LATIN HADROH

1. **Dilarang Keras**: Merender teks Arab Qosidah menggunakan font sistem default komputer/smartphone yang gepeng, patah-patah, atau memotong harakat atas/bawah.
2. **Ketetapan Font Arab**: Menggunakan **Noto Naskh Arabic** dengan kerning yang lega, line-height minimal **2.2x – 2.5x**, dan alignment RTL yang sempurna.
3. **Ketetapan Font Latin**: Menggunakan **Plus Jakarta Sans** (atau Inter) dengan rentang bobot yang disiplin (Regular 400, Medium 500, SemiBold 600). Dilarang membold hampir seluruh teks seperti pada template AI amatir.

---

### MANDAT VII: LARANGAN COPYWRITING AI GENERIK (NO CORPORATE SAAS JARGON)

1. **Dilarang Keras**: Menggunakan bahasa promosi ala korporat Silicon Valley seperti:
   - *"Supercharge your Hadroh workflow with cutting-edge synergy."*
   - *"Revolutionize your booking management experience."*
   - *"Unlock the power of next-generation vocal collaboration."*
2. **Bahasa Resmi Khoirunnada**: Menggunakan Bahasa Indonesia yang hangat, bersahaja, santun, bernuansa kekeluargaan Islami, dan lugas secara operasional (contoh: *"Jadwal Job Terdekat"*, *"Konfirmasi Kehadiran Anggota"*, *"Teks Qosidah Khoirunnada"*, *"Catatan Keuangan Kas"*).

---

### MANDAT VIII: DISIPLIN SEMANTIK IKON (NO DECORATIVE ICON SPAM)

1. **Dilarang Keras**: Menaburkan ikon secara sembarangan di setiap sudut tombol dan judul hanya untuk "mengisi kekosongan".
2. **Dilarang Keras**: Menggunakan emoji warna-warni sebagai pengganti ikon antarmuka resmi.
3. **Ketetapan Ikon**: Ikon wajib berasal dari satu keluarga desain konsisten (Lucide Icons dalam wujud stroke 1.75px – 2px yang presisi). Setiap ikon harus memiliki fungsi semantik navigasi yang jelas atau penanda status sistem.

---

### MANDAT IX: FISIKA GERAK & ERGONOMI SENTUH NYATA (REAL-DEVICE ERGONOMICS)

1. **Dilarang Keras**: Menerapkan animasi pantul kekanak-kanakan (*bouncing animation*) atau efek hovering kompleks yang hanya bagus di layar mouse desktop namun merusak pengalaman sentuhan jari smartphone.
2. **Area Sentuh Ergonomis**: Setiap tombol, tautan, dan elemen interaktif wajib memiliki area sentuh (*hit target*) minimal **44 × 44px**.
3. **Motion Physics**: Transisi kaca, buka-tutup sheet, dan feedback tombol menggunakan kurva pegas halus (*cubic-bezier easing*) dengan durasi cepat **150ms – 250ms**, memberikan respons taktil yang instan dan berkelas.

---

### MANDAT X: JAMINAN PERFORMA & FALLBACK HARDWARE (ANTI LAG GUARANTEE)

1. **Dilarang Keras**: Menyebabkan penurunan frame rate (*stuttering/jank*) saat scrolling di perangkat smartphone kelas menengah ke bawah akibat komputasi blur berlebihan.
2. **Hardware Acceleration**: Seluruh lapisan kaca wajib memanfaatkan akselerasi GPU (`transform: translateZ(0)` atau `will-change: backdrop-filter`).
3. **CSS Fallback Mandatori**: Setiap komponen Glassmorphism wajib menyertakan fallback semi-solid untuk browser yang mematikan atau belum mendukung `backdrop-filter`:
   ```css
   @supports not (backdrop-filter: blur(1px)) {
     .glass-panel {
       background-color: rgba(248, 246, 240, 0.95);
     }
   }
   ```

---

# 4. TARGET USERS

Aplikasi memiliki empat kategori pengguna.

| User | Deskripsi |
|---|---|
| Public | Masyarakat atau calon pemesan |
| Pending User | User Google yang belum dikonfirmasi Admin |
| Member | Anggota resmi Khoirunnada |
| Privileged Member | Member dengan akses tambahan seperti Admin atau Bendahara |

---

# 5. ROLE SYSTEM

Role menggunakan konsep **additive permission**.

Seorang Bendahara tetap merupakan anggota.

Seorang Admin juga dapat tetap merupakan anggota aktif.

Satu akun dapat memiliki lebih dari satu permission.

Contoh:

```text
Member: true
Treasurer: false
Admin: false
```

atau:

```text
Member: true
Treasurer: true
Admin: false
```

atau:

```text
Member: true
Treasurer: true
Admin: true
```

---

# 6. DEFAULT ROLES

## 6.1 Pending

User sudah login Google tetapi belum disetujui.

Hak akses:

- Halaman Waiting Approval.
- Logout.

Tidak dapat mengakses fitur internal.

---

## 6.2 Member

Hak akses:

- Home.
- Qosidah.
- Job.
- Konfirmasi kehadiran.
- Notifikasi.
- Profil.

---

## 6.3 Treasurer

Bendahara merupakan Member dengan permission tambahan.

Hak akses:

Semua hak Member ditambah:

- Dashboard keuangan.
- Tambah pemasukan.
- Tambah pengeluaran.
- Edit transaksi.
- Upload bukti transaksi.
- Melihat laporan.
- Melihat saldo.

---

## 6.4 Admin

Admin merupakan Member dengan permission administratif.

Hak akses:

Semua hak Member ditambah:

- Kelola booking.
- Kelola job.
- Kelola anggota.
- Approval anggota.
- Kelola Qosidah.
- Kelola notifikasi/pengumuman.
- Memberikan role Bendahara.
- Mencabut role Bendahara.
- Memberikan permission Admin.
- Menonaktifkan akun.
- Pengaturan aplikasi.

Admin juga dapat memiliki permission Treasurer.

---

# 7. AUTHENTICATION

Authentication menggunakan:

**Google OAuth**

Tidak tersedia:

- Register email/password.
- Login email/password.
- Forgot password.

Aplikasi tidak menyimpan password pengguna.

---

# 8. FIRST LOGIN FLOW

Flow pengguna pertama kali:

```text
Open App
↓
Login dengan Google
↓
Google Authentication berhasil
↓
Profile dibuat di database
↓
Status = Pending
↓
Waiting Approval Screen
↓
Admin menerima permintaan
↓
Admin menyetujui
↓
Status menjadi Active Member
↓
User mendapatkan akses aplikasi
```

---

# 9. MEMBER APPROVAL

Admin mempunyai halaman:

**Member Requests**

Informasi yang ditampilkan:

- Foto Google.
- Nama.
- Email.
- Waktu login pertama.
- Status akun.

Action:

- Approve.
- Reject.

Saat Approve:

Default permission:

```text
Member = true
Treasurer = false
Admin = false
```

---

# 10. ACCOUNT DEACTIVATION

Jika seseorang sudah tidak menjadi anggota Khoirunnada:

Admin dapat memilih:

**Deactivate Member**

Data historis tidak dihapus.

User tidak lagi dapat membuka aplikasi internal.

Status menjadi:

`inactive`

Jika login kembali, tampil informasi bahwa akun tidak memiliki akses.

---

# 11. PUBLIC ACCESS ARCHITECTURE

Public user hanya memiliki akses ke:

```text
/booking
/booking/success
```

Public user tidak mempunyai navigation menuju aplikasi internal.

Public user tidak dapat membuka:

```text
/home
/qosidah
/jobs
/notifications
/finance
/members
/admin
/settings
```

---

# 12. QR CODE BOOKING

Khoirunnada dapat membuat QR Code menuju halaman:

```text
/booking
```

QR dapat ditempatkan pada:

- Banner.
- Brosur.
- Kartu nama.
- Poster.
- Instagram.
- WhatsApp.
- Undangan.
- Materi promosi.
- Dokumentasi acara.

---

# 13. PUBLIC BOOKING PAGE

Halaman Booking mengadopsi tema **Frosted Glass Container** yang tenang dan sakral di atas kanvas Warm Ivory (`#F8F6F0`).

Visual premium, bersih, elegan, dan menumbuhkan rasa percaya tinggi bagi calon pemesan.

Struktur halaman:

### Header

- Logo Khoirunnada.
- Nama Khoirunnada.
- Tagline pendek.

### Intro

Penjelasan singkat bahwa pengguna dapat mengirim permintaan booking.

### Booking Form

Field utama:

**Nama Pemesan**

Required.

**Nomor WhatsApp**

Required.

**Jenis Acara**

Pilihan seperti:

- Pernikahan.
- Walimatul Ursy.
- Maulid Nabi.
- Aqiqah.
- Pengajian.
- Haflah.
- Khitan.
- Majelis.
- Acara Instansi.
- Lainnya.

**Nama / Judul Acara**

Optional.

**Tanggal Acara**

Required.

**Waktu Acara**

Required jika sudah diketahui.

**Lokasi Acara**

Required.

**Detail Lokasi**

Optional.

**Catatan**

Optional.

---

# 14. BOOKING CTA

Primary CTA:

**Kirim Permintaan Booking**

Setelah berhasil:

User diarahkan ke:

```text
/booking/success
```

---

# 15. BOOKING SUCCESS PAGE

Menampilkan:

**Permintaan Booking Berhasil Dikirim**

Informasi:

- Khoirunnada telah menerima permintaan.
- Admin akan melakukan konfirmasi.
- Pastikan nomor WhatsApp aktif.

Tidak perlu menampilkan data internal lainnya.

---

# 16. BOOKING STATUS

Setiap booking mempunyai status.

```text
new
contacted
negotiation
waiting_dp
confirmed
completed
cancelled
rejected
```

Tampilan user-friendly:

- Baru
- Sudah Dihubungi
- Negosiasi
- Menunggu DP
- Terkonfirmasi
- Selesai
- Dibatalkan
- Ditolak

---

# 17. BOOKING ADMIN FLOW

Booking masuk ke dashboard Admin.

Card booking menampilkan:

- Nama pemesan.
- Jenis acara.
- Tanggal.
- Lokasi.
- Nomor WhatsApp.
- Status.

Admin dapat membuka detail booking.

---

# 18. WHATSAPP INTEGRATION

Pada detail booking terdapat:

**Hubungi via WhatsApp**

Saat ditekan:

WhatsApp dibuka menuju nomor pelanggan dengan template pesan otomatis.

Contoh struktur:

```text
Assalamu'alaikum Kak [Nama].

Kami dari Hadroh Khoirunnada.

Kami telah menerima permintaan booking untuk acara [Jenis Acara] pada [Tanggal].

Kami ingin melakukan konfirmasi lebih lanjut terkait acara tersebut.

Terima kasih.
```

Admin tetap dapat mengedit pesan sebelum mengirim.

---

# 19. BOOKING TO JOB CONVERSION

Booking dan Job merupakan dua entity berbeda.

### Booking

Permintaan calon pelanggan.

### Job

Acara resmi yang sudah dikonfirmasi Khoirunnada.

Flow:

```text
Booking Baru
↓
Admin menghubungi calon pelanggan
↓
Negosiasi
↓
Kesepakatan
↓
Admin memilih "Konfirmasi Sebagai Job"
↓
Job dibuat
↓
Anggota mendapatkan notifikasi
```

---

# 20. JOB MODULE

Job merupakan pusat informasi kegiatan Khoirunnada.

Setiap Job mempunyai:

- Nama acara.
- Jenis acara.
- Pemesan.
- Nomor WhatsApp.
- Tanggal.
- Jam kumpul.
- Jam acara.
- Lokasi.
- Link Maps.
- Catatan.
- Status.
- Dress code jika ada.
- Informasi transport jika ada.
- Informasi khusus.

---

# 21. JOB STATUS

Status:

```text
upcoming
ongoing
completed
cancelled
```

UI:

- Akan Datang.
- Sedang Berlangsung.
- Selesai.
- Dibatalkan.

---

# 22. JOB MEMBER NOTIFICATION

Saat Job dibuat dan dikonfirmasi:

Seluruh Member menerima notifikasi.

Contoh:

```text
Job Baru

Pernikahan
Sabtu, 10 Oktober 2026
19.30 WITA

Tap untuk melihat detail.
```

---

# 23. ATTENDANCE CONFIRMATION

Anggota dapat memberi status kehadiran pada setiap Job.

Pilihan:

- Hadir.
- Tidak Bisa Hadir.
- Belum Pasti.

Admin dapat melihat rekap anggota.

Contoh:

```text
Hadir: 12
Tidak Hadir: 2
Belum Menjawab: 4
```

---

# 24. PERSONNEL ASSIGNMENT

Admin dapat memberikan tugas pada anggota dalam Job.

Contoh posisi:

- Vokal Utama.
- Backing Vocal.
- Terbang.
- Bass.
- Tam.
- Keprak.
- Dokumentasi.
- Driver.
- Koordinator.
- Posisi lainnya.

Assignment bersifat fleksibel.

Admin dapat membuat nama posisi sendiri.

---

# 25. JOB DETAIL PAGE

Job detail mempunyai sections:

### Event

Nama dan jenis acara.

### Date & Time

Tanggal, jam kumpul dan jam acara.

### Location

Alamat dan tombol:

**Buka Maps**

### Attendance

Status kehadiran pengguna.

### Team

Daftar personel dan assignment.

### Notes

Informasi tambahan.

---

# 26. QOSIDAH MODULE

Qosidah menjadi salah satu fitur utama aplikasi.

Tujuan utamanya:

- Latihan.
- Hafalan.
- Referensi.
- Digunakan saat tampil.

---

# 27. QOSIDAH CONTENT

Setiap Qosidah dapat mempunyai:

- Judul.
- Judul alternatif.
- Teks Arab.
- Latin.
- Terjemahan.
- Catatan.
- Kategori.
- Tags.
- Urutan bait.
- Informasi versi Khoirunnada.
- Audio referensi apabila tersedia.
- Status aktif/nonaktif.

Konten Qosidah dikelola Admin menggunakan materi yang memang dimiliki atau berhak digunakan oleh Khoirunnada.

---

# 28. QOSIDAH CATEGORIES

Kategori bersifat configurable.

Contoh:

- Pembukaan.
- Sholawat.
- Mahalul Qiyam.
- Qosidah Inti.
- Penutup.
- Request.
- Latihan.
- Lainnya.

---

# 29. QOSIDAH SEARCH

Member dapat mencari Qosidah berdasarkan:

- Judul.
- Kata.
- Latin.
- Kategori.
- Tag.

Search harus cepat dan mudah digunakan ketika latihan atau tampil.

---

# 30. FAVORITE QOSIDAH

User dapat menandai Qosidah:

**Favorite**

Favorite disimpan berdasarkan akun.

---

# 31. RECENT QOSIDAH

Home atau halaman Qosidah dapat menampilkan:

**Terakhir Dibuka**

Untuk mempermudah kembali ke Qosidah sebelumnya.

---

# 32. PERFORMANCE MODE

Qosidah mempunyai mode khusus:

**Performance Mode**

Tujuannya digunakan saat Khoirunnada tampil.

UI harus sangat minimal.

Fokus utama:

**teks Qosidah.**

Fitur:

- Font besar.
- Increase font size.
- Decrease font size.
- Previous Qosidah.
- Next Qosidah.
- Scroll nyaman.
- Screen friendly.
- Minimal controls.
- Tidak menampilkan Bottom Navigation selama mode tampil jika mengganggu.

---

# 33. PERFORMANCE MODE DESIGN

Background:

`#F8F6F0` (Kanvas Light) atau `#0D1210` (Kanvas Dark saat panggung temaram)

Primary text:

`#151917` (High Contrast Charcoal) / `#FFFFFF` (Pristine White pada Dark Mode)

Accent:

`#996A19`

Disiplin Glassmorphism saat Tampil (On-Stage Performance):

- Menggunakan **Matte High-Legibility Glass** dengan opasitas tinggi (90%+) untuk mengeliminasi distorsi optik di bawah sorotan lampu panggung (stage spotlights).
- Kontrol font size dan navigasi bait dibungkus dalam floating glass pill dengan efek blur halus agar tidak menutupi bait suci.
- Arabic typography wajib memiliki line-height minimal 2.2x – 2.5x dengan harakat tajam bebas halasi.

---

# 34. FINANCE MODULE

Finance hanya dapat dikelola oleh:

- Treasurer.
- Admin dengan permission finance jika dibutuhkan.

Tujuan:

Mencatat seluruh keuangan Khoirunnada.

---

# 35. FINANCE DASHBOARD & TRANSPARANSI KAS

Menampilkan struktur ringkas dan langsung:

1. **Card Ringkasan Kas**:
   - Total Uang Kas (Saldo aktif Hadroh).
   - Uang Masuk & Uang Keluar (beradaptasi secara dinamis sesuai periode yang dipilih).

2. **Filter Periode & Kalender (Tepat di Bawah Card Kas)**:
   - Tanpa tombol perantara ("Catat Transaksi" dan "Histori Lengkap" dihapus dari bawah card; pencatatan transaksi kas baru dilakukan via tombol header bagi Bendahara/Admin).
   - Pilihan tab periode cepat: **Semua**, **Minggu Ini**, **Bulan Ini**, **Tahun Ini**.
   - **Tombol Kalender**: Membuka pemilih rentang tanggal (*Date Picker*) kustom untuk menyaring transaksi pada tanggal atau rentang waktu spesifik.
   - Filter jenis aliran cepat: Semua Aliran, Pemasukan, Pengeluaran.

3. **Riwayat Transaksi Lengkap**:
   - Langsung memunculkan histori transaksi lengkap tanpa perlu pindah halaman.
   - Menampilkan kategori, deskripsi, tanggal, nominal (+/-), dan indikator bukti nota.
   - Ketukan pada kartu transaksi membuka popup detail rincian dan preview kuitansi/nota.

---

# 36. FINANCE TRANSACTION TYPES

Dua jenis utama:

### Income

Contoh:

- Pembayaran Job.
- Kas.
- Donasi.
- Bantuan.
- Pendapatan lainnya.

### Expense

Contoh:

- Transport.
- Konsumsi.
- Peralatan.
- Perawatan alat.
- Seragam.
- Dokumentasi.
- Operasional.
- Pengeluaran lainnya.

---

# 37. FINANCE TRANSACTION DATA

Setiap transaksi memiliki:

- Type.
- Amount.
- Category.
- Date.
- Description.
- Created by.
- Receipt attachment.
- Related Job apabila ada.
- Created at.
- Updated at.

---

# 38. FINANCE ATTACHMENT

Treasurer dapat upload:

- Foto nota.
- Bukti transfer.
- Kwitansi.
- Dokumentasi transaksi.

File disimpan menggunakan Supabase Storage.

---

# 39. FINANCE EDITING

Treasurer dapat:

- Create.
- Edit.
- Delete.

Namun setiap perubahan sensitif harus tercatat dalam Audit Log.

---

# 40. FINANCE AUDIT LOG

Audit menyimpan:

- Siapa melakukan perubahan.
- Jenis tindakan.
- ID transaksi.
- Waktu.
- Data sebelum perubahan jika diperlukan.
- Data setelah perubahan jika diperlukan.

---

# 41. MEMBER FINANCE ACCESS

Pemain (Member):
- Memiliki hak akses transparansi keuangan kas Hadroh Khoirunnada.
- Hanya dapat melihat: **Total Uang Kas**, **Uang Masuk**, dan **Uang Keluar**.
- Tidak dapat melihat detail pembukuan transaksi perorangan/nota dan tidak memiliki akses pencatatan transaksi kas.
- Pengelolaan, pencatatan transaksi baru, dan histori pembukuan lengkap hanya dapat diakses oleh Bendahara dan Admin.

---

# 42. HOME PAGE

Home merupakan dashboard Member.

Tidak boleh terlalu padat.

Komponen utama:

### Greeting

Contoh:

```text
Assalamu'alaikum, Ahmad
```

### Upcoming Job

Menampilkan Job terdekat.

### Quick Access

Shortcut:

- Qosidah.
- Job.

Jika Treasurer:

- Keuangan.

Jika Admin:

- Booking.

### Recent Information

Pengumuman atau notifikasi penting.

---

# 43. BOTTOM NAVIGATION

Internal app menggunakan **Floating Frosted Glass Dock**:

- Latar belakang kaca buram: `backdrop-filter: blur(20px) saturate(180%)`.
- Permukaan kaca: `rgba(255, 255, 255, 0.82)` pada Light Mode atau `rgba(23, 30, 26, 0.82)` pada Dark Mode.
- Border atas tipis 1px dengan specular reflection `rgba(255, 255, 255, 0.50)` memberikan efek pemisah fisik yang anggun.
- Indikator tab aktif menggunakan kapsul kaca emas halus (`rgba(153, 106, 25, 0.12) text-[#996A19] font-semibold`).

Default untuk Member / Pemain:

```text
Home (Beranda)
Qosidah
Job (Jadwal Job)
Profil
```

Catatan Navigasi:
- Halaman Notifikasi **tidak berada di Bottom Navigation**, melainkan diakses secara eksklusif melalui ikon Lonceng pada Glass App Header di bagian atas.

Maksimal 5 primary navigation items.

Gunakan SVG icons (Lucide Icons) dengan satu visual style seragam (stroke 1.75px – 2px).

Tidak menggunakan emoji.

Area sentuh setiap tab minimal 44 × 44px dengan clearance `safe-area-inset-bottom`.

---

# 44. ADMIN ACCESS & DEDICATED ADMIN EXPERIENCE

Area Admin dirancang dengan tampilan **Executive Obsidian & Royal Gold Command Center** yang kontras dan eksklusif, berbeda secara visual dari tampilan Pemain (Light Cream Glassmorphism):

### Tema & Visual Khusus Admin:
- Latar Belakang: Dark Obsidian Black (`#070908` canvas, `#0D1210` mobile frame) dengan pencahayaan radial emas (`radial-gradient` Royal Gold `#B58228`).
- Header Admin: Menggunakan bilah obsidian gelap beraksen emas dengan badge resmi **ADMINISTRATOR / PUSAT KONTROL**, logo resmi tanpa card background, lonceng notifikasi, dan tombol pintas ke Mode Pemain.
- Card & Panel: Deep obsidian glass card (`rgba(20, 26, 23, 0.88)` dengan border specular emas `#B58228`/30) serta metrik operasional bercahaya (Booking Baru, Approval Calon Anggota, Total Job Aktif, Kas).

### Admin Bottom Navigation:
1. **Beranda Admin** (`/app/admin`) - Pusat Kontrol Operasional.
2. **Qosidah** (`/app/admin/qosidah`) - Akses Kitab Qosidah & CMS.
3. **Tambah Job** (Menggantikan Jadwal Job):
   - Ditampilkan sebagai tombol aksi menonjol bergradasi Royal Gold dengan ikon `CalendarPlus`.
   - Ketika ditekan, membuka **Popup Bottom Sheet** dari bawah ke atas (tidak full layar, `max-h-[85vh]`, `rounded-t-[32px]`) dengan animasi buka (`animate-slide-up-sheet`) dan tutup (`animate-slide-down-sheet`).
   - Di dalam popup ini Admin/Bendahara dapat mengisi data Job baru (Nama Acara, Kategori/Jenis Acara, Tanggal, Jam Kumpul, Jam Mulai, Lokasi, Tuan Rumah, Dress Code, dan Catatan) lalu menerbitkannya seketika ke seluruh anggota.
4. **Profil** (`/app/profile`) - Pengaturan Akun & Peran.

### Keamanan & Pemisahan Hak Akses Pemain:
- Halaman Pemain bebas total dari tombol maupun pintu masuk ke Admin (`Pusat Admin Hadroh`, `Alat & Menu Admin`, serta `Ganti Peran Demonstrasi` dihapus permanen).
- Pemain biasa tidak memiliki akses ke dashboard Admin maupun fungsi pencatatan/pengaturan uang kas.
- Login ke area Admin **HANYA** dapat dilakukan melalui Halaman Login resmi (tab Admin).
- Hak akses Admin dan Bendahara hanya diberikan secara ketat kepada akun yang memiliki jabatan resmi yang ditentukan.

---

# 45. NOTIFICATION CENTER

Halaman Notifikasi menyimpan:

- Job baru.
- Perubahan Job.
- Job dibatalkan.
- Pengumuman.
- Approval.
- Informasi penting lainnya.

Notifikasi memiliki:

- Title.
- Message.
- Type.
- Read/unread.
- Timestamp.
- Target URL.

---

# 46. PUSH NOTIFICATION

PWA dirancang agar mendukung push notification.

Permission tidak boleh langsung diminta saat user baru membuka aplikasi.

Permission diminta setelah:

- User sudah approved.
- User memahami kegunaannya.

Contoh prompt internal:

**Aktifkan notifikasi agar tidak melewatkan informasi Job baru dari Khoirunnada.**

---

# 47. NOTIFICATION TRIGGERS

Push notification dapat dibuat untuk:

- Job baru.
- Perubahan tanggal Job.
- Perubahan waktu Job.
- Job dibatalkan.
- Pengumuman penting.
- Reminder Job.

---

# 48. PROFILE PAGE

Profile menampilkan:

- Foto Google.
- Nama.
- Email.
- Status anggota.
- Role.
- Notification settings.
- App information.
- Logout.

Data utama dari Google tidak perlu diedit secara bebas.

---

# 49. INSTALLABLE PWA

Aplikasi harus memiliki:

- Web App Manifest.
- App Name.
- Short Name.
- Icons.
- Theme color.
- Background color.
- Standalone display.
- Installability.

Nama:

**Khoirunnada**

Short Name:

**Khoirunnada**

---

# 50. PWA LAUNCH EXPERIENCE

Saat aplikasi dibuka dari Home Screen:

Aplikasi harus terasa seperti aplikasi tersendiri.

Tidak menampilkan browser UI jika platform mendukung standalone mode.

---

# 51. PWA ICON

Gunakan logo resmi Khoirunnada.

Dibutuhkan beberapa ukuran PWA icon serta maskable icon.

Background icon harus konsisten dengan branding.

---

# 52. SPLASH EXPERIENCE

Splash sederhana.

Elemen:

- Logo Khoirunnada.
- Nama Khoirunnada.

Tidak menggunakan animasi kompleks.

---

# 53. OFFLINE EXPERIENCE

V1 tidak harus menyediakan seluruh data secara offline.

Tetapi static app shell dapat dicache.

Untuk Qosidah, post-MVP dapat dikembangkan:

**Offline Qosidah Library**

agar Qosidah tertentu tetap dapat dibaca ketika jaringan buruk.

---

# 54. MOBILE ONLY BEHAVIOR

Target utama:

```text
320px – 480px
```

Tetap responsif sampai tablet kecil.

Untuk desktop besar:

Internal App tidak perlu berubah menjadi dashboard desktop.

Dapat menampilkan container menyerupai aplikasi mobile atau halaman informasi:

**Khoirunnada App dirancang untuk digunakan melalui smartphone.**

---

# 55. PUBLIC BOOKING RESPONSIVENESS

Berbeda dengan internal app:

Halaman Booking tetap harus dapat digunakan jika calon pelanggan membukanya melalui desktop.

Namun desain utamanya tetap mobile-first.

---

# 56. DESIGN DIRECTION: PREMIUM ISLAMIC GLASSMORPHISM

Visual identity:

**Premium Islamic Glassmorphism (Frosted Elegance)**

Karakteristik visual utama:

- **Elegance & Serenity**: Menggabungkan kesakralan tradisi Hadroh dengan keindahan antarmuka kaca buram kontemporer.
- **Optical Depth**: Menghadirkan kedalaman ruang visual berlapis (*spatial layering*) yang teratur rapi tanpa kekacauan visual.
- **Bespoke Handcrafted Detail**: Setiap lengkungan sudut (*squircle*), pantulan garis border (*rim highlight*), dan bayangan difus dirancang presisi dengan tangan (anti-AI slop).
- **Modern Islamic Warmth**: Berbasis kanvas gading hangat (*Warm Ivory*) dan emas kerajaan bermartabat (*Royal Brand Gold* sesuai logo resmi), jauh dari kesan dingin atau artifisial.
- **Zero Distraction**: Seluruh estetika kaca difokuskan untuk mempermudah anggota membaca teks Qosidah, mengonfirmasi kehadiran Job, dan mengelola operasional.

---

# 56.A ARSITEKTUR 4-TIER LAYER GLASS & KEDALAMAN OPTIK

Aplikasi membagi seluruh bidang antarmuka ke dalam 4 tingkatan lapisan kaca (*spatial elevation hierarchy*):

### Layer 0: Ambient Canvas (Dasar)
- Kanvas utama di bagian paling belakang.
- Light Mode: `#F8F6F0` (Warm Ivory) dipadukan dengan aksen pencahayaan difus radial bergradasi sangat halus (Emerald/Gold tint, opasitas 6% – 10%, blur 100px).
- Dark Mode: `#0D100F` (Obsidian Jet Black) dengan pendaran emas luminescent yang tenang sesuai logo.

### Layer 1: Frosted Content Surface (Panel Konten & Kartu)
- Digunakan untuk: JobCard, BookingCard, QosidahRow, form section, profil section.
- Efek Kaca:
  ```css
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px) saturate(170%);
  -webkit-backdrop-filter: blur(14px) saturate(170%);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 4px 20px -2px rgba(11, 107, 87, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.80);
  ```

### Layer 2: Floating Interactive Glass (Navigasi & Kontrol Melayang)
- Digunakan untuk: Bottom Navigation Dock, Sticky Header, Floating Action Controls, Pill Filter.
- Efek Kaca:
  ```css
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.75);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 -4px 24px -2px rgba(0, 0, 0, 0.06);
  ```

### Layer 3: Overlay & Scrim Glass (Modal & Bottom Sheet)
- Digunakan untuk: Bottom Sheet detail, konfirmasi destruktif, modal form.
- Scrim Backdrop:
  ```css
  background: rgba(16, 21, 18, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  ```
- Sheet Surface:
  ```css
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 -12px 36px rgba(0, 0, 0, 0.12);
  ```

---

# 57. PRIMARY COLOR PALETTE & GLASS TOKENS

### Royal Brand Gold (Warna Utama - Sesuai Logo Resmi)
- Solid Value: `#996A19`
- Glass Background Tint: `rgba(153, 106, 25, 0.10)`
- Glass Active Highlight: `rgba(153, 106, 25, 0.16)`
- Glass Border Tint: `rgba(181, 130, 40, 0.25)`
- Glass Glow Accent: `rgba(181, 130, 40, 0.20)`

Digunakan untuk:
- Primary CTA (Solid Royal Gold dengan specular top sheen).
- Active navigation dock badge.
- Selected states.
- Link utama & branding.

### Primary Dark Gold (Gold Pekat / Bronze)
- Solid Value: `#70490E`
- Digunakan untuk: Pressed button state, penegasan kontras tinggi, dan teks tebal pada latar kaca terang.

### Primary Soft Gold (Cream Emas Halus)
- Solid Value: `#F5EBD7`
- Glass Soft Tint: `rgba(245, 235, 215, 0.70)`
- Digunakan untuk: Badge status terkonfirmasi, soft highlight, dan active pill container.

---

# 58. BACKGROUND COLORS & CANVAS DEPTH

### Base Canvas: Warm Ivory
```text
#F8F6F0
```
Latar kanvas dasar yang hangat dan nyaman di mata pengguna, memberikan keteduhan visual khas majelis.

### Frosted White Surface
```css
rgba(255, 255, 255, 0.72)
```
Untuk panel konten utama, formulir, dan deretan teks Qosidah.

### Secondary Frosted Surface
```css
rgba(240, 238, 231, 0.60)
```
Untuk section sekunder, input background yang belum aktif, dan pembatas grup informasi.

### Ambient Backdrop Lighting Policy
Di belakang lapisan kanvas dasar, ditempatkan 1–2 titik pendaran cahaya difus statis:
- **Radiant Gold Mist**: `radial-gradient(circle at 15% 10%, rgba(181, 130, 40, 0.08) 0%, transparent 60%)`
- **Warm Gold Radiance**: `radial-gradient(circle at 85% 80%, rgba(181, 138, 58, 0.06) 0%, transparent 60%)`
Pendaran ini semata-mata memberi materi refraksi alami pada panel kaca agar tidak tampak seperti abu-abu flat.

---

# 59. TEXT COLORS & STANDAR KONTRAS WCAG

Kontras teks di atas permukaan kaca adalah hukum mutlak:

### Primary Text (Charcoal Pekat)
```text
#151917
```
- Digunakan untuk judul, teks Qosidah, label utama, dan nominal keuangan.
- Memberikan rasio kontras > 12:1 di atas panel kaca putih, menjamin keterbacaan sempurna.

### Secondary Text (Slate Deep Muted)
```text
#525D58
```
- Dikalibrasi ulang dari warna abu-abu pudar sebelumnya agar tetap memenuhi standar **WCAG 2.1 AA (rasio kontras minimal 4.8:1)** di atas kaca buram.
- Digunakan untuk deskripsi jadwal Job, metadata Qosidah, dan instruksi form.

### Muted Text (Subtle Metadata)
```text
#6F7B75
```
- Digunakan secara selektif untuk timestamp atau hint minor.
- Dilarang menggunakan teks abu-abu yang lebih terang dari nilai ini di atas panel kaca.

---

# 60. BORDER & SPECULAR RIM LIGHTING SPECIFICATION

Pemisahan visual pada Glassmorphism Khoirunnada tidak menggunakan garis hitam tebal atau shadow gelap, melainkan **Specular Rim Lighting** (pantulan cahaya pada tepi kaca):

### Spesifikasi Rim Light (Light Mode):
```css
border: 1px solid rgba(255, 255, 255, 0.65);
box-shadow: 
  inset 0 1px 1px 0 rgba(255, 255, 255, 0.85),
  0 4px 20px -2px rgba(153, 106, 25, 0.04);
```
- Sisi atas dan kiri menangkap pantulan cahaya putih cerah (`rgba(255, 255, 255, 0.85)`).
- Sisi bawah dan kanan bergradasi lembut ke arah latar belakang.
- Menciptakan ilusi fisik lempengan kaca asli yang tebal dan kokoh.

### Spesifikasi Rim Light (Dark Mode):
```css
border: 1px solid rgba(255, 255, 255, 0.12);
box-shadow: 
  inset 0 1px 1px 0 rgba(255, 255, 255, 0.15),
  0 8px 24px -4px rgba(0, 0, 0, 0.40);
```

---

# 61. GOLD ACCENT & SPECULAR HIGHLIGHTS

### Muted Gold
```text
#B58A3A
```
- Glass Gold Tint: `rgba(181, 138, 58, 0.12)`
- Glass Gold Border: `rgba(181, 138, 58, 0.30)`

### Soft Gold
```text
#F2E8D2
```

Penggunaan Emas:
- Detail logo Khoirunnada.
- Badges khusus (contoh: status "Job Terdekat", "Role Admin", atau penanda Bait Utama Qosidah).
- Garis dekoratif specular tipis.
- Gold **tidak pernah digunakan sebagai background tombol CTA utama**.

---

# 62. SEMANTIC COLORS & GLASS STATUS PILLS

Status badge dirender dalam bentuk **Frosted Glass Pills**:

### Success (Terkonfirmasi / Hadir / Pemasukan)
- Background: `rgba(25, 135, 84, 0.10)`
- Border: `1px solid rgba(25, 135, 84, 0.25)`
- Text: `#0F5B38` (High Contrast Green)

### Warning (Menunggu Konfirmasi / Belum Pasti / Pending)
- Background: `rgba(200, 135, 25, 0.12)`
- Border: `1px solid rgba(200, 135, 25, 0.30)`
- Text: `#8F5D0A` (High Contrast Amber)

### Danger (Batal / Tidak Hadir / Pengeluaran / Hapus)
- Background: `rgba(200, 74, 69, 0.10)`
- Border: `1px solid rgba(200, 74, 69, 0.25)`
- Text: `#A12B26` (High Contrast Crimson)

### Info (Pengumuman / Informasi Acara)
- Background: `rgba(61, 113, 140, 0.12)`
- Border: `1px solid rgba(61, 113, 140, 0.28)`
- Text: `#245167` (High Contrast Teal-Blue)

Semua badge mempertahankan `backdrop-filter: blur(8px)` dan padding vertikal-horizontal yang proporsional.

---

# 63. DARK MODE: OBSIDIAN ROYAL GOLD GLASS

Meskipun MVP memprioritaskan Light Mode yang bernuansa hangat, sistem Glassmorphism Khoirunnada telah dirancang siap pakai untuk Dark Mode:

### Obsidian Canvas
```text
#0D1210
```
Latar belakang hitam kehijauan pekat, bukan hitam OLED polos.

### Dark Frosted Glass Surface
```css
background: rgba(23, 30, 26, 0.70);
backdrop-filter: blur(16px) saturate(160%);
border: 1px solid rgba(255, 255, 255, 0.10);
```

### Elevated Dark Glass
```css
background: rgba(31, 41, 36, 0.80);
backdrop-filter: blur(20px);
border: 1px solid rgba(56, 165, 133, 0.20);
```

### Text Dark Mode
- Primary Text: `#EAECE8`
- Secondary Text: `#A3AEA8`
- Gold Glow Accent: `#DCA03C`

---

# 64. GRADIENT & AMBIENT BACKDROP LIGHTING POLICY

- Gradient permukaan dilarang digunakan sembarangan pada button dan card.
- Gradasi hanya diizinkan untuk:
  1. Splash screen branding.
  2. Ambient lighting layer di balik kaca (Layer 0).
  3. Specular rim highlight pada garis tepi kaca.
- Hindari gradasi warna-warni neon yang menjadi ciri khas AI slop.

---

# 65. TYPOGRAPHY & ARABIC RENDERING ON GLASS

### UI Font (Latin)
**Plus Jakarta Sans** (Alternatif: **Inter**)
- Karakter geometris modern dengan sudut halus yang harmonis dengan kurva kaca.
- Kerning diatur proporsional (`letter-spacing: -0.01em` pada judul, `0` pada body).

### Teks Arab Qosidah
**Noto Naskh Arabic**
- Wajib mendukung harakat tajwid secara presisi tanpa tumpang-tindih.
- Line-height wajib berada pada rentang **2.2x – 2.5x** agar baris bait terpisah sangat lega.
- Ukuran font Arab minimal **22px – 28px** di smartphone, dapat diperbesar hingga 36px pada Performance Mode.
- Teks Arab dirender dengan anti-aliasing tajam di atas permukaan kaca buram dengan opasitas minimal 80%.

---

# 66. TYPOGRAPHY PRINCIPLES & LEGIBILITY HIERARCHY

- Hierarki jelas: Heading (Bold/SemiBold), Section Title (SemiBold), Body (Regular/Medium), Label (Medium), Metadata (Regular).
- Dilarang membold seluruh teks.
- Teks Latin judul Job dan nama pemesan menggunakan ukuran 18px – 20px dengan kontras tinggi.
- Label status dan tanggal disajikan dengan hirarki visual yang langsung terbaca dalam 1 detik.

---

# 67. BORDER RADIUS & SQUIRCLE PHYSICS

Glassmorphism Khoirunnada menggunakan kurva sudut halus (*smooth corner rounding / squircle*) untuk memberikan sensasi taktil seperti hardware modern:

```text
Small (Pill Badge, Input Field): 10px
Medium (Tombol, Baris Qosidah): 14px
Large (Kartu Job, Panel Konten): 20px
XL (Modal, Bottom Sheet, Floating Dock): 28px
```

Dilarang membuat semua komponen berbentuk lonjong kaku (*pill-shaped*). Hanya badge status dan floating controls kecil yang menggunakan bentuk pil penuh.

---

# 68. SHADOW & GLASS REFRACTION SYSTEM

Sistem bayangan Khoirunnada meniru refraksi cahaya melalui medium kaca buram:

- **Bukan Shadow Hitam Kasar**: Shadow tidak pernah menggunakan hitam legam berdensitas tinggi (`rgba(0,0,0,0.5)` dilarang).
- **Dual Layer Physics**:
  1. *Diffuse Ambient Shadow*: Bayangan lembut berwarna emas hangat sangat tipis (`rgba(153, 106, 25, 0.04 - 0.08)`) menyebar luas.
  2. *Inner Specular Sheen*: Highlight putih di tepi dalam atas (`inset 0 1px 1px 0 rgba(255, 255, 255, 0.85)`).
- Menghasilkan efek kaca melayang yang berwibawa dan tidak mengotori kanvas.

---

# 69. ICON SYSTEM & SEMANTIC DISCIPLINE

- Menggunakan **Lucide Icons** dengan ketebalan stroke seragam **1.75px – 2px**.
- Ikon ditempatkan di dalam container kaca bundar atau squircle berlatar belakang kaca buram halus (`p-2 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-sm`).
- Dilarang menggunakan emoji berwarna sebagai ikon kontrol antarmuka.
- Setiap ikon wajib memiliki makna fungsional yang eksplisit (contoh: kalender untuk tanggal, pin lokasi untuk venue, mikrofon untuk Qosidah, dompet untuk kas).

---

# 70. ANIMATION & HAPTIC MOTION PHYSICS

- Durasi animasi responsif dan cepat: **150ms – 220ms**.
- Kurva transisi: `cubic-bezier(0.16, 1, 0.3, 1)` (Apple-like spring-damped ease-out).
- Efek tekan (*active state*):
  - Tombol kaca dan kartu menyusut halus ke skala `0.98` saat disentuh, memberikan umpan balik fisik seketika.
- Transisi Bottom Sheet: Meluncur mulus dari bawah layar dengan redupnya background melalui `backdrop-filter: blur(8px)`.
- Dilarang menggunakan efek animasi pantul (*bouncing/rubber-band*) yang berlebihan.

---

# 71. BUTTON SYSTEM — FROSTED GLASS & SOLID CTA

### Primary CTA (Solid Royal Gold dengan Glass Sheen)
- Background: `#996A19`
- Specular Sheen: `box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.30)`
- Text: `#FFFFFF`, font-semibold.
- Hover/Active: `#70490E`, scale 0.98.
- Digunakan untuk: "Kirim Permintaan Booking", "Konfirmasi Job", "Simpan Transaksi", "Login Google".

### Secondary Button (Frosted Glass Button)
- Background: `rgba(255, 255, 255, 0.70)`
- Backdrop-filter: `blur(12px)`
- Border: `1px solid rgba(255, 255, 255, 0.80)`
- Text: `#996A19`, font-medium.
- Active: `rgba(255, 255, 255, 0.90)`.
- Digunakan untuk: "Buka Maps", "Lihat Detail", "Batal", "Filter".

### Destructive Button (Danger Glass)
- Background: `rgba(200, 74, 69, 0.12)`
- Border: `1px solid rgba(200, 74, 69, 0.25)`
- Text: `#A12B26`, font-medium.
- Digunakan untuk: "Batalkan Job", "Nonaktifkan Anggota", "Hapus Transaksi".

### Ghost Glass Button
- Background: `transparent` (berubah menjadi `rgba(153, 106, 25, 0.08)` saat disentuh).
- Text: `#525D58`.
- Digunakan untuk navigasi kembali (*Back*), close modal, atau aksi minor.

Semua tombol wajib memenuhi area sentuh minimal **44 × 44px**.

---

# 72. CARD SYSTEM — MULTI-LAYER FROSTED GLASS

- Kartu adalah representasi fisik dari lempengan kaca buram fungsional.
- Komponen kartu:
  - Permukaan: `rgba(255, 255, 255, 0.72)`.
  - Blur: `backdrop-filter: blur(14px) saturate(170%)`.
  - Border: 1px specular highlight putih.
  - Padding dalam: 16px – 20px yang lega.
  - Radius: 20px (Large Squircle).
- Kartu tidak boleh ditumpuk di dalam kartu lain tanpa alasan struktural yang sah.
- Kartu interaktif (dapat diklik) memiliki status hover/active yang mengangkat kartu secara visual dengan penambahan pendaran halus zamrud.

---

# 73. FORMS & GLASS INPUT FIELDS

- Input field menggunakan latar belakang kaca semi-transparan:
  ```css
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(221, 220, 213, 0.80);
  border-radius: 12px;
  min-height: 48px;
  padding: 12px 16px;
  ```
- Focus State:
  - Border beralih ke Royal Brand Gold: `rgba(181, 130, 40, 0.60)`.
  - Pendaran kaca zamrud halus: `box-shadow: 0 0 0 3px rgba(11, 107, 87, 0.15)`.
- Label input: Di luar field atau floating dengan kontras tajam `#151917`.
- Error State: Border merah koral `rgba(200, 74, 69, 0.80)` dengan pesan teks merah di bawahnya.
- Mobile keyboard appropriate: `type="tel"` untuk nomor WhatsApp, native date picker untuk tanggal acara.

---

# 74. LOADING STATES — FROSTED SHIMMER

- Loading state menggunakan **Frosted Glass Shimmer Skeleton**:
  - Kerangka balok kaca dengan background `rgba(255, 255, 255, 0.50)` dan blur.
  - Gelombang cahaya specular putih transparan (`rgba(255, 255, 255, 0.40)`) menyapu secara diagonal dari kiri ke kanan.
- Menghilangkan kesan "kotak abu-abu mati" khas wireframe mentah.
- Form submit menampilkan spinner halus di dalam tombol dan mendisable input untuk mencegah submit ganda.

---

# 75. EMPTY STATES — FROSTED MEDALLION

- Setiap daftar kosong menampilkan **Frosted Glass Medallion**:
  - Wadah lingkaran kaca buram berdiameter 64px dengan ikon Lucide yang relevan di tengahnya.
  - Judul yang jelas dan bersahaja (contoh: **Belum Ada Jadwal Job**).
  - Teks penjelasan yang informatif (contoh: *Jadwal Job Khoirunnada akan muncul di sini setelah disepakati bersama pemesan.*).
  - Tidak menggunakan ilustrasi kartun generik yang kekanak-kanakan.

---

# 76. ERROR STATES — FROSTED ALERT

- Kesalahan sistem dan jaringan disajikan dalam kartu kaca peringatan:
  - Background: `rgba(200, 74, 69, 0.08)`.
  - Border: `1px solid rgba(200, 74, 69, 0.25)`.
  - Backdrop-filter: `blur(12px)`.
  - Bahasa manusiawi dan solutif (contoh: *Data belum berhasil dimuat. Silakan periksa koneksi internet Anda dan coba lagi.*).
  - Dilengkapi tombol "Coba Lagi" bergaya Secondary Glass.

---

# 76.A TEKNIK IMPLEMENTASI CSS & TAILWIND GLASS (HARDWARE ACCELERATED & FALLBACK)

Untuk memastikan performa 60 FPS mulus di seluruh smartphone anggota:

### Utility Classes Tailwind yang Digunakan:
```html
<!-- Contoh Panel Kartu Glassmorphism Khoirunnada -->
<div class="relative overflow-hidden rounded-2xl bg-white/75 backdrop-blur-md backdrop-saturate-150 border border-white/60 shadow-[0_4px_20px_-2px_rgba(11,107,87,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] p-5 transition-transform duration-200 active:scale-[0.98] transform-gpu">
  <!-- Konten Kartu -->
</div>
```

### Aturan Akselerasi GPU:
- Setiap elemen ber-filter kaca wajib menyertakan kelas `transform-gpu` (`transform: translateZ(0)`) untuk memindahkan beban komputasi blur ke chip grafis smartphone.

### Fallback untuk Perangkat Tanpa Dukungan Backdrop-Filter:
```css
@supports not (backdrop-filter: blur(1px)) {
  .glass-card {
    background-color: #FFFFFF !important;
    border: 1px solid #DDDCD5 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  }
  .glass-dock {
    background-color: #FFFFFF !important;
    border-top: 1px solid #DDDCD5 !important;
  }
}
```

---

# 77. APPLICATION ARCHITECTURE

Frontend:

```text
Next.js
React
JSX
Tailwind CSS
```

Direkomendasikan menggunakan:

**Next.js App Router**

---

# 78. DATABASE DECISION

Database V1:

**Supabase PostgreSQL**

Supabase dipilih karena struktur Khoirunnada bersifat relational.

Contoh relasi:

```text
Member
↓
Attendance
↓
Job
↓
Booking
```

dan:

```text
User
↓
Finance Transactions
↓
Job
```

---

# 79. SUPABASE SERVICES

Gunakan:

- Supabase PostgreSQL.
- Supabase Auth.
- Google OAuth.
- Supabase Storage.
- Row Level Security.
- Realtime jika diperlukan.

---

# 80. GOOGLE AUTH

Supabase Auth digunakan sebagai authentication provider.

Google OAuth menjadi satu-satunya login provider pada MVP.

---

# 81. DATABASE TABLE — PROFILES

Table:

```text
profiles
```

Fields:

```text
id
auth_user_id
name
email
avatar_url
status
is_member
is_treasurer
is_admin
created_at
updated_at
approved_at
approved_by
```

---

# 82. PROFILE STATUS

Possible values:

```text
pending
active
rejected
inactive
```

---

# 83. DATABASE TABLE — BOOKINGS

```text
bookings
```

Fields:

```text
id
booking_code
customer_name
customer_phone
event_type
event_name
event_date
event_time
location
location_detail
notes
status
admin_notes
created_at
updated_at
converted_job_id
```

---

# 84. BOOKING CODE

Setiap booking memiliki reference code.

Contoh:

```text
KN-2026-00125
```

Kode mempermudah Admin mencari booking.

---

# 85. DATABASE TABLE — JOBS

```text
jobs
```

Fields:

```text
id
booking_id
title
event_type
customer_name
customer_phone
event_date
gather_time
start_time
location
maps_url
dress_code
transport_info
notes
status
created_by
created_at
updated_at
```

---

# 86. DATABASE TABLE — JOB ATTENDANCE

```text
job_attendance
```

Fields:

```text
id
job_id
user_id
status
note
updated_at
```

Status:

```text
attending
not_attending
maybe
no_response
```

---

# 87. DATABASE TABLE — JOB ASSIGNMENTS

```text
job_assignments
```

Fields:

```text
id
job_id
user_id
role_name
notes
created_at
```

---

# 88. DATABASE TABLE — QOSIDAH

```text
qosidah
```

Fields:

```text
id
title
alternate_title
arabic_text
latin_text
translation
category_id
notes
is_active
sort_order
created_by
created_at
updated_at
```

---

# 89. DATABASE TABLE — QOSIDAH CATEGORIES

```text
qosidah_categories
```

Fields:

```text
id
name
slug
sort_order
is_active
```

---

# 90. DATABASE TABLE — QOSIDAH FAVORITES

```text
qosidah_favorites
```

Fields:

```text
id
user_id
qosidah_id
created_at
```

Unique combination:

```text
user_id + qosidah_id
```

---

# 91. DATABASE TABLE — QOSIDAH RECENT

```text
qosidah_recent
```

Fields:

```text
user_id
qosidah_id
last_opened_at
```

---

# 92. DATABASE TABLE — FINANCE TRANSACTIONS

```text
finance_transactions
```

Fields:

```text
id
type
category_id
amount
transaction_date
description
job_id
attachment_url
created_by
created_at
updated_at
```

---

# 93. DATABASE TABLE — FINANCE CATEGORIES

```text
finance_categories
```

Fields:

```text
id
name
type
is_active
created_at
```

---

# 94. DATABASE TABLE — NOTIFICATIONS

```text
notifications
```

Fields:

```text
id
title
message
type
target_type
target_id
target_url
created_by
created_at
```

---

# 95. DATABASE TABLE — USER NOTIFICATIONS

```text
user_notifications
```

Fields:

```text
id
notification_id
user_id
is_read
read_at
created_at
```

---

# 96. DATABASE TABLE — PUSH SUBSCRIPTIONS

```text
push_subscriptions
```

Fields:

```text
id
user_id
subscription_data
device_name
created_at
updated_at
```

---

# 97. DATABASE TABLE — AUDIT LOGS

```text
audit_logs
```

Fields:

```text
id
user_id
action
entity_type
entity_id
old_data
new_data
created_at
```

---

# 98. STORAGE STRUCTURE

Supabase Storage buckets dapat menggunakan:

```text
finance-receipts
qosidah-audio
app-assets
```

Buckets internal harus private jika file tidak dimaksudkan untuk public.

---

# 99. ROW LEVEL SECURITY

RLS wajib diaktifkan untuk data internal.

Contoh:

Member:

- Read Qosidah.
- Read Job.
- Manage own attendance.
- Read own notification.

Treasurer:

- Finance CRUD.

Admin:

- Administrative CRUD sesuai permission.

Public:

- Insert booking melalui endpoint yang dikontrol.

Public tidak boleh memiliki akses SELECT terhadap seluruh booking.

---

# 100. SERVER-SIDE AUTHORIZATION

Jangan hanya mengandalkan hide/show UI.

Contoh:

Menyembunyikan menu Finance bukan keamanan.

Server/database tetap wajib memastikan bahwa hanya Treasurer/Admin yang diizinkan mengakses transaksi.

---

# 101. PUBLIC BOOKING SECURITY

Booking form harus mempunyai:

- Server-side validation.
- Rate limiting.
- Anti duplicate submit.
- Sanitization.
- Basic bot protection apabila diperlukan.

---

# 102. FORM VALIDATION

Gunakan validation schema.

Validasi:

- Required field.
- Phone format.
- Date validity.
- Length limit.
- Allowed values.

Semua input divalidasi ulang di server.

---

# 103. AUTHORIZATION MIDDLEWARE

Protected routes harus mengecek:

1. Session tersedia.
2. Profile tersedia.
3. Status active.
4. Permission sesuai halaman.

---

# 104. ROUTE STRUCTURE

Public:

```text
/booking
/booking/success
```

Authentication:

```text
/login
/auth/callback
/pending
```

Member:

```text
/app
/app/qosidah
/app/qosidah/[id]
/app/jobs
/app/jobs/[id]
/app/notifications
/app/profile
```

Treasurer:

```text
/app/finance
/app/finance/transactions
/app/finance/transactions/new
```

Admin:

```text
/app/admin
/app/admin/bookings
/app/admin/bookings/[id]
/app/admin/jobs
/app/admin/members
/app/admin/qosidah
/app/admin/notifications
/app/admin/settings
```

---

# 105. PROJECT STRUCTURE

Recommended:

```text
/app
/components
/components/ui
/components/navigation
/components/qosidah
/components/jobs
/components/finance
/components/admin
/lib
/lib/supabase
/lib/auth
/lib/permissions
/lib/validation
/lib/utils
/public
/styles
```

---

# 106. UI COMPONENTS

Reusable components dengan spesifikasi Glassmorphism terpadu:

```text
GlassAppHeader
GlassBottomNavigation
GlassPageContainer
GlassCard
GlassButton (Primary, Secondary, Destructive, Ghost)
GlassIconButton
GlassInput
GlassTextarea
GlassSelect
GlassDateField
GlassStatusBadge
GlassBottomSheet
GlassModal
GlassEmptyState
GlassLoadingSkeleton
GlassJobCard
GlassBookingCard
GlassQosidahRow
GlassNotificationItem
GlassFinanceTransactionRow
GlassMemberAvatar
GlassRoleBadge
```

---

# 107. STATE MANAGEMENT

Gunakan state management sesederhana mungkin.

Default:

- Server Components untuk data server jika sesuai.
- React state untuk local UI.
- Context hanya untuk state global sederhana.

Jangan menambah Redux kecuali memang diperlukan.

---

# 108. DATA FETCHING

Prioritaskan server-side data fetching untuk data yang aman dan sesuai.

Realtime dapat dipakai secara selektif untuk:

- Booking baru.
- Job update.
- Notification.

Tidak semua data membutuhkan realtime.

---

# 109. PERFORMANCE TARGET

Target:

- First load ringan.
- Navigation responsif.
- Optimized images.
- Lazy loading.
- Minimal JavaScript.
- Avoid unnecessary dependency.

---

# 110. IMAGE OPTIMIZATION

Gunakan Next.js Image untuk gambar yang sesuai.

Avatar dari Google dan image assets harus dioptimalkan.

---

# 111. SEARCH PERFORMANCE

Qosidah search harus terasa instan.

Jika library masih kecil:

Client-side filtering diperbolehkan.

Jika database menjadi besar:

Gunakan database search.

---

# 112. SEO

Internal App:

Tidak perlu SEO.

Gunakan:

```text
noindex
```

Public Booking:

Dapat mempunyai metadata yang baik.

Namun discovery utama tetap melalui QR/link langsung.

---

# 113. PRIVACY

Jangan mengekspos:

- Daftar anggota.
- Email anggota.
- Nomor pribadi.
- Keuangan.
- Data booking.

ke public URL.

---

# 114. CUSTOMER PHONE PRIVACY

Nomor WhatsApp pemesan hanya dapat dilihat role yang membutuhkan.

Default:

- Admin: yes.
- Treasurer: hanya jika dibutuhkan.
- Member biasa: tidak.

Member cukup melihat informasi Job yang diperlukan.

---

# 115. ADMIN ACTIVITY LOGGING

Action penting harus tercatat:

- Approve member.
- Reject member.
- Deactivate member.
- Role changes.
- Booking changes.
- Job creation.
- Job cancellation.
- Finance changes.
- Qosidah deletion.

---

# 116. DESTRUCTIVE ACTION

Action destructive harus memiliki confirmation.

Contoh:

```text
Batalkan Job?
```

atau:

```text
Nonaktifkan anggota ini?
```

Tidak gunakan confirmation untuk action kecil.

---

# 117. DELETE POLICY

Untuk data penting, prioritaskan:

**soft delete / inactive status**

daripada permanent delete.

Terutama:

- Member.
- Qosidah.
- Finance category.

---

# 118. BOOKING DELETION

Booking sebaiknya tidak dihapus permanen.

Gunakan status:

- rejected.
- cancelled.

Tujuannya menjaga histori.

---

# 119. JOB HISTORY

Job selesai tetap disimpan sebagai histori.

Member dapat melihat:

- Upcoming.
- History.

---

# 120. FINANCE AND JOB RELATION

Finance transaction dapat dikaitkan dengan Job.

Contoh:

```text
Income:
Pernikahan Ahmad
Rp2.500.000

Related Job:
JOB-0085
```

Mempermudah laporan pendapatan job.

---

# 121. FINANCE BALANCE CALCULATION

Saldo dihitung dari:

```text
Total Income - Total Expense
```

Jangan menyimpan current balance sebagai angka manual jika tidak diperlukan.

---

# 122. ADMIN DASHBOARD

Admin Dashboard fokus pada action yang membutuhkan perhatian.

Contoh:

- Booking baru.
- Pending members.
- Upcoming Job.
- Job tanpa konfirmasi cukup.
- Notification action.

Jangan membuat dashboard penuh chart dekoratif.

---

# 123. TREASURER DASHBOARD

Bendahara melihat:

- Saldo.
- Income bulan ini.
- Expense bulan ini.
- Recent transactions.
- Tambah transaksi.

---

# 124. ADMIN BOOKING FILTER

Booking dapat difilter berdasarkan:

- Status.
- Date.
- Event type.

Search berdasarkan:

- Nama.
- Nomor WhatsApp.
- Booking code.

---

# 125. MEMBER MANAGEMENT

Admin dapat:

- Search member.
- View profile.
- Approve.
- Reject.
- Activate.
- Deactivate.
- Set Treasurer.
- Remove Treasurer.
- Set Admin.
- Remove Admin.

---

# 126. ROLE CHANGE CONFIRMATION

Perubahan permission sensitif memerlukan confirmation.

Contoh:

**Berikan akses Bendahara kepada Ahmad?**

---

# 127. QOSIDAH MANAGEMENT

Admin dapat:

- Create.
- Edit.
- Reorder.
- Categorize.
- Activate.
- Deactivate.

Tidak perlu permanent delete sebagai default.

---

# 128. QOSIDAH EDITOR

Editor harus nyaman untuk teks panjang.

Field Arab dan Latin dibuat terpisah.

Arabic textarea:

- RTL support.
- Proper Arabic alignment.
- Large preview.

---

# 129. NOTIFICATION MANAGEMENT

Admin dapat membuat announcement.

Target:

- Semua anggota.
- Role tertentu.
- User tertentu jika nanti dibutuhkan.

---

# 130. ANNOUNCEMENT TYPES

Contoh:

- General.
- Important.
- Job.
- Finance.
- Schedule.

---

# 131. NOTIFICATION BADGE

Bottom navigation Notifications dapat menampilkan unread badge.

Contoh:

```text
3
```

Jangan menampilkan angka sangat besar.

Setelah angka tertentu:

```text
9+
```

---

# 132. DATE & TIME STANDARD

Tampilan pengguna mengikuti locale Indonesia.

Contoh:

```text
Sabtu, 10 Oktober 2026
19.30 WITA
```

Data database tetap menggunakan timestamp yang konsisten.

---

# 133. LOCALE

Bahasa utama aplikasi:

**Bahasa Indonesia**

Istilah Arabic/Islamic dapat digunakan secara natural.

---

# 134. COPYWRITING STYLE

Gunakan bahasa:

- Ramah.
- Natural.
- Ringkas.
- Tidak terlalu formal.
- Tetap profesional.

Hindari copywriting ala corporate SaaS.

---

# 135. ACCESSIBILITY

Target minimum:

- Text contrast jelas.
- Touch target nyaman.
- Form label jelas.
- Screen reader friendly.
- Focus state tersedia.
- Jangan mengandalkan warna saja untuk status.

---

# 136. MINIMUM TOUCH TARGET

Interactive item harus cukup besar untuk digunakan menggunakan satu tangan.

Ideal minimum sekitar:

```text
44 × 44px
```

---

# 137. SCROLL EXPERIENCE

Internal app mempunyai:

- Sticky header jika dibutuhkan.
- Fixed bottom navigation.
- Safe bottom padding.

Pastikan content tidak tertutup Bottom Navigation.

---

# 138. SAFE AREA

PWA harus memperhatikan:

- iPhone notch.
- Android navigation.
- `safe-area-inset-bottom`.

---

# 139. TOAST SYSTEM

Toast digunakan untuk informasi singkat.

Contoh:

- Data berhasil disimpan.
- Status kehadiran diperbarui.
- Qosidah ditambahkan ke favorit.

Jangan gunakan toast untuk informasi kritis yang harus dibaca lama.

---

# 140. MODAL VS BOTTOM SHEET

Mobile interaction memprioritaskan:

**Frosted Glass Bottom Sheet**

untuk:

- Filter jadwal dan kategori Qosidah.
- Quick action konfirmasi kehadiran.
- Confirmation ringan operasional.

Spesifikasi Sheet:
- Frosted scrim overlay: `backdrop-filter: blur(8px) bg-black/35`.
- Sheet container: `backdrop-filter: blur(24px) saturate(180%) bg-white/90 dark:bg-[#171E1A]/90 rounded-t-[28px] border-t border-white/75`.
- Drag indicator: Kapsul kaca bundar halus di bagian atas sheet untuk gestur usap ke bawah (*swipe to dismiss*).

Modal kaca digunakan jika interaksi membutuhkan dialog konfirmasi yang terpusat dan berjarak seimbang.

---

# 141. INSTALL PROMPT

App dapat menampilkan edukasi install setelah user sudah memahami aplikasi.

Jangan menampilkan install prompt agresif pada kunjungan pertama.

---

# 142. SECURITY ENVIRONMENT VARIABLES

Secret hanya disimpan di environment variables.

Tidak boleh commit:

- Service role key.
- Private secrets.
- Push private keys.

Vercel Environment Variables digunakan saat production.

---

# 143. SUPABASE KEYS

Anon key dapat digunakan di client sesuai desain Supabase dan RLS.

Service Role Key:

**server only.**

Tidak pernah dikirim ke browser.

---

# 144. DEPLOYMENT

Hosting:

**Vercel**

Environments:

```text
Development
Preview
Production
```

---

# 145. DOMAIN

Domain final dapat ditentukan kemudian.

Struktur aplikasi cukup menggunakan satu domain.

Contoh konsep:

```text
app.khoirunnada...
```

atau domain utama Khoirunnada.

Tidak wajib memisahkan Admin ke subdomain berbeda.

---

# 146. GIT WORKFLOW

Recommended branches:

```text
main
development
feature/*
fix/*
```

Production deploy berasal dari branch stabil.

---

# 147. QUALITY ASSURANCE

Sebelum production, testing wajib mencakup:

- Google Login.
- Pending user.
- Member approval.
- Protected routes.
- Treasurer permission.
- Admin permission.
- Booking submit.
- WhatsApp link.
- Booking conversion.
- Job creation.
- Attendance.
- Notification.
- Qosidah search.
- Performance Mode.
- Finance CRUD.
- Upload receipt.
- Logout.
- PWA install.

---

# 148. AUTH TEST CASE

Scenario:

User baru login Google.

Expected:

- Profile dibuat.
- Status pending.
- Tidak dapat membuka internal route.

Scenario:

Admin approve.

Expected:

- User menjadi active.
- User dapat masuk aplikasi.

---

# 149. PERMISSION TEST CASE

Scenario:

Member membuka URL Finance manual.

Expected:

**Access denied / redirected.**

Scenario:

Treasurer membuka Finance.

Expected:

**Allowed.**

---

# 150. PUBLIC SECURITY TEST

Scenario:

Public user membuka:

```text
/app/jobs
```

Expected:

Redirect ke Login.

Scenario:

Pending user membuka:

```text
/app/qosidah
```

Expected:

Redirect ke Pending Approval.

---

# 151. BOOKING TEST

Public dapat:

- Membuka halaman.
- Mengisi form.
- Submit.
- Mendapat confirmation.

Public tidak dapat:

- Melihat booking lain.
- Membaca database booking.
- Mengakses nomor pelanggan lain.

---

# 152. DUPLICATE BOOKING PROTECTION

Saat submit booking:

Button berubah menjadi loading dan disabled.

User tidak dapat menekan berulang kali.

---

# 153. FINANCE SECURITY TEST

Member biasa:

Tidak boleh mengambil data finance melalui client/API request manual.

Permission harus dihentikan oleh server/database.

---

# 154. MOBILE DEVICE TESTING

Minimum testing:

- Android Chrome.
- Android installed PWA.
- iPhone Safari.
- iPhone installed PWA.
- Small screen.
- Large smartphone.

---

# 155. DESIGN QA

Pemeriksaan kualitas visual wajib memverifikasi standar Glassmorphism dan kepatuhan Anti-AI Slop:

- **Glassmorphism Optical Balance**: Efek blur (12px – 20px) dan saturasi (160% – 180%) ter-render mulus tanpa artefak piksel.
- **Rim Lighting Rendering**: Garis tepi kaca 1px dengan specular top highlight tampil tajam di resolusi Retina dan HD smartphone.
- **WCAG 2.1 AA/AAA Compliance**: Seluruh teks konten dan angka nominal memiliki kontras minimal 4.5:1 terhadap permukaan kaca.
- **Arabic Typography & Harakat**: Teks Noto Naskh Arabic memiliki line-height lega (2.2x+) dan bebas dari efek halasi ganda yang mengaburkan tajwid.
- **Audit Anti-AI Slop**:
  - Bebas dari warna neon cyberpunk / ungu generik.
  - Bebas dari tumpukan kartu bersarang (*no card nesting soup*).
  - Bebas dari widget/grafik statistik fiktif.
  - Bebas dari ornamen melayang tanpa makna (*no floating blobs/sparkles*).
  - Bebas dari bahasa promosi korporat SaaS generik.
  - Bebas dari emoji pada tombol dan navigasi resmi.
- **Performa 60 FPS**: Scrolling halus tanpa frame drops pada smartphone kelas menengah (GPU hardware acceleration aktif).
- **CSS Fallback**: Tampilan tetap terbaca dan fungsional 100% ketika `backdrop-filter` dimatikan pada browser lama.
- **Spacing & Hit Target**: Area sentuh minimal 44 × 44px dan aman terhadap notch/home bar (`safe-area-inset`).

---

# 156. MVP SCOPE

Fitur wajib V1:

1. Google Login.
2. Admin approval.
3. Role Member.
4. Role Treasurer.
5. Role Admin.
6. Public Booking.
7. Booking Management.
8. WhatsApp confirmation.
9. Convert Booking to Job.
10. Job Management.
11. Job Attendance.
12. Job Notifications.
13. Qosidah Library.
14. Qosidah Search.
15. Qosidah Detail.
16. Performance Mode.
17. Finance Tracking.
18. Receipt Upload.
19. Notification Center.
20. Member Management.
21. Installable PWA.
22. Bottom Navigation.
23. Khoirunnada Premium Design System.

---

# 157. POST-MVP FEATURES

Fitur berikut tidak wajib untuk initial launch namun dapat ditambahkan:

### Offline Qosidah

Download/caching Qosidah untuk akses offline.

### Qosidah Audio

Audio latihan.

### Setlist

Admin membuat daftar Qosidah untuk satu Job.

Contoh:

```text
Opening
↓
Qosidah A
↓
Qosidah B
↓
Mahalul Qiyam
↓
Closing
```

### Attendance Statistics

Melihat histori kehadiran.

### Finance Reports

Export PDF/Excel.

### Calendar

Calendar khusus Job.

### Equipment Management

Inventaris:

- Bass.
- Terbang.
- Mic.
- Mixer.
- Kabel.

### Internal Announcement

Pengumuman lengkap dengan attachment.

### Member Directory

Daftar anggota internal.

---

# 158. FUTURE SETLIST FEATURE

Setlist sangat direkomendasikan sebagai pengembangan berikutnya karena berhubungan langsung dengan Qosidah dan Job.

Flow:

```text
Job
↓
Setlist
↓
Qosidah 1
Qosidah 2
Qosidah 3
↓
Performance Mode
```

Saat tampil, anggota tidak perlu mencari Qosidah satu per satu.

---

# 159. FUTURE QR MANAGEMENT

Admin dapat membuat QR khusus Booking dari dalam aplikasi.

QR tetap mengarah ke halaman public booking.

---

# 160. FUTURE FINANCE REPORT

Bendahara dapat memilih periode:

- Mingguan.
- Bulanan.
- Tahunan.
- Custom.

Report:

```text
Opening Balance
Total Income
Total Expense
Closing Balance
```

---

# 161. OUT OF SCOPE V1

Tidak termasuk V1:

- Marketplace.
- Chat internal.
- Social feed.
- Livestream.
- Public member profiles.
- Public Qosidah page.
- Customer account.
- Full CRM.
- Payroll.
- Native Android APK.
- Native iOS app.

---

# 162. USER EXPERIENCE SUCCESS CRITERIA

Member harus dapat:

Membuka Qosidah maksimal dalam beberapa tap setelah masuk aplikasi.

Member harus dapat:

Melihat Job berikutnya langsung dari Home.

Admin harus dapat:

Melihat Booking baru tanpa membuka banyak menu.

Bendahara harus dapat:

Mencatat transaksi dengan cepat menggunakan smartphone.

---

# 163. BOOKING SUCCESS CRITERIA

Calon customer harus dapat mengirim booking tanpa:

- Membuat akun.
- Login.
- Menginstall aplikasi.
- Menghubungi nomor secara manual terlebih dahulu.

---

# 164. APPLICATION SUCCESS CRITERIA

Aplikasi dianggap berhasil apabila dapat menggantikan sebagian proses manual seperti:

```text
Cari teks Qosidah di chat
↓
Kirim jadwal di grup
↓
Tanya siapa yang hadir
↓
Catat Job manual
↓
Catat uang manual
```

menjadi:

```text
Satu Khoirunnada App
```

---

# 165. LOCKED PRODUCT DECISIONS

Keputusan berikut dianggap telah disepakati.

### Platform

Mobile-only Web App.

### PWA

Installable.

### Framework

Next.js.

### UI

React JSX.

### Styling

Tailwind CSS.

### Database

Supabase untuk V1.

### Hosting

Vercel.

### Authentication

Google Login only.

### Registration

Tidak menggunakan register manual.

### Member Access

Harus disetujui Admin.

### Role

Additive permission.

### Bendahara

Tetap merupakan Member.

### Public Page

Booking only.

### Public Qosidah

Tidak tersedia.

### Navigation

Bottom Navigation.

### Primary Features

Qosidah, Job, Booking, Finance, Notifications.

### Booking

Tidak membutuhkan account.

### Customer Communication

WhatsApp.

### Design

Premium Islamic Glassmorphism (Frosted Elegance, Bespoke Handcrafted Spatial Depth).

### AI-Slop UI

Dilarang keras tanpa kompromi — Wajib mematuhi 10 Peraturan Keras Anti-AI Slop (# 3.A).

### Primary Brand Color

`#996A19` (Royal Brand Gold Glass).

### Background

`#F8F6F0` (Warm Ivory Canvas) dengan lapisan Frosted Glass dan pencahayaan ambient organik.

### Primary Text

`#151917` (High Contrast Charcoal, memenuhi WCAG 2.1 AA/AAA).

### Gold Accent

`#B58228` (Luminous Royal Gold Refraction).

---

# 166. PRODUCT EXPERIENCE SUMMARY

Pengalaman calon pemesan:

```text
Scan QR
↓
Booking Khoirunnada
↓
Isi Form
↓
Submit
↓
Admin menerima Booking
↓
Admin menghubungi via WhatsApp
```

Pengalaman Admin:

```text
Login Google
↓
Dashboard
↓
Booking Baru
↓
Hubungi Customer
↓
Deal
↓
Convert menjadi Job
↓
Member mendapat Notification
```

Pengalaman Member:

```text
Open Khoirunnada App
↓
Home
↓
Lihat Job berikutnya
↓
Konfirmasi Kehadiran
↓
Buka Qosidah
↓
Performance Mode ketika tampil
```

Pengalaman Bendahara:

```text
Open App
↓
Semua fitur Member
+
Finance
↓
Tambah Income / Expense
↓
Upload Bukti
↓
Saldo otomatis diperbarui
```

---

# 167. FINAL PRODUCT POSITIONING

Khoirunnada Web App bukan website company profile dan bukan dashboard administratif generik.

Khoirunnada Web App adalah:

**aplikasi operasional internal Khoirunnada yang berfungsi sebagai pusat Qosidah, Job Management, Booking Management, Finance Management, dan komunikasi anggota.**

Aplikasi harus terasa seperti produk yang memang dibuat khusus untuk Khoirunnada.

Identitas visualnya:

**Premium. Tenang. Islami. Modern. Fungsional.**

Dan prinsip desain yang harus selalu dijaga selama pengembangan:

> **Setiap elemen harus memiliki alasan untuk berada di layar.**

Jika sebuah komponen tidak membantu pengguna melakukan tugasnya, komponen tersebut tidak perlu ditambahkan.