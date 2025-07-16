import { Request, Response } from 'express';
import * as matchDayService from '../services/matchDayService';

export async function createMatchDay(
  req: Request,
  res: Response
): Promise<void> {
  const { title, startTime, endTime } = req.body;
  if (!title || !startTime || !endTime) {
    res
      .status(400)
      .json({ error: 'title, startTime, and endTime are required' });
    return;
  }
  const matchDay = await matchDayService.createMatchDay(
    title,
    new Date(startTime),
    new Date(endTime)
  );
  res.status(201).json(matchDay);
}

export async function updatePlayerStats(
  req: Request,
  res: Response
): Promise<void> {
  const { id: matchDayId } = req.params;
  const { playerId, stats } = req.body;
  if (!playerId || !stats) {
    res.status(400).json({ error: 'playerId and stats required' });
    return;
  }
  const updated = await matchDayService.updatePlayerStats(
    matchDayId,
    playerId,
    stats
  );
  if (!updated) {
    res.status(404).json({ error: 'MatchDay not found' });
    return;
  }
  res.json(updated);
}

export async function calculatePoints(
  req: Request,
  res: Response
): Promise<void> {
  const { id: matchDayId } = req.params;
  const results = await matchDayService.calculatePoints(matchDayId);
  res.json(results);
}

export async function getMatchDays(
  _req: Request,
  res: Response
): Promise<void> {
  const matchDays = await matchDayService.getMatchDays();
  res.json(matchDays);
}

export async function startMatchDay(
  req: Request,
  res: Response
): Promise<void> {
  const { id: matchDayId } = req.params;
  try {
    const result = await matchDayService.startMatchDay(matchDayId);
    if (!result) {
      res.status(404).json({ error: 'MatchDay not found' });
      return;
    }
    res.json({ message: 'MatchDay started successfully', matchDayId });
  } catch (error) {
    console.error('Error starting matchday:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPlayerStats(
  req: Request,
  res: Response
): Promise<void> {
  const { id: matchDayId } = req.params;
  const stats = await matchDayService.getPlayerStats(matchDayId);
  res.json(stats);
}
