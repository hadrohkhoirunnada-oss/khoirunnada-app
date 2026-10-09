-- ==============================================================================
-- Migration: 20261010000000_decouple_qosidah_favorites.sql
-- Tujuan:
-- 1. Qosidah kini ditulis langsung di dalam kode aplikasi (tanpa perlu tabel DB).
-- 2. Database Supabase dikhususkan hanya untuk menyimpan data Favorit personal (qosidah_favorites).
-- 3. Hapus foreign key constraint agar qosidah_favorites berdiri sendiri.
-- 4. Hapus tabel public.qosidah & public.qosidah_categories dari database.
-- ==============================================================================

-- 1. Lepas Foreign Key constraint pada qosidah_favorites
alter table public.qosidah_favorites drop constraint if exists qosidah_favorites_qosidah_id_fkey;

-- 2. Ubah tipe kolom qosidah_id di qosidah_favorites menjadi text
alter table public.qosidah_favorites alter column qosidah_id type text;

-- 3. Lepas Foreign Key constraint pada qosidah_recent
alter table public.qosidah_recent drop constraint if exists qosidah_recent_qosidah_id_fkey;
alter table public.qosidah_recent alter column qosidah_id type text;

-- 4. Sinkronkan Realtime publication
do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'qosidah'
  ) then
    alter publication supabase_realtime drop table public.qosidah;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'qosidah_favorites'
  ) then
    alter publication supabase_realtime add table public.qosidah_favorites;
  end if;
end $$;

-- 5. Hapus tabel public.qosidah dan public.qosidah_categories dari database
drop table if exists public.qosidah cascade;
drop table if exists public.qosidah_categories cascade;
