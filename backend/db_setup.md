# Database Setup and Migrations

## Initial Setup

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   ```

2. **Create the database**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE wpfantasy;
   CREATE USER wpfantasy_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE wpfantasy TO wpfantasy_user;
   \q
   ```

3. **Set environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual database credentials
   # DATABASE_URL=postgresql://wpfantasy_user:your_password@localhost:5432/wpfantasy
   ```

## Migration Management with node-pg-migrate

We use [node-pg-migrate](https://github.com/salsita/node-pg-migrate) for robust database migration management.

### Running Migrations

```bash
# Run all pending migrations (production)
npm run migrate:up

# Run migrations in development
npm run migrate:dev

# Rollback the last migration
npm run migrate:down
npm run migrate:dev:down  # for development

# Check migration status
npm run migrate
```

### Creating New Migrations

```bash
# Create a new migration file
npm run migrate:create add_user_table

# For development environment
npm run migrate:dev:create add_user_preferences
```

This will create a new migration file in the `migrations/` directory with the format:
`[timestamp]_add_user_table.js`

### Migration File Structure

```javascript
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Forward migration - what should happen when applying this migration
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = pgm => {
  // Rollback migration - how to undo this migration
  pgm.dropTable('users');
};
```

### Migration Best Practices

1. **Always provide rollback**: Every `up` migration should have a corresponding `down` migration
2. **Test rollbacks**: Test that your rollback actually works
3. **Small, focused changes**: Keep migrations small and focused on one logical change
4. **No breaking changes in production**: Be careful with column drops, renames, etc.
5. **Use transactions**: node-pg-migrate runs each migration in a transaction by default

## Current Schema Status

- ✅ **1734566400000_initial-schema.js**: Complete schema with all tables and constraints
  - Includes start_time and end_time columns in matchdays table
  - All foreign key relationships
  - Proper constraints and defaults

## Development Workflow

1. **Making schema changes**:
   ```bash
   npm run migrate:dev:create descriptive_change_name
   # Edit the generated migration file
   npm run migrate:dev
   ```

2. **Testing migrations**:
   ```bash
   # Apply migration
   npm run migrate:dev
   
   # Test rollback
   npm run migrate:dev:down
   
   # Re-apply to confirm
   npm run migrate:dev
   ```

3. **Production deployment**:
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="postgresql://user:pass@host:port/dbname"
   npm run migrate:up
   ```

## Migration Table

node-pg-migrate automatically creates a `pgmigrations` table to track applied migrations:

```sql
-- View migration history
SELECT * FROM pgmigrations ORDER BY run_on;

-- Check if a specific migration was applied
SELECT * FROM pgmigrations WHERE name = '1734566400000_initial-schema.js';
```

## Troubleshooting

### Reset Database (Development Only)
```bash
# Drop and recreate database
psql postgres -c "DROP DATABASE IF EXISTS wpfantasy;"
psql postgres -c "CREATE DATABASE wpfantasy;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE wpfantasy TO wpfantasy_user;"

# Run all migrations
npm run migrate:dev
```

### Manual Migration Fixes
If you need to manually mark a migration as applied/unapplied:

```sql
-- Mark migration as applied
INSERT INTO pgmigrations (id, name, run_on) 
VALUES (1, '1734566400000_initial-schema.js', NOW());

-- Mark migration as not applied
DELETE FROM pgmigrations WHERE name = '1734566400000_initial-schema.js';
```
