import { Pool } from 'pg';

// Database configuration with SSL support for production/cloud databases
const getDatabaseConfig = (): any => {
  const config: any = {
    user: process.env.PGUSER || process.env.DB_USER || 'postgres',
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'wp_fantasy',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432'),
  };
  const requireSsl = process.env.environment != 'dev'

  // Configure SSL based on database type, not environment
  if (requireSsl) {
    config.ssl = {
      rejectUnauthorized: false // Required for Neon and other cloud databases
    };
    console.log('  - SSL enabled with rejectUnauthorized: false');
  } else {
    // Explicitly disable SSL for local databases
    config.ssl = false;
    console.log('  - SSL disabled for local database');
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
