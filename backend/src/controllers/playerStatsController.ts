import { Request, Response } from 'express';
import { PlayerStatsService } from '../services/playerStatsService';
import { PlayerStatsQuery } from '../types/playerStats';

export class PlayerStatsController {
  constructor(private playerStatsService: PlayerStatsService) {}

  getPlayerStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: PlayerStatsQuery = {
        player_id: req.query.player_id ? parseInt(req.query.player_id as string) : undefined,
        matchday_id: req.query.matchday_id ? parseInt(req.query.matchday_id as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };

      const stats = await this.playerStatsService.getPlayerStats(filters);
      res.json({
        success: true,
        data: stats,
        total: stats.length
      });
    } catch (error) {
      console.error('Error fetching player stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch player stats'
      });
    }
  };

  getPlayerStatsByMatchday = async (req: Request, res: Response): Promise<void> => {
    try {
      const matchday_id = parseInt(req.params.matchday_id);
      
      if (isNaN(matchday_id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid matchday ID'
        });
        return;
      }

      const stats = await this.playerStatsService.getPlayerStatsByMatchday(matchday_id);
      res.json({
        success: true,
        data: stats,
        total: stats.length
      });
    } catch (error) {
      console.error('Error fetching player stats by matchday:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch player stats'
      });
    }
  };

  getTopPerformers = async (req: Request, res: Response): Promise<void> => {
    try {
      const matchday_id = req.query.matchday_id ? parseInt(req.query.matchday_id as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const stats = await this.playerStatsService.getTopPerformers(matchday_id, limit);
      res.json({
        success: true,
        data: stats,
        total: stats.length
      });
    } catch (error) {
      console.error('Error fetching top performers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top performers'
      });
    }
  };

  getAvailableMatchdays = async (req: Request, res: Response): Promise<void> => {
    try {
      const matchdays = await this.playerStatsService.getAvailableMatchdays();
      res.json({
        success: true,
        data: matchdays,
        total: matchdays.length
      });
    } catch (error) {
      console.error('Error fetching available matchdays:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available matchdays'
      });
    }
  };
}