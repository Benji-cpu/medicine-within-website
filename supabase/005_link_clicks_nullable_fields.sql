-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- The webhook handler intentionally logs a click even when email/clicked_url
-- extraction fails (so nothing is lost if Kit's real payload shape differs
-- from what was guessed) - the schema needs to allow that, not reject it.

alter table public.link_clicks
  alter column email drop not null,
  alter column clicked_url drop not null;
