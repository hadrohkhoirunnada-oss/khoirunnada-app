create table if not exists public.qosidah_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id text not null,
  category_name text not null,
  arabic_text text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

grant select, insert, delete on public.qosidah_drafts to authenticated;

alter table public.qosidah_drafts enable row level security;

create policy "Admin dapat mengelola qosidah_drafts"
on public.qosidah_drafts
for all
to authenticated
using (private.has_finance_role())
with check (private.has_finance_role());

