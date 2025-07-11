import { Router, Request, Response, NextFunction } from 'express';
import { createTeam, addPlayerToTeam, removePlayerFromTeam, setTeamCaptain, getTeams, getTeamsWithScores, clearTeamsCache, clearAllCaches } from '../controllers/teamController';

const router = Router();

// Helper to wrap async route handlers and forward errors
function asyncHandler(fn: (req: Request, res: Response, next?: NextFunction) => Promise<void | Response>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/teams', asyncHandler(createTeam));
router.post('/teams/add-player', asyncHandler(addPlayerToTeam));
router.post('/teams/remove-player', asyncHandler(removePlayerFromTeam));
router.post('/teams/set-captain', asyncHandler(setTeamCaptain));
router.get('/teams', asyncHandler(getTeams));
router.get('/teams/with-scores', asyncHandler(getTeamsWithScores));
router.get('/league/teams', asyncHandler(getTeamsWithScores));
router.post('/teams/clear-cache', asyncHandler(clearTeamsCache));
router.post('/cache/clear-all', asyncHandler(clearAllCaches));

export default router;
