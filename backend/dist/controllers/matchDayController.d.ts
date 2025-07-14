import { Request, Response } from 'express';
export declare function createMatchDay(req: Request, res: Response): Promise<void>;
export declare function updatePlayerStats(req: Request, res: Response): Promise<void>;
export declare function calculatePoints(req: Request, res: Response): Promise<void>;
export declare function getMatchDays(_req: Request, res: Response): Promise<void>;
export declare function startMatchDay(req: Request, res: Response): Promise<void>;
export declare function getPlayerStats(req: Request, res: Response): Promise<void>;
