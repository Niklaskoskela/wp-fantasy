import { Request, Response } from 'express';
/**
 * POST /api/roster-history/:teamId/:matchDayId
 * Create roster history for a team on a specific matchday
 */
export declare function createRosterHistory(req: Request, res: Response): Promise<void>;
/**
 * GET /api/roster-history/:teamId/:matchDayId
 * Get roster history for a specific team and matchday
 */
export declare function getRosterHistory(req: Request, res: Response): Promise<void>;
/**
 * GET /api/roster-history/team/:teamId
 * Get all roster history for a specific team across all matchdays
 */
export declare function getTeamRosterHistory(req: Request, res: Response): Promise<void>;
/**
 * GET /api/roster-history/matchday/:matchDayId
 * Get all roster history for a specific matchday across all teams
 */
export declare function getMatchDayRosterHistory(req: Request, res: Response): Promise<void>;
/**
 * POST /api/roster-history/snapshot/:matchDayId
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts
 */
export declare function snapshotAllTeamRosters(req: Request, res: Response): Promise<void>;
/**
 * DELETE /api/roster-history/:teamId/:matchDayId
 * Remove roster history for a specific team and matchday
 */
export declare function removeRosterHistory(req: Request, res: Response): Promise<void>;
/**
 * GET /api/roster-history/check/:teamId/:matchDayId
 * Check if roster history exists for a team and matchday
 */
export declare function checkRosterHistory(req: Request, res: Response): Promise<void>;
