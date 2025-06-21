/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Create roster_history table to track team compositions for each matchday
  pgm.createTable('roster_history', {
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
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Add unique constraint to prevent duplicate entries for same team/matchday/player
  pgm.addConstraint('roster_history', 'roster_history_unique', {
    unique: ['team_id', 'matchday_id', 'player_id'],
  });

  // Add index for faster queries by team and matchday
  pgm.createIndex('roster_history', ['team_id', 'matchday_id']);
  
  // Add index for matchday queries
  pgm.createIndex('roster_history', 'matchday_id');
  
  // Create a partial unique index to ensure only one captain per team per matchday
  // This prevents multiple captains for the same team in the same matchday
  pgm.createIndex('roster_history', ['team_id', 'matchday_id'], {
    unique: true,
    where: 'is_captain = true',
    name: 'roster_history_one_captain_per_team_matchday',
  });
};

exports.down = pgm => {
  pgm.dropTable('roster_history');
};
