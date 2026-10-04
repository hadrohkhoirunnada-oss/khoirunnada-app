-- ==============================================================================
-- Migration: 20261004000200_fix_sync_rls.sql
-- Tujuan: Memastikan sinkronisasi data Admin -> Pemain bekerja 100% sempurna:
-- 1. Perbaiki RLS notifications agar pemain dapat membaca notifikasi & pengumuman
-- 2. Perbaiki RLS profiles agar pemain dapat melihat daftar anggota & peran
-- 3. Perbaiki RLS bookings agar pemain dapat melihat booking/acara yang dikelola admin
-- 4. Aktifkan Supabase Realtime dengan REPLICA IDENTITY FULL untuk realtime updates
-- ==============================================================================

-- 1. NOTIFICATIONS RLS FIX
-- Hapus policy lama yang memiliki bug variable shadowing (un.notification_id = id yang merujuk ke un.id)
drop policy if exists notifications_select_recipient on public.notifications;

-- Buat policy baru yang jelas & mengizinkan seluruh anggota internal yang aktif untuk membaca notifikasi
create policy notifications_select_recipient on public.notifications
for select to authenticated
using (
  private.has_internal_access()
);

-- 2. PROFILES RLS FIX
-- Izinkan seluruh anggota aktif melihat data profil anggota lain (nama, avatar, peran, role_title)
drop policy if exists profiles_select on public.profiles;

create policy profiles_select on public.profiles
for select to authenticated
using (
  private.has_internal_access() or id = private.current_profile_id()
);

-- 3. BOOKINGS RLS FIX
-- Izinkan anggota internal melihat daftar booking acara yang dikelola pengurus
drop policy if exists bookings_select_admin on public.bookings;

create policy bookings_select_internal on public.bookings
for select to authenticated
using (
  private.has_internal_access()
);

-- 4. QOSIDAH & USER_NOTIFICATIONS REPLICA IDENTITY FULL & REALTIME
alter table public.qosidah replica identity full;
alter table public.profiles replica identity full;
alter table public.bookings replica identity full;
alter table public.jobs replica identity full;
alter table public.notifications replica identity full;
alter table public.user_notifications replica identity full;

-- Pastikan semua tabel ada dalam supabase_realtime publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'qosidah'
  ) then
    alter publication supabase_realtime add table public.qosidah;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'jobs'
  ) then
    alter publication supabase_realtime add table public.jobs;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'user_notifications'
  ) then
    alter publication supabase_realtime add table public.user_notifications;
  end if;
end $$;
