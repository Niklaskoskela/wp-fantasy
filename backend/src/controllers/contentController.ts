// Club and Player controllers for content management
import { Request, Response } from 'express';
import { ClubService } from '../services/clubService';
import { PlayerService } from '../services/playerService';

export class ClubController {
  static async createClub(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Club name is required' });
      }
      const club = await ClubService.createClub(name);
      res.status(201).json(club);
    } catch (error) {
      console.error('Error in createClub:', error);
      res.status(500).json({ error: 'Failed to create club' });
    }
  }

  static async getAllClubs(_req: Request, res: Response) {
    try {
      const clubs = await ClubService.getAllClubs();
      res.json(clubs);
    } catch (error) {
      console.error('Error in getAllClubs:', error);
      res.status(500).json({ error: 'Failed to fetch clubs' });
    }
  }
}

export class PlayerController {
  static async createPlayer(req: Request, res: Response) {
    try {
      const { name, position, clubId } = req.body;
      if (!name || !position || !clubId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const player = await PlayerService.createPlayer(name, position, clubId);
      res.status(201).json(player);
    } catch (error) {
      console.error('Error in createPlayer:', error);
      res.status(500).json({ error: 'Failed to create player' });
    }
  }

  static async getAllPlayers(_req: Request, res: Response) {
    try {
      const players = await PlayerService.getAllPlayers();
      res.json(players);
    } catch (error) {
      console.error('Error in getAllPlayers:', error);
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  }
}
