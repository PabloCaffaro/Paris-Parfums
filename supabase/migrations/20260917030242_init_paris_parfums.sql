create table public.perfumes (
  slug text primary key,
  name text not null,
  image_url text not null default '',
  price numeric(10,2) not null check (price between 0 and 10000),
  family text not null, short_description text not null, hero_description text not null,
  detailed_description text not null, narrative text not null, volume text not null,
  concentration text not null, badge text not null,
  notes text[] not null check (cardinality(notes) between 1 and 8),
  occasions text[] not null check (cardinality(occasions) between 1 and 8),
  intensity text not null, duration text not null, sort_order bigint not null default 0
);
create index perfumes_sort_order_idx on public.perfumes (sort_order);
create table public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.perfumes enable row level security;
alter table public.admin_users enable row level security;
grant select on public.perfumes to anon, authenticated;
grant insert, update, delete on public.perfumes to authenticated;
grant select on public.admin_users to authenticated;
create policy "catalogo publico" on public.perfumes for select to anon, authenticated using (true);
create policy "admins gestionan catalogo" on public.perfumes for all to authenticated
using ((select exists (select 1 from public.admin_users where user_id = (select auth.uid()))))
with check ((select exists (select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy "usuarios leen su rol" on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));
insert into storage.buckets (id, name, public) values ('perfume-images', 'perfume-images', true) on conflict (id) do nothing;
create policy "admins suben imagenes" on storage.objects for insert to authenticated
with check (bucket_id = 'perfume-images' and (select exists (select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy "admins actualizan imagenes" on storage.objects for update to authenticated
using (bucket_id = 'perfume-images' and (select exists (select 1 from public.admin_users where user_id = (select auth.uid()))))
with check (bucket_id = 'perfume-images' and (select exists (select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy "admins borran imagenes" on storage.objects for delete to authenticated
using (bucket_id = 'perfume-images' and (select exists (select 1 from public.admin_users where user_id = (select auth.uid()))));
