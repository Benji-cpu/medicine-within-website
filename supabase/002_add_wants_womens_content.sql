-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Adds the opt-in checkbox answer from the lead magnet signup forms.

alter table public.subscribers
  add column if not exists wants_womens_content boolean not null default false;
