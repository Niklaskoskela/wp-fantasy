import { RosterHistory, RosterEntry } from '../../../shared/dist/types';
/**
 * Create roster history entries for a team on a specific matchday
 * This snapshots the current team composition when a matchday starts
 */
export declare function createRosterHistory(teamId: string, matchDayId: string, rosterEntries: RosterEntry[]): Promise<RosterHistory[]>;
/**
 * Get roster history for a specific team and matchday
 */
export declare function getRosterHistory(teamId: string, matchDayId: string): Promise<RosterHistory[]>;
/**
 * Get all roster history for a specific team across all matchdays
 */
export declare function getTeamRosterHistory(teamId: string): Promise<Map<string, RosterHistory[]>>;
/**
 * Get all roster history for a specific matchday across all teams
 */
export declare function getMatchDayRosterHistory(matchDayId: string): Promise<Map<string, RosterHistory[]>>;
/**
 * Remove roster history for a specific team and matchday
 * Useful for updating rosters before matchday starts
 */
export declare function removeRosterHistory(teamId: string, matchDayId: string): Promise<void>;
/**
 * Check if roster history exists for a team and matchday
 */
export declare function hasRosterHistory(teamId: string, matchDayId: string): Promise<boolean>;
/**
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts to freeze team compositions
 * Only admin users can snapshot all teams, regular users can only snapshot their own team
 */
export declare function snapshotAllTeamRosters(matchDayId: string): Promise<Map<string, RosterHistory[]>>;
/**
 * Get all roster histories (for debugging/admin purposes)
 */
export declare function getAllRosterHistories(): Promise<RosterHistory[]>;
