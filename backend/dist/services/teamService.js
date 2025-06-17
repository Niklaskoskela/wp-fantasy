"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeam = createTeam;
exports.addPlayerToTeam = addPlayerToTeam;
exports.removePlayerFromTeam = removePlayerFromTeam;
exports.setTeamCaptain = setTeamCaptain;
exports.getTeams = getTeams;
exports.getTeamsWithScores = getTeamsWithScores;
const uuid_1 = require("uuid");
// In-memory store for demo (replace with DB in production)
const teams = [];
function createTeam(teamName) {
    const newTeam = {
        id: (0, uuid_1.v4)(),
        teamName,
        players: [],
        scoreHistory: new Map()
    };
    teams.push(newTeam);
    return newTeam;
}
function addPlayerToTeam(teamId, player) {
    const team = teams.find((t) => t.id === teamId);
    if (!team)
        return null;
    if (team.players.length >= 6)
        throw new Error('Team already has 6 players');
    if (player.position === 'goalkeeper' && team.players.some((p) => p.position === 'goalkeeper')) {
        throw new Error('Team already has a goalkeeper');
    }
    team.players.push(player);
    return team;
}
function removePlayerFromTeam(teamId, playerId) {
    const team = teams.find((t) => t.id === teamId);
    if (!team)
        return null;
    team.players = team.players.filter((p) => p.id !== playerId);
    if (team.teamCaptain && team.teamCaptain.id === playerId) {
        team.teamCaptain = undefined;
    }
    return team;
}
function setTeamCaptain(teamId, playerId) {
    const team = teams.find((t) => t.id === teamId);
    if (!team)
        return null;
    const player = team.players.find((p) => p.id === playerId);
    if (!player)
        throw new Error('Player not in team');
    team.teamCaptain = player;
    return team;
}
function getTeams() {
    return teams;
}
function getTeamsWithScores() {
    const { getMatchDays, calculatePoints } = require('./matchDayService');
    const allMatchDays = getMatchDays();
    return teams.map(team => {
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