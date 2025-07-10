// PlayerService split from clubService for player management
import { PlayerPosition } from 'shared';
import { pool } from '../config/database';

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache storage
let allPlayersCache: CacheEntry<any[]> | null = null;
let playerByIdCache: Map<string, CacheEntry<any>> = new Map();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export class PlayerService {
  // Function to invalidate all player caches
  static invalidatePlayerCaches(): void {
    allPlayersCache = null;
    playerByIdCache.clear();
  }

  static async createPlayer(
    name: string,
    position: PlayerPosition,
    clubId: string
  ) {
    const result = await pool.query(
      'INSERT INTO players (name, position, club_id) VALUES ($1, $2, $3) RETURNING id, name, position, club_id',
      [name, position, clubId]
    );
    
    // Fetch the club name for the created player
    const clubResult = await pool.query('SELECT name FROM clubs WHERE id = $1', [clubId]);
    const clubName = clubResult.rows[0]?.name || '';
    
    // Invalidate caches since new player was created
    PlayerService.invalidatePlayerCaches();
    
    return {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      position: result.rows[0].position,
      club: { id: result.rows[0].club_id.toString(), name: clubName },
      statsHistory: new Map()
    };
  }

  static async getAllPlayers() {
    // Check cache first
    if (allPlayersCache && Date.now() - allPlayersCache.timestamp < CACHE_DURATION) {
      return allPlayersCache.data;
    }

    const result = await pool.query(
      'SELECT p.id, p.name, p.position, p.club_id, c.name as club_name FROM players p JOIN clubs c ON p.club_id = c.id ORDER BY p.name'
    );
    
    const players = result.rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      position: row.position,
      club: { id: row.club_id.toString(), name: row.club_name },
      statsHistory: new Map()
    }));
    
    // Cache the result
    allPlayersCache = {
      data: players,
      timestamp: Date.now()
    };
    
    return players;
  }

  static async getPlayerById(id: string) {
    // Check cache first
    const cached = playerByIdCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const result = await pool.query(
      'SELECT p.id, p.name, p.position, p.club_id, c.name as club_name FROM players p JOIN clubs c ON p.club_id = c.id WHERE p.id = $1', 
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const player = {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      position: result.rows[0].position,
      club: { id: result.rows[0].club_id.toString(), name: result.rows[0].club_name },
      statsHistory: new Map()
    };
    
    // Cache the result
    playerByIdCache.set(id, {
      data: player,
      timestamp: Date.now()
    });
    
    return player;
  }
}
