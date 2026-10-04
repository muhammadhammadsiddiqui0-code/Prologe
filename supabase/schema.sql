-- Run once in the Supabase SQL editor.
-- The API route writes with the service-role key (server-side only), so no public policies are needed.

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  company     text not null,
  email       text not null,
  phone       text not null,
  country     text not null,
  interest    text not null,
  message     text not null,
  consent     boolean not null default false,
  user_agent  text,
  source      text default 'prologe.ae'
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Lock the table down: with RLS on and no policies, only the service role can read/write.
alter table public.leads enable row level security;
