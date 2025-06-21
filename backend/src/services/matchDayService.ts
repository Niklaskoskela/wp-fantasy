import { MatchDay, Player, Stats, Team } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';
import { getTeams } from './teamService';

// In-memory stores
const matchDays: MatchDay[] = [];
const playerStats: { [key: string]: { [playerId: string]: Stats } } = {}; // matchDayId -> playerId -> stats

export function createMatchDay(title: string, startTime: Date, endTime: Date): MatchDay {
    const matchDay: MatchDay = { 
        id: uuidv4(), 
        title,
        startTime,
        endTime
    };
    matchDays.push(matchDay);
    playerStats[matchDay.id] = {};
    return matchDay;
}

export function updatePlayerStats(matchDayId: string, playerId: string, stats: Stats): Stats | null {
    if (!playerStats[matchDayId]) return null;
    playerStats[matchDayId][playerId] = stats;
    return stats;
}

export function calculatePoints(matchDayId: string): { teamId: string; points: number }[] {
    const teams = getTeams();
    const results: { teamId: string; points: number }[] = [];
    
    for (const team of teams) {
        let total = 0;
        
        for (const player of team.players) {
            const stats = playerStats[matchDayId]?.[player.id];
            if (stats) {
                // Simple scoring: goals*5 + assists*3 + blocks*2 + steals*2
                const basePoints = stats.goals * 5 + stats.assists * 3 + stats.blocks * 2 + stats.steals * 2;
                total += basePoints;
                // Captain gets double points
                if (team.teamCaptain && team.teamCaptain.id === player.id) {
                    total += basePoints;
                }
            }
        }
        results.push({ teamId: team.id, points: total });
    }
    return results;
}

/**
 * Start a matchday - this snapshots all current team rosters
 * and should be called when a matchday begins
 */
export function startMatchDay(matchDayId: string): boolean {
    const matchDay = matchDays.find(md => md.id === matchDayId);
    if (!matchDay) return false;
    
    // Check if matchday has already started
    if (new Date() < matchDay.startTime) {
        throw new Error('Matchday has not reached its start time yet');
    }
    
    // Import the roster history service
    const { snapshotAllTeamRosters, hasRosterHistory } = require('./rosterHistoryService');
    
    // Check if rosters have already been snapshotted for this matchday
    const { getTeams } = require('./teamService');
    const teams = getTeams();
    
    // If any team already has roster history for this matchday, don't snapshot again
    const alreadySnapshotted = teams.some((team: any) => hasRosterHistory(team.id, matchDayId));
    
    if (!alreadySnapshotted) {
        // Snapshot all team rosters for this matchday
        snapshotAllTeamRosters(matchDayId);
        console.log(`Rosters snapshotted for matchday ${matchDay.title} (${matchDayId})`);
    } else {
        console.log(`Rosters already snapshotted for matchday ${matchDay.title} (${matchDayId})`);
    }
    
    return true;
}

export function getMatchDays(): MatchDay[] {
    return matchDays;
}

export function getPlayerStats(matchDayId: string): { [playerId: string]: Stats } {
    return playerStats[matchDayId] || {};
}
