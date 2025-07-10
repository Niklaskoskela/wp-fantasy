"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeam = createTeam;
exports.addPlayerToTeam = addPlayerToTeam;
exports.removePlayerFromTeam = removePlayerFromTeam;
exports.setTeamCaptain = setTeamCaptain;
exports.getTeams = getTeams;
exports.getUserTeam = getUserTeam;
exports.invalidateTeamsWithScoresCache = invalidateTeamsWithScoresCache;
exports.getTeamsWithScores = getTeamsWithScores;
// Service for managing teams: create, update players, set captain
const types_1 = require("../../../shared/dist/types");
const database_1 = require("../config/database");
function createTeam(teamName, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if user already has a team
        const existingTeamCheck = yield database_1.pool.query('SELECT id FROM teams WHERE EXISTS (SELECT 1 FROM users WHERE users.id = $1 AND users.team_id = teams.id)', [ownerId]);
        if (existingTeamCheck.rows.length > 0) {
            throw new Error('User already has a team');
        }
        // Create team
        const teamResult = yield database_1.pool.query('INSERT INTO teams (team_name) VALUES ($1) RETURNING id, team_name', [teamName]);
        const teamRow = teamResult.rows[0];
        // Update user's team_id
        yield database_1.pool.query('UPDATE users SET team_id = $1 WHERE id = $2', [teamRow.id, ownerId]);
        return {
            id: teamRow.id.toString(),
            teamName: teamRow.team_name,
            players: [],
            scoreHistory: new Map(),
            ownerId
        };
    });
}
function addPlayerToTeam(teamId, player, userId, userRole) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check team ownership
        const teamCheck = yield database_1.pool.query('SELECT t.id, t.team_name FROM teams t JOIN users u ON u.team_id = t.id WHERE t.id = $1 AND ($2 = $3 OR u.id = $4)', [teamId, userRole, types_1.UserRole.ADMIN, userId]);
        if (teamCheck.rows.length === 0) {
            if (userRole !== types_1.UserRole.ADMIN) {
                throw new Error('You can only modify your own team');
            }
            // Admin can modify any team, check if team exists
            const teamExistsCheck = yield database_1.pool.query('SELECT id, team_name FROM teams WHERE id = $1', [teamId]);
            if (teamExistsCheck.rows.length === 0) {
                return null;
            }
        }
        // Check team player count
        const playerCountCheck = yield database_1.pool.query('SELECT COUNT(*) as count FROM team_players WHERE team_id = $1', [teamId]);
        if (parseInt(playerCountCheck.rows[0].count) >= 7) {
            throw new Error('Team already has 7 players');
        }
        // Check if team already has a goalkeeper
        if (player.position === 'goalkeeper') {
            const goalkeeperCheck = yield database_1.pool.query('SELECT COUNT(*) as count FROM team_players tp JOIN players p ON tp.player_id = p.id WHERE tp.team_id = $1 AND p.position = $2', [teamId, 'goalkeeper']);
            if (parseInt(goalkeeperCheck.rows[0].count) > 0) {
                throw new Error('Team already has a goalkeeper');
            }
        }
        // Add player to team
        yield database_1.pool.query('INSERT INTO team_players (team_id, player_id) VALUES ($1, $2)', [teamId, player.id]);
        // Invalidate caches since team composition changed
        invalidateTeamsWithScoresCache();
        // Also invalidate player caches if they exist
        try {
            const { PlayerService } = require('./playerService');
            PlayerService.invalidatePlayerCaches();
        }
        catch (e) {
            // Ignore if PlayerService is not available
        }
        return getTeamById(teamId);
    });
}
function removePlayerFromTeam(teamId, playerId, userId, userRole) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check team ownership
        const teamCheck = yield database_1.pool.query('SELECT t.id, t.team_name FROM teams t JOIN users u ON u.team_id = t.id WHERE t.id = $1 AND ($2 = $3 OR u.id = $4)', [teamId, userRole, types_1.UserRole.ADMIN, userId]);
        if (teamCheck.rows.length === 0) {
            if (userRole !== types_1.UserRole.ADMIN) {
                throw new Error('You can only modify your own team');
            }
            // Admin can modify any team, check if team exists
            const teamExistsCheck = yield database_1.pool.query('SELECT id, team_name FROM teams WHERE id = $1', [teamId]);
            if (teamExistsCheck.rows.length === 0) {
                return null;
            }
        }
        // Remove player from team
        yield database_1.pool.query('DELETE FROM team_players WHERE team_id = $1 AND player_id = $2', [teamId, playerId]);
        // Remove captain if this player was the captain
        yield database_1.pool.query('UPDATE team_players SET is_captain = FALSE WHERE team_id = $1 AND player_id = $2', [teamId, playerId]);
        // Invalidate cache since team composition changed
        invalidateTeamsWithScoresCache();
        // Also invalidate player caches if they exist
        try {
            const { PlayerService } = require('./playerService');
            PlayerService.invalidatePlayerCaches();
        }
        catch (e) {
            // Ignore if PlayerService is not available
        }
        return getTeamById(teamId);
    });
}
function setTeamCaptain(teamId, playerId, userId, userRole) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check team ownership
        const teamCheck = yield database_1.pool.query('SELECT t.id, t.team_name FROM teams t JOIN users u ON u.team_id = t.id WHERE t.id = $1 AND ($2 = $3 OR u.id = $4)', [teamId, userRole, types_1.UserRole.ADMIN, userId]);
        if (teamCheck.rows.length === 0) {
            if (userRole !== types_1.UserRole.ADMIN) {
                throw new Error('You can only modify your own team');
            }
            // Admin can modify any team, check if team exists
            const teamExistsCheck = yield database_1.pool.query('SELECT id, team_name FROM teams WHERE id = $1', [teamId]);
            if (teamExistsCheck.rows.length === 0) {
                return null;
            }
        }
        // Check if player is in team
        const playerCheck = yield database_1.pool.query('SELECT COUNT(*) as count FROM team_players WHERE team_id = $1 AND player_id = $2', [teamId, playerId]);
        if (parseInt(playerCheck.rows[0].count) === 0) {
            throw new Error('Player not in team');
        }
        // Clear existing captain
        yield database_1.pool.query('UPDATE team_players SET is_captain = FALSE WHERE team_id = $1', [teamId]);
        // Set new captain
        yield database_1.pool.query('UPDATE team_players SET is_captain = TRUE WHERE team_id = $1 AND player_id = $2', [teamId, playerId]);
        // Invalidate cache since team captain changed
        invalidateTeamsWithScoresCache();
        return getTeamById(teamId);
    });
}
function getTeamById(teamId) {
    return __awaiter(this, void 0, void 0, function* () {
        const teamResult = yield database_1.pool.query('SELECT id, team_name FROM teams WHERE id = $1', [teamId]);
        if (teamResult.rows.length === 0)
            return null;
        const teamRow = teamResult.rows[0];
        // Get team owner (user who has this team_id)
        const ownerResult = yield database_1.pool.query('SELECT id FROM users WHERE team_id = $1', [teamId]);
        const ownerId = ownerResult.rows.length > 0 ? ownerResult.rows[0].id.toString() : undefined;
        // Get team players
        const playersResult = yield database_1.pool.query(`SELECT p.id, p.name, p.position, p.club_id, c.name as club_name, tp.is_captain
         FROM team_players tp 
         JOIN players p ON tp.player_id = p.id 
         JOIN clubs c ON p.club_id = c.id 
         WHERE tp.team_id = $1`, [teamId]);
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
            scoreHistory: new Map(),
            ownerId
        };
    });
}
function getTeams(userId, userRole) {
    return __awaiter(this, void 0, void 0, function* () {
        const teamsResult = yield database_1.pool.query('SELECT id, team_name FROM teams ORDER BY team_name');
        const teams = [];
        for (const teamRow of teamsResult.rows) {
            const team = yield getTeamById(teamRow.id.toString());
            if (team) {
                teams.push(team);
            }
        }
        return teams;
    });
}
function getUserTeam(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT team_id FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0 || !result.rows[0].team_id) {
            return null;
        }
        return getTeamById(result.rows[0].team_id.toString());
    });
}
let teamsWithScoresCache = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
// Function to invalidate cache when teams or stats change
function invalidateTeamsWithScoresCache() {
    teamsWithScoresCache = null;
}
function getTeamsWithScores(userId, userRole) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check cache first
        if (teamsWithScoresCache && Date.now() - teamsWithScoresCache.timestamp < CACHE_DURATION) {
            return teamsWithScoresCache.data;
        }
        const { getMatchDays } = require('./matchDayService');
        const allMatchDays = yield getMatchDays();
        // Get all teams with their data in one optimized query
        const teamsResult = yield database_1.pool.query(`
        SELECT 
            t.id as team_id,
            t.team_name,
            u.id as owner_id,
            p.id as player_id,
            p.name as player_name,
            p.position,
            c.id as club_id,
            c.name as club_name,
            tp.is_captain
        FROM teams t
        LEFT JOIN users u ON u.team_id = t.id
        LEFT JOIN team_players tp ON tp.team_id = t.id
        LEFT JOIN players p ON p.id = tp.player_id
        LEFT JOIN clubs c ON c.id = p.club_id
        ORDER BY t.team_name, p.name
    `);
        // Get all player stats for all match days in one query
        const statsResult = yield database_1.pool.query(`
        SELECT 
            ps.player_id,
            ps.matchday_id,
            ps.goals,
            ps.assists,
            ps.blocks,
            ps.steals,
            ps.pf_drawn,
            ps.pf,
            ps.balls_lost,
            ps.contra_fouls,
            ps.shots,
            ps.swim_offs,
            ps.brutality,
            ps.saves,
            ps.wins
        FROM player_stats ps
        WHERE ps.matchday_id = ANY($1)
    `, [allMatchDays.map((md) => md.id)]);
        // Build stats lookup map
        const statsMap = {};
        statsResult.rows.forEach(row => {
            const key = `${row.player_id}_${row.matchday_id}`;
            statsMap[key] = {
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
        });
        // Build teams map from the result
        const teamsMap = {};
        teamsResult.rows.forEach(row => {
            const teamId = row.team_id.toString();
            if (!teamsMap[teamId]) {
                teamsMap[teamId] = {
                    id: teamId,
                    teamName: row.team_name,
                    players: [],
                    teamCaptain: undefined,
                    scoreHistory: new Map(),
                    ownerId: row.owner_id,
                    totalPoints: 0,
                    matchDayScores: []
                };
            }
            if (row.player_id) {
                const player = {
                    id: row.player_id.toString(),
                    name: row.player_name,
                    position: row.position,
                    club: {
                        id: row.club_id.toString(),
                        name: row.club_name
                    },
                    statsHistory: new Map()
                };
                teamsMap[teamId].players.push(player);
                if (row.is_captain) {
                    teamsMap[teamId].teamCaptain = player;
                }
            }
        });
        // Calculate scores for all teams and match days
        const teamsWithScores = Object.values(teamsMap).map(team => {
            let totalPoints = 0;
            const matchDayScores = [];
            // Calculate points for each match day
            for (const matchDay of allMatchDays) {
                let matchDayPoints = 0;
                for (const player of team.players) {
                    const statsKey = `${player.id}_${matchDay.id}`;
                    const stats = statsMap[statsKey];
                    if (stats) {
                        // Simple scoring: goals*5 + assists*3 + blocks*2 + steals*2
                        const basePoints = stats.goals * 5 + stats.assists * 3 + stats.blocks * 2 + stats.steals * 2;
                        matchDayPoints += basePoints;
                        // Captain gets double points
                        if (team.teamCaptain && team.teamCaptain.id === player.id) {
                            matchDayPoints += basePoints;
                        }
                    }
                }
                totalPoints += matchDayPoints;
                matchDayScores.push({
                    matchDayId: matchDay.id,
                    matchDayTitle: matchDay.title,
                    points: matchDayPoints
                });
            }
            return Object.assign(Object.assign({}, team), { totalPoints,
                matchDayScores });
        });
        // Cache the result
        teamsWithScoresCache = {
            data: teamsWithScores,
            timestamp: Date.now()
        };
        return teamsWithScores;
    });
}
//# sourceMappingURL=teamService.js.map