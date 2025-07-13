// backend/src/routes/playerStatsRoutes.ts
import { Router } from 'express';
import { PlayerStatsController } from '../controllers/playerStatsController';
import { PlayerStatsService } from '../services/playerStatsService';
import { Pool } from 'pg';

export const createPlayerStatsRoutes = (db: Pool): Router => {
  const router = Router();
  const playerStatsService = new PlayerStatsService(db);
  const playerStatsController = new PlayerStatsController(playerStatsService);

  // Get all player stats with optional filters
  router.get('/stats', playerStatsController.getPlayerStats);

  // Get player stats by specific matchday
  router.get('/stats/matchday/:matchday_id', playerStatsController.getPlayerStatsByMatchday);

  // Get top performers (optionally filtered by matchday)
  router.get('/stats/top', playerStatsController.getTopPerformers);

  // Get available matchdays
  router.get('/matchdays', playerStatsController.getAvailableMatchdays);

  return router;
};

// Usage in your main app file:
// import { createPlayerStatsRoutes } from './routes/playerStatsRoutes';
// app.use('/api/players', createPlayerStatsRoutes(db));