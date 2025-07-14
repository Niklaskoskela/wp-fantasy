"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const points_1 = require("../config/points");
const playerService_1 = require("./playerService");
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
            playerService_1.PlayerService.invalidatePlayerCaches();
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
            playerService_1.PlayerService.invalidatePlayerCaches();
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
        // Single optimized query to get all team data at once
        const result = yield database_1.pool.query(`SELECT 
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
         WHERE t.id = $1`, [teamId]);
        if (result.rows.length === 0)
            return null;
        const firstRow = result.rows[0];
        const ownerId = firstRow.owner_id ? firstRow.owner_id.toString() : undefined;
        // Process the result to build players array and identify captain
        const players = result.rows
            .filter(row => row.player_id) // Only include rows with players
            .map(row => ({
            id: row.player_id.toString(),
            name: row.player_name,
            position: row.position,
            club: {
                id: row.club_id.toString(),
                name: row.club_name
            },
            statsHistory: new Map()
        }));
        const captain = result.rows.find(row => row.is_captain && row.player_id);
        return {
            id: firstRow.team_id.toString(),
            teamName: firstRow.team_name,
            players,
            teamCaptain: captain ? {
                id: captain.player_id.toString(),
                name: captain.player_name,
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
function getTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        // Single optimized query to get all teams and their data at once
        const result = yield database_1.pool.query(`SELECT 
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
         ORDER BY t.team_name, p.name`);
        // Build teams map from the result
        const teamsMap = {};
        result.rows.forEach(row => {
            const teamId = row.team_id.toString();
            if (!teamsMap[teamId]) {
                teamsMap[teamId] = {
                    id: teamId,
                    teamName: row.team_name,
                    players: [],
                    teamCaptain: undefined,
                    scoreHistory: new Map(),
                    ownerId: row.owner_id ? row.owner_id.toString() : undefined
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
        return Object.values(teamsMap);
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
function getTeamsWithScores() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check cache first
        if (teamsWithScoresCache && Date.now() - teamsWithScoresCache.timestamp < CACHE_DURATION) {
            return teamsWithScoresCache.data;
        }
        const { getMatchDays } = yield Promise.resolve().then(() => __importStar(require('./matchDayService')));
        const { getAllRosterHistories } = yield Promise.resolve().then(() => __importStar(require('./rosterHistoryService')));
        const allMatchDays = yield getMatchDays();
        // Get all teams with basic info
        const teamsResult = yield database_1.pool.query(`
        SELECT 
            t.id as team_id,
            t.team_name,
            u.id as owner_id
        FROM teams t
        LEFT JOIN users u ON u.team_id = t.id
        ORDER BY t.team_name
    `);
        // Get all roster histories
        const allRosterHistories = yield getAllRosterHistories();
        // Group roster histories by team and matchday
        const rosterHistoryMap = {};
        allRosterHistories.forEach(roster => {
            if (!rosterHistoryMap[roster.teamId]) {
                rosterHistoryMap[roster.teamId] = {};
            }
            if (!rosterHistoryMap[roster.teamId][roster.matchDayId]) {
                rosterHistoryMap[roster.teamId][roster.matchDayId] = [];
            }
            rosterHistoryMap[roster.teamId][roster.matchDayId].push(roster);
        });
        // Get all players data
        const playersResult = yield database_1.pool.query(`
        SELECT 
            p.id as player_id,
            p.name as player_name,
            p.position,
            c.id as club_id,
            c.name as club_name
        FROM players p
        LEFT JOIN clubs c ON c.id = p.club_id
    `);
        // Build players lookup map
        const playersMap = {};
        playersResult.rows.forEach(row => {
            playersMap[row.player_id.toString()] = {
                id: row.player_id.toString(),
                name: row.player_name,
                position: row.position,
                club: {
                    id: row.club_id.toString(),
                    name: row.club_name
                },
                statsHistory: new Map()
            };
        });
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
        statsResult.rows.forEach((row) => {
            var _a;
            const key = `${row.player_id}_${row.matchday_id}`;
            statsMap[key] = {
                id: ((_a = row.id) === null || _a === void 0 ? void 0 : _a.toString()) || '',
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
        // Sort matchdays by start time (earliest first) to determine order for fallback
        const sortedMatchDays = [...allMatchDays].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        const currentTime = new Date();
        // Build teams map from the result
        const teamsMap = {};
        teamsResult.rows.forEach(row => {
            const teamId = row.team_id.toString();
            teamsMap[teamId] = {
                id: teamId,
                teamName: row.team_name,
                players: [],
                teamCaptain: undefined,
                scoreHistory: new Map(),
                ownerId: row.owner_id,
                totalScore: 0,
                totalPoints: 0,
                matchDayScores: []
            };
        });
        // Calculate scores for all teams and match days using roster history
        const teamsWithScores = Object.values(teamsMap).map(team => {
            var _a, _b;
            let totalPoints = 0;
            const matchDayScores = [];
            // Calculate points for each match day using roster history
            for (const matchDay of allMatchDays) {
                let matchDayPoints = 0;
                let rosterToUse = (_a = rosterHistoryMap[team.id]) === null || _a === void 0 ? void 0 : _a[matchDay.id];
                // If no roster history exists for this matchday, find the latest past matchday with roster
                if (!rosterToUse || rosterToUse.length === 0) {
                    const pastMatchDays = sortedMatchDays.filter(md => new Date(md.startTime) <= currentTime &&
                        new Date(md.startTime) <= new Date(matchDay.startTime));
                    // Find the latest past matchday that has roster history for this team
                    for (let i = pastMatchDays.length - 1; i >= 0; i--) {
                        const pastMatchDay = pastMatchDays[i];
                        const pastRoster = (_b = rosterHistoryMap[team.id]) === null || _b === void 0 ? void 0 : _b[pastMatchDay.id];
                        if (pastRoster && pastRoster.length > 0) {
                            rosterToUse = pastRoster;
                            break;
                        }
                    }
                }
                // Calculate points using the roster
                if (rosterToUse && rosterToUse.length > 0) {
                    for (const rosterEntry of rosterToUse) {
                        const statsKey = `${rosterEntry.playerId}_${matchDay.id}`;
                        const stats = statsMap[statsKey];
                        if (stats) {
                            // Calculate points using the configuration
                            const basePoints = stats.goals * points_1.pointsConfig.goal +
                                stats.assists * points_1.pointsConfig.assist +
                                stats.blocks * points_1.pointsConfig.block +
                                stats.steals * points_1.pointsConfig.steal +
                                stats.pfDrawn * points_1.pointsConfig.pfDrawn +
                                stats.pf * points_1.pointsConfig.pf +
                                stats.ballsLost * points_1.pointsConfig.ballsLost +
                                stats.contraFouls * points_1.pointsConfig.contraFoul +
                                stats.shots * points_1.pointsConfig.shot +
                                stats.swimOffs * points_1.pointsConfig.swimOff +
                                stats.brutality * points_1.pointsConfig.brutality +
                                stats.saves * points_1.pointsConfig.save +
                                stats.wins * points_1.pointsConfig.win;
                            matchDayPoints += basePoints;
                            // Captain gets double points
                            if (rosterEntry.isCaptain) {
                                matchDayPoints += basePoints;
                            }
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
            // Get current team roster for display purposes (players and teamCaptain fields)
            const currentRoster = rosterHistoryMap[team.id];
            const latestMatchDayWithRoster = sortedMatchDays
                .reverse()
                .find(md => (currentRoster === null || currentRoster === void 0 ? void 0 : currentRoster[md.id]) && currentRoster[md.id].length > 0);
            if (latestMatchDayWithRoster && currentRoster[latestMatchDayWithRoster.id]) {
                const latestRoster = currentRoster[latestMatchDayWithRoster.id];
                const players = latestRoster.map(rosterEntry => playersMap[rosterEntry.playerId]).filter(Boolean);
                const captain = latestRoster.find(entry => entry.isCaptain);
                const teamCaptain = captain ? playersMap[captain.playerId] : undefined;
                return Object.assign(Object.assign({}, team), { players,
                    teamCaptain,
                    totalPoints,
                    matchDayScores });
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