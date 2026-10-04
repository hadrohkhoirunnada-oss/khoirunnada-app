create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists private.admin_allowlist (
  email text primary key check (email = lower(email)),
  is_admin boolean not null default true,
  is_treasurer boolean not null default true,
  is_member boolean not null default false,
  role_title text not null default 'Pengurus Admin & Bendahara'
);

-- Akun pengurus khusus. Ganti alamat ini sebelum migration bila diperlukan.
insert into private.admin_allowlist (email)
values ('admin.khoirunnada@gmail.com')
on conflict (email) do nothing;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  email text not null unique,
  avatar_url text not null default '/logo-khoirunnada-192.png',
  phone text,
  role_title text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'rejected', 'inactive')),
  is_member boolean not null default false,
  is_treasurer boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null
);

create sequence public.booking_code_seq start 1;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_phone text not null check (char_length(customer_phone) between 8 and 20),
  event_type text not null check (char_length(event_type) between 2 and 60),
  event_name text,
  event_date date not null,
  event_time text not null,
  location text not null check (char_length(location) between 3 and 200),
  location_detail text,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'negotiation', 'waiting_dp', 'confirmed', 'completed', 'cancelled', 'rejected')),
  admin_notes text,
  request_fingerprint text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  converted_job_id uuid
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings(id) on delete set null,
  title text not null check (char_length(title) between 2 and 160),
  event_type text not null,
  customer_name text not null,
  customer_phone text not null,
  event_date date not null,
  gather_time text not null,
  start_time text not null,
  location text not null,
  maps_url text not null default '',
  dress_code text,
  transport_info text,
  notes text,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings
  add constraint bookings_converted_job_id_fkey
  foreign key (converted_job_id) references public.jobs(id) on delete set null;

create table public.job_attendance (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null default '',
  user_avatar text,
  status text not null default 'no_response'
    check (status in ('attending', 'not_attending', 'maybe', 'no_response')),
  note text,
  updated_at timestamptz not null default now(),
  unique (job_id, user_id)
);

create table public.job_assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null default '',
  role_name text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (job_id, user_id, role_name)
);

create table public.qosidah_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.qosidah (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alternate_title text,
  arabic_text text not null,
  latin_text text not null,
  translation text not null default '',
  category_id uuid not null references public.qosidah_categories(id) on delete restrict,
  tags text[] not null default '{}',
  verses jsonb,
  notes text,
  audio_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.qosidah_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  qosidah_id uuid not null references public.qosidah(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, qosidah_id)
);

create table public.qosidah_recent (
  user_id uuid not null references public.profiles(id) on delete cascade,
  qosidah_id uuid not null references public.qosidah(id) on delete cascade,
  last_opened_at timestamptz not null default now(),
  primary key (user_id, qosidah_id)
);

create table public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, type)
);

create table public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  category_id uuid not null references public.finance_categories(id) on delete restrict,
  amount bigint not null check (amount > 0),
  transaction_date date not null,
  description text not null check (char_length(description) between 2 and 1000),
  job_id uuid references public.jobs(id) on delete set null,
  attachment_url text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_by_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text not null check (type in ('job_new', 'job_update', 'job_cancelled', 'announcement', 'approval', 'finance')),
  target_type text not null check (target_type in ('all', 'member', 'treasurer', 'admin')),
  target_id uuid references public.profiles(id) on delete cascade,
  target_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (notification_id, user_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index jobs_event_date_idx on public.jobs (event_date, status);
create index bookings_status_created_idx on public.bookings (status, created_at desc);
create index attendance_job_idx on public.job_attendance (job_id);
create index notifications_created_idx on public.notifications (created_at desc);
create index user_notifications_user_idx on public.user_notifications (user_id, is_read, created_at desc);
create index finance_transaction_date_idx on public.finance_transactions (transaction_date desc);
create index qosidah_sort_idx on public.qosidah (is_active, sort_order);

create or replace function private.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.profiles p where p.auth_user_id = (select auth.uid()) limit 1
$$;

create or replace function private.has_internal_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.status = 'active'
      and (p.is_member or p.is_treasurer or p.is_admin)
  )
$$;

create or replace function private.has_admin_role()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.status = 'active' and p.is_admin
  )
$$;

create or replace function private.has_finance_role()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.status = 'active' and (p.is_treasurer or p.is_admin)
  )
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.set_booking_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.booking_code is null or new.booking_code = '' then
    new.booking_code := 'KN-' || extract(year from now())::text || '-' ||
      lpad(nextval('public.booking_code_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create or replace function private.fill_attendance_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.name, p.avatar_url into new.user_name, new.user_avatar
  from public.profiles p where p.id = new.user_id;
  return new;
end;
$$;

create or replace function private.fill_assignment_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.name into new.user_name from public.profiles p where p.id = new.user_id;
  return new;
end;
$$;

create or replace function private.fill_finance_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.name into new.created_by_name from public.profiles p where p.id = new.created_by;
  return new;
end;
$$;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed private.admin_allowlist%rowtype;
  normalized_email text := lower(coalesce(new.email, ''));
begin
  select * into allowed from private.admin_allowlist a where a.email = normalized_email;

  insert into public.profiles (
    auth_user_id, name, email, avatar_url, role_title, status,
    is_member, is_treasurer, is_admin, approved_at
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(normalized_email, '@', 1)),
    normalized_email,
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '/logo-khoirunnada-192.png'),
    case when found then allowed.role_title else 'Calon Anggota' end,
    case when found then 'active' else 'pending' end,
    case when found then allowed.is_member else false end,
    case when found then allowed.is_treasurer else false end,
    case when found then allowed.is_admin else false end,
    case when found then now() else null end
  ) on conflict (auth_user_id) do update set
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

create or replace function private.protect_allowlisted_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_admin and not exists (
    select 1 from private.admin_allowlist a
    where a.email = new.email and a.is_admin
  ) then
    raise exception 'Role Administrator hanya boleh diberikan kepada email dalam allowlist';
  end if;

  if exists (select 1 from private.admin_allowlist a where a.email = old.email)
    and (
      new.email <> old.email or new.status <> 'active'
      or not new.is_admin or not new.is_treasurer
    ) then
    raise exception 'Akun pengurus khusus tidak dapat dinonaktifkan atau dicabut perannya';
  end if;
  return new;
end;
$$;

create or replace function private.fanout_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_notifications (notification_id, user_id)
  select new.id, p.id
  from public.profiles p
  where p.status = 'active'
    and (
      (new.target_id is not null and p.id = new.target_id)
      or
      (new.target_id is null and (
        new.target_type = 'all'
        or (new.target_type = 'member' and p.is_member)
        or (new.target_type = 'treasurer' and p.is_treasurer)
        or (new.target_type = 'admin' and p.is_admin)
      ))
    )
  on conflict (notification_id, user_id) do nothing;
  return new;
end;
$$;

create or replace function private.notify_new_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (title, message, type, target_type, target_url)
  values (
    'Permintaan Booking Baru Masuk',
    new.customer_name || ' mengajukan booking untuk acara ' || new.event_type || ' (' || new.event_date || ').',
    'announcement', 'admin', '/app/admin/bookings/' || new.id
  );
  return new;
end;
$$;

create or replace function private.notify_job_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (title, message, type, target_type, target_url, created_by)
    values (
      'Job Baru Diterbitkan',
      new.title || ' (' || new.event_date || '). Silakan periksa detail dan konfirmasi kehadiran.',
      'job_new', 'all', '/app/jobs/' || new.id, new.created_by
    );
  elsif row(new.title, new.event_date, new.gather_time, new.start_time, new.location, new.status)
    is distinct from row(old.title, old.event_date, old.gather_time, old.start_time, old.location, old.status) then
    insert into public.notifications (title, message, type, target_type, target_url, created_by)
    values (
      case when new.status = 'cancelled' then 'Job Dibatalkan' else 'Informasi Job Diperbarui' end,
      new.title || ' mengalami pembaruan. Silakan periksa kembali detail acara.',
      case when new.status = 'cancelled' then 'job_cancelled' else 'job_update' end,
      'all', '/app/jobs/' || new.id, new.created_by
    );
  end if;
  return new;
end;
$$;

create or replace function private.notify_profile_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status is distinct from new.status and new.status = 'active' then
    insert into public.notifications (title, message, type, target_type, target_id, target_url, created_by)
    values (
      'Akun Anda Telah Disetujui',
      'Selamat bergabung. Anda sekarang dapat membuka portal internal Khoirunnada.',
      'approval', 'member', new.id, '/app', new.approved_by
    );
  end if;
  return new;
end;
$$;

create or replace function private.audit_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id uuid;
  actor uuid;
begin
  row_id := case when tg_op = 'DELETE' then old.id else new.id end;
  actor := private.current_profile_id();

  insert into public.audit_logs (
    user_id, action, entity_type, entity_id, description, old_data, new_data
  ) values (
    actor,
    tg_op || '_' || upper(tg_table_name),
    upper(tg_table_name),
    row_id,
    case tg_op
      when 'INSERT' then 'Membuat data ' || replace(tg_table_name, '_', ' ')
      when 'UPDATE' then 'Memperbarui data ' || replace(tg_table_name, '_', ' ')
      else 'Menghapus data ' || replace(tg_table_name, '_', ' ')
    end,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger bookings_updated_at before update on public.bookings
for each row execute function private.set_updated_at();
create trigger jobs_updated_at before update on public.jobs
for each row execute function private.set_updated_at();
create trigger qosidah_updated_at before update on public.qosidah
for each row execute function private.set_updated_at();
create trigger finance_updated_at before update on public.finance_transactions
for each row execute function private.set_updated_at();
create trigger booking_code_before_insert before insert on public.bookings
for each row execute function private.set_booking_code();
create trigger attendance_identity before insert or update on public.job_attendance
for each row execute function private.fill_attendance_identity();
create trigger assignment_identity before insert or update on public.job_assignments
for each row execute function private.fill_assignment_identity();
create trigger finance_identity before insert or update on public.finance_transactions
for each row execute function private.fill_finance_identity();
create trigger protect_admin before update on public.profiles
for each row execute function private.protect_allowlisted_admin();
create trigger fanout_notification after insert on public.notifications
for each row execute function private.fanout_notification();
create trigger booking_notification after insert on public.bookings
for each row execute function private.notify_new_booking();
create trigger job_notification after insert or update on public.jobs
for each row execute function private.notify_job_change();
create trigger profile_approval_notification after update on public.profiles
for each row execute function private.notify_profile_approval();

create trigger auth_user_profile_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();
create trigger auth_user_profile_updated
after update of raw_user_meta_data on auth.users
for each row execute function private.handle_new_auth_user();

-- Backfill bila project Auth sudah memiliki user sebelum migration dijalankan.
insert into public.profiles (
  auth_user_id, name, email, avatar_url, role_title, status,
  is_member, is_treasurer, is_admin, approved_at
)
select
  auth_user.id,
  coalesce(
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    split_part(lower(auth_user.email), '@', 1)
  ),
  lower(auth_user.email),
  coalesce(
    auth_user.raw_user_meta_data ->> 'avatar_url',
    auth_user.raw_user_meta_data ->> 'picture',
    '/logo-khoirunnada-192.png'
  ),
  coalesce(allowlist.role_title, 'Calon Anggota'),
  case when allowlist.email is not null then 'active' else 'pending' end,
  coalesce(allowlist.is_member, false),
  coalesce(allowlist.is_treasurer, false),
  coalesce(allowlist.is_admin, false),
  case when allowlist.email is not null then now() else null end
from auth.users auth_user
left join private.admin_allowlist allowlist on allowlist.email = lower(auth_user.email)
where auth_user.email is not null
on conflict (auth_user_id) do nothing;

create trigger audit_profiles after update on public.profiles
for each row execute function private.audit_change();
create trigger audit_bookings after update or delete on public.bookings
for each row execute function private.audit_change();
create trigger audit_jobs after insert or update or delete on public.jobs
for each row execute function private.audit_change();
create trigger audit_assignments after insert or update or delete on public.job_assignments
for each row execute function private.audit_change();
create trigger audit_qosidah after insert or update or delete on public.qosidah
for each row execute function private.audit_change();
create trigger audit_finance after insert or update or delete on public.finance_transactions
for each row execute function private.audit_change();

create or replace function public.get_finance_summary()
returns table (balance bigint, income_this_month bigint, expense_this_month bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_internal_access() then
    raise exception 'Akses ditolak';
  end if;

  return query
  select
    coalesce(sum(case when f.type = 'income' then f.amount else -f.amount end), 0)::bigint,
    coalesce(sum(case when f.type = 'income' and date_trunc('month', f.transaction_date::timestamp) = date_trunc('month', now()) then f.amount else 0 end), 0)::bigint,
    coalesce(sum(case when f.type = 'expense' and date_trunc('month', f.transaction_date::timestamp) = date_trunc('month', now()) then f.amount else 0 end), 0)::bigint
  from public.finance_transactions f;
end;
$$;

create or replace function public.convert_booking_to_job(
  booking_uuid uuid,
  gather_time_value text default '18:30 WITA',
  maps_url_value text default null,
  dress_code_value text default 'Gamis Putih, Jas Hitam Khoirunnada',
  transport_info_value text default 'Kumpul bersama di Markaz Khoirunnada',
  notes_value text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  booking_record public.bookings%rowtype;
  created_job public.jobs%rowtype;
begin
  if not private.has_admin_role() then
    raise exception 'Akses admin diperlukan';
  end if;

  select * into booking_record from public.bookings where id = booking_uuid for update;
  if not found then raise exception 'Booking tidak ditemukan'; end if;
  if booking_record.converted_job_id is not null then raise exception 'Booking sudah dikonversi'; end if;

  insert into public.jobs (
    booking_id, title, event_type, customer_name, customer_phone,
    event_date, gather_time, start_time, location, maps_url,
    dress_code, transport_info, notes, status, created_by
  ) values (
    booking_record.id,
    coalesce(nullif(booking_record.event_name, ''), booking_record.event_type || ' ' || booking_record.customer_name),
    booking_record.event_type,
    booking_record.customer_name,
    booking_record.customer_phone,
    booking_record.event_date,
    gather_time_value,
    booking_record.event_time,
    booking_record.location || case when booking_record.location_detail is not null then ' (' || booking_record.location_detail || ')' else '' end,
    coalesce(maps_url_value, 'https://maps.google.com/?q=' || replace(booking_record.location, ' ', '+')),
    dress_code_value,
    transport_info_value,
    coalesce(booking_record.notes, notes_value, 'Jaga kekompakan dan adab panggung.'),
    'upcoming',
    private.current_profile_id()
  ) returning * into created_job;

  update public.bookings
  set status = 'confirmed', converted_job_id = created_job.id
  where id = booking_record.id;

  return to_jsonb(created_job);
end;
$$;

revoke all on table
  public.profiles, public.bookings, public.jobs, public.job_attendance,
  public.job_assignments, public.qosidah_categories, public.qosidah,
  public.qosidah_favorites, public.qosidah_recent, public.finance_categories,
  public.finance_transactions, public.notifications, public.user_notifications,
  public.audit_logs
from anon, authenticated;
revoke all on sequence public.booking_code_seq from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update on public.job_attendance to authenticated;
grant select, insert, update, delete on public.job_assignments to authenticated;
grant select, insert, update, delete on public.qosidah_categories to authenticated;
grant select, insert, update, delete on public.qosidah to authenticated;
grant select, insert, delete on public.qosidah_favorites to authenticated;
grant select, insert, update, delete on public.qosidah_recent to authenticated;
grant select, insert, update, delete on public.finance_categories to authenticated;
grant select, insert, update, delete on public.finance_transactions to authenticated;
grant select, insert on public.notifications to authenticated;
grant select, update on public.user_notifications to authenticated;
grant select on public.audit_logs to authenticated;
grant select, update on public.bookings to authenticated;
grant usage, select on sequence public.booking_code_seq to service_role;
grant select, insert on public.bookings to service_role;

grant usage on schema private to authenticated;
revoke execute on function public.get_finance_summary() from public, anon;
revoke execute on function public.convert_booking_to_job(uuid, text, text, text, text, text) from public, anon;
grant execute on function private.current_profile_id() to authenticated;
grant execute on function private.has_internal_access() to authenticated;
grant execute on function private.has_admin_role() to authenticated;
grant execute on function private.has_finance_role() to authenticated;
grant execute on function public.get_finance_summary() to authenticated;
grant execute on function public.convert_booking_to_job(uuid, text, text, text, text, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.jobs enable row level security;
alter table public.job_attendance enable row level security;
alter table public.job_assignments enable row level security;
alter table public.qosidah_categories enable row level security;
alter table public.qosidah enable row level security;
alter table public.qosidah_favorites enable row level security;
alter table public.qosidah_recent enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.user_notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select on public.profiles for select to authenticated
using (id = private.current_profile_id() or private.has_admin_role());
create policy profiles_update_admin on public.profiles for update to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());

create policy bookings_select_admin on public.bookings for select to authenticated
using (private.has_admin_role());
create policy bookings_update_admin on public.bookings for update to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());

create policy jobs_select_internal on public.jobs for select to authenticated
using (private.has_internal_access());
create policy jobs_insert_admin on public.jobs for insert to authenticated
with check (private.has_admin_role() and created_by = private.current_profile_id());
create policy jobs_update_admin on public.jobs for update to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());
create policy jobs_delete_admin on public.jobs for delete to authenticated
using (private.has_admin_role());

create policy attendance_select_internal on public.job_attendance for select to authenticated
using (private.has_internal_access());
create policy attendance_insert_own on public.job_attendance for insert to authenticated
with check (private.has_internal_access() and user_id = private.current_profile_id());
create policy attendance_update_own on public.job_attendance for update to authenticated
using (user_id = private.current_profile_id()) with check (user_id = private.current_profile_id());

create policy assignments_select_internal on public.job_assignments for select to authenticated
using (private.has_internal_access());
create policy assignments_insert_admin on public.job_assignments for insert to authenticated
with check (private.has_admin_role());
create policy assignments_update_admin on public.job_assignments for update to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());
create policy assignments_delete_admin on public.job_assignments for delete to authenticated
using (private.has_admin_role());

create policy categories_select_internal on public.qosidah_categories for select to authenticated
using (private.has_internal_access());
create policy categories_insert_admin on public.qosidah_categories for insert to authenticated
with check (private.has_admin_role());
create policy categories_update_admin on public.qosidah_categories for update to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());
create policy categories_delete_admin on public.qosidah_categories for delete to authenticated
using (private.has_admin_role());

create policy qosidah_select_internal on public.qosidah for select to authenticated
using (private.has_internal_access() and (is_active or private.has_admin_role()));
create policy qosidah_insert_admin on public.qosidah for insert to authenticated
with check (private.has_admin_role());
create policy qosidah_update_admin on public.qosidah for update to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());
create policy qosidah_delete_admin on public.qosidah for delete to authenticated
using (private.has_admin_role());

create policy favorites_own on public.qosidah_favorites for select to authenticated
using (user_id = private.current_profile_id());
create policy favorites_insert_own on public.qosidah_favorites for insert to authenticated
with check (user_id = private.current_profile_id());
create policy favorites_delete_own on public.qosidah_favorites for delete to authenticated
using (user_id = private.current_profile_id());

create policy recent_own on public.qosidah_recent for select to authenticated
using (user_id = private.current_profile_id());
create policy recent_insert_own on public.qosidah_recent for insert to authenticated
with check (user_id = private.current_profile_id());
create policy recent_update_own on public.qosidah_recent for update to authenticated
using (user_id = private.current_profile_id()) with check (user_id = private.current_profile_id());
create policy recent_delete_own on public.qosidah_recent for delete to authenticated
using (user_id = private.current_profile_id());

create policy finance_categories_select_staff on public.finance_categories for select to authenticated
using (private.has_finance_role());
create policy finance_categories_insert_admin on public.finance_categories for insert to authenticated
with check (private.has_admin_role());
create policy finance_categories_update_admin on public.finance_categories for update to authenticated
using (private.has_admin_role()) with check (private.has_admin_role());
create policy finance_categories_delete_admin on public.finance_categories for delete to authenticated
using (private.has_admin_role());

create policy finance_select_staff on public.finance_transactions for select to authenticated
using (private.has_finance_role());
create policy finance_insert_staff on public.finance_transactions for insert to authenticated
with check (private.has_finance_role() and created_by = private.current_profile_id());
create policy finance_update_staff on public.finance_transactions for update to authenticated
using (private.has_finance_role()) with check (private.has_finance_role());
create policy finance_delete_staff on public.finance_transactions for delete to authenticated
using (private.has_finance_role());

create policy notifications_select_recipient on public.notifications for select to authenticated
using (
  private.has_admin_role() or exists (
    select 1 from public.user_notifications un
    where un.notification_id = id and un.user_id = private.current_profile_id()
  )
);
create policy notifications_insert_admin on public.notifications for insert to authenticated
with check (private.has_admin_role() and created_by = private.current_profile_id());

create policy user_notifications_select_own on public.user_notifications for select to authenticated
using (user_id = private.current_profile_id());
create policy user_notifications_update_own on public.user_notifications for update to authenticated
using (user_id = private.current_profile_id())
with check (user_id = private.current_profile_id());

create policy audit_select_admin on public.audit_logs for select to authenticated
using (private.has_admin_role());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'finance-receipts', 'finance-receipts', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy receipt_select_staff on storage.objects for select to authenticated
using (bucket_id = 'finance-receipts' and private.has_finance_role());
create policy receipt_insert_staff on storage.objects for insert to authenticated
with check (
  bucket_id = 'finance-receipts'
  and private.has_finance_role()
  and (storage.foldername(name))[1] = private.current_profile_id()::text
);
create policy receipt_update_staff on storage.objects for update to authenticated
using (bucket_id = 'finance-receipts' and private.has_finance_role())
with check (bucket_id = 'finance-receipts' and private.has_finance_role());
create policy receipt_delete_staff on storage.objects for delete to authenticated
using (bucket_id = 'finance-receipts' and private.has_finance_role());

insert into public.qosidah_categories (name, slug, sort_order) values
  ('Pembukaan', 'pembukaan', 1),
  ('Sholawat', 'sholawat', 2),
  ('Mahalul Qiyam', 'mahalul-qiyam', 3),
  ('Qosidah Inti', 'qosidah-inti', 4),
  ('Penutup', 'penutup', 5)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.finance_categories (name, type) values
  ('Pembayaran Job', 'income'), ('Kas Anggota', 'income'), ('Donasi', 'income'),
  ('Bantuan', 'income'), ('Pendapatan Lainnya', 'income'),
  ('Transport', 'expense'), ('Konsumsi', 'expense'), ('Peralatan', 'expense'),
  ('Perawatan Alat', 'expense'), ('Seragam', 'expense'), ('Dokumentasi', 'expense'),
  ('Operasional', 'expense'), ('Pengeluaran Lainnya', 'expense')
on conflict (name, type) do nothing;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.jobs; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.user_notifications; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.bookings; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.profiles; exception when duplicate_object then null; end;
  end if;
end $$;
