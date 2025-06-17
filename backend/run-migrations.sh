#!/bin/bash

# Simple migration runner script
# Usage: ./run-migrations.sh [database_url]

set -e

# Default database URL (can be overridden by environment variable or argument)
DB_URL=${1:-${DATABASE_URL:-"postgresql://wpfantasy_user@localhost:5432/wpfantasy"}}

echo "Running migrations on database: $DB_URL"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "Error: Migrations directory not found at $MIGRATIONS_DIR"
    exit 1
fi

# Create migrations tracking table if it doesn't exist
psql "$DB_URL" -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);" || {
    echo "Error: Could not create schema_migrations table"
    exit 1
}

# Get list of already applied migrations
APPLIED_MIGRATIONS=$(psql "$DB_URL" -t -c "SELECT version FROM schema_migrations ORDER BY version;" | tr -d ' ')

# Run migrations in order
for migration_file in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration_file" ]; then
        migration_name=$(basename "$migration_file" .sql)
        
        # Check if migration was already applied
        if echo "$APPLIED_MIGRATIONS" | grep -q "^$migration_name$"; then
            echo "✓ Skipping already applied migration: $migration_name"
        else
            echo "→ Applying migration: $migration_name"
            
            # Run the migration
            if psql "$DB_URL" -f "$migration_file"; then
                # Record successful migration
                psql "$DB_URL" -c "INSERT INTO schema_migrations (version) VALUES ('$migration_name');"
                echo "✓ Applied migration: $migration_name"
            else
                echo "✗ Failed to apply migration: $migration_name"
                exit 1
            fi
        fi
    fi
done

echo "All migrations completed successfully!"
