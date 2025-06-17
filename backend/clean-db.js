#!/usr/bin/env node

/**
 * Clean database tables while preserving the database itself
 */

//DATABASE_URL=postgresql://wpfantasy_user@localhost:5432/wpfantasy

require('dotenv').config();
const { Client } = require('pg');

const cleanDatabase = async () => {
  const dbUrl = "postgresql://wpfantasy_user@localhost:5432/wpfantasy"; // process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🧹 Cleaning database tables...');

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    
    // First, drop all foreign key constraints to avoid dependency issues
    await client.query(`
      DROP TABLE IF EXISTS team_scores CASCADE;
      DROP TABLE IF EXISTS player_stats CASCADE;
      DROP TABLE IF EXISTS team_players CASCADE;
      DROP TABLE IF EXISTS teams CASCADE;
      DROP TABLE IF EXISTS players CASCADE;
      DROP TABLE IF EXISTS matchdays CASCADE;
      DROP TABLE IF EXISTS clubs CASCADE;
      DROP TABLE IF EXISTS pgmigrations CASCADE;
    `);
    
    console.log('✅ All tables dropped successfully');
    console.log('🔄 Database is now clean and ready for migrations');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

cleanDatabase();
