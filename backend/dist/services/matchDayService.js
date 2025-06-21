"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchDay = createMatchDay;
exports.updatePlayerStats = updatePlayerStats;
exports.calculatePoints = calculatePoints;
exports.startMatchDay = startMatchDay;
exports.getMatchDays = getMatchDays;
exports.getPlayerStats = getPlayerStats;
const uuid_1 = require("uuid");
const teamService_1 = require("./teamService");
// In-memory stores
const matchDays = [];
const playerStats = {}; // matchDayId -> playerId -> stats
function createMatchDay(title, startTime, endTime) {
    const matchDay = {
        id: (0, uuid_1.v4)(),
        title,
        startTime,
        endTime
    };
    matchDays.push(matchDay);
    playerStats[matchDay.id] = {};
    return matchDay;
}
function updatePlayerStats(matchDayId, playerId, stats) {
    if (!playerStats[matchDayId])
        return null;
    playerStats[matchDayId][playerId] = stats;
    return stats;
}
function calculatePoints(matchDayId) {
    var _a;
    const teams = (0, teamService_1.getTeams)();
    const results = [];
    for (const team of teams) {
        let total = 0;
        for (const player of team.players) {
            const stats = (_a = playerStats[matchDayId]) === null || _a === void 0 ? void 0 : _a[player.id];
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
/**
 * Start a matchday - this snapshots all current team rosters
 * and should be called when a matchday begins
 */
function startMatchDay(matchDayId) {
    const matchDay = matchDays.find(md => md.id === matchDayId);
    if (!matchDay)
        return false;
    // Check if matchday has already started
    if (new Date() < matchDay.startTime) {
        throw new Error('Matchday has not reached its start time yet');
    }
    // Import the roster history service
    const { snapshotAllTeamRosters, hasRosterHistory } = require('./rosterHistoryService');
    // Check if rosters have already been snapshotted for this matchday
    const { getTeams } = require('./teamService');
    const teams = getTeams();
    // If any team already has roster history for this matchday, don't snapshot again
    const alreadySnapshotted = teams.some((team) => hasRosterHistory(team.id, matchDayId));
    if (!alreadySnapshotted) {
        // Snapshot all team rosters for this matchday
        snapshotAllTeamRosters(matchDayId);
        console.log(`Rosters snapshotted for matchday ${matchDay.title} (${matchDayId})`);
    }
    else {
        console.log(`Rosters already snapshotted for matchday ${matchDay.title} (${matchDayId})`);
    }
    return true;
}
function getMatchDays() {
    return matchDays;
}
function getPlayerStats(matchDayId) {
    return playerStats[matchDayId] || {};
}
//# sourceMappingURL=matchDayService.js.map