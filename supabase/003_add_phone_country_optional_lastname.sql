-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Simplifies the lead magnet signup form: first name + email are the only
-- required fields now. Adds optional phone/country capture, and makes
-- last_name optional to match (it's no longer collected in the form at all).

alter table public.subscribers
  add column if not exists phone text,
  add column if not exists country text;

alter table public.subscribers
  alter column last_name drop not null;
