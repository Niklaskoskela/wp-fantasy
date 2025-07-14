// PlayerService split from clubService for player management
import { PlayerPosition, Player } from 'shared';
import { pool } from '../config/database';
import { pointsConfig } from '../config/points';

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache storage
let allPlayersCache: CacheEntry<Player[]> | null = null;
const playerByIdCache = new Map<string, CacheEntry<Player>>();
const playersWithStatsCache = new Map<string, CacheEntry<any[]>>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export class PlayerService {
  // Function to invalidate all player caches
  static invalidatePlayerCaches(): void {
    allPlayersCache = null;
    playerByIdCache.clear();
    playersWithStatsCache.clear();
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

  static async getAllPlayersWithStats(matchDayId?: string) {
    // Create cache key based on matchDayId
    const cacheKey = matchDayId || 'total';
    
    // Check cache first
    const cached = playersWithStatsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < STATS_CACHE_DURATION) {
      return cached.data;
    }

    let query: string;
    let params: any[] = [];

    if (matchDayId) {
      // Get players with stats for a specific matchday
      query = `
        SELECT 
          p.id, p.name, p.position, p.club_id, c.name as club_name,
          COALESCE(ps.goals, 0) as goals,
          COALESCE(ps.assists, 0) as assists,
          COALESCE(ps.blocks, 0) as blocks,
          COALESCE(ps.steals, 0) as steals,
          COALESCE(ps.pf_drawn, 0) as pf_drawn,
          COALESCE(ps.pf, 0) as pf,
          COALESCE(ps.balls_lost, 0) as balls_lost,
          COALESCE(ps.contra_fouls, 0) as contra_fouls,
          COALESCE(ps.shots, 0) as shots,
          COALESCE(ps.swim_offs, 0) as swim_offs,
          COALESCE(ps.brutality, 0) as brutality,
          COALESCE(ps.saves, 0) as saves,
          COALESCE(ps.wins, 0) as wins
        FROM players p 
        JOIN clubs c ON p.club_id = c.id 
        LEFT JOIN player_stats ps ON p.id = ps.player_id AND ps.matchday_id = $1
        ORDER BY p.name
      `;
      params = [matchDayId];
    } else {
      // Get players with total stats across all matchdays
      query = `
        SELECT 
          p.id, p.name, p.position, p.club_id, c.name as club_name,
          COALESCE(SUM(ps.goals), 0) as goals,
          COALESCE(SUM(ps.assists), 0) as assists,
          COALESCE(SUM(ps.blocks), 0) as blocks,
          COALESCE(SUM(ps.steals), 0) as steals,
          COALESCE(SUM(ps.pf_drawn), 0) as pf_drawn,
          COALESCE(SUM(ps.pf), 0) as pf,
          COALESCE(SUM(ps.balls_lost), 0) as balls_lost,
          COALESCE(SUM(ps.contra_fouls), 0) as contra_fouls,
          COALESCE(SUM(ps.shots), 0) as shots,
          COALESCE(SUM(ps.swim_offs), 0) as swim_offs,
          COALESCE(SUM(ps.brutality), 0) as brutality,
          COALESCE(SUM(ps.saves), 0) as saves,
          COALESCE(SUM(ps.wins), 0) as wins
        FROM players p 
        JOIN clubs c ON p.club_id = c.id 
        LEFT JOIN player_stats ps ON p.id = ps.player_id
        GROUP BY p.id, p.name, p.position, p.club_id, c.name
        ORDER BY p.name
      `;
    }

    const result = await pool.query(query, params);
    
    const players = result.rows.map((row) => {
      // Calculate total points based on stats
      const totalPoints = 
        row.goals * pointsConfig.goal +
        row.assists * pointsConfig.assist +
        row.blocks * pointsConfig.block +
        row.steals * pointsConfig.steal +
        row.pf_drawn * pointsConfig.pfDrawn +
        row.pf * pointsConfig.pf +
        row.balls_lost * pointsConfig.ballsLost +
        row.contra_fouls * pointsConfig.contraFoul +
        row.shots * pointsConfig.shot +
        row.swim_offs * pointsConfig.swimOff +
        row.brutality * pointsConfig.brutality +
        row.saves * pointsConfig.save +
        row.wins * pointsConfig.win;

      return {
        id: row.id.toString(),
        name: row.name,
        position: row.position,
        club: { id: row.club_id.toString(), name: row.club_name },
        stats: {
          id: row.id.toString(),
          goals: row.goals,
          assists: row.assists,
          blocks: row.blocks,
          steals: row.steals,
          pfDrawn: row.pf_drawn,
          pf: row.pf,
          ballsLost: row.balls_lost,
          contraFouls: row.contra_fouls,
          shots: row.shots,
          swimOffs: row.swim_offs,
          brutality: row.brutality,
          saves: row.saves,
          wins: row.wins,
        },
        totalPoints: totalPoints,
        statsHistory: new Map()
      };
    });
    
    // Cache the result
    playersWithStatsCache.set(cacheKey, {
      data: players,
      timestamp: Date.now()
    });
    
    return players;
  }
}
