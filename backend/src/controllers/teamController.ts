import { Request, Response } from 'express';
import * as teamService from '../services/teamService';

export function createTeam(req: Request, res: Response) {
    const { teamName } = req.body;
    if (!teamName) return res.status(400).json({ error: 'teamName required' });
    
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    try {
        const team = teamService.createTeam(teamName, req.user.id);
        return res.status(201).json(team);
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
}

export function addPlayerToTeam(req: Request, res: Response) {
    const { teamId, player } = req.body;
    if (!teamId || !player) return res.status(400).json({ error: 'teamId and player required' });
    
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    try {
        const team = teamService.addPlayerToTeam(teamId, player, req.user.id, req.user.role);
        return res.json(team);
    } catch (e: any) {
        // Use 409 Conflict for business logic errors (e.g., too many goalkeepers)
        if (e.message && (e.message.includes('goalkeeper') || e.message.includes('6 players'))) {
            return res.status(409).json({ error: e.message });
        }
        // Use 403 for authorization errors
        if (e.message && e.message.includes('only modify your own team')) {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}

export function removePlayerFromTeam(req: Request, res: Response) {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId) return res.status(400).json({ error: 'teamId and playerId required' });
    
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    try {
        const team = teamService.removePlayerFromTeam(teamId, playerId, req.user.id, req.user.role);
        return res.json(team);
    } catch (e: any) {
        if (e.message && e.message.includes('only modify your own team')) {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}

export function setTeamCaptain(req: Request, res: Response) {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId) return res.status(400).json({ error: 'teamId and playerId required' });
    
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    try {
        const team = teamService.setTeamCaptain(teamId, playerId, req.user.id, req.user.role);
        return res.json(team);
    } catch (e: any) {
        // Use 409 Conflict for business logic errors (e.g., player not in team)
        if (e.message && e.message.includes('Player not in team')) {
            return res.status(409).json({ error: e.message });
        }
        if (e.message && e.message.includes('only modify your own team')) {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}

export function getTeams(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    return res.json(teamService.getTeams(req.user.id, req.user.role));
}

export function getTeamsWithScores(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    return res.json(teamService.getTeamsWithScores(req.user.id, req.user.role));
}
