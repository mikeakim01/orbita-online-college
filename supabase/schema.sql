-- Run this once in the Supabase SQL editor (Dashboard > SQL editor > New query).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program text not null,
  level text not null,
  statement text,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  program text not null,
  level text not null default 'Foundation',
  pass_mark int not null default 60,
  duration_min int not null default 20,
  description text not null default ''
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  position int not null,
  prompt text not null,
  options jsonb not null,
  correct int not null
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete cascade,
  score int not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  serial text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete cascade,
  student_name text not null,
  exam_title text not null,
  score int not null,
  issued_at timestamptz not null default now(),
  revoked boolean not null default false
);

create index if not exists applications_user_idx on public.applications (user_id);
create index if not exists attempts_user_exam_idx on public.attempts (user_id, exam_id, created_at);
create index if not exists certificates_user_idx on public.certificates (user_id);

-- Row level security. The server uses the service-role key for grading and
-- certificate issuing, so students get NO policy on questions and no insert
-- policy on attempts or certificates.
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "applications read own or admin" on public.applications;
create policy "applications read own or admin" on public.applications for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "applications insert own" on public.applications;
create policy "applications insert own" on public.applications for insert
  with check (user_id = auth.uid() and status = 'submitted');

drop policy if exists "applications admin update" on public.applications;
create policy "applications admin update" on public.applications for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "exams read all" on public.exams;
create policy "exams read all" on public.exams for select using (true);

drop policy if exists "attempts read own or admin" on public.attempts;
create policy "attempts read own or admin" on public.attempts for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "certificates read own or admin" on public.certificates;
create policy "certificates read own or admin" on public.certificates for select
  using (user_id = auth.uid() or public.is_admin());
