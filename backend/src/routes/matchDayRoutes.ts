import { Router } from 'express';
import { createMatchDay, updatePlayerStats, calculatePoints, getMatchDays, getPlayerStats, startMatchDay } from '../controllers/matchDayController';

const router = Router();

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/matchdays', asyncHandler(createMatchDay));
router.post('/matchdays/:id/start', asyncHandler(startMatchDay));
router.post('/matchdays/:id/player-stats', asyncHandler(updatePlayerStats));
router.get('/matchdays/:id/player-stats', asyncHandler(getPlayerStats));
router.get('/matchdays/:id/calculate-points', asyncHandler(calculatePoints));
router.get('/matchdays', asyncHandler(getMatchDays));

export default router;
