# Khoirunnada App

PWA internal Hadroh Khoirunnada dengan portal Pemain dan portal khusus Admin/Bendahara. Backend menggunakan Supabase PostgreSQL, Auth, Realtime, Storage, dan Row Level Security.

## Menyiapkan Supabase

1. Buat project Supabase.
2. Tentukan akun Google/email khusus Admin. Sebelum menjalankan migration pertama, ganti `admin.khoirunnada@gmail.com` pada `supabase/migrations/20261004000000_initial_khoirunnada.sql` bila alamat resminya berbeda.
3. Jalankan seluruh file pada `supabase/migrations/` secara berurutan melalui Supabase SQL Editor, atau gunakan Supabase CLI:

```bash
supabase link --project-ref PROJECT_REF
supabase db push
```

Migration membuat seluruh tabel, trigger profil otomatis, approval anggota, audit log, notifikasi, bucket nota privat, indeks, RPC, dan policy RLS. Akun baru otomatis berstatus `pending`; hanya email dalam `private.admin_allowlist` yang otomatis mendapat role Admin/Bendahara aktif.

Untuk mengganti/menambah akun pengurus khusus setelah migration, jalankan dari SQL Editor sebagai pemilik project:

```sql
insert into private.admin_allowlist (email)
values ('admin-resmi@gmail.com')
on conflict (email) do nothing;

update public.profiles
set status = 'active', is_admin = true, is_treasurer = true,
    is_member = false, role_title = 'Pengurus Admin & Bendahara',
    approved_at = now()
where email = 'admin-resmi@gmail.com';
```

Baris `update` diperlukan hanya jika profil alamat tersebut sudah tercipta sebelum allowlist ditambahkan. Jangan pernah menambahkan role Admin dari browser atau metadata user.

## Google OAuth

Di Google Auth Platform, buat OAuth Client bertipe Web Application.

- Authorized JavaScript origin lokal: `http://localhost:3000`
- Authorized redirect URI Google: callback Supabase yang ditampilkan di halaman provider Google, biasanya `https://PROJECT_REF.supabase.co/auth/v1/callback`

Di Supabase Dashboard:

1. Buka Authentication -> Providers -> Google, lalu isi Client ID dan Client Secret.
2. Buka Authentication -> URL Configuration.
3. Isi Site URL production.
4. Tambahkan `http://localhost:3000/auth/callback` dan `https://DOMAIN_PRODUCTION/auth/callback` ke Redirect URLs.

Email/password juga didukung untuk akun yang sudah dibuat melalui Supabase Authentication. Aplikasi ini tidak membuka pendaftaran password publik; onboarding pemain utama tetap melalui Google dan approval Admin.

## Environment variables

Salin contoh konfigurasi:

```bash
cp .env.example .env.local
```

Isi ketiga nilai berikut:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — hanya server, dipakai endpoint booking publik

Masukkan nilai yang sama ke Vercel Environment Variables. Service role key tidak boleh diberi prefix `NEXT_PUBLIC_` atau dikirim ke browser.

## Getting Started

Install dependency dan jalankan development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Alur akses

- Public hanya dapat mengirim booking melalui `/api/bookings`; public tidak memiliki akses SELECT ke tabel booking.
- Login Google pertama membuat profil `pending`.
- Admin menyetujui profil dari menu Kelola Anggota.
- Pemain aktif dapat membaca job/qosidah, mengatur favorit, dan mengisi kehadiran sendiri.
- Pemain hanya menerima agregat saldo kas; detail transaksi dan nota dilindungi untuk Admin/Bendahara.
- Akun khusus Admin/Bendahara diarahkan ke portal admin dan dilindungi oleh allowlist database.
- Semua otorisasi sensitif ditegakkan kembali oleh RLS, bukan hanya penyembunyian tombol.

## Pemeriksaan kualitas

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Build membutuhkan akses ke Google Fonts karena frontend memakai Plus Jakarta Sans dan Noto Naskh Arabic melalui `next/font`.
