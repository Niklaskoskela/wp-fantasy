import { Request, Response } from 'express';
import * as teamService from '../services/teamService';

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
    } catch (e: any) {
        res.status(400).json({ error: e.message });
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
    } catch (e: any) {
        // Use 409 Conflict for business logic errors (e.g., too many goalkeepers)
        if (e.message && (e.message.includes('goalkeeper') || e.message.includes('6 players'))) {
            res.status(409).json({ error: e.message });
            return;
        }
        // Use 403 for authorization errors
        if (e.message && e.message.includes('only modify your own team')) {
            res.status(403).json({ error: e.message });
            return;
        }
        res.status(400).json({ error: e.message });
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
    } catch (e: any) {
        if (e.message && e.message.includes('only modify your own team')) {
            res.status(403).json({ error: e.message });
            return;
        }
        res.status(400).json({ error: e.message });
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
    } catch (e: any) {
        // Use 409 Conflict for business logic errors (e.g., player not in team)
        if (e.message && e.message.includes('Player not in team')) {
            res.status(409).json({ error: e.message });
            return;
        }
        if (e.message && e.message.includes('only modify your own team')) {
            res.status(403).json({ error: e.message });
            return;
        }
        res.status(400).json({ error: e.message });
    }
}

export async function getTeams(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    const teams = await teamService.getTeams(req.user.id, req.user.role);
    res.json(teams);
}

export async function getTeamsWithScores(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    
    const teams = await teamService.getTeamsWithScores(req.user.id, req.user.role);
    res.json(teams);
}
