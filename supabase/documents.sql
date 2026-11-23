-- Applicant documents. Run once in the Supabase SQL editor (after schema.sql).

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  doc_type text not null,
  file_path text not null unique,
  file_name text not null,
  size_bytes int not null,
  created_at timestamptz not null default now(),
  verified boolean not null default false,
  verified_at timestamptz
);
-- For installs that already ran an earlier version of this file:
alter table public.application_documents add column if not exists verified boolean not null default false;
alter table public.application_documents add column if not exists verified_at timestamptz;
-- A note from admissions to the applicant, for example a request for a missing document.
alter table public.applications add column if not exists docs_note text;
alter table public.applications add column if not exists docs_note_at timestamptz;
create index if not exists application_documents_app_idx on public.application_documents (application_id);
alter table public.application_documents enable row level security;

drop policy if exists "documents read own or admin" on public.application_documents;
create policy "documents read own or admin" on public.application_documents for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "documents insert own" on public.application_documents;
create policy "documents insert own" on public.application_documents for insert
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid() and a.status = 'submitted')
  );

drop policy if exists "documents delete own while pending" on public.application_documents;
create policy "documents delete own while pending" on public.application_documents for delete
  using (
    user_id = auth.uid()
    and exists (select 1 from public.applications a where a.id = application_id and a.status = 'submitted')
  );

-- Private storage bucket: PDF, JPG or PNG, 5 MB each. Files live under <user id>/<application id>/.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('application-docs', 'application-docs', false, 5242880, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false, file_size_limit = 5242880, allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

drop policy if exists "docs upload own folder" on storage.objects;
create policy "docs upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'application-docs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "docs read own or admin" on storage.objects;
create policy "docs read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'application-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists "docs delete own folder" on storage.objects;
create policy "docs delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'application-docs' and (storage.foldername(name))[1] = auth.uid()::text);
