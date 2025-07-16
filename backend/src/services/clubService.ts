// Club and Player services for content management
import { Club } from 'shared';
import { pool } from '../config/database';

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache storage
let allClubsCache: CacheEntry<Club[]> | null = null;
const clubByIdCache: Map<string, CacheEntry<Club | null>> = new Map();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds (clubs change less frequently)

export class ClubService {
  // Function to invalidate all club caches
  static invalidateClubCaches(): void {
    allClubsCache = null;
    clubByIdCache.clear();
  }

  static async createClub(name: string): Promise<Club> {
    const result = await pool.query(
      'INSERT INTO clubs (name) VALUES ($1) RETURNING id, name',
      [name]
    );

    // Invalidate caches since new club was created
    ClubService.invalidateClubCaches();

    return { id: result.rows[0].id.toString(), name: result.rows[0].name };
  }

  static async getAllClubs(): Promise<Club[]> {
    // Check cache first
    if (
      allClubsCache &&
      Date.now() - allClubsCache.timestamp < CACHE_DURATION
    ) {
      return allClubsCache.data;
    }

    const result = await pool.query('SELECT id, name FROM clubs ORDER BY name');
    const clubs = result.rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
    }));

    // Cache the result
    allClubsCache = {
      data: clubs,
      timestamp: Date.now(),
    };

    return clubs;
  }

  static async getClubById(id: string): Promise<Club | null> {
    // Check cache first
    const cached = clubByIdCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const result = await pool.query(
      'SELECT id, name FROM clubs WHERE id = $1',
      [id]
    );
    const club =
      result.rows.length === 0
        ? null
        : { id: result.rows[0].id.toString(), name: result.rows[0].name };

    // Cache the result
    clubByIdCache.set(id, {
      data: club,
      timestamp: Date.now(),
    });

    return club;
  }
}
