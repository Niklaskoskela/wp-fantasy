// PlayerService split from clubService for player management
import { PlayerPosition } from 'shared';
import { pool } from '../config/database';

export class PlayerService {
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
    
    return {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      position: result.rows[0].position,
      club: { id: result.rows[0].club_id.toString(), name: clubName },
      statsHistory: new Map()
    };
  }

  static async getAllPlayers() {
    const result = await pool.query(
      'SELECT p.id, p.name, p.position, p.club_id, c.name as club_name FROM players p JOIN clubs c ON p.club_id = c.id'
    );
    return result.rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      position: row.position,
      club: { id: row.club_id.toString(), name: row.club_name },
      statsHistory: new Map()
    }));
  }

  static async getPlayerById(id: string) {
    const result = await pool.query(
      'SELECT p.id, p.name, p.position, p.club_id, c.name as club_name FROM players p JOIN clubs c ON p.club_id = c.id WHERE p.id = $1', 
      [id]
    );
    if (result.rows.length === 0) return null;
    return {
      id: result.rows[0].id.toString(),
      name: result.rows[0].name,
      position: result.rows[0].position,
      club: { id: result.rows[0].club_id.toString(), name: result.rows[0].club_name },
      statsHistory: new Map()
    };
  }
}
