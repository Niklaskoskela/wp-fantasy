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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeam = createTeam;
exports.addPlayerToTeam = addPlayerToTeam;
exports.removePlayerFromTeam = removePlayerFromTeam;
exports.setTeamCaptain = setTeamCaptain;
exports.getTeams = getTeams;
exports.getTeamsWithScores = getTeamsWithScores;
const teamService = __importStar(require("../services/teamService"));
function createTeam(req, res) {
    const { teamName } = req.body;
    if (!teamName)
        return res.status(400).json({ error: 'teamName required' });
    if (!req.user)
        return res.status(401).json({ error: 'Authentication required' });
    try {
        const team = teamService.createTeam(teamName, req.user.id);
        return res.status(201).json(team);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
}
function addPlayerToTeam(req, res) {
    const { teamId, player } = req.body;
    if (!teamId || !player)
        return res.status(400).json({ error: 'teamId and player required' });
    if (!req.user)
        return res.status(401).json({ error: 'Authentication required' });
    try {
        const team = teamService.addPlayerToTeam(teamId, player, req.user.id, req.user.role);
        return res.json(team);
    }
    catch (e) {
        // Use 409 Conflict for business logic errors (e.g., too many goalkeepers)
        if (e.message && (e.message.includes('goalkeeper') || e.message.includes('6 players'))) {
            return res.status(409).json({ error: e.message });
        }
        // Use 403 for authorization errors
        if (e.message && e.message.includes('only modify your own team')) {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}
function removePlayerFromTeam(req, res) {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId)
        return res.status(400).json({ error: 'teamId and playerId required' });
    if (!req.user)
        return res.status(401).json({ error: 'Authentication required' });
    try {
        const team = teamService.removePlayerFromTeam(teamId, playerId, req.user.id, req.user.role);
        return res.json(team);
    }
    catch (e) {
        if (e.message && e.message.includes('only modify your own team')) {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}
function setTeamCaptain(req, res) {
    const { teamId, playerId } = req.body;
    if (!teamId || !playerId)
        return res.status(400).json({ error: 'teamId and playerId required' });
    if (!req.user)
        return res.status(401).json({ error: 'Authentication required' });
    try {
        const team = teamService.setTeamCaptain(teamId, playerId, req.user.id, req.user.role);
        return res.json(team);
    }
    catch (e) {
        // Use 409 Conflict for business logic errors (e.g., player not in team)
        if (e.message && e.message.includes('Player not in team')) {
            return res.status(409).json({ error: e.message });
        }
        if (e.message && e.message.includes('only modify your own team')) {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
}
function getTeams(req, res) {
    if (!req.user)
        return res.status(401).json({ error: 'Authentication required' });
    return res.json(teamService.getTeams(req.user.id, req.user.role));
}
function getTeamsWithScores(req, res) {
    if (!req.user)
        return res.status(401).json({ error: 'Authentication required' });
    return res.json(teamService.getTeamsWithScores(req.user.id, req.user.role));
}
//# sourceMappingURL=teamController.js.map