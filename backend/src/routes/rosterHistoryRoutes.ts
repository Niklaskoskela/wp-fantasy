// Routes for roster history management
import { Router } from 'express';
import * as rosterHistoryController from '../controllers/rosterHistoryController';

const router = Router();

// Create roster history for a team on a specific matchday
router.post('/:teamId/:matchDayId', rosterHistoryController.createRosterHistory);

// Get roster history for a specific team and matchday
router.get('/:teamId/:matchDayId', rosterHistoryController.getRosterHistory);

// Get all roster history for a specific team across all matchdays
router.get('/team/:teamId', rosterHistoryController.getTeamRosterHistory);

// Get all roster history for a specific matchday across all teams
router.get('/matchday/:matchDayId', rosterHistoryController.getMatchDayRosterHistory);

// Snapshot all current team rosters for a matchday
router.post('/snapshot/:matchDayId', rosterHistoryController.snapshotAllTeamRosters);

// Check if roster history exists for a team and matchday
router.get('/check/:teamId/:matchDayId', rosterHistoryController.checkRosterHistory);

// Remove roster history for a specific team and matchday
router.delete('/:teamId/:matchDayId', rosterHistoryController.removeRosterHistory);

export default router;
