-- =============================================================
-- Přežij Monetu — Databázové schéma
-- PRIVACY: žádné osobní údaje, žádné IP adresy, žádný tracking
-- =============================================================

-- Sezóny
CREATE TABLE IF NOT EXISTS seasons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Anonymní avatary — UUID je klientem generovaný, ukládaný v localStorage
-- ŽÁDNÉ osobní informace, ŽÁDNÉ IP adresy
CREATE TABLE IF NOT EXISTS avatars (
  id                  UUID PRIMARY KEY,
  display_name        TEXT NOT NULL,
  level               INTEGER DEFAULT 1 CHECK (level >= 1),
  xp                  INTEGER DEFAULT 0 CHECK (xp >= 0),
  morale              INTEGER DEFAULT 70 CHECK (morale BETWEEN 0 AND 100),
  energy              INTEGER DEFAULT 80 CHECK (energy BETWEEN 0 AND 100),
  burnout             INTEGER DEFAULT 10 CHECK (burnout BETWEEN 0 AND 100),
  flex                INTEGER DEFAULT 0 CHECK (flex >= 0),
  overtime_mins       INTEGER DEFAULT 0 CHECK (overtime_mins >= 0),
  loyalty             INTEGER DEFAULT 50 CHECK (loyalty BETWEEN 0 AND 100),
  influence_score     INTEGER DEFAULT 0,
  unlocked_abilities  TEXT[] DEFAULT '{}',
  season_id           UUID REFERENCES seasons(id),
  backup_key          TEXT UNIQUE,
  last_checkin_at     DATE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Boss stav (jeden řádek per sezóna)
CREATE TABLE IF NOT EXISTS boss_state (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id       UUID REFERENCES seasons(id) UNIQUE,
  name            TEXT NOT NULL DEFAULT 'Vzpurný',
  control_level   INTEGER DEFAULT 100 CHECK (control_level BETWEEN 0 AND 100),
  aggression      INTEGER DEFAULT 3 CHECK (aggression BETWEEN 1 AND 10),
  adaptation      INTEGER DEFAULT 0 CHECK (adaptation >= 0),
  flavor_text     TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Boss eventy
CREATE TABLE IF NOT EXISTS boss_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id       UUID REFERENCES seasons(id),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('realisticky', 'bizarni')),
  morale_delta    INTEGER DEFAULT 0,
  burnout_delta   INTEGER DEFAULT 0,
  energy_delta    INTEGER DEFAULT 0,
  flex_delta      INTEGER DEFAULT 0,
  overtime_delta  INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT false,
  activated_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Denní check-iny (UNIQUE avatar+datum zabrání duplicitám)
CREATE TABLE IF NOT EXISTS daily_checkins (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id         UUID REFERENCES avatars(id) ON DELETE CASCADE,
  season_id         UUID REFERENCES seasons(id),
  checkin_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  office_days       INTEGER DEFAULT 0 CHECK (office_days >= 0),
  home_office_days  INTEGER DEFAULT 0 CHECK (home_office_days >= 0),
  overtime_mins     INTEGER DEFAULT 0 CHECK (overtime_mins >= 0),
  day_rating        TEXT NOT NULL CHECK (day_rating IN ('skull', 'fire', 'clown', 'chart')),
  xp_gained         INTEGER DEFAULT 0,
  damage_contrib    INTEGER DEFAULT 0,
  morale_delta      INTEGER DEFAULT 0,
  energy_delta      INTEGER DEFAULT 0,
  burnout_delta     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(avatar_id, checkin_date)
);

-- Posty
CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id       UUID REFERENCES avatars(id) ON DELETE CASCADE,
  season_id       UUID REFERENCES seasons(id),
  content         TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 280),
  reaction_score  INTEGER DEFAULT 0,
  comment_count   INTEGER DEFAULT 0,
  is_boosted      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Komentáře (hloubka max 1 = reply na komentář, tzn. post→komentář→reply)
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
  avatar_id   UUID REFERENCES avatars(id) ON DELETE CASCADE,
  depth       INTEGER DEFAULT 0 CHECK (depth BETWEEN 0 AND 1),
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 280),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Reakce (váha je denormalizovaná = rychlé dotazy)
CREATE TABLE IF NOT EXISTS reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID REFERENCES posts(id) ON DELETE CASCADE,
  avatar_id       UUID REFERENCES avatars(id) ON DELETE CASCADE,
  reaction_type   TEXT NOT NULL CHECK (reaction_type IN ('skull', 'fire', 'clown', 'chart')),
  weight          INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, avatar_id, reaction_type)
);

-- Denní rozuzlení
CREATE TABLE IF NOT EXISTS daily_resolutions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id             UUID REFERENCES seasons(id),
  resolution_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  total_damage          INTEGER DEFAULT 0,
  total_control         INTEGER DEFAULT 0,
  result                TEXT NOT NULL CHECK (result IN ('win', 'lose', 'draw')),
  active_players        INTEGER DEFAULT 0,
  boss_control_before   INTEGER,
  boss_control_after    INTEGER,
  created_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(season_id, resolution_date)
);

-- Indexy pro výkon
CREATE INDEX IF NOT EXISTS idx_avatars_season ON avatars(season_id);
CREATE INDEX IF NOT EXISTS idx_posts_season_created ON posts(season_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_avatar ON posts(avatar_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_avatar ON reactions(avatar_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkins_avatar ON daily_checkins(avatar_id);
CREATE INDEX IF NOT EXISTS idx_boss_events_season_active ON boss_events(season_id, is_active);
