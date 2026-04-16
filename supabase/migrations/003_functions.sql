-- =============================================================
-- PL/pgSQL funkce pro herní logiku
-- =============================================================

-- Přepočítej influence score pro konkrétního avatara
CREATE OR REPLACE FUNCTION prepocitej_influence(p_avatar_id UUID)
RETURNS void AS $$
DECLARE
  base_score  INTEGER;
  velocity    FLOAT;
  posts_7d    INTEGER;
  posts_24h   INTEGER;
BEGIN
  -- Suma vah reakcí + komentáře (posledních 7 dní)
  SELECT
    COALESCE(SUM(r.weight), 0) + COALESCE(SUM(p.comment_count) * 2, 0)
  INTO base_score
  FROM posts p
  LEFT JOIN reactions r ON r.post_id = p.id
  WHERE p.avatar_id = p_avatar_id
    AND p.created_at > now() - interval '7 days';

  -- Velocity faktor (1.0–2.0)
  SELECT COUNT(*) INTO posts_7d FROM posts
  WHERE avatar_id = p_avatar_id AND created_at > now() - interval '7 days';

  SELECT COUNT(*) INTO posts_24h FROM posts
  WHERE avatar_id = p_avatar_id AND created_at > now() - interval '24 hours';

  IF posts_7d > 0 THEN
    velocity := LEAST(2.0, GREATEST(1.0, (posts_24h::float / (posts_7d::float / 7))));
  ELSE
    velocity := 1.0;
  END IF;

  UPDATE avatars
  SET influence_score = ROUND(base_score * velocity)
  WHERE id = p_avatar_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Denní rozuzlení — volané cronem nebo manuálně
CREATE OR REPLACE FUNCTION spust_denni_rozuzleni(p_season_id UUID)
RETURNS TABLE(vysledek TEXT, poskozeni INT, kontrola INT) AS $$
DECLARE
  v_damage            INTEGER;
  v_control           INTEGER;
  v_boss_control      INTEGER;
  v_events_impact     INTEGER;
  v_checkin_count     INTEGER;
  v_result            TEXT;
  v_boss_before       INTEGER;
  v_boss_after        INTEGER;
BEGIN
  -- Součet damage z dnešních check-inů
  SELECT COALESCE(SUM(damage_contrib), 0) INTO v_damage
  FROM daily_checkins
  WHERE season_id = p_season_id AND checkin_date = CURRENT_DATE;

  -- Přidej damage z dnešních reakcí
  SELECT v_damage + COALESCE(SUM(r.weight), 0) INTO v_damage
  FROM reactions r
  JOIN posts p ON p.id = r.post_id
  WHERE p.season_id = p_season_id
    AND DATE(r.created_at AT TIME ZONE 'Europe/Prague') = CURRENT_DATE;

  -- Počet check-inů dnes
  SELECT COUNT(*) INTO v_checkin_count
  FROM daily_checkins
  WHERE season_id = p_season_id AND checkin_date = CURRENT_DATE;

  -- Boss kontrola
  SELECT control_level INTO v_boss_control
  FROM boss_state WHERE season_id = p_season_id;
  v_boss_before := v_boss_control;

  -- Dopad aktivních eventů
  SELECT COALESCE(SUM(ABS(morale_delta) + ABS(burnout_delta)), 0) INTO v_events_impact
  FROM boss_events
  WHERE season_id = p_season_id AND is_active = true;

  -- Inaktivita penálta
  v_control := 10 + v_events_impact + GREATEST(0, (5 - v_checkin_count) * 3);

  -- Rozuzlení
  IF v_damage > v_control THEN
    v_result := 'win';
    UPDATE boss_state
    SET control_level = GREATEST(0, control_level - LEAST(20, v_damage - v_control)),
        updated_at = now()
    WHERE season_id = p_season_id;
  ELSIF v_damage = v_control THEN
    v_result := 'draw';
  ELSE
    v_result := 'lose';
    UPDATE boss_state
    SET control_level = LEAST(100, control_level + 5),
        aggression = LEAST(10, aggression + 1),
        updated_at = now()
    WHERE season_id = p_season_id;
  END IF;

  SELECT control_level INTO v_boss_after FROM boss_state WHERE season_id = p_season_id;

  -- Zapiš výsledek
  INSERT INTO daily_resolutions
    (season_id, total_damage, total_control, result, active_players, boss_control_before, boss_control_after)
  VALUES
    (p_season_id, v_damage, v_control, v_result, v_checkin_count, v_boss_before, v_boss_after)
  ON CONFLICT (season_id, resolution_date) DO UPDATE
    SET total_damage = EXCLUDED.total_damage,
        total_control = EXCLUDED.total_control,
        result = EXCLUDED.result;

  RETURN QUERY SELECT v_result, v_damage, v_control;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: po vložení/smazání reakce aktualizuj reaction_score na postu
CREATE OR REPLACE FUNCTION aktualizuj_reaction_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET reaction_score = reaction_score + NEW.weight WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET reaction_score = GREATEST(0, reaction_score - OLD.weight) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reakce_score
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION aktualizuj_reaction_score();

-- Trigger: po vložení komentáře inkrementuj comment_count
CREATE OR REPLACE FUNCTION aktualizuj_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_komentar_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION aktualizuj_comment_count();
