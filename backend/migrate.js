#!/usr/bin/env node

/**
 * Migration helper script for TypeScript projects
 * This script provides convenient commands for common migration tasks
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const command = process.argv[2];
const args = process.argv.slice(3);

// Ensure .env is loaded for development
require('dotenv').config();

const runCommand = (cmd) => {
  try {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: __dirname });
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
};

const showHelp = () => {
  console.log(`
Migration Helper Commands:

  npm run migrate:help                    Show this help
  npm run migrate:status                  Show migration status
  npm run migrate:up                      Run all pending migrations  
  npm run migrate:down                    Rollback last migration
  npm run migrate:create <name>           Create new migration
  npm run migrate:reset                   Reset database (DEV ONLY)
  npm run migrate:seed                    Run seed data (if implemented)

Development Commands (use local DATABASE_URL):
  npm run migrate:dev                     Run pending migrations (dev)
  npm run migrate:dev:down               Rollback last migration (dev)  
  npm run migrate:dev:create <name>      Create new migration (dev)
  npm run migrate:dev:reset              Reset dev database
  npm run migrate:dev:status             Show dev migration status

Examples:
  npm run migrate:dev:create add_user_preferences
  npm run migrate:dev:status
  npm run migrate:dev
`);
};

const resetDatabase = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  
  // Extract database name from URL
  const url = new URL(dbUrl);
  const dbName = url.pathname.slice(1);
  
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot reset production database!');
    process.exit(1);
  }
  
  console.log(`Resetting database: ${dbName}`);
  
  // Create connection URL without database name for dropping/creating
  const adminUrl = `${url.protocol}//${url.username}:${url.password}@${url.host}/postgres`;
  
  runCommand(`psql "${adminUrl}" -c "DROP DATABASE IF EXISTS ${dbName};"`);
  runCommand(`psql "${adminUrl}" -c "CREATE DATABASE ${dbName};"`);
  
  if (url.username !== 'postgres') {
    runCommand(`psql "${adminUrl}" -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${url.username};"`);
  }
  
  console.log('Database reset complete. Running migrations...');
  runCommand('node-pg-migrate up');
};

switch (command) {
  case 'help':
    showHelp();
    break;
    
  case 'status':
    // node-pg-migrate doesn't have a 'list' command, so we'll show a custom status
    console.log('Checking migration status...');
    try {
      // Try to show current migration state by running a dry-run up
      runCommand('node-pg-migrate up --dry-run');
    } catch (error) {
      console.log('Unable to check migration status. Database may not be initialized.');
      console.log('Try running: npm run migrate:dev');
    }
    break;
    
  case 'up':
    runCommand('node-pg-migrate up');
    break;
    
  case 'down':
    runCommand('node-pg-migrate down');
    break;
    
  case 'create':
    if (!args[0]) {
      console.error('Migration name required');
      process.exit(1);
    }
    runCommand(`node-pg-migrate create ${args[0]}`);
    break;
    
  case 'reset':
    resetDatabase();
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
