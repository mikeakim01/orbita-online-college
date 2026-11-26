-- Run once in the Supabase SQL editor (safe to run again).
alter table public.certificates add column if not exists results jsonb;
