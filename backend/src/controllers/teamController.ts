import { Request, Response } from 'express';
import * as teamService from '../services/teamService';

export function createTeam(req: Request, res: Response) {
    const { teamName } = req.body;
    if (!teamName) return res.status(400).json({ error: 'teamName required' });
    try {
        const team = teamService.createTeam(teamName);
        return res.status(201).json(team);
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
}

export function addPlayerToTeam(req: Request, res: Response) {
    const { teamId, player } = req.body;
    if (!teamId || !player) return res.status(400).json({ error: 'teamId and player required' });
    try {
        const team = teamService.addPlayerToTeam(teamId, player);
        return res.json(team);
    } catch (e: any) {
        // Use 409 Conflict for business logic errors (e.g., too many goalkeepers)
        if (e.message && (e.message.includes('goalkeeper') || e.message.includes('6 players'))) {
            return res.status(409).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}

export function removePlayerFromTeam(req: Request, res: Response) {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId) return res.status(400).json({ error: 'teamId and playerId required' });
    try {
        const team = teamService.removePlayerFromTeam(teamId, playerId);
        return res.json(team);
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
}

export function setTeamCaptain(req: Request, res: Response) {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId) return res.status(400).json({ error: 'teamId and playerId required' });
    try {
        const team = teamService.setTeamCaptain(teamId, playerId);
        return res.json(team);
    } catch (e: any) {
        // Use 409 Conflict for business logic errors (e.g., player not in team)
        if (e.message && e.message.includes('Player not in team')) {
            return res.status(409).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}

export function getTeams(_req: Request, res: Response) {
    return res.json(teamService.getTeams());
}
