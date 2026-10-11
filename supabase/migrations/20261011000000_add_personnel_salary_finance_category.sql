insert into public.finance_categories (name, type)
values ('Gaji Personel', 'expense')
on conflict (name, type) do nothing;
