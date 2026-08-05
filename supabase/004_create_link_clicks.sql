-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Logs individual link-click events from Kit's (ConvertKit) v4 webhook
-- (subscriber.link_click), so repeat-click-per-offer can be queried going
-- forward. Historical clicks from before this table existed cannot be
-- backfilled - Kit's API has no per-subscriber, per-link click history.

create table if not exists public.link_clicks (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  clicked_url text not null,
  hipsy_event_id integer,
  offer_name text,
  clicked_at timestamptz not null default now(),
  raw_payload jsonb
);

create index if not exists link_clicks_email_idx on public.link_clicks (email);
create index if not exists link_clicks_offer_idx on public.link_clicks (offer_name);

-- Row Level Security enabled with no policies, so only requests using the
-- SUPABASE_SECRET_KEY (server-side, in api/kit-click-webhook.js) can read or
-- write. The browser never talks to this table directly.
alter table public.link_clicks enable row level security;
