"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeam = createTeam;
exports.addPlayerToTeam = addPlayerToTeam;
exports.removePlayerFromTeam = removePlayerFromTeam;
exports.setTeamCaptain = setTeamCaptain;
exports.getTeams = getTeams;
exports.getUserTeam = getUserTeam;
exports.getTeamsWithScores = getTeamsWithScores;
// Service for managing teams: create, update players, set captain
const types_1 = require("../../../shared/dist/types");
const uuid_1 = require("uuid");
// In-memory store for demo (replace with DB in production)
const teams = [];
function createTeam(teamName, ownerId) {
    // Check if user already has a team
    const existingTeam = teams.find(t => t.ownerId === ownerId);
    if (existingTeam) {
        throw new Error('User already has a team');
    }
    const newTeam = {
        id: (0, uuid_1.v4)(),
        teamName,
        players: [],
        scoreHistory: new Map(),
        ownerId
    };
    teams.push(newTeam);
    // Return team without ownerId for API response
    const { ownerId: _ } = newTeam, teamResponse = __rest(newTeam, ["ownerId"]);
    return teamResponse;
}
function addPlayerToTeam(teamId, player, userId, userRole) {
    const team = teams.find((t) => t.id === teamId);
    if (!team)
        return null;
    // Check ownership (admin can modify any team)
    if (userRole !== types_1.UserRole.ADMIN && team.ownerId !== userId) {
        throw new Error('You can only modify your own team');
    }
    if (team.players.length >= 6)
        throw new Error('Team already has 6 players');
    if (player.position === 'goalkeeper' && team.players.some((p) => p.position === 'goalkeeper')) {
        throw new Error('Team already has a goalkeeper');
    }
    team.players.push(player);
    const { ownerId: _ } = team, teamResponse = __rest(team, ["ownerId"]);
    return teamResponse;
}
function removePlayerFromTeam(teamId, playerId, userId, userRole) {
    const team = teams.find((t) => t.id === teamId);
    if (!team)
        return null;
    // Check ownership (admin can modify any team)
    if (userRole !== types_1.UserRole.ADMIN && team.ownerId !== userId) {
        throw new Error('You can only modify your own team');
    }
    team.players = team.players.filter((p) => p.id !== playerId);
    if (team.teamCaptain && team.teamCaptain.id === playerId) {
        team.teamCaptain = undefined;
    }
    const { ownerId: _ } = team, teamResponse = __rest(team, ["ownerId"]);
    return teamResponse;
}
function setTeamCaptain(teamId, playerId, userId, userRole) {
    const team = teams.find((t) => t.id === teamId);
    if (!team)
        return null;
    // Check ownership (admin can modify any team)
    if (userRole !== types_1.UserRole.ADMIN && team.ownerId !== userId) {
        throw new Error('You can only modify your own team');
    }
    const player = team.players.find((p) => p.id === playerId);
    if (!player)
        throw new Error('Player not in team');
    team.teamCaptain = player;
    const { ownerId: _ } = team, teamResponse = __rest(team, ["ownerId"]);
    return teamResponse;
}
function getTeams(userId, userRole) {
    // Admin can see all teams
    if (userRole === types_1.UserRole.ADMIN) {
        return teams.map(team => {
            const { ownerId: _ } = team, teamResponse = __rest(team, ["ownerId"]);
            return teamResponse;
        });
    }
    // Regular users can only see their own team
    if (userId) {
        const userTeams = teams.filter(t => t.ownerId === userId);
        return userTeams.map(team => {
            const { ownerId: _ } = team, teamResponse = __rest(team, ["ownerId"]);
            return teamResponse;
        });
    }
    return [];
}
function getUserTeam(userId) {
    const team = teams.find(t => t.ownerId === userId);
    if (!team)
        return null;
    const { ownerId: _ } = team, teamResponse = __rest(team, ["ownerId"]);
    return teamResponse;
}
function getTeamsWithScores(userId, userRole) {
    const { getMatchDays, calculatePoints } = require('./matchDayService');
    const allMatchDays = getMatchDays();
    const userTeams = getTeams(userId, userRole);
    return userTeams.map(team => {
        let totalPoints = 0;
        const matchDayScores = [];
        // Calculate points for each match day
        for (const matchDay of allMatchDays) {
            const matchDayResults = calculatePoints(matchDay.id);
            const teamResult = matchDayResults.find((result) => result.teamId === team.id);
            const points = teamResult ? teamResult.points : 0;
            totalPoints += points;
            matchDayScores.push({
                matchDayId: matchDay.id,
                matchDayTitle: matchDay.title,
                points
            });
        }
        return Object.assign(Object.assign({}, team), { totalPoints,
            matchDayScores });
    });
}
//# sourceMappingURL=teamService.js.map