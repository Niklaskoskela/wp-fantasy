// Content management routes for clubs and players
import { Router } from 'express';
import { ClubController, PlayerController } from '../controllers/contentController';

const router = Router();

// Helper to wrap async route handlers and forward errors
function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Club routes
router.post('/clubs', asyncHandler(ClubController.createClub));
router.get('/clubs', asyncHandler(ClubController.getAllClubs));

// Player routes
router.post('/players', asyncHandler(PlayerController.createPlayer));
router.get('/players', asyncHandler(PlayerController.getAllPlayers));

export default router;
