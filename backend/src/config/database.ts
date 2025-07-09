import { Pool } from 'pg';

// Database configuration with SSL support for production/cloud databases
const getDatabaseConfig = () => {
  const config: any = {
    connectionString: process.env.DATABASE_URL,
  };

  // Add SSL configuration for cloud databases (Neon, etc.)
  if (process.env.DATABASE_URL?.includes('neon.tech') || 
      process.env.DATABASE_URL?.includes('amazonaws.com') || 
      process.env.DATABASE_URL?.includes('supabase.com') ||
      process.env.ENVIRONMENT === 'production') {
    config.ssl = {
      rejectUnauthorized: false, // Required for most cloud database providers
    };
  }

  // For development, you might want to disable SSL if using local PostgreSQL
  if (process.env.ENVIRONMENT === 'dev' || process.env.NODE_ENV === 'development') {
    // Only disable SSL if DATABASE_URL is localhost
    if (process.env.DATABASE_URL?.includes('localhost')) {
      config.ssl = false;
    }
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
