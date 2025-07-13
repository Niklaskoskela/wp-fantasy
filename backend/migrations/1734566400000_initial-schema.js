/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Clubs table
  pgm.createTable('clubs', {
    id: 'id',
    name: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
  });

  // Matchdays table  
  pgm.createTable('matchdays', {
    id: 'id',
    title: {
      type: 'varchar(100)',
      notNull: true,
    },
    start_time: {
      type: 'timestamp',
      notNull: true,
    },
    end_time: {
      type: 'timestamp', 
      notNull: true,
    },
  });

  // Players table
  pgm.createTable('players', {
    id: 'id',
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    position: {
      type: 'varchar(20)',
      notNull: true,
      check: "position IN ('field', 'goalkeeper')",
    },
    club_id: {
      type: 'integer',
      notNull: true,
      references: 'clubs(id)',
    },
  });

  // Teams table
  pgm.createTable('teams', {
    id: 'id',
    team_name: {
      type: 'varchar(100)',
      notNull: true,
    },
  });

  // Team Players (many-to-many: teams <-> players)
  pgm.createTable('team_players', {
    team_id: {
      type: 'integer',
      notNull: true,
      references: 'teams(id)',
      onDelete: 'CASCADE',
    },
    player_id: {
      type: 'integer', 
      notNull: true,
      references: 'players(id)',
      onDelete: 'CASCADE',
    },
    is_captain: {
      type: 'boolean',
      default: false,
    },
  });

  // Primary key for team_players
  pgm.addConstraint('team_players', 'team_players_pkey', {
    primaryKey: ['team_id', 'player_id'],
  });

  // Player stats per matchday
  pgm.createTable('player_stats', {
    id: 'id',
    player_id: {
      type: 'integer',
      notNull: true,
      references: 'players(id)',
      onDelete: 'CASCADE',
    },
    matchday_id: {
      type: 'integer',
      notNull: true,
      references: 'matchdays(id)',
      onDelete: 'CASCADE',
    },
    points: {
      type: 'integer',
      default: 0,
    },
    goals: {
      type: 'integer',
      default: 0,
    },
    assists: {
      type: 'integer',
      default: 0,
    },
    blocks: {
      type: 'integer',
      default: 0,
    },
    steals: {
      type: 'integer',
      default: 0,
    },
    pf_drawn: {
      type: 'integer',
      default: 0,
    },
    pf: {
      type: 'integer',
      default: 0,
    },
    balls_lost: {
      type: 'integer',
      default: 0,
    },
    contra_fouls: {
      type: 'integer',
      default: 0,
    },
    shots: {
      type: 'integer',
      default: 0,
    },
    swim_offs: {
      type: 'integer',
      default: 0,
    },
    brutality: {
      type: 'integer',
      default: 0,
    },
    saves: {
      type: 'integer',
      default: 0,
    },
    wins: {
      type: 'integer',
      default: 0,
    },
  });

  // Unique constraint for player_stats
  pgm.addConstraint('player_stats', 'player_stats_unique', {
    unique: ['player_id', 'matchday_id'],
  });

  // Team score per matchday
  pgm.createTable('team_scores', {
    id: 'id',
    team_id: {
      type: 'integer',
      notNull: true,
      references: 'teams(id)',
      onDelete: 'CASCADE',
    },
    matchday_id: {
      type: 'integer',
      notNull: true,
      references: 'matchdays(id)',
      onDelete: 'CASCADE',
    },
    score: {
      type: 'integer',
      default: 0,
    },
  });

  // Unique constraint for team_scores
  pgm.addConstraint('team_scores', 'team_scores_unique', {
    unique: ['team_id', 'matchday_id'],
  });
};

exports.down = pgm => {
  // Drop tables in reverse order to handle foreign key constraints
  pgm.dropTable('team_scores');
  pgm.dropTable('player_stats');
  pgm.dropTable('team_players');
  pgm.dropTable('teams');
  pgm.dropTable('players');
  pgm.dropTable('matchdays');
  pgm.dropTable('clubs');
};
