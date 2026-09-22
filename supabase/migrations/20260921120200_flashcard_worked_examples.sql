-- Cache for AI-generated flashcard worked examples (Premium-only content — see
-- docs/plans/freemium-paywall-v2.md, decision 5). Global cache keyed by card
-- content, not per-user: every Premium user sees the same worked example for the
-- same card, so there's no reason to regenerate per request. Static cards today
-- (src/data/practiceData.js) plus room for future AI-authored/user cards, all keyed
-- the same way.

create table if not exists public.flashcard_worked_examples (
  card_key       text primary key,  -- stable slug: category + front, lowercased/dashed
  worked_example text not null,
  created_at     timestamptz not null default now()
);

alter table public.flashcard_worked_examples enable row level security;
-- No policies: only the flashcard-example Edge Function (service role) reads/writes.
