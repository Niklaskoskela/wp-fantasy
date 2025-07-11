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
exports.createMatchDay = createMatchDay;
exports.updatePlayerStats = updatePlayerStats;
exports.calculatePoints = calculatePoints;
exports.startMatchDay = startMatchDay;
exports.getMatchDays = getMatchDays;
exports.getPlayerStats = getPlayerStats;
const teamService_1 = require("./teamService");
const database_1 = require("../config/database");
const points_1 = require("../config/points");
function createMatchDay(title, startTime, endTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('INSERT INTO matchdays (title, start_time, end_time) VALUES ($1, $2, $3) RETURNING id, title, start_time, end_time', [title, startTime, endTime]);
        const row = result.rows[0];
        return {
            id: row.id.toString(),
            title: row.title,
            startTime: row.start_time,
            endTime: row.end_time
        };
    });
}
function updatePlayerStats(matchDayId, playerId, stats) {
    return __awaiter(this, void 0, void 0, function* () {
        const { invalidateTeamsWithScoresCache } = yield Promise.resolve().then(() => __importStar(require('./teamService')));
        try {
            const result = yield database_1.pool.query(`INSERT INTO player_stats (player_id, matchday_id, goals, assists, blocks, steals, pf_drawn, pf, balls_lost, contra_fouls, shots, swim_offs, brutality, saves, wins) 
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
             RETURNING *`, [playerId, matchDayId, stats.goals, stats.assists, stats.blocks, stats.steals,
                stats.pfDrawn, stats.pf, stats.ballsLost, stats.contraFouls, stats.shots,
                stats.swimOffs, stats.brutality, stats.saves, stats.wins]);
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
        }
        catch (error) {
            console.error('Error updating player stats:', error);
            return null;
        }
    });
}
function calculatePoints(matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        const teams = yield (0, teamService_1.getTeams)();
        const playerStats = yield getPlayerStats(matchDayId);
        const results = [];
        for (const team of teams) {
            let total = 0;
            for (const player of team.players) {
                const stats = playerStats[player.id];
                if (stats) {
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
    });
}
/**
 * Start a matchday - this snapshots all current team rosters
 * and should be called when a matchday begins
 */
function startMatchDay(matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchDay = yield getMatchDayById(matchDayId);
        if (!matchDay)
            return false;
        // Check if matchday has already started
        if (new Date() < matchDay.startTime) {
            throw new Error('Matchday has not reached its start time yet');
        }
        // Import the roster history service
        const { snapshotAllTeamRosters, hasRosterHistory } = yield Promise.resolve().then(() => __importStar(require('./rosterHistoryService')));
        // Check if rosters have already been snapshotted for this matchday
        const { getTeams } = yield Promise.resolve().then(() => __importStar(require('./teamService')));
        const teams = yield getTeams();
        // If any team already has roster history for this matchday, don't snapshot again
        const alreadySnapshotted = yield Promise.all(teams.map((team) => __awaiter(this, void 0, void 0, function* () { return yield hasRosterHistory(team.id, matchDayId); }))).then(results => results.some(result => result));
        if (!alreadySnapshotted) {
            // Snapshot all team rosters for this matchday
            yield snapshotAllTeamRosters(matchDayId);
            console.log(`Rosters snapshotted for matchday ${matchDay.title} (${matchDayId})`);
        }
        else {
            console.log(`Rosters already snapshotted for matchday ${matchDay.title} (${matchDayId})`);
        }
        return true;
    });
}
/**
 * Get a specific matchday by ID
 */
function getMatchDayById(matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield database_1.pool.query('SELECT id, title, start_time, end_time FROM matchdays WHERE id = $1', [matchDayId]);
            if (result.rows.length === 0)
                return null;
            const row = result.rows[0];
            return {
                id: row.id.toString(),
                title: row.title,
                startTime: row.start_time,
                endTime: row.end_time
            };
        }
        catch (error) {
            console.error('Error getting matchday by ID:', error);
            return null;
        }
    });
}
function getMatchDays() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield database_1.pool.query('SELECT id, title, start_time, end_time FROM matchdays ORDER BY start_time DESC');
            return result.rows.map(row => ({
                id: row.id.toString(),
                title: row.title,
                startTime: row.start_time,
                endTime: row.end_time
            }));
        }
        catch (error) {
            console.error('Error getting matchdays:', error);
            return [];
        }
    });
}
function getPlayerStats(matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield database_1.pool.query('SELECT * FROM player_stats WHERE matchday_id = $1', [matchDayId]);
            const statsMap = {};
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
        }
        catch (error) {
            console.error('Error getting player stats:', error);
            return {};
        }
    });
}
//# sourceMappingURL=matchDayService.js.map