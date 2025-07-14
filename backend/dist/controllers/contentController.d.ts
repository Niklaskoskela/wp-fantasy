import { Request, Response } from 'express';
export declare class ClubController {
    static createClub(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAllClubs(_req: Request, res: Response): Promise<void>;
    static getClub(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static clearClubsCache(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare class PlayerController {
    static createPlayer(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAllPlayers(_req: Request, res: Response): Promise<void>;
    static getPlayer(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static clearPlayersCache(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
