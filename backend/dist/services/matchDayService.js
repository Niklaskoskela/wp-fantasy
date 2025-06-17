"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchDay = createMatchDay;
exports.updatePlayerStats = updatePlayerStats;
exports.calculatePoints = calculatePoints;
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
function getMatchDays() {
    return matchDays;
}
function getPlayerStats(matchDayId) {
    return playerStats[matchDayId] || {};
}
//# sourceMappingURL=matchDayService.js.map