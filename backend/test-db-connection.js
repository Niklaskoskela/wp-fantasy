#!/usr/bin/env node

/**
 * Database connection test using the centralized database configuration
 * This script tests the connection using the same configuration as the application
 */

require('dotenv').config();

// Function to test the database connection
const testDatabaseConnection = async () => {
  console.log('🔗 Testing database connection...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in environment');
    console.log('Please create a .env file with:');
    console.log('DATABASE_URL=your_database_connection_string');
    process.exit(1);
  }

  // Show connection info (masked password)
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@');
  console.log(`📡 Connecting to: ${maskedUrl}`);
  console.log(`🌍 Environment: ${process.env.ENVIRONMENT || 'not set'}`);
  
  // Determine SSL configuration
  const isCloudDB = process.env.DATABASE_URL.includes('neon.tech') || 
                   process.env.DATABASE_URL.includes('amazonaws.com') || 
                   process.env.DATABASE_URL.includes('supabase.com') ||
                   process.env.ENVIRONMENT === 'production';
  
  const isLocal = process.env.DATABASE_URL.includes('localhost');
  const isDev = process.env.ENVIRONMENT === 'dev' || process.env.NODE_ENV === 'development';
  
  console.log(`🔐 SSL Configuration:`);
  console.log(`    Cloud DB detected: ${isCloudDB}`);
  console.log(`    Local DB detected: ${isLocal}`);
  console.log(`    Development mode: ${isDev}`);
  
  if (isCloudDB) {
    console.log(`    SSL will be enabled with rejectUnauthorized: false`);
  } else if (isDev && isLocal) {
    console.log(`    SSL will be disabled for local development`);
  } else {
    console.log(`    SSL will use default configuration`);
  }

  try {
    // Import and use the testConnection function
    const { testConnection, closePool } = require('./src/config/database.ts');
    
    // Test the connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection test successful!');
      console.log('🎉 Your application should be able to connect to the database');
      
      // Test a basic query
      const { pool } = require('./src/config/database.ts');
      const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
      console.log(`⏰ Database time: ${result.rows[0].current_time}`);
      console.log(`📊 PostgreSQL version: ${result.rows[0].pg_version}`);
      
      // Check if tables exist
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      if (tableCheck.rows.length > 0) {
        console.log('📋 Existing tables:');
        tableCheck.rows.forEach(row => {
          console.log(`    - ${row.table_name}`);
        });
      } else {
        console.log('📋 No tables found. You may need to run migrations.');
        console.log('    Run: npm run migrate:up');
      }
      
    } else {
      console.error('❌ Database connection test failed');
      console.log('\n💡 Troubleshooting steps:');
      console.log('1. Check your DATABASE_URL in .env file');
      console.log('2. Verify your database server is running');
      console.log('3. Check if your database requires SSL');
      console.log('4. Verify your database credentials');
      process.exit(1);
    }
    
    // Clean up
    await closePool();
    console.log('🔒 Database connection closed');
    
  } catch (error) {
    console.error('❌ Database connection test failed with error:');
    console.error(error.message);
    
    // Provide specific error guidance
    if (error.message.includes('connection is insecure')) {
      console.log('\n💡 SSL Error detected:');
      console.log('Your database requires SSL connection.');
      console.log('The centralized database config should handle this automatically.');
      console.log('If you continue to see this error, check your DATABASE_URL format.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused:');
      console.log('1. Is your database server running?');
      console.log('2. Check the host and port in your DATABASE_URL');
      console.log('3. Verify firewall settings');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database does not exist:');
      console.log('Create the database first or check DATABASE_URL');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed:');
      console.log('Check your username and password in DATABASE_URL');
    }
    
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    const { closePool } = require('./src/config/database.ts');
    await closePool();
  } catch (error) {
    // Ignore errors during shutdown
  }
  process.exit(0);
});

// Run the test
testDatabaseConnection();
