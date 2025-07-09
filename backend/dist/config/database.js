"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.closePool = exports.pool = void 0;
const pg_1 = require("pg");
// Database configuration with SSL support for production/cloud databases
const getDatabaseConfig = () => {
    const config = {
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
    }
    else if (isLocalDatabase) {
        // Explicitly disable SSL for local databases
        config.ssl = false;
        console.log('  - SSL disabled for local database');
    }
    else {
        console.log('  - Using default SSL configuration');
    }
    return config;
};
// Create and export a single pool instance
exports.pool = new pg_1.Pool(getDatabaseConfig());
// Graceful shutdown
const closePool = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.pool.end();
});
exports.closePool = closePool;
// Optional: Test connection function
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield exports.pool.connect();
        yield client.query('SELECT 1');
        client.release();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
});
exports.testConnection = testConnection;
//# sourceMappingURL=database.js.map