#!/usr/bin/env node

/**
 * Simple database connection test
 */

require('dotenv').config();

const { Client } = require('pg');

const testConnection = async () => {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set in environment');
    console.log('Please create a .env file with:');
    console.log('DATABASE_URL=postgresql://wpfantasy_user:password@localhost:5432/wpfantasy');
    process.exit(1);
  }

  console.log(`🔗 Testing connection to: ${dbUrl.replace(/:[^:@]*@/, ':****@')}`);

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Test if we can run a simple query
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Database query successful! Current time: ${result.rows[0].now}`);
    
    // Check if migrations table exists
    const migrationCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pgmigrations'
      );
    `);
    
    if (migrationCheck.rows[0].exists) {
      console.log('✅ Migration table exists');
      
      // Show applied migrations
      const migrations = await client.query('SELECT name, run_on FROM pgmigrations ORDER BY id');
      if (migrations.rows.length > 0) {
        console.log('📋 Applied migrations:');
        migrations.rows.forEach(row => {
          console.log(`  - ${row.name} (${row.run_on})`);
        });
      } else {
        console.log('📋 No migrations have been applied yet');
      }
    } else {
      console.log('ℹ️  Migration table does not exist (will be created on first migration)');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Is PostgreSQL running? Try: brew services start postgresql');
      console.log('2. Does the database exist? Try: createdb wpfantasy');
      console.log('3. Does the user exist? Try connecting with: psql postgres');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist. Create it with:');
      console.log('createdb wpfantasy');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. Check your username/password in DATABASE_URL');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
};

testConnection();
