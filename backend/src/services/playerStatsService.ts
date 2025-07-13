import { Pool } from 'pg';
import { PlayerStats, PlayerStatsWithDetails, PlayerStatsQuery } from '../types/playerStats';

export class PlayerStatsService {
  constructor(private db: Pool) {}

  async getPlayerStatsByMatchday(matchday_id: number): Promise<PlayerStatsWithDetails[]> {
    const query = `
  SELECT 
    ps.*,
    p.name AS player_name,
    c.name AS team_name,
    m.title AS matchday_name
  FROM player_stats ps
  LEFT JOIN players p ON ps.player_id = p.id
  LEFT JOIN clubs c ON p.club_id = c.id
  LEFT JOIN matchdays m ON ps.matchday_id = m.id
  WHERE ps.matchday_id = $1
  ORDER BY ps.points DESC, ps.goals DESC, ps.assists DESC
`;
    
    const result = await this.db.query(query, [matchday_id]);
    return result.rows;
  }

  async getPlayerStats(filters: PlayerStatsQuery): Promise<PlayerStatsWithDetails[]> {
    let query = `
  SELECT 
    ps.*,
    p.name AS player_name,
    c.name AS team_name,
    m.title AS matchday_name
  FROM player_stats ps
  LEFT JOIN players p ON ps.player_id = p.id
  LEFT JOIN clubs c ON p.club_id = c.id
  LEFT JOIN matchdays m ON ps.matchday_id = m.id
  WHERE 1=1
`;
    
    const params: any[] = [];
    let paramCount = 0;

    if (filters.player_id) {
      paramCount++;
      query += ` AND ps.player_id = $${paramCount}`;
      params.push(filters.player_id);
    }

    if (filters.matchday_id) {
      paramCount++;
      query += ` AND ps.matchday_id = $${paramCount}`;
      params.push(filters.matchday_id);
    }

    query += ` ORDER BY ps.points DESC, ps.goals DESC, ps.assists DESC`;

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async getTopPerformers(matchday_id?: number, limit: number = 10): Promise<PlayerStatsWithDetails[]> {
    let query = `
  SELECT 
    ps.*,
    p.name AS player_name,
    c.name AS team_name,
    m.title AS matchday_name
  FROM player_stats ps
  LEFT JOIN players p ON ps.player_id = p.id
  LEFT JOIN clubs c ON p.club_id = c.id
  LEFT JOIN matchdays m ON ps.matchday_id = m.id
`;
    
    const params: any[] = [];
    
    if (matchday_id) {
      query += ` WHERE ps.matchday_id = $1`;
      params.push(matchday_id);
    }
    
    query += ` ORDER BY ps.points DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async getAvailableMatchdays(): Promise<{id: number, name: string}[]> {
    const query = `
  SELECT DISTINCT m.id, m.title 
  FROM matchdays m
  INNER JOIN player_stats ps ON m.id = ps.matchday_id
  ORDER BY m.id DESC
`;
    
    const result = await this.db.query(query);
    return result.rows;
  }
}