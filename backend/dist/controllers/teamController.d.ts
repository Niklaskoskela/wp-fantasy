import { Request, Response } from 'express';
export declare function createTeam(req: Request, res: Response): Promise<void>;
export declare function addPlayerToTeam(req: Request, res: Response): Promise<void>;
export declare function removePlayerFromTeam(req: Request, res: Response): Promise<void>;
export declare function setTeamCaptain(req: Request, res: Response): Promise<void>;
export declare function getTeams(req: Request, res: Response): Promise<void>;
export declare function getTeamsWithScores(req: Request, res: Response): Promise<void>;
export declare function clearTeamsCache(req: Request, res: Response): Promise<void>;
export declare function clearAllCaches(req: Request, res: Response): Promise<void>;
