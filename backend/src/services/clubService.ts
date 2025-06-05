// Club and Player services for content management
import { Pool } from 'pg';
import { Club, PlayerPosition } from 'shared';

export const pool = new Pool();

export class ClubService {
  static async createClub(name: string): Promise<Club> {
    const result = await pool.query(
      'INSERT INTO clubs (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    return { id: result.rows[0].id.toString(), name: result.rows[0].name };
  }

  static async getAllClubs(): Promise<Club[]> {
    const result = await pool.query('SELECT id, name FROM clubs');
    return result.rows.map((row) => ({ id: row.id.toString(), name: row.name }));
  }

  static async getClubById(id: string): Promise<Club | null> {
    const result = await pool.query('SELECT id, name FROM clubs WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return { id: result.rows[0].id.toString(), name: result.rows[0].name };
  }
}
