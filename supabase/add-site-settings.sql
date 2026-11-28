-- Run once in the Supabase SQL editor (safe to run again). Stores admin settings such as the certificate design.
create table if not exists public.site_settings (key text primary key, value text not null);
alter table public.site_settings enable row level security;
