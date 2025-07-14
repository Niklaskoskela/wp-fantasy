import { MatchDay, Stats } from '../../../shared/dist/types';
export declare function createMatchDay(title: string, startTime: Date, endTime: Date): Promise<MatchDay>;
export declare function updatePlayerStats(matchDayId: string, playerId: string, stats: Stats): Promise<Stats | null>;
export declare function calculatePoints(matchDayId: string): Promise<{
    teamId: string;
    points: number;
}[]>;
/**
 * Start a matchday - this snapshots all current team rosters
 * and should be called when a matchday begins
 */
export declare function startMatchDay(matchDayId: string): Promise<boolean>;
export declare function getMatchDays(): Promise<MatchDay[]>;
/**
 * Get the next upcoming matchday (start time is in the future)
 */
export declare function getNextUpcomingMatchday(): Promise<MatchDay | null>;
export declare function getPlayerStats(matchDayId: string): Promise<{
    [playerId: string]: Stats;
}>;
