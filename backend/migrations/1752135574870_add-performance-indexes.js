/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Indexes for the getTeamsWithScores query optimization
  
  // Index on team_players for team_id lookups
  pgm.createIndex('team_players', 'team_id');
  
  // Index on team_players for player_id lookups  
  pgm.createIndex('team_players', 'player_id');
  
  // Index on players for club_id lookups
  pgm.createIndex('players', 'club_id');
  
  // Index on users for team_id lookups
  pgm.createIndex('users', 'team_id');
  
  // Composite index on player_stats for the stats query (player_id, matchday_id)
  pgm.createIndex('player_stats', ['player_id', 'matchday_id']);
  
  // Index on player_stats for matchday_id only (for batch queries)
  pgm.createIndex('player_stats', 'matchday_id');
  
  // Index on matchdays for ordering by start_time
  pgm.createIndex('matchdays', 'start_time');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop indexes in reverse order
  pgm.dropIndex('matchdays', 'start_time');
  pgm.dropIndex('player_stats', 'matchday_id');
  pgm.dropIndex('player_stats', ['player_id', 'matchday_id']);
  pgm.dropIndex('users', 'team_id');
  pgm.dropIndex('players', 'club_id');
  pgm.dropIndex('team_players', 'player_id');
  pgm.dropIndex('team_players', 'team_id');
};
