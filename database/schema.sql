-- Create tables for basketball stats
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    conference VARCHAR(50)
);
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    -- jersey_number INTEGER,
    -- position VARCHAR(10),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unique(team_id, first_name, last_name)
);
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    away_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    game_date DATE NOT NULL,
    season VARCHAR(10) NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (home_team_id, away_team_id, game_date)
);
CREATE TABLE IF NOT EXISTS lineups (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    display_lineup VARCHAR(150) NOT NULL,
    canonical_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (team_id, canonical_key)
);
CREATE TABLE IF NOT EXISTS lineup_players (
    lineup_id INTEGER NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
    PRIMARY KEY (lineup_id, player_id)
);
CREATE INDEX IF NOT EXISTS idx_lineup_players_player on lineup_players (player_id);
CREATE INDEX IF NOT EXISTS idx_lineup_players_lineup on lineup_players (lineup_id);
CREATE TABLE IF NOT EXISTS lineup_game_stats (
    id SERIAL PRIMARY KEY,
    lineup_id INTEGER NOT NULL REFERENCES lineups(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    display_lineup VARCHAR(150) NOT NULL,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    posessions INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    oreb INTEGER DEFAULT 0,
    dreb INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    fgm INTEGER DEFAULT 0,
    fga INTEGER DEFAULT 0,
    fg_pct DECIMAL DEFAULT 0.0,
    three_ptr_made INTEGER DEFAULT 0,
    three_ptr_attempted INTEGER DEFAULT 0,
    three_ptr_pct DECIMAL DEFAULT 0.0,
    ftm INTEGER DEFAULT 0,
    fta INTEGER DEFAULT 0,
    ft_pct DECIMAL DEFAULT 0.0,
    shots_in_paint_made INTEGER DEFAULT 0,
    shots_in_paint_attempted INTEGER DEFAULT 0,
    points_in_paint INTEGER DEFAULT 0,
    fastbreak_attempted INTEGER DEFAULT 0,
    fastbreak_made INTEGER DEFAULT 0,
    fastbreak_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (lineup_id, team_id, display_lineup, game_id)
);
-- AGGREGATE LINEUP TABLE: Total stats across all games
CREATE TABLE IF NOT EXISTS lineup_aggregates (
    id SERIAL PRIMARY KEY,
    lineup_id INTEGER NOT NULL UNIQUE REFERENCES lineups(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    posessions INTEGER DEFAULT 0,
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    oreb INTEGER DEFAULT 0,
    dreb INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    fgm INTEGER DEFAULT 0,
    fga INTEGER DEFAULT 0,
    three_ptr_made INTEGER DEFAULT 0,
    three_ptr_attempted INTEGER DEFAULT 0,
    ftm INTEGER DEFAULT 0,
    fta INTEGER DEFAULT 0,
    shots_in_paint_made INTEGER DEFAULT 0,
    shots_in_paint_attempted INTEGER DEFAULT 0,
    points_in_paint INTEGER DEFAULT 0,
    fastbreak_attempted INTEGER DEFAULT 0,
    fastbreak_made INTEGER DEFAULT 0,
    fastbreak_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);