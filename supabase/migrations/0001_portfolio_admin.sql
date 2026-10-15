create table if not exists public.portfolio_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_drafts (
  id text primary key check (id = 'main'),
  content jsonb not null,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;
alter table public.portfolio_drafts enable row level security;

grant select on public.portfolio_content to anon, authenticated;
grant insert, update, select on public.portfolio_content to authenticated;
grant all on public.portfolio_drafts to authenticated;

create policy "public can read published portfolio"
  on public.portfolio_content for select
  to anon, authenticated
  using (published = true);

create policy "admin can manage portfolio content"
  on public.portfolio_content for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can manage portfolio drafts"
  on public.portfolio_drafts for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-private', 'portfolio-private', false, 4194304, array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 4194304, allowed_mime_types = excluded.allowed_mime_types;

create policy "admin can manage portfolio uploads"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'portfolio-private' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'portfolio-private' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
