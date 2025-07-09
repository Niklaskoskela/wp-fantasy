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

  // Determine if this is a cloud database or requires SSL
  const host = config.host;
  const isCloudDatabase = host.includes('neon.tech') || 
                         host.includes('amazonaws.com') || 
                         host.includes('supabase.com');
  
  const requiresSSL = isCloudDatabase ||
                     process.env.ENVIRONMENT != 'dev' ||
                     process.env.SSL_MODE === 'require';

  const isLocalDatabase = host === 'localhost' || host === '127.0.0.1';

  // Debug logging
  console.log('🔍 Database Configuration Debug:');
  console.log('  - host:', config.host);
  console.log('  - database:', config.database);
  console.log('  - user:', config.user);
  console.log('  - port:', config.port);
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
