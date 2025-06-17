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
   CREATE DATABASE wp_fantasy;
   CREATE USER wp_fantasy_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE wp_fantasy TO wp_fantasy_user;
   \q
   ```

3. **Set environment variables** (create `.env` file in backend directory)
   ```
   DATABASE_URL=postgresql://wp_fantasy_user:your_password_here@localhost:5432/wp_fantasy
   ```

## Running Migrations

### Manual Migration Execution
Run migrations in order:

```bash
# Connect to your database
psql wp_fantasy

# Run initial schema
\i migrations/001_init.sql

# Run subsequent migrations
\i migrations/002_add_matchday_times.sql

\q
```

### Migration Tracking (Recommended Future Enhancement)
Consider implementing a migration tracking system that:
- Tracks which migrations have been applied
- Provides rollback capabilities
- Validates migration order
- Supports both development and production environments

Example migration tracking table:
```sql
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Current Schema Status

- ✅ **001_init.sql**: Basic schema with clubs, players, teams, stats
- 🆕 **002_add_matchday_times.sql**: Adds start_time and end_time to matchdays table

## Development Workflow

1. **Before making schema changes**: Create a new migration file
2. **Naming convention**: `XXX_descriptive_name.sql` (e.g., `003_add_player_positions.sql`)
3. **Test migrations**: Always test on a copy of production data
4. **Document changes**: Update this file when adding new migrations
