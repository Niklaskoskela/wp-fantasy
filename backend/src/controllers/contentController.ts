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

  static async getClub(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'Club id is required' });
      const club = await ClubService.getClubById(id);
      if (!club) return res.status(404).json({ error: 'Club not found' });
      res.json(club);
    } catch (error) {
      console.error('Error in getClub:', error);
      res.status(500).json({ error: 'Failed to fetch club' });
    }
  }

  static async clearClubsCache(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      ClubService.invalidateClubCaches();
      res.json({ message: 'Clubs cache cleared successfully' });
    } catch (error) {
      console.error('Error in clearClubsCache:', error);
      res.status(500).json({ error: 'Failed to clear clubs cache' });
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

  static async getPlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'Player id is required' });
      const player = await PlayerService.getPlayerById(id);
      if (!player) return res.status(404).json({ error: 'Player not found' });
      res.json(player);
    } catch (error) {
      console.error('Error in getPlayer:', error);
      res.status(500).json({ error: 'Failed to fetch player' });
    }
  }

  static async getPlayersWithStats(req: Request, res: Response) {
    try {
      const { matchDayId } = req.query;
      const players = await PlayerService.getAllPlayersWithStats(matchDayId as string);
      res.json(players);
    } catch (error) {
      console.error('Error in getPlayersWithStats:', error);
      res.status(500).json({ error: 'Failed to fetch players with stats' });
    }
  }

  static async clearPlayersCache(req: Request, res: Response) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      PlayerService.invalidatePlayerCaches();
      res.json({ message: 'Players cache cleared successfully' });
    } catch (error) {
      console.error('Error in clearPlayersCache:', error);
      res.status(500).json({ error: 'Failed to clear players cache' });
    }
  }
}
