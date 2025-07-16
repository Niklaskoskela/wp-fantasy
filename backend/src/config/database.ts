import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration with SSL support for production/cloud databases
interface DatabaseConfig {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  env: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
}

const getDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    user: process.env.PGUSER || process.env.DB_USER || 'wpfantasy_user',
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    database: process.env.PGDATABASE || process.env.DB_NAME || 'wpfantasy',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432'),
    env: process.env.ENVIRONMENT || '-',
  };

  // Default SSL is enabled for production environments
  const requireSsl = config.env != 'dev' && !config.host.includes('localhost');

  console.log('Database configuration:');
  console.log(`  - User: ${config.user}`);
  console.log(`  - Host: ${config.host}`);
  console.log(`  - Database: ${config.database}`);
  console.log(`  - Port: ${config.port}`);
  console.log(`  - SSL required: ${requireSsl}`);
  console.log(`  - Environment: ${config.env}`);

  // Configure SSL based on database type, not environment
  if (requireSsl) {
    config.ssl = {
      rejectUnauthorized: false, // Required for Neon and other cloud databases
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
