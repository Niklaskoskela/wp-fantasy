import { MatchDay, Stats, Team } from '../../../shared/dist/types';
import { getTeams } from './teamService';
import { pool } from '../config/database';
import { pointsConfig } from '../config/points';
import { getMatchDayRosterHistory } from './rosterHistoryService';

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
    const { invalidateTeamsWithScoresCache } = await import('./teamService');
    
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
    
    // Get roster history for this matchday
    const { getMatchDayRosterHistory } = await import('./rosterHistoryService');
    const matchDayRosterHistory = await getMatchDayRosterHistory(matchDayId);
    
    for (const team of teams) {
        let total = 0;
        
        // Get roster history for this team and matchday
        const teamRosterHistory = matchDayRosterHistory.get(team.id) || [];
        
        // Only calculate points if roster history exists for this matchday
        if (teamRosterHistory.length > 0) {
            const playersToScore: Array<{playerId: string, isCaptain: boolean}> = teamRosterHistory.map(entry => ({
                playerId: entry.playerId,
                isCaptain: entry.isCaptain
            }));

            for (const rosterEntry of playersToScore) {
            const stats = playerStats[rosterEntry.playerId];
            if (stats) {
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
                if (rosterEntry.isCaptain) {
                    total += basePoints;
                }
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
export async function startMatchDay(matchDayId: string): Promise<boolean> {
    const matchDay = await getMatchDayById(matchDayId);
    if (!matchDay) return false;
    
    // Check if matchday has already started
    if (new Date() < matchDay.startTime) {
        throw new Error('Matchday has not reached its start time yet');
    }
    
    // Import the roster history service
    const { snapshotAllTeamRosters, hasRosterHistory } = await import('./rosterHistoryService');
    
    // Check if rosters have already been snapshotted for this matchday
    const { getTeams } = await import('./teamService');
    const teams = await getTeams();
    
    // If any team already has roster history for this matchday, don't snapshot again
    const alreadySnapshotted = await Promise.all(
        teams.map(async (team: Team) => await hasRosterHistory(team.id, matchDayId))
    ).then(results => results.some(result => result));
    
    if (!alreadySnapshotted) {
        // Snapshot all team rosters for this matchday
        await snapshotAllTeamRosters(matchDayId);
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

/**
 * Get the next upcoming matchday (start time is in the future)
 */
export async function getNextUpcomingMatchday(): Promise<MatchDay | null> {
    try {
        const now = new Date();
        const result = await pool.query(
            'SELECT id, title, start_time, end_time FROM matchdays WHERE start_time > $1 ORDER BY start_time ASC LIMIT 1',
            [now]
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
        console.error('Error getting next matchday:', error);
        return null;
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
