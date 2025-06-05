import { Router } from 'express';
import { createTeam, addPlayerToTeam, removePlayerFromTeam, setTeamCaptain, getTeams } from '../controllers/teamController';

const router = Router();

// Helper to wrap async route handlers and forward errors
function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/teams', asyncHandler(createTeam));
router.post('/teams/add-player', asyncHandler(addPlayerToTeam));
router.post('/teams/remove-player', asyncHandler(removePlayerFromTeam));
router.post('/teams/set-captain', asyncHandler(setTeamCaptain));
router.get('/teams', asyncHandler(getTeams));
router.get('/league/teams', asyncHandler(getTeams));

export default router;
