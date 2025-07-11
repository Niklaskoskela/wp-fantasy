import { Request, Response } from 'express';
import * as teamService from '../services/teamService';
import { PlayerService } from '../services/playerService';
import { ClubService } from '../services/clubService';

export async function createTeam(req: Request, res: Response): Promise<void> {
    const { teamName } = req.body;
    if (!teamName) {
        res.status(400).json({ error: 'teamName required' });
        return;
    }
    
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    try {
        const team = await teamService.createTeam(teamName, req.user.id);
        res.status(201).json(team);
    } catch (e: unknown) {
        const error = e as Error;
        res.status(400).json({ error: error.message });
    }
}

export async function addPlayerToTeam(req: Request, res: Response): Promise<void> {
    const { teamId, player } = req.body;
    if (!teamId || !player) {
        res.status(400).json({ error: 'teamId and player required' });
        return;
    }
    
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    try {
        const team = await teamService.addPlayerToTeam(teamId, player, req.user.id, req.user.role);
        res.json(team);
    } catch (e: unknown) {
        const error = e as Error;
        // Use 409 Conflict for business logic errors (e.g., too many goalkeepers)
        if (error.message && (error.message.includes('goalkeeper') || error.message.includes('6 players'))) {
            res.status(409).json({ error: error.message });
            return;
        }
        // Use 403 for authorization errors
        if (error.message && error.message.includes('only modify your own team')) {
            res.status(403).json({ error: error.message });
            return;
        }
        res.status(400).json({ error: error.message });
    }
}

export async function removePlayerFromTeam(req: Request, res: Response): Promise<void> {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId) {
        res.status(400).json({ error: 'teamId and playerId required' });
        return;
    }
    
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    try {
        const team = await teamService.removePlayerFromTeam(teamId, playerId, req.user.id, req.user.role);
        res.json(team);
    } catch (e: unknown) {
        const error = e as Error;
        if (error.message && error.message.includes('only modify your own team')) {
            res.status(403).json({ error: error.message });
            return;
        }
        res.status(400).json({ error: error.message });
    }
}

export async function setTeamCaptain(req: Request, res: Response): Promise<void> {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId) {
        res.status(400).json({ error: 'teamId and playerId required' });
        return;
    }
    
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    try {
        const team = await teamService.setTeamCaptain(teamId, playerId, req.user.id, req.user.role);
        res.json(team);
    } catch (e: unknown) {
        const error = e as Error;
        // Use 409 Conflict for business logic errors (e.g., player not in team)
        if (error.message && error.message.includes('Player not in team')) {
            res.status(409).json({ error: error.message });
            return;
        }
        if (error.message && error.message.includes('only modify your own team')) {
            res.status(403).json({ error: error.message });
            return;
        }
        res.status(400).json({ error: error.message });
    }
}

export async function getTeams(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    const teams = await teamService.getTeams();
    res.json(teams);
}

export async function getTeamsWithScores(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    const teams = await teamService.getTeamsWithScores();
    res.json(teams);
}

export async function clearTeamsCache(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    // Only allow admin to clear cache
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    
    teamService.invalidateTeamsWithScoresCache();
    res.json({ message: 'Teams cache cleared successfully' });
}

export async function clearAllCaches(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    // Only allow admin to clear cache
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    
    // Clear all caches
    teamService.invalidateTeamsWithScoresCache();
    
    try {
        PlayerService.invalidatePlayerCaches();
    } catch (e) {
        console.warn('PlayerService cache invalidation failed:', e);
    }
    
    try {
        ClubService.invalidateClubCaches();
    } catch (e) {
        console.warn('ClubService cache invalidation failed:', e);
    }
    
    res.json({ message: 'All caches cleared successfully' });
}
