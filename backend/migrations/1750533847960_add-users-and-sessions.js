/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Users table
  pgm.createTable('users', {
    id: 'id',
    username: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true,
    },
    role: {
      type: 'varchar(20)',
      notNull: true,
      default: 'user',
      check: "role IN ('user', 'admin')",
    },
    team_id: {
      type: 'integer',
      references: 'teams(id)',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    last_login: {
      type: 'timestamp',
    },
    failed_login_attempts: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    account_locked_until: {
      type: 'timestamp',
    },
  });

  // User sessions table
  pgm.createTable('user_sessions', {
    id: 'id',
    session_token: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    expires_at: {
      type: 'timestamp',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    ip_address: {
      type: 'inet',
    },
    user_agent: {
      type: 'text',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
  });

  // Password reset tokens table
  pgm.createTable('password_reset_tokens', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    token: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    expires_at: {
      type: 'timestamp',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    used_at: {
      type: 'timestamp',
    },
  });

  // Add indexes for performance
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'username');
  pgm.createIndex('user_sessions', 'session_token');
  pgm.createIndex('user_sessions', 'user_id');
  pgm.createIndex('user_sessions', 'expires_at');
  pgm.createIndex('password_reset_tokens', 'token');
  pgm.createIndex('password_reset_tokens', 'expires_at');

  // Add constraint to ensure only one team per user
  pgm.addConstraint('users', 'users_team_id_unique', {
    unique: ['team_id'],
  });

  // Add updated_at trigger function
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = current_timestamp;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Add trigger to update updated_at on users table
  pgm.sql(`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = pgm => {
  // Drop triggers and functions
  pgm.sql('DROP TRIGGER IF EXISTS update_users_updated_at ON users;');
  pgm.sql('DROP FUNCTION IF EXISTS update_updated_at_column();');
  
  // Drop tables in reverse order
  pgm.dropTable('password_reset_tokens');
  pgm.dropTable('user_sessions');
  pgm.dropTable('users');
};
