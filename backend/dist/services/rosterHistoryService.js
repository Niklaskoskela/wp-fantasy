"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRosterHistory = createRosterHistory;
exports.getRosterHistory = getRosterHistory;
exports.getTeamRosterHistory = getTeamRosterHistory;
exports.getMatchDayRosterHistory = getMatchDayRosterHistory;
exports.removeRosterHistory = removeRosterHistory;
exports.hasRosterHistory = hasRosterHistory;
exports.snapshotAllTeamRosters = snapshotAllTeamRosters;
exports.getAllRosterHistories = getAllRosterHistories;
const uuid_1 = require("uuid");
// In-memory store for demo (replace with DB integration in production)
const rosterHistories = [];
/**
 * Create roster history entries for a team on a specific matchday
 * This snapshots the current team composition when a matchday starts
 */
function createRosterHistory(teamId, matchDayId, rosterEntries) {
    // First, remove any existing roster history for this team/matchday combination
    // This allows updating the roster if needed before matchday starts
    removeRosterHistory(teamId, matchDayId);
    const newRosterEntries = [];
    for (const entry of rosterEntries) {
        const rosterHistory = {
            id: (0, uuid_1.v4)(),
            teamId,
            matchDayId,
            playerId: entry.playerId,
            isCaptain: entry.isCaptain,
            createdAt: new Date()
        };
        rosterHistories.push(rosterHistory);
        newRosterEntries.push(rosterHistory);
    }
    return newRosterEntries;
}
/**
 * Get roster history for a specific team and matchday
 */
function getRosterHistory(teamId, matchDayId) {
    return rosterHistories.filter(rh => rh.teamId === teamId && rh.matchDayId === matchDayId);
}
/**
 * Get all roster history for a specific team across all matchdays
 */
function getTeamRosterHistory(teamId) {
    const teamRosterHistory = rosterHistories.filter(rh => rh.teamId === teamId);
    const historyMap = new Map();
    for (const history of teamRosterHistory) {
        if (!historyMap.has(history.matchDayId)) {
            historyMap.set(history.matchDayId, []);
        }
        historyMap.get(history.matchDayId).push(history);
    }
    return historyMap;
}
/**
 * Get all roster history for a specific matchday across all teams
 */
function getMatchDayRosterHistory(matchDayId) {
    const matchDayRosterHistory = rosterHistories.filter(rh => rh.matchDayId === matchDayId);
    const historyMap = new Map();
    for (const history of matchDayRosterHistory) {
        if (!historyMap.has(history.teamId)) {
            historyMap.set(history.teamId, []);
        }
        historyMap.get(history.teamId).push(history);
    }
    return historyMap;
}
/**
 * Remove roster history for a specific team and matchday
 * Useful for updating rosters before matchday starts
 */
function removeRosterHistory(teamId, matchDayId) {
    const indicesToRemove = [];
    rosterHistories.forEach((rh, index) => {
        if (rh.teamId === teamId && rh.matchDayId === matchDayId) {
            indicesToRemove.push(index);
        }
    });
    // Remove in reverse order to maintain correct indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        rosterHistories.splice(indicesToRemove[i], 1);
    }
}
/**
 * Check if roster history exists for a team and matchday
 */
function hasRosterHistory(teamId, matchDayId) {
    return rosterHistories.some(rh => rh.teamId === teamId && rh.matchDayId === matchDayId);
}
/**
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts to freeze team compositions
 * Only admin users can snapshot all teams, regular users can only snapshot their own team
 */
function snapshotAllTeamRosters(matchDayId, userId, userRole) {
    const { getTeams } = require('./teamService');
    const teams = getTeams(userId, userRole);
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
            const snapshot = createRosterHistory(team.id, matchDayId, rosterEntries);
            allSnapshots.set(team.id, snapshot);
        }
    }
    return allSnapshots;
}
/**
 * Get all roster histories (for debugging/admin purposes)
 */
function getAllRosterHistories() {
    return [...rosterHistories];
}
//# sourceMappingURL=rosterHistoryService.js.map