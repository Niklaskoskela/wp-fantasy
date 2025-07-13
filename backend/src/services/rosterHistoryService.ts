// Service for managing roster history: track team compositions for each matchday
import { RosterHistory, RosterEntry, Player } from '../../../shared/dist/types';
import { pool } from '../config/database';

/**
 * Create roster history entries for a team on a specific matchday
 * This snapshots the current team composition when a matchday starts
 */
export async function createRosterHistory(
    teamId: string, 
    matchDayId: string, 
    rosterEntries: RosterEntry[]
): Promise<RosterHistory[]> {
    // First, remove any existing roster history for this team/matchday combination
    // This allows updating the roster if needed before matchday starts
    console.log('Removing existing entries...');
    await removeRosterHistory(teamId, matchDayId);
    console.log('Removed existing entries');

    const newRosterEntries: RosterHistory[] = [];
    
    for (const entry of rosterEntries) {
        console.log('Inserting entry:', entry);
        const result = await pool.query(
            'INSERT INTO roster_history (team_id, matchday_id, player_id, is_captain) VALUES ($1, $2, $3, $4) RETURNING id, team_id, matchday_id, player_id, is_captain, created_at',
            [teamId, matchDayId, entry.playerId, entry.isCaptain]
            
        );
        console.log('Insert result:', result.rows[0]);
        
        const row = result.rows[0];
        const rosterHistory: RosterHistory = {
            id: row.id.toString(),
            teamId: row.team_id.toString(),
            matchDayId: row.matchday_id.toString(),
            playerId: row.player_id.toString(),
            isCaptain: row.is_captain,
            createdAt: row.created_at
        };
        
        newRosterEntries.push(rosterHistory);
    }
    
    return newRosterEntries;
}

/**
 * Get roster history for a specific team and matchday
 */
export async function getRosterHistory(teamId: string, matchDayId: string): Promise<RosterHistory[]> {
    const result = await pool.query(
        'SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history WHERE team_id = $1 AND matchday_id = $2',
        [teamId, matchDayId]
    );
    
    return result.rows.map(row => ({
        id: row.id.toString(),
        teamId: row.team_id.toString(),
        matchDayId: row.matchday_id.toString(),
        playerId: row.player_id.toString(),
        isCaptain: row.is_captain,
        createdAt: row.created_at
    }));
}

/**
 * Get all roster history for a specific team across all matchdays
 */
export async function getTeamRosterHistory(teamId: string): Promise<Map<string, RosterHistory[]>> {
    const result = await pool.query(
        'SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history WHERE team_id = $1',
        [teamId]
    );
    
    const historyMap = new Map<string, RosterHistory[]>();
    
    for (const row of result.rows) {
        const rosterHistory: RosterHistory = {
            id: row.id.toString(),
            teamId: row.team_id.toString(),
            matchDayId: row.matchday_id.toString(),
            playerId: row.player_id.toString(),
            isCaptain: row.is_captain,
            createdAt: row.created_at
        };
        
        if (!historyMap.has(rosterHistory.matchDayId)) {
            historyMap.set(rosterHistory.matchDayId, []);
        }
        const matchDayHistory = historyMap.get(rosterHistory.matchDayId);
        if (matchDayHistory) {
            matchDayHistory.push(rosterHistory);
        }
    }
    
    return historyMap;
}

/**
 * Get all roster history for a specific matchday across all teams
 */
export async function getMatchDayRosterHistory(matchDayId: string): Promise<Map<string, RosterHistory[]>> {
    const result = await pool.query(
        'SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history WHERE matchday_id = $1',
        [matchDayId]
    );
    
    const historyMap = new Map<string, RosterHistory[]>();
    
    for (const row of result.rows) {
        const rosterHistory: RosterHistory = {
            id: row.id.toString(),
            teamId: row.team_id.toString(),
            matchDayId: row.matchday_id.toString(),
            playerId: row.player_id.toString(),
            isCaptain: row.is_captain,
            createdAt: row.created_at
        };
        
        if (!historyMap.has(rosterHistory.teamId)) {
            historyMap.set(rosterHistory.teamId, []);
        }
        const teamHistory = historyMap.get(rosterHistory.teamId);
        if (teamHistory) {
            teamHistory.push(rosterHistory);
        }
    }
    
    return historyMap;
}

/**
 * Remove roster history for a specific team and matchday
 * Useful for updating rosters before matchday starts
 */
export async function removeRosterHistory(teamId: string, matchDayId: string): Promise<void> {
    await pool.query(
        'DELETE FROM roster_history WHERE team_id = $1 AND matchday_id = $2',
        [teamId, matchDayId]
    );
}

/**
 * Check if roster history exists for a team and matchday
 */
export async function hasRosterHistory(teamId: string, matchDayId: string): Promise<boolean> {
    const result = await pool.query(
        'SELECT COUNT(*) as count FROM roster_history WHERE team_id = $1 AND matchday_id = $2',
        [teamId, matchDayId]
    );
    
    return parseInt(result.rows[0].count) > 0;
}

/**
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts to freeze team compositions
 * Only admin users can snapshot all teams, regular users can only snapshot their own team
 */
export async function snapshotAllTeamRosters(matchDayId: string): Promise<Map<string, RosterHistory[]>> {
    const { getTeams } = await import('./teamService');
    const teams = await getTeams();
    const allSnapshots = new Map<string, RosterHistory[]>();
    
    for (const team of teams) {
        // Convert current team roster to roster entries
        const rosterEntries: RosterEntry[] = team.players.map((player: Player) => ({
            playerId: player.id,
            isCaptain: team.teamCaptain?.id === player.id
        }));
        
        if (rosterEntries.length > 0) {
            const snapshot = await createRosterHistory(team.id, matchDayId, rosterEntries);
            allSnapshots.set(team.id, snapshot);
        }
    }
    
    return allSnapshots;
}

/**
 * Get all roster histories (for debugging/admin purposes)
 */
export async function getAllRosterHistories(): Promise<RosterHistory[]> {
    const result = await pool.query(
        'SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history ORDER BY created_at DESC'
    );
    
    return result.rows.map(row => ({
        id: row.id.toString(),
        teamId: row.team_id.toString(),
        matchDayId: row.matchday_id.toString(),
        playerId: row.player_id.toString(),
        isCaptain: row.is_captain,
        createdAt: row.created_at
    }));
}
