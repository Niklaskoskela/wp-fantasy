import { Pool } from 'pg';
export declare const pool: Pool;
export declare const closePool: () => Promise<void>;
export declare const testConnection: () => Promise<boolean>;
