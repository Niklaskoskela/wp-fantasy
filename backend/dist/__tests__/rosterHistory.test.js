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
// Test roster history functionality
const globals_1 = require("@jest/globals");
const rosterHistoryService = __importStar(require("../services/rosterHistoryService"));
const teamService = __importStar(require("../services/teamService"));
const matchDayService = __importStar(require("../services/matchDayService"));
(0, globals_1.describe)('Roster History Service', () => {
    let testTeam;
    let testMatchDay;
    let testPlayers;
    (0, globals_1.beforeEach)(() => {
        // Reset the in-memory stores by clearing arrays
        rosterHistoryService.rosterHistories = [];
        teamService.teams = [];
        matchDayService.matchDays = [];
        matchDayService.playerStats = {};
        // Create test data
        testTeam = teamService.createTeam('Test Team');
        testMatchDay = matchDayService.createMatchDay('Test Match Day', new Date('2024-01-01T10:00:00Z'), new Date('2024-01-01T12:00:00Z'));
        // Mock players (in real implementation these would come from playerService)
        testPlayers = [
            { id: 'player1', name: 'Player 1', position: 'field' },
            { id: 'player2', name: 'Player 2', position: 'goalkeeper' },
            { id: 'player3', name: 'Player 3', position: 'field' }
        ];
        // Add players to team
        testPlayers.forEach(player => {
            teamService.addPlayerToTeam(testTeam.id, player);
        });
        // Set captain
        teamService.setTeamCaptain(testTeam.id, testPlayers[0].id);
    });
    (0, globals_1.test)('should create roster history for a team', () => {
        const rosterEntries = [
            { playerId: 'player1', isCaptain: true },
            { playerId: 'player2', isCaptain: false },
            { playerId: 'player3', isCaptain: false }
        ];
        const rosterHistory = rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        (0, globals_1.expect)(rosterHistory).toHaveLength(3);
        (0, globals_1.expect)(rosterHistory[0].teamId).toBe(testTeam.id);
        (0, globals_1.expect)(rosterHistory[0].matchDayId).toBe(testMatchDay.id);
        (0, globals_1.expect)(rosterHistory[0].playerId).toBe('player1');
        (0, globals_1.expect)(rosterHistory[0].isCaptain).toBe(true);
    });
    (0, globals_1.test)('should get roster history for a team and matchday', () => {
        var _a;
        const rosterEntries = [
            { playerId: 'player1', isCaptain: true },
            { playerId: 'player2', isCaptain: false }
        ];
        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        const retrieved = rosterHistoryService.getRosterHistory(testTeam.id, testMatchDay.id);
        (0, globals_1.expect)(retrieved).toHaveLength(2);
        (0, globals_1.expect)((_a = retrieved.find(r => r.playerId === 'player1')) === null || _a === void 0 ? void 0 : _a.isCaptain).toBe(true);
    });
    (0, globals_1.test)('should snapshot all team rosters for a matchday', () => {
        const snapshots = rosterHistoryService.snapshotAllTeamRosters(testMatchDay.id);
        (0, globals_1.expect)(snapshots.has(testTeam.id)).toBe(true);
        const teamSnapshot = snapshots.get(testTeam.id);
        (0, globals_1.expect)(teamSnapshot).toHaveLength(3); // 3 players in the team
        // Captain should be correctly identified
        const captainEntry = teamSnapshot === null || teamSnapshot === void 0 ? void 0 : teamSnapshot.find(entry => entry.isCaptain);
        (0, globals_1.expect)(captainEntry === null || captainEntry === void 0 ? void 0 : captainEntry.playerId).toBe(testPlayers[0].id);
    });
    (0, globals_1.test)('should prevent duplicate roster entries', () => {
        var _a;
        const rosterEntries = [
            { playerId: 'player1', isCaptain: true },
            { playerId: 'player2', isCaptain: false }
        ];
        // Create initial roster
        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        // Try to create again - should replace the previous one
        const newRosterEntries = [
            { playerId: 'player1', isCaptain: false },
            { playerId: 'player3', isCaptain: true }
        ];
        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, newRosterEntries);
        const finalRoster = rosterHistoryService.getRosterHistory(testTeam.id, testMatchDay.id);
        (0, globals_1.expect)(finalRoster).toHaveLength(2);
        (0, globals_1.expect)((_a = finalRoster.find(r => r.playerId === 'player3')) === null || _a === void 0 ? void 0 : _a.isCaptain).toBe(true);
        (0, globals_1.expect)(finalRoster.find(r => r.playerId === 'player2')).toBeUndefined();
    });
    (0, globals_1.test)('should check if roster history exists', () => {
        (0, globals_1.expect)(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(false);
        const rosterEntries = [{ playerId: 'player1', isCaptain: true }];
        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        (0, globals_1.expect)(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(true);
    });
    (0, globals_1.test)('should remove roster history', () => {
        const rosterEntries = [{ playerId: 'player1', isCaptain: true }];
        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        (0, globals_1.expect)(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(true);
        rosterHistoryService.removeRosterHistory(testTeam.id, testMatchDay.id);
        (0, globals_1.expect)(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(false);
    });
});
//# sourceMappingURL=rosterHistory.test.js.map