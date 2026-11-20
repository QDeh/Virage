create table if not exists public.virage_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  cv_path text,
  updated_at timestamptz not null default now()
);

alter table public.virage_profiles enable row level security;

drop policy if exists "Users manage their Virage profile"
  on public.virage_profiles;
create policy "Users manage their Virage profile"
  on public.virage_profiles
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'virage-cvs',
  'virage-cvs',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users read their Virage CV"
  on storage.objects;
create policy "Users read their Virage CV"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'virage-cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users upload their Virage CV"
  on storage.objects;
create policy "Users upload their Virage CV"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'virage-cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update their Virage CV"
  on storage.objects;
create policy "Users update their Virage CV"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'virage-cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'virage-cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete their Virage CV"
  on storage.objects;
create policy "Users delete their Virage CV"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'virage-cvs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
