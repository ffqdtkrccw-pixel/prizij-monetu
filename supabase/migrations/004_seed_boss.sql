-- =============================================================
-- Seed: první sezóna + boss Vzpurný
-- =============================================================

INSERT INTO seasons (id, name, starts_at, ends_at, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sezóna I: Nástup Vzpurného',
  now(),
  now() + interval '28 days',
  true
) ON CONFLICT DO NOTHING;

INSERT INTO boss_state (season_id, name, control_level, aggression, adaptation, flavor_text)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Vzpurný',
  100,
  3,
  0,
  '„Produktivita je naše core value. Alignment je naše síla. Vy jste naše výhoda." — Vzpurný, Q3 All-Hands'
) ON CONFLICT DO NOTHING;
