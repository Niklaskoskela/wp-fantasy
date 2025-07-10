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
exports.createRosterHistory = createRosterHistory;
exports.getRosterHistory = getRosterHistory;
exports.getTeamRosterHistory = getTeamRosterHistory;
exports.getMatchDayRosterHistory = getMatchDayRosterHistory;
exports.snapshotAllTeamRosters = snapshotAllTeamRosters;
exports.removeRosterHistory = removeRosterHistory;
exports.checkRosterHistory = checkRosterHistory;
const rosterHistoryService = __importStar(require("../services/rosterHistoryService"));
/**
 * POST /api/roster-history/:teamId/:matchDayId
 * Create roster history for a team on a specific matchday
 */
function createRosterHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId, matchDayId } = req.params;
            const rosterEntries = req.body;
            if (!Array.isArray(rosterEntries)) {
                res.status(400).json({ error: 'Request body must be an array of roster entries' });
                return;
            }
            // Validate roster entries
            for (const entry of rosterEntries) {
                if (!entry.playerId || typeof entry.isCaptain !== 'boolean') {
                    res.status(400).json({ error: 'Each roster entry must have playerId and isCaptain properties' });
                    return;
                }
            }
            // Ensure only one captain per team
            const captains = rosterEntries.filter(entry => entry.isCaptain);
            if (captains.length > 1) {
                res.status(400).json({ error: 'Only one captain allowed per team' });
                return;
            }
            const rosterHistory = yield rosterHistoryService.createRosterHistory(teamId, matchDayId, rosterEntries);
            res.status(201).json(rosterHistory);
        }
        catch (error) {
            console.error('Error creating roster history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
/**
 * GET /api/roster-history/:teamId/:matchDayId
 * Get roster history for a specific team and matchday
 */
function getRosterHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId, matchDayId } = req.params;
            const rosterHistory = yield rosterHistoryService.getRosterHistory(teamId, matchDayId);
            res.json(rosterHistory);
        }
        catch (error) {
            console.error('Error getting roster history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
/**
 * GET /api/roster-history/team/:teamId
 * Get all roster history for a specific team across all matchdays
 */
function getTeamRosterHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId } = req.params;
            const rosterHistory = yield rosterHistoryService.getTeamRosterHistory(teamId);
            // Convert Map to object for JSON serialization
            const rosterHistoryObj = {};
            rosterHistory.forEach((value, key) => {
                rosterHistoryObj[key] = value;
            });
            res.json(rosterHistoryObj);
        }
        catch (error) {
            console.error('Error getting team roster history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
/**
 * GET /api/roster-history/matchday/:matchDayId
 * Get all roster history for a specific matchday across all teams
 */
function getMatchDayRosterHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { matchDayId } = req.params;
            const rosterHistory = yield rosterHistoryService.getMatchDayRosterHistory(matchDayId);
            // Convert Map to object for JSON serialization
            const rosterHistoryObj = {};
            rosterHistory.forEach((value, key) => {
                rosterHistoryObj[key] = value;
            });
            res.json(rosterHistoryObj);
        }
        catch (error) {
            console.error('Error getting matchday roster history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
/**
 * POST /api/roster-history/snapshot/:matchDayId
 * Snapshot all current team rosters for a matchday
 * This should be called when a matchday starts
 */
function snapshotAllTeamRosters(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { matchDayId } = req.params;
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const snapshots = yield rosterHistoryService.snapshotAllTeamRosters(matchDayId);
            // Convert Map to object for JSON serialization
            const snapshotsObj = {};
            snapshots.forEach((value, key) => {
                snapshotsObj[key] = value;
            });
            res.json(snapshotsObj);
        }
        catch (error) {
            console.error('Error snapshotting team rosters:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
/**
 * DELETE /api/roster-history/:teamId/:matchDayId
 * Remove roster history for a specific team and matchday
 */
function removeRosterHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId, matchDayId } = req.params;
            yield rosterHistoryService.removeRosterHistory(teamId, matchDayId);
            res.status(204).send();
        }
        catch (error) {
            console.error('Error removing roster history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
/**
 * GET /api/roster-history/check/:teamId/:matchDayId
 * Check if roster history exists for a team and matchday
 */
function checkRosterHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId, matchDayId } = req.params;
            const exists = yield rosterHistoryService.hasRosterHistory(teamId, matchDayId);
            res.json({ exists });
        }
        catch (error) {
            console.error('Error checking roster history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
//# sourceMappingURL=rosterHistoryController.js.map