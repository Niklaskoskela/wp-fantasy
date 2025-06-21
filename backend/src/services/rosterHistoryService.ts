// Service for managing roster history: track team compositions for each matchday
import { RosterHistory, RosterEntry } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demo (replace with DB integration in production)
const rosterHistories: RosterHistory[] = [];

/**
 * Create roster history entries for a team on a specific matchday
 * This snapshots the current team composition when a matchday starts
 */
export function createRosterHistory(
    teamId: string, 
    matchDayId: string, 
    rosterEntries: RosterEntry[]
): RosterHistory[] {
    // First, remove any existing roster history for this team/matchday combination
    // This allows updating the roster if needed before matchday starts
    removeRosterHistory(teamId, matchDayId);
    
    const newRosterEntries: RosterHistory[] = [];
    
    for (const entry of rosterEntries) {
        const rosterHistory: RosterHistory = {
            id: uuidv4(),
            teamId,
            matchDayId,
            playerId: entry.playerId,
            isCaptain: entry.isCaptain,
            createdAt: new Date()
        };
        
        rosterHistories.push(rosterHistory);
        newRosterEntries.push(rosterHistory);
    }
    
    return newRosterEntries;
}

/**
 * Get roster history for a specific team and matchday
 */
export function getRosterHistory(teamId: string, matchDayId: string): RosterHistory[] {
    return rosterHistories.filter(
        rh => rh.teamId === teamId && rh.matchDayId === matchDayId
    );
}

/**
 * Get all roster history for a specific team across all matchdays
 */
export function getTeamRosterHistory(teamId: string): Map<string, RosterHistory[]> {
    const teamRosterHistory = rosterHistories.filter(rh => rh.teamId === teamId);
    const historyMap = new Map<string, RosterHistory[]>();
    
    for (const history of teamRosterHistory) {
        if (!historyMap.has(history.matchDayId)) {
            historyMap.set(history.matchDayId, []);
        }
        historyMap.get(history.matchDayId)!.push(history);
    }
    
    return historyMap;
}

/**
 * Get all roster history for a specific matchday across all teams
 */
export function getMatchDayRosterHistory(matchDayId: string): Map<string, RosterHistory[]> {
    const matchDayRosterHistory = rosterHistories.filter(rh => rh.matchDayId === matchDayId);
    const historyMap = new Map<string, RosterHistory[]>();
    
    for (const history of matchDayRosterHistory) {
        if (!historyMap.has(history.teamId)) {
            historyMap.set(history.teamId, []);
        }
        historyMap.get(history.teamId)!.push(history);
    }
    
    return historyMap;
}

/**
 * Remove roster history for a specific team and matchday
 * Useful for updating rosters before matchday starts
 */
export function removeRosterHistory(teamId: string, matchDayId: string): void {
    const indicesToRemove: number[] = [];
    
    rosterHistories.forEach((rh, index) => {
        if (rh.teamId === teamId && rh.matchDayId === matchDayId) {
            indicesToRemove.push(index);
        }
    });
    
    // Remove in reverse order to maintain correct indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        rosterHistories.splice(indicesToRemove[i], 1);
    }
}

/**
 * Check if roster history exists for a team and matchday
 */
export function hasRosterHistory(teamId: string, matchDayId: string): boolean {
    return rosterHistories.some(
        rh => rh.teamId === teamId && rh.matchDayId === matchDayId
    );
}

/**
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts to freeze team compositions
 */
export function snapshotAllTeamRosters(matchDayId: string): Map<string, RosterHistory[]> {
    const { getTeams } = require('./teamService');
    const teams = getTeams();
    const allSnapshots = new Map<string, RosterHistory[]>();
    
    for (const team of teams) {
        // Convert current team roster to roster entries
        const rosterEntries: RosterEntry[] = team.players.map((player: any) => ({
            playerId: player.id,
            isCaptain: team.teamCaptain?.id === player.id
        }));
        
        if (rosterEntries.length > 0) {
            const snapshot = createRosterHistory(team.id, matchDayId, rosterEntries);
            allSnapshots.set(team.id, snapshot);
        }
    }
    
    return allSnapshots;
}

/**
 * Get all roster histories (for debugging/admin purposes)
 */
export function getAllRosterHistories(): RosterHistory[] {
    return [...rosterHistories];
}
