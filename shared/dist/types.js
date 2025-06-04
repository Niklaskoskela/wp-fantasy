"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerPosition = void 0;
exports.createDefaultStats = createDefaultStats;
exports.createDefaultClub = createDefaultClub;
exports.createDefaultPlayer = createDefaultPlayer;
exports.createDefaultTeam = createDefaultTeam;
exports.serializePlayer = serializePlayer;
exports.deserializePlayer = deserializePlayer;
exports.serializeTeam = serializeTeam;
exports.deserializeTeam = deserializeTeam;
var PlayerPosition;
(function (PlayerPosition) {
    PlayerPosition["FIELD"] = "field";
    PlayerPosition["GOALKEEPER"] = "goalkeeper";
})(PlayerPosition || (exports.PlayerPosition = PlayerPosition = {}));
function createDefaultStats() {
    return {
        goals: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        pfDrawn: 0,
        pf: 0,
        ballsLost: 0,
        contraFouls: 0,
        shots: 0,
        swimOffs: 0,
        brutality: 0,
        saves: 0,
        wins: 0
    };
}
function createDefaultClub(name) {
    return {
        name
    };
}
function createDefaultPlayer(name, position, club) {
    return {
        name,
        captain: false,
        position,
        club,
        statsHistory: new Map(),
        scoreHistory: new Map()
    };
}
function createDefaultTeam(teamName) {
    return {
        teamName,
        players: [],
        teamCaptain: {},
        scoreHistory: new Map()
    };
}
function serializePlayer(player) {
    return {
        ...player,
        statsHistory: Object.fromEntries(player.statsHistory),
        scoreHistory: Object.fromEntries(player.scoreHistory)
    };
}
function deserializePlayer(serializedPlayer) {
    return {
        ...serializedPlayer,
        statsHistory: new Map(Object.entries(serializedPlayer.statsHistory).map(([k, v]) => [Number(k), v])),
        scoreHistory: new Map(Object.entries(serializedPlayer.scoreHistory).map(([k, v]) => [Number(k), v]))
    };
}
function serializeTeam(team) {
    return {
        ...team,
        players: team.players.map(serializePlayer),
        teamCaptain: serializePlayer(team.teamCaptain),
        scoreHistory: Object.fromEntries(team.scoreHistory)
    };
}
function deserializeTeam(serializedTeam) {
    return {
        ...serializedTeam,
        players: serializedTeam.players.map(deserializePlayer),
        teamCaptain: deserializePlayer(serializedTeam.teamCaptain),
        scoreHistory: new Map(Object.entries(serializedTeam.scoreHistory).map(([k, v]) => [Number(k), v]))
    };
}
