import { MatchDay, Player, Stats, Team } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';
import { getTeams } from './teamService';
import { pool } from '../config/database';
import { pointsConfig } from 'config/points';

export async function createMatchDay(title: string, startTime: Date, endTime: Date): Promise<MatchDay> {
    const result = await pool.query(
        'INSERT INTO matchdays (title, start_time, end_time) VALUES ($1, $2, $3) RETURNING id, title, start_time, end_time',
        [title, startTime, endTime]
    );
    
    const row = result.rows[0];
    return {
        id: row.id.toString(),
        title: row.title,
        startTime: row.start_time,
        endTime: row.end_time
    };
}

export async function updatePlayerStats(matchDayId: string, playerId: string, stats: Stats): Promise<Stats | null> {
    const { invalidateTeamsWithScoresCache } = require('./teamService');
    
    try {
        const result = await pool.query(
            `INSERT INTO player_stats (player_id, matchday_id, goals, assists, blocks, steals, pf_drawn, pf, balls_lost, contra_fouls, shots, swim_offs, brutality, saves, wins) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (player_id, matchday_id) 
             DO UPDATE SET 
                goals = EXCLUDED.goals,
                assists = EXCLUDED.assists,
                blocks = EXCLUDED.blocks,
                steals = EXCLUDED.steals,
                pf_drawn = EXCLUDED.pf_drawn,
                pf = EXCLUDED.pf,
                balls_lost = EXCLUDED.balls_lost,
                contra_fouls = EXCLUDED.contra_fouls,
                shots = EXCLUDED.shots,
                swim_offs = EXCLUDED.swim_offs,
                brutality = EXCLUDED.brutality,
                saves = EXCLUDED.saves,
                wins = EXCLUDED.wins
             RETURNING *`,
            [playerId, matchDayId, stats.goals, stats.assists, stats.blocks, stats.steals, 
             stats.pfDrawn, stats.pf, stats.ballsLost, stats.contraFouls, stats.shots, 
             stats.swimOffs, stats.brutality, stats.saves, stats.wins]
        );
        
        const row = result.rows[0];
        
        // Invalidate cache since player stats changed
        invalidateTeamsWithScoresCache();
        
        return {
            id: row.id.toString(),
            goals: row.goals,
            assists: row.assists,
            blocks: row.blocks,
            steals: row.steals,
            pfDrawn: row.pf_drawn,
            pf: row.pf,
            ballsLost: row.balls_lost,
            contraFouls: row.contra_fouls,
            shots: row.shots,
            swimOffs: row.swim_offs,
            brutality: row.brutality,
            saves: row.saves,
            wins: row.wins
        };
    } catch (error) {
        console.error('Error updating player stats:', error);
        return null;
    }
}

export async function calculatePoints(matchDayId: string): Promise<{ teamId: string; points: number }[]> {
    const teams = await getTeams();
    const playerStats = await getPlayerStats(matchDayId);
    const results: { teamId: string; points: number }[] = [];
    
    for (const team of teams) {
        let total = 0;
        
        for (const player of team.players) {
            const stats = playerStats[player.id];
            if (stats) {
                // Simple scoring: goals*5 + assists*3 + blocks*2 + steals*2
                const basePoints = 
                    stats.goals * pointsConfig.goal + 
                    stats.assists * pointsConfig.assist + 
                    stats.blocks * pointsConfig.block + 
                    stats.steals * pointsConfig.steal + 
                    stats.pfDrawn * pointsConfig.pfDrawn + 
                    stats.pf * pointsConfig.pf + 
                    stats.ballsLost * pointsConfig.ballsLost + 
                    stats.contraFouls * pointsConfig.contraFoul + 
                    stats.shots * pointsConfig.shot + 
                    stats.swimOffs * pointsConfig.swimOff + 
                    stats.brutality * pointsConfig.brutality + 
                    stats.saves * pointsConfig.save + 
                    stats.wins * pointsConfig.win;
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
 * Get player stats for a specific player in a matchday
 */
async function getPlayerStatsForPlayer(matchDayId: string, playerId: string): Promise<Stats | null> {
    try {
        const result = await pool.query(
            'SELECT * FROM player_stats WHERE matchday_id = $1 AND player_id = $2',
            [matchDayId, playerId]
        );
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return {
            id: row.id.toString(),
            goals: row.goals,
            assists: row.assists,
            blocks: row.blocks,
            steals: row.steals,
            pfDrawn: row.pf_drawn,
            pf: row.pf,
            ballsLost: row.balls_lost,
            contraFouls: row.contra_fouls,
            shots: row.shots,
            swimOffs: row.swim_offs,
            brutality: row.brutality,
            saves: row.saves,
            wins: row.wins
        };
    } catch (error) {
        console.error('Error getting player stats:', error);
        return null;
    }
}

/**
 * Start a matchday - this snapshots all current team rosters
 * and should be called when a matchday begins
 */
export async function startMatchDay(matchDayId: string): Promise<boolean> {
    const matchDay = await getMatchDayById(matchDayId);
    if (!matchDay) return false;
    
    // Check if matchday has already started
    if (new Date() < matchDay.startTime) {
        throw new Error('Matchday has not reached its start time yet');
    }
    
    // Import the roster history service
    const { snapshotAllTeamRosters, hasRosterHistory } = require('./rosterHistoryService');
    
    // Check if rosters have already been snapshotted for this matchday
    const { getTeams } = require('./teamService');
    const teams = await getTeams();
    
    // If any team already has roster history for this matchday, don't snapshot again
    const alreadySnapshotted = await Promise.all(
        teams.map(async (team: any) => await hasRosterHistory(team.id, matchDayId))
    ).then(results => results.some(result => result));
    
    if (!alreadySnapshotted) {
        // Snapshot all team rosters for this matchday
        await snapshotAllTeamRosters(matchDayId, undefined, undefined);
        console.log(`Rosters snapshotted for matchday ${matchDay.title} (${matchDayId})`);
    } else {
        console.log(`Rosters already snapshotted for matchday ${matchDay.title} (${matchDayId})`);
    }
    
    return true;
}

/**
 * Get a specific matchday by ID
 */
async function getMatchDayById(matchDayId: string): Promise<MatchDay | null> {
    try {
        const result = await pool.query(
            'SELECT id, title, start_time, end_time FROM matchdays WHERE id = $1',
            [matchDayId]
        );
        
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
        return {
            id: row.id.toString(),
            title: row.title,
            startTime: row.start_time,
            endTime: row.end_time
        };
    } catch (error) {
        console.error('Error getting matchday by ID:', error);
        return null;
    }
}

export async function getMatchDays(): Promise<MatchDay[]> {
    try {
        const result = await pool.query(
            'SELECT id, title, start_time, end_time FROM matchdays ORDER BY start_time DESC'
        );
        
        return result.rows.map(row => ({
            id: row.id.toString(),
            title: row.title,
            startTime: row.start_time,
            endTime: row.end_time
        }));
    } catch (error) {
        console.error('Error getting matchdays:', error);
        return [];
    }
}

export async function getPlayerStats(matchDayId: string): Promise<{ [playerId: string]: Stats }> {
    try {
        const result = await pool.query(
            'SELECT * FROM player_stats WHERE matchday_id = $1',
            [matchDayId]
        );
        
        const statsMap: { [playerId: string]: Stats } = {};
        
        for (const row of result.rows) {
            statsMap[row.player_id.toString()] = {
                id: row.id.toString(),
                goals: row.goals,
                assists: row.assists,
                blocks: row.blocks,
                steals: row.steals,
                pfDrawn: row.pf_drawn,
                pf: row.pf,
                ballsLost: row.balls_lost,
                contraFouls: row.contra_fouls,
                shots: row.shots,
                swimOffs: row.swim_offs,
                brutality: row.brutality,
                saves: row.saves,
                wins: row.wins
            };
        }
        
        return statsMap;
    } catch (error) {
        console.error('Error getting player stats:', error);
        return {};
    }
}
