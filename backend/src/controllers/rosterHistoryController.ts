// Controller for roster history endpoints
import { Request, Response } from 'express';
import * as rosterHistoryService from '../services/rosterHistoryService';
import { RosterEntry, RosterHistory } from '../../../shared/dist/types';

/**
 * POST /api/roster-history/:teamId/:matchDayId
 * Create roster history for a team on a specific matchday
 */
export async function createRosterHistory(req: Request, res: Response): Promise<void> {
    try {
        const { teamId, matchDayId } = req.params;
        const rosterEntries: RosterEntry[] = req.body;
        console.log('Calling createRosterHistory with:', { teamId, matchDayId, rosterEntries });


        if (!Array.isArray(rosterEntries)) {
            res.status(400).json({ error: 'Request body must be an array of roster entries' });
            return;
        }

        // Validate roster entries
        for (const entry of rosterEntries) {
            if (!entry.playerId || typeof entry.isCaptain !== 'boolean') {
                res.status(400).json({ error: 'Each roster entry must have playerId and isCaptain properties' });
                return;
            }
        }

        // Ensure only one captain per team
        const captains = rosterEntries.filter(entry => entry.isCaptain);
        if (captains.length > 1) {
            res.status(400).json({ error: 'Only one captain allowed per team' });
            return;
        }

        const rosterHistory = await rosterHistoryService.createRosterHistory(teamId, matchDayId, rosterEntries);
        res.status(201).json(rosterHistory);
    } catch (error) {
        console.error('Error creating roster history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * GET /api/roster-history/:teamId/:matchDayId
 * Get roster history for a specific team and matchday
 */
export async function getRosterHistory(req: Request, res: Response): Promise<void> {
    try {
        const { teamId, matchDayId } = req.params;
        const rosterHistory = await rosterHistoryService.getRosterHistory(teamId, matchDayId);
        res.json(rosterHistory);
    } catch (error) {
        console.error('Error getting roster history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * GET /api/roster-history/team/:teamId
 * Get all roster history for a specific team across all matchdays
 */
export async function getTeamRosterHistory(req: Request, res: Response): Promise<void> {
    try {
        const { teamId } = req.params;
        const rosterHistory = await rosterHistoryService.getTeamRosterHistory(teamId);
        
        // Convert Map to object for JSON serialization
        const rosterHistoryObj: { [matchDayId: string]: RosterHistory[] } = {};
        rosterHistory.forEach((value, key) => {
            rosterHistoryObj[key] = value;
        });
        
        res.json(rosterHistoryObj);
    } catch (error) {
        console.error('Error getting team roster history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * GET /api/roster-history/matchday/:matchDayId
 * Get all roster history for a specific matchday across all teams
 */
export async function getMatchDayRosterHistory(req: Request, res: Response): Promise<void> {
    try {
        const { matchDayId } = req.params;
        const rosterHistory = await rosterHistoryService.getMatchDayRosterHistory(matchDayId);
        
        // Convert Map to object for JSON serialization
        const rosterHistoryObj: { [teamId: string]: RosterHistory[] } = {};
        rosterHistory.forEach((value, key) => {
            rosterHistoryObj[key] = value;
        });
        
        res.json(rosterHistoryObj);
    } catch (error) {
        console.error('Error getting matchday roster history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * POST /api/roster-history/snapshot/:matchDayId
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts
 */
export async function snapshotAllTeamRosters(req: Request, res: Response): Promise<void> {
    try {
        const { matchDayId } = req.params;
        
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        
        const snapshots = await rosterHistoryService.snapshotAllTeamRosters(matchDayId);
        
        // Convert Map to object for JSON serialization
        const snapshotsObj: { [teamId: string]: RosterHistory[] } = {};
        snapshots.forEach((value, key) => {
            snapshotsObj[key] = value;
        });
        
        res.json(snapshotsObj);
    } catch (error) {
        console.error('Error snapshotting team rosters:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * DELETE /api/roster-history/:teamId/:matchDayId
 * Remove roster history for a specific team and matchday
 */
export async function removeRosterHistory(req: Request, res: Response): Promise<void> {
    try {
        const { teamId, matchDayId } = req.params;
        await rosterHistoryService.removeRosterHistory(teamId, matchDayId);
        res.status(204).send();
    } catch (error) {
        console.error('Error removing roster history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * GET /api/roster-history/check/:teamId/:matchDayId
 * Check if roster history exists for a team and matchday
 */
export async function checkRosterHistory(req: Request, res: Response): Promise<void> {
    try {
        const { teamId, matchDayId } = req.params;
        const exists = await rosterHistoryService.hasRosterHistory(teamId, matchDayId);
        res.json({ exists });
    } catch (error) {
        console.error('Error checking roster history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
