import { Pool } from 'pg';

// Database configuration with SSL support for production/cloud databases
const getDatabaseConfig = (): any => {
  const config: any = {
    connectionString: process.env.DATABASE_URL,
  };

  // Parse sslmode from connection string or detect cloud databases
  const databaseUrl = process.env.DATABASE_URL || '';
  const isCloudDatabase = databaseUrl.includes('neon.tech') || 
                         databaseUrl.includes('amazonaws.com') || 
                         databaseUrl.includes('supabase.com');
  
  const requiresSSL = databaseUrl.includes('sslmode=require') || 
                     isCloudDatabase ||
                     process.env.ENVIRONMENT === 'production';

  const isLocalDatabase = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

  // Debug logging
  console.log('🔍 Database Configuration Debug:');
  console.log('  - isCloudDatabase:', isCloudDatabase);
  console.log('  - requiresSSL:', requiresSSL);
  console.log('  - isLocalDatabase:', isLocalDatabase);
  console.log('  - ENVIRONMENT:', process.env.ENVIRONMENT);

  // Configure SSL based on database type, not environment
  if (requiresSSL && !isLocalDatabase) {
    config.ssl = {
      rejectUnauthorized: false // Required for Neon and other cloud databases
    };
    console.log('  - SSL enabled with rejectUnauthorized: false');
  } else if (isLocalDatabase) {
    // Explicitly disable SSL for local databases
    config.ssl = false;
    console.log('  - SSL disabled for local database');
  } else {
    console.log('  - Using default SSL configuration');
  }

  return config;
};

// Create and export a single pool instance
export const pool = new Pool(getDatabaseConfig());

// Graceful shutdown
export const closePool = async () => {
  await pool.end();
};

// Optional: Test connection function
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};
