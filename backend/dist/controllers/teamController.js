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
exports.getTeamsWithScores = getTeamsWithScores;
exports.clearTeamsCache = clearTeamsCache;
exports.clearAllCaches = clearAllCaches;
const teamService = __importStar(require("../services/teamService"));
function createTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { teamName } = req.body;
        if (!teamName) {
            res.status(400).json({ error: 'teamName required' });
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        try {
            const team = yield teamService.createTeam(teamName, req.user.id);
            res.status(201).json(team);
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    });
}
function addPlayerToTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { teamId, player } = req.body;
        if (!teamId || !player) {
            res.status(400).json({ error: 'teamId and player required' });
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        try {
            const team = yield teamService.addPlayerToTeam(teamId, player, req.user.id, req.user.role);
            res.json(team);
        }
        catch (e) {
            // Use 409 Conflict for business logic errors (e.g., too many goalkeepers)
            if (e.message && (e.message.includes('goalkeeper') || e.message.includes('6 players'))) {
                res.status(409).json({ error: e.message });
                return;
            }
            // Use 403 for authorization errors
            if (e.message && e.message.includes('only modify your own team')) {
                res.status(403).json({ error: e.message });
                return;
            }
            res.status(400).json({ error: e.message });
        }
    });
}
function removePlayerFromTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { teamId, playerId } = req.body;
        if (!teamId || !playerId) {
            res.status(400).json({ error: 'teamId and playerId required' });
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        try {
            const team = yield teamService.removePlayerFromTeam(teamId, playerId, req.user.id, req.user.role);
            res.json(team);
        }
        catch (e) {
            if (e.message && e.message.includes('only modify your own team')) {
                res.status(403).json({ error: e.message });
                return;
            }
            res.status(400).json({ error: e.message });
        }
    });
}
function setTeamCaptain(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { teamId, playerId } = req.body;
        if (!teamId || !playerId) {
            res.status(400).json({ error: 'teamId and playerId required' });
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        try {
            const team = yield teamService.setTeamCaptain(teamId, playerId, req.user.id, req.user.role);
            res.json(team);
        }
        catch (e) {
            // Use 409 Conflict for business logic errors (e.g., player not in team)
            if (e.message && e.message.includes('Player not in team')) {
                res.status(409).json({ error: e.message });
                return;
            }
            if (e.message && e.message.includes('only modify your own team')) {
                res.status(403).json({ error: e.message });
                return;
            }
            res.status(400).json({ error: e.message });
        }
    });
}
function getTeams(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const teams = yield teamService.getTeams(req.user.id, req.user.role);
        res.json(teams);
    });
}
function getTeamsWithScores(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const teams = yield teamService.getTeamsWithScores(req.user.id, req.user.role);
        res.json(teams);
    });
}
function clearTeamsCache(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Only allow admin to clear cache
        if (req.user.role !== 'admin') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        teamService.invalidateTeamsWithScoresCache();
        res.json({ message: 'Teams cache cleared successfully' });
    });
}
function clearAllCaches(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Only allow admin to clear cache
        if (req.user.role !== 'admin') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        // Clear all caches
        teamService.invalidateTeamsWithScoresCache();
        try {
            const { PlayerService } = require('../services/playerService');
            PlayerService.invalidatePlayerCaches();
        }
        catch (e) {
            console.warn('PlayerService cache invalidation failed:', e);
        }
        try {
            const { ClubService } = require('../services/clubService');
            ClubService.invalidateClubCaches();
        }
        catch (e) {
            console.warn('ClubService cache invalidation failed:', e);
        }
        res.json({ message: 'All caches cleared successfully' });
    });
}
//# sourceMappingURL=teamController.js.map