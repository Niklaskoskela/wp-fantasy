import { Request, Response } from 'express';
import * as matchDayService from '../services/matchDayService';

export function createMatchDay(req: Request, res: Response) {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const matchDay = matchDayService.createMatchDay(title);
    return res.status(201).json(matchDay);
}

export function updatePlayerStats(req: Request, res: Response) {
    const { id: matchDayId } = req.params;
    const { playerId, stats } = req.body;
    if (!playerId || !stats) return res.status(400).json({ error: 'playerId and stats required' });
    const updated = matchDayService.updatePlayerStats(matchDayId, playerId, stats);
    if (!updated) return res.status(404).json({ error: 'MatchDay not found' });
    return res.json(updated);
}

export function calculatePoints(req: Request, res: Response) {
    const { id: matchDayId } = req.params;
    const results = matchDayService.calculatePoints(matchDayId);
    return res.json(results);
}

export function getMatchDays(_req: Request, res: Response) {
    return res.json(matchDayService.getMatchDays());
}

export function getPlayerStats(req: Request, res: Response) {
    const { id: matchDayId } = req.params;
    const stats = matchDayService.getPlayerStats(matchDayId);
    return res.json(stats);
}
