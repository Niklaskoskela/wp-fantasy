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
exports.createRosterHistory = createRosterHistory;
exports.getRosterHistory = getRosterHistory;
exports.getTeamRosterHistory = getTeamRosterHistory;
exports.getMatchDayRosterHistory = getMatchDayRosterHistory;
exports.removeRosterHistory = removeRosterHistory;
exports.hasRosterHistory = hasRosterHistory;
exports.snapshotAllTeamRosters = snapshotAllTeamRosters;
exports.getAllRosterHistories = getAllRosterHistories;
const database_1 = require("../config/database");
/**
 * Create roster history entries for a team on a specific matchday
 * This snapshots the current team composition when a matchday starts
 */
function createRosterHistory(teamId, matchDayId, rosterEntries) {
    return __awaiter(this, void 0, void 0, function* () {
        // First, remove any existing roster history for this team/matchday combination
        // This allows updating the roster if needed before matchday starts
        yield removeRosterHistory(teamId, matchDayId);
        const newRosterEntries = [];
        for (const entry of rosterEntries) {
            const result = yield database_1.pool.query('INSERT INTO roster_history (team_id, matchday_id, player_id, is_captain) VALUES ($1, $2, $3, $4) RETURNING id, team_id, matchday_id, player_id, is_captain, created_at', [teamId, matchDayId, entry.playerId, entry.isCaptain]);
            const row = result.rows[0];
            const rosterHistory = {
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
    });
}
/**
 * Get roster history for a specific team and matchday
 */
function getRosterHistory(teamId, matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history WHERE team_id = $1 AND matchday_id = $2', [teamId, matchDayId]);
        return result.rows.map(row => ({
            id: row.id.toString(),
            teamId: row.team_id.toString(),
            matchDayId: row.matchday_id.toString(),
            playerId: row.player_id.toString(),
            isCaptain: row.is_captain,
            createdAt: row.created_at
        }));
    });
}
/**
 * Get all roster history for a specific team across all matchdays
 */
function getTeamRosterHistory(teamId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history WHERE team_id = $1', [teamId]);
        const historyMap = new Map();
        for (const row of result.rows) {
            const rosterHistory = {
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
            historyMap.get(rosterHistory.matchDayId).push(rosterHistory);
        }
        return historyMap;
    });
}
/**
 * Get all roster history for a specific matchday across all teams
 */
function getMatchDayRosterHistory(matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history WHERE matchday_id = $1', [matchDayId]);
        const historyMap = new Map();
        for (const row of result.rows) {
            const rosterHistory = {
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
            historyMap.get(rosterHistory.teamId).push(rosterHistory);
        }
        return historyMap;
    });
}
/**
 * Remove roster history for a specific team and matchday
 * Useful for updating rosters before matchday starts
 */
function removeRosterHistory(teamId, matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.pool.query('DELETE FROM roster_history WHERE team_id = $1 AND matchday_id = $2', [teamId, matchDayId]);
    });
}
/**
 * Check if roster history exists for a team and matchday
 */
function hasRosterHistory(teamId, matchDayId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT COUNT(*) as count FROM roster_history WHERE team_id = $1 AND matchday_id = $2', [teamId, matchDayId]);
        return parseInt(result.rows[0].count) > 0;
    });
}
/**
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts to freeze team compositions
 * Only admin users can snapshot all teams, regular users can only snapshot their own team
 */
function snapshotAllTeamRosters(matchDayId, userId, userRole) {
    return __awaiter(this, void 0, void 0, function* () {
        const { getTeams } = require('./teamService');
        const teams = yield getTeams(userId, userRole);
        const allSnapshots = new Map();
        for (const team of teams) {
            // Convert current team roster to roster entries
            const rosterEntries = team.players.map((player) => {
                var _a;
                return ({
                    playerId: player.id,
                    isCaptain: ((_a = team.teamCaptain) === null || _a === void 0 ? void 0 : _a.id) === player.id
                });
            });
            if (rosterEntries.length > 0) {
                const snapshot = yield createRosterHistory(team.id, matchDayId, rosterEntries);
                allSnapshots.set(team.id, snapshot);
            }
        }
        return allSnapshots;
    });
}
/**
 * Get all roster histories (for debugging/admin purposes)
 */
function getAllRosterHistories() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, team_id, matchday_id, player_id, is_captain, created_at FROM roster_history ORDER BY created_at DESC');
        return result.rows.map(row => ({
            id: row.id.toString(),
            teamId: row.team_id.toString(),
            matchDayId: row.matchday_id.toString(),
            playerId: row.player_id.toString(),
            isCaptain: row.is_captain,
            createdAt: row.created_at
        }));
    });
}
//# sourceMappingURL=rosterHistoryService.js.map