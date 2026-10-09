# MASTER IMPLEMENTATION PROMPT
## KHOIRUNNADA BRAIN ENGINE v2.0
### Pure TypeScript Intelligence — Zero AI API Cost

Anda adalah Senior TypeScript Architect, NLP Engineer, Software Security Engineer, dan Quality Assurance Engineer yang bertanggung jawab meningkatkan kecerdasan Khoirunnada AI.

**TUJUAN UTAMA**

Mengembangkan mesin kecerdasan Khoirunnada AI yang berjalan sepenuhnya menggunakan algoritma TypeScript buatan sendiri, tanpa API AI eksternal, pretrained language model, layanan inferensi AI, atau library AI siap pakai.

Aplikasi menggunakan Next.js, TypeScript, Tailwind CSS, dan Vercel Hobby. Target biaya API AI adalah Rp0.

**KONDISI PROYEK SAAT INI**

- UI utama berada di `components/ai/KhoirunnadaAIWidget.tsx`.
- Mesin AI berada di `lib/ai-engine.ts`.
- Fungsi publik: `processKhoirunnadaAI(userInput: string, context: AIContext): AIResponse`.
- Data aplikasi berasal dari `useAppStore()`, meliputi `currentUser`, `qosidahs`, `jobs`, dan `favorites`.
- Engine berjalan di browser/client-side.
- Respons memakai interface `AIResponse` dengan properti `text`, `actions?`, dan `isDeepSearch?`.
- UI memiliki mekanisme animasi berpikir yang sudah berjalan.

**ATURAN MUTLAK**

1. Jangan mengubah desain, styling, layout, atau animasi UI.
2. Jangan menghapus fitur AI yang sudah berfungsi.
3. Jangan menggunakan API AI pihak ketiga.
4. Jangan menggunakan model bahasa pretrained, embedding model, atau library AI/NLP siap pakai.
5. Gunakan TypeScript dan API bawaan JavaScript untuk implementasi algoritma kecerdasan.
6. Pertahankan signature publik `processKhoirunnadaAI(userInput, context): AIResponse`.
7. Pertahankan kompatibilitas `AIAction` dan `AIResponse`, termasuk `href`, `promptText`, dan `isDeepSearch`.
8. Jangan membuat fakta palsu mengenai Khoirunnada.
9. Jangan mengakses atau mengubah database tanpa kebutuhan dan persetujuan.
10. Jangan melakukan perubahan besar secara sekaligus.
11. Setiap fase harus diuji sebelum berlanjut.
12. Jangan menyatakan pengujian berhasil jika belum benar-benar dijalankan.

---

## FASE 0 — BASELINE DAN PERLINDUNGAN

Sebelum menulis kode:

- Baca seluruh implementasi `ai-engine.ts`.
- Baca integrasi pada `KhoirunnadaAIWidget.tsx`.
- Periksa definisi tipe domain dan struktur data aktual.
- Identifikasi semua intent serta respons yang ada.
- Catat seluruh perilaku yang harus tetap dipertahankan.
- Periksa status Git dan pastikan tidak menimpa perubahan pengguna.
- Siapkan strategi perubahan yang dapat dikembalikan tanpa menghapus pekerjaan pengguna.

Bangun regression test untuk intent dan perilaku lama dengan fasilitas bawaan Node.js jika sesuai dengan konfigurasi proyek.

Jangan mengubah UI.

## FASE 1 — LANGUAGE UNDERSTANDING ENGINE

Implementasikan modul:

- Text normalization bahasa Indonesia.
- Unicode-aware tokenization.
- Stopword handling yang menjaga kata penting.
- Normalisasi imbuhan sederhana.
- Synonym mapping berdasarkan domain Khoirunnada.
- Weighted intent scoring.
- Damerau-Levenshtein distance untuk typo.
- Token similarity dan character n-gram.
- Negation detection.
- Entity extraction untuk judul qosidah, tanggal, nama, dan kategori yang benar-benar tersedia.

Jangan menggunakan satu metode similarity untuk semua jenis pertanyaan.

Normalisasi harus mempertahankan makna, terutama negasi, nama orang, judul lagu, dan teks Arab yang relevan.

## FASE 2 — MODULAR KNOWLEDGE ENGINE

Pisahkan pengetahuan statis dan algoritma.

Gunakan data `qosidahs`, `jobs`, `favorites`, dan `currentUser` dari context sebagai sumber dinamis.

Bangun pencarian menggunakan kombinasi:

- Exact matching.
- Prefix matching.
- Alias matching.
- Weighted token similarity.
- Typo tolerance.
- Domain synonym matching.

Pastikan setiap hasil pencarian mempertahankan referensi data asli.

Jangan membuat informasi yang tidak terdapat dalam data.

Jika hasil pencarian ambigu, tampilkan beberapa kandidat yang paling relevan.

## FASE 3 — CONTEXTUAL MEMORY

Bangun sistem memori percakapan ringan.

Persyaratan:

- Mendukung referensi lanjutan seperti "itu", "yang tadi", "artinya", dan "kapan jadwalnya".
- Menyimpan topik aktif, intent terakhir, entity terakhir, dan konteks yang relevan.
- Tidak menggunakan state global yang tercampur antar pengguna.
- Tidak memerlukan database baru.
- Memiliki batas ukuran dan mekanisme reset.
- Tidak menyimpan data privat secara permanen tanpa kebutuhan dan persetujuan.

Gunakan penambahan field opsional pada `AIContext` jika diperlukan.

Perubahan pada widget hanya diizinkan untuk pengiriman konteks percakapan dan reset memory.

Dilarang mengubah tampilan dan animasi widget.

## FASE 4 — REASONING & QUERY PLANNING

Bangun mekanisme yang dapat:

- Memecah pertanyaan menjadi operasi sederhana.
- Melakukan pencarian berdasarkan tanggal.
- Memfilter dan mengurutkan jadwal.
- Menghitung jumlah data.
- Menggabungkan informasi dari beberapa sumber.
- Menggunakan entity hasil percakapan sebelumnya.
- Mengidentifikasi pertanyaan yang tidak dapat dijawab dengan data saat ini.

Gunakan aturan eksplisit yang dapat diuji.

Jangan mengklaim mesin mempunyai kemampuan penalaran generatif seperti LLM.

## FASE 5 — NATURAL RESPONSE COMPOSER

Bangun generator jawaban berbasis grammar rules dan modular templates.

Persyaratan:

- Menghasilkan variasi kalimat yang alami.
- Mendukung gaya singkat, informatif, dan detail sesuai intent.
- Menghindari variasi acak yang mengubah makna.
- Menggunakan fakta yang berasal dari hasil retrieval.
- Menjaga konsistensi tanggal, nama, jabatan, dan lokasi.
- Mendukung natural fallback dan klarifikasi interaktif.
- Mempertahankan kompatibilitas `AIAction`.

Jangan membuat jawaban panjang hanya untuk terlihat cerdas.

## FASE 6 — CONFIDENCE, VALIDATION & SECURITY

Bangun confidence score untuk pencocokan intent dan entity.

Bedakan:

- Confidence tinggi: jawaban berdasarkan data.
- Confidence sedang: klarifikasi atau kandidat pencarian.
- Confidence rendah: fallback yang jujur.

Confidence bukan probabilitas kebenaran kecuali telah dikalibrasi.

Pastikan:

- Tidak ada informasi sensitif dibocorkan melalui jawaban.
- Semua operasi browser menggunakan data yang memang boleh dilihat pengguna.
- Tidak ada navigasi ke URL tidak tepercaya.
- Tidak ada mutasi data oleh AI tanpa otorisasi.
- Input aneh dan pertanyaan ambigu ditangani dengan aman.
- Teks output tidak dianggap sebagai HTML terpercaya.

## FASE 7 — TESTING DAN PERFORMANCE

Gunakan test framework yang sudah tersedia atau fasilitas bawaan Node.js tanpa menambah dependency AI.

Buat pengujian meliputi:

- Salam dan sapaan.
- Informasi Khoirunnada.
- Informasi pengembang sesuai data resmi.
- Pencarian qosidah dengan judul tepat.
- Pencarian qosidah dengan typo.
- Pencarian menggunakan sinonim.
- Pencarian menggunakan teks Arab jika data mendukung.
- Jadwal terdekat.
- Jadwal berdasarkan tanggal.
- Qosidah favorit.
- Pertanyaan lanjutan.
- Kalimat negasi.
- Input kosong.
- Pertanyaan di luar domain.
- Informasi yang belum tersedia.
- Input dengan karakter khusus.
- Perlindungan informasi privat.
- Kompatibilitas seluruh actions.
- Performa pencarian pada dataset kecil maupun besar.

Lakukan pengujian regresi dan build.

Jangan mengklaim sistem 100% akurat tanpa hasil pengukuran.

---

## STRATEGI IMPLEMENTASI

Kerjakan secara bertahap.

Untuk setiap fase:

1. Jelaskan file yang akan diubah.
2. Jelaskan alasan perubahan.
3. Implementasikan hanya cakupan fase tersebut.
4. Jalankan pengujian yang relevan.
5. Laporkan hasil aktual.
6. Pastikan fungsi lama tetap bekerja.
7. Jangan lanjut ke fase berikutnya sebelum mendapatkan persetujuan saya.

## TUGAS SEKARANG

**MULAI HANYA DARI FASE 0.**

Jangan langsung mengimplementasikan seluruh Brain Engine.

Periksa baseline proyek, dokumentasikan kontrak lama, dan siapkan rencana implementasi terperinci berdasarkan source code aktual.

Laporkan hasil Fase 0 dan tunggu persetujuan sebelum melanjutkan Fase 1.