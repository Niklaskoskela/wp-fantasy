import { MatchDay, Player, Stats, Team } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';
import { getTeams } from './teamService';

// In-memory stores
const matchDays: MatchDay[] = [];
const playerStats: { [key: string]: { [playerId: string]: Stats } } = {}; // matchDayId -> playerId -> stats

export function createMatchDay(title: string): MatchDay {
    const matchDay: MatchDay = { id: uuidv4(), title };
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

export function getMatchDays(): MatchDay[] {
    return matchDays;
}
