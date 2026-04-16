-- =============================================================
-- Row Level Security — PRIVACY-FIRST
-- Vše veřejně čitelné, zápis jen přes X-Avatar-Id header
-- (server API route nastaví app.avatar_id před každou mutací)
-- =============================================================

ALTER TABLE avatars           ENABLE ROW LEVEL SECURITY;
ALTER TABLE boss_state        ENABLE ROW LEVEL SECURITY;
ALTER TABLE boss_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons           ENABLE ROW LEVEL SECURITY;

-- ===== SEASONS (veřejné čtení) =====
CREATE POLICY "seasons_select" ON seasons FOR SELECT USING (true);

-- ===== BOSS STATE (veřejné čtení, zápis jen service_role) =====
CREATE POLICY "boss_state_select" ON boss_state FOR SELECT USING (true);

-- ===== BOSS EVENTS (veřejné čtení) =====
CREATE POLICY "boss_events_select" ON boss_events FOR SELECT USING (true);

-- ===== AVATARY =====
-- Veřejné čtení (leaderboard, feed)
CREATE POLICY "avatars_select" ON avatars FOR SELECT USING (true);
-- Vložení vlastního avatara
CREATE POLICY "avatars_insert" ON avatars FOR INSERT
  WITH CHECK (id = current_setting('app.avatar_id', true)::uuid);
-- Update jen vlastního avatara
CREATE POLICY "avatars_update" ON avatars FOR UPDATE
  USING (id = current_setting('app.avatar_id', true)::uuid);

-- ===== CHECKINS =====
-- Čtení jen vlastních check-inů
CREATE POLICY "checkins_select" ON daily_checkins FOR SELECT
  USING (avatar_id = current_setting('app.avatar_id', true)::uuid);
-- Vložení jen vlastního
CREATE POLICY "checkins_insert" ON daily_checkins FOR INSERT
  WITH CHECK (avatar_id = current_setting('app.avatar_id', true)::uuid);

-- ===== POSTY (veřejné čtení, vložení jen vlastní) =====
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT
  WITH CHECK (avatar_id = current_setting('app.avatar_id', true)::uuid);

-- ===== KOMENTÁŘE (veřejné čtení) =====
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT
  WITH CHECK (avatar_id = current_setting('app.avatar_id', true)::uuid);

-- ===== REAKCE =====
CREATE POLICY "reactions_select" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT
  WITH CHECK (avatar_id = current_setting('app.avatar_id', true)::uuid);
CREATE POLICY "reactions_delete" ON reactions FOR DELETE
  USING (avatar_id = current_setting('app.avatar_id', true)::uuid);

-- ===== DAILY RESOLUTIONS (veřejné čtení) =====
CREATE POLICY "resolutions_select" ON daily_resolutions FOR SELECT USING (true);
