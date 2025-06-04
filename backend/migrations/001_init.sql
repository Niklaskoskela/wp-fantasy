-- Water Polo Fantasy League MVP DB Schema
-- Clubs table
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Matchdays table
CREATE TABLE matchdays (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL
);

-- Players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(20) NOT NULL CHECK (position IN ('field', 'goalkeeper')),
    club_id INTEGER NOT NULL REFERENCES clubs(id)
);

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL
);

-- Team Players (many-to-many: teams <-> players)
CREATE TABLE team_players (
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    is_captain BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (team_id, player_id)
);

-- Player stats per matchday
CREATE TABLE player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    matchday_id INTEGER NOT NULL REFERENCES matchdays(id) ON DELETE CASCADE,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    pf_drawn INTEGER DEFAULT 0,
    pf INTEGER DEFAULT 0,
    balls_lost INTEGER DEFAULT 0,
    contra_fouls INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    swim_offs INTEGER DEFAULT 0,
    brutality INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    UNIQUE(player_id, matchday_id)
);

-- Team score per matchday
CREATE TABLE team_scores (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    matchday_id INTEGER NOT NULL REFERENCES matchdays(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    UNIQUE(team_id, matchday_id)
);
