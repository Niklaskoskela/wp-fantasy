// Content management routes for clubs and players
import { Router, Request, Response, NextFunction } from 'express';
import {
  ClubController,
  PlayerController,
} from '../controllers/contentController';

const router = Router();

// Helper to wrap async route handlers and forward errors
function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next?: NextFunction
  ) => Promise<void | Response>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Club routes
router.post('/clubs', asyncHandler(ClubController.createClub));
router.get('/clubs', asyncHandler(ClubController.getAllClubs));
router.get('/clubs/:id', asyncHandler(ClubController.getClub));
router.post('/clubs/clear-cache', asyncHandler(ClubController.clearClubsCache));

// Player routes
router.post('/players', asyncHandler(PlayerController.createPlayer));
router.get('/players', asyncHandler(PlayerController.getAllPlayers));
router.get(
  '/players/with-stats',
  asyncHandler(PlayerController.getPlayersWithStats)
);
router.get('/players/:id', asyncHandler(PlayerController.getPlayer));
router.post(
  '/players/clear-cache',
  asyncHandler(PlayerController.clearPlayersCache)
);

export default router;
