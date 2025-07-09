// Service for managing teams: create, update players, set captain
import { Team, Player, MatchDay, UserRole } from '../../../shared/dist/types';
import { pool } from '../config/database';

export async function createTeam(teamName: string, ownerId: string): Promise<Team> {
    // Check if user already has a team
    const existingTeamCheck = await pool.query(
        'SELECT id FROM teams WHERE EXISTS (SELECT 1 FROM users WHERE users.id = $1 AND users.team_id = teams.id)',
        [ownerId]
    );
    
    if (existingTeamCheck.rows.length > 0) {
        throw new Error('User already has a team');
    }

    // Create team
    const teamResult = await pool.query(
        'INSERT INTO teams (team_name) VALUES ($1) RETURNING id, team_name',
        [teamName]
    );
    
    const teamRow = teamResult.rows[0];
    
    // Update user's team_id
    await pool.query(
        'UPDATE users SET team_id = $1 WHERE id = $2',
        [teamRow.id, ownerId]
    );
    
    return {
        id: teamRow.id.toString(),
        teamName: teamRow.team_name,
        players: [],
        scoreHistory: new Map<MatchDay, number>()
    };
}

export async function addPlayerToTeam(teamId: string, player: Player, userId: string, userRole: UserRole): Promise<Team | null> {
    // Check team ownership
    const teamCheck = await pool.query(
        'SELECT t.id, t.team_name FROM teams t JOIN users u ON u.team_id = t.id WHERE t.id = $1 AND ($2 = $3 OR u.id = $4)',
        [teamId, userRole, UserRole.ADMIN, userId]
    );
    
    if (teamCheck.rows.length === 0) {
        if (userRole !== UserRole.ADMIN) {
            throw new Error('You can only modify your own team');
        }
        // Admin can modify any team, check if team exists
        const teamExistsCheck = await pool.query('SELECT id, team_name FROM teams WHERE id = $1', [teamId]);
        if (teamExistsCheck.rows.length === 0) {
            return null;
        }
    }
    
    // Check team player count
    const playerCountCheck = await pool.query(
        'SELECT COUNT(*) as count FROM team_players WHERE team_id = $1',
        [teamId]
    );
    
    if (parseInt(playerCountCheck.rows[0].count) >= 6) {
        throw new Error('Team already has 6 players');
    }
    
    // Check if team already has a goalkeeper
    if (player.position === 'goalkeeper') {
        const goalkeeperCheck = await pool.query(
            'SELECT COUNT(*) as count FROM team_players tp JOIN players p ON tp.player_id = p.id WHERE tp.team_id = $1 AND p.position = $2',
            [teamId, 'goalkeeper']
        );
        
        if (parseInt(goalkeeperCheck.rows[0].count) > 0) {
            throw new Error('Team already has a goalkeeper');
        }
    }
    
    // Add player to team
    await pool.query(
        'INSERT INTO team_players (team_id, player_id) VALUES ($1, $2)',
        [teamId, player.id]
    );
    
    return getTeamById(teamId);
}

export async function removePlayerFromTeam(teamId: string, playerId: string, userId: string, userRole: UserRole): Promise<Team | null> {
    // Check team ownership
    const teamCheck = await pool.query(
        'SELECT t.id, t.team_name FROM teams t JOIN users u ON u.team_id = t.id WHERE t.id = $1 AND ($2 = $3 OR u.id = $4)',
        [teamId, userRole, UserRole.ADMIN, userId]
    );
    
    if (teamCheck.rows.length === 0) {
        if (userRole !== UserRole.ADMIN) {
            throw new Error('You can only modify your own team');
        }
        // Admin can modify any team, check if team exists
        const teamExistsCheck = await pool.query('SELECT id, team_name FROM teams WHERE id = $1', [teamId]);
        if (teamExistsCheck.rows.length === 0) {
            return null;
        }
    }
    
    // Remove player from team
    await pool.query(
        'DELETE FROM team_players WHERE team_id = $1 AND player_id = $2',
        [teamId, playerId]
    );
    
    // Remove captain if this player was the captain
    await pool.query(
        'UPDATE team_players SET is_captain = FALSE WHERE team_id = $1 AND player_id = $2',
        [teamId, playerId]
    );
    
    return getTeamById(teamId);
}

export async function setTeamCaptain(teamId: string, playerId: string, userId: string, userRole: UserRole): Promise<Team | null> {
    // Check team ownership
    const teamCheck = await pool.query(
        'SELECT t.id, t.team_name FROM teams t JOIN users u ON u.team_id = t.id WHERE t.id = $1 AND ($2 = $3 OR u.id = $4)',
        [teamId, userRole, UserRole.ADMIN, userId]
    );
    
    if (teamCheck.rows.length === 0) {
        if (userRole !== UserRole.ADMIN) {
            throw new Error('You can only modify your own team');
        }
        // Admin can modify any team, check if team exists
        const teamExistsCheck = await pool.query('SELECT id, team_name FROM teams WHERE id = $1', [teamId]);
        if (teamExistsCheck.rows.length === 0) {
            return null;
        }
    }
    
    // Check if player is in team
    const playerCheck = await pool.query(
        'SELECT COUNT(*) as count FROM team_players WHERE team_id = $1 AND player_id = $2',
        [teamId, playerId]
    );
    
    if (parseInt(playerCheck.rows[0].count) === 0) {
        throw new Error('Player not in team');
    }
    
    // Clear existing captain
    await pool.query(
        'UPDATE team_players SET is_captain = FALSE WHERE team_id = $1',
        [teamId]
    );
    
    // Set new captain
    await pool.query(
        'UPDATE team_players SET is_captain = TRUE WHERE team_id = $1 AND player_id = $2',
        [teamId, playerId]
    );
    
    return getTeamById(teamId);
}

async function getTeamById(teamId: string): Promise<Team | null> {
    const teamResult = await pool.query(
        'SELECT id, team_name FROM teams WHERE id = $1',
        [teamId]
    );
    
    if (teamResult.rows.length === 0) return null;
    
    const teamRow = teamResult.rows[0];
    
    // Get team players
    const playersResult = await pool.query(
        `SELECT p.id, p.name, p.position, p.club_id, c.name as club_name, tp.is_captain
         FROM team_players tp 
         JOIN players p ON tp.player_id = p.id 
         JOIN clubs c ON p.club_id = c.id 
         WHERE tp.team_id = $1`,
        [teamId]
    );
    
    const players = playersResult.rows.map(row => ({
        id: row.id.toString(),
        name: row.name,
        position: row.position,
        club: {
            id: row.club_id.toString(),
            name: row.club_name
        },
        statsHistory: new Map()
    }));
    
    const captain = playersResult.rows.find(row => row.is_captain);
    
    return {
        id: teamRow.id.toString(),
        teamName: teamRow.team_name,
        players,
        teamCaptain: captain ? {
            id: captain.id.toString(),
            name: captain.name,
            position: captain.position,
            club: {
                id: captain.club_id.toString(),
                name: captain.club_name
            },
            statsHistory: new Map()
        } : undefined,
        scoreHistory: new Map<MatchDay, number>()
    };
}

export async function getTeams(userId?: string, userRole?: UserRole): Promise<Team[]> {
    const teamsResult = await pool.query(
        'SELECT id, team_name FROM teams ORDER BY team_name'
    );
    
    const teams: Team[] = [];
    
    for (const teamRow of teamsResult.rows) {
        const team = await getTeamById(teamRow.id.toString());
        if (team) {
            teams.push(team);
        }
    }
    
    return teams;
}

export async function getUserTeam(userId: string): Promise<Team | null> {
    const result = await pool.query(
        'SELECT team_id FROM users WHERE id = $1',
        [userId]
    );
    
    if (result.rows.length === 0 || !result.rows[0].team_id) {
        return null;
    }
    
    return getTeamById(result.rows[0].team_id.toString());
}

export async function getTeamsWithScores(userId?: string, userRole?: UserRole): Promise<any[]> {
    const { getMatchDays, calculatePoints } = require('./matchDayService');
    const allMatchDays = await getMatchDays();
    const userTeams = await getTeams();
    
    const teamsWithScores = [];
    
    for (const team of userTeams) {
        let totalPoints = 0;
        const matchDayScores: { matchDayId: string; matchDayTitle: string; points: number }[] = [];
        
        // Calculate points for each match day
        for (const matchDay of allMatchDays) {
            const matchDayResults: { teamId: string; points: number }[] = await calculatePoints(matchDay.id);
            const teamResult = matchDayResults.find((result: { teamId: string; points: number }) => result.teamId === team.id);
            const points = teamResult ? teamResult.points : 0;
            
            totalPoints += points;
            matchDayScores.push({
                matchDayId: matchDay.id,
                matchDayTitle: matchDay.title,
                points
            });
        }
        
        teamsWithScores.push({
            ...team,
            totalPoints,
            matchDayScores
        });
    }
    
    return teamsWithScores;
}
