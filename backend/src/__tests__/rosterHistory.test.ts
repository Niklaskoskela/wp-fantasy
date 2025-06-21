// Test roster history functionality
import { describe, expect, test, beforeEach } from '@jest/globals';
import * as rosterHistoryService from '../services/rosterHistoryService';
import * as teamService from '../services/teamService';
import * as matchDayService from '../services/matchDayService';
import { UserRole } from '../../../shared/dist/types';

describe('Roster History Service', () => {
    let testTeam: any;
    let testMatchDay: any;
    let testPlayers: any[];
    let testUserId: string;

    beforeEach(() => {
        // Reset the in-memory stores by clearing arrays
        (rosterHistoryService as any).rosterHistories = [];
        (matchDayService as any).matchDays = [];
        (matchDayService as any).playerStats = {};

        // Generate unique user ID for each test to avoid conflicts
        testUserId = `test-user-${Date.now()}-${Math.random()}`;

        // Create test data
        testTeam = teamService.createTeam('Test Team', testUserId);
        testMatchDay = matchDayService.createMatchDay(
            'Test Match Day',
            new Date('2024-01-01T10:00:00Z'),
            new Date('2024-01-01T12:00:00Z')
        );

        // Mock players (in real implementation these would come from playerService)
        testPlayers = [
            { id: 'player1', name: 'Player 1', position: 'field' },
            { id: 'player2', name: 'Player 2', position: 'goalkeeper' },
            { id: 'player3', name: 'Player 3', position: 'field' }
        ];

        // Add players to team (as the team owner)
        testPlayers.forEach(player => {
            teamService.addPlayerToTeam(testTeam.id, player, testUserId, UserRole.USER);
        });

        // Set captain (as the team owner)
        teamService.setTeamCaptain(testTeam.id, testPlayers[0].id, testUserId, UserRole.USER);
    });

    test('should create roster history for a team', () => {
        const rosterEntries = [
            { playerId: 'player1', isCaptain: true },
            { playerId: 'player2', isCaptain: false },
            { playerId: 'player3', isCaptain: false }
        ];

        const rosterHistory = rosterHistoryService.createRosterHistory(
            testTeam.id,
            testMatchDay.id,
            rosterEntries
        );

        expect(rosterHistory).toHaveLength(3);
        expect(rosterHistory[0].teamId).toBe(testTeam.id);
        expect(rosterHistory[0].matchDayId).toBe(testMatchDay.id);
        expect(rosterHistory[0].playerId).toBe('player1');
        expect(rosterHistory[0].isCaptain).toBe(true);
    });

    test('should get roster history for a team and matchday', () => {
        const rosterEntries = [
            { playerId: 'player1', isCaptain: true },
            { playerId: 'player2', isCaptain: false }
        ];

        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        const retrieved = rosterHistoryService.getRosterHistory(testTeam.id, testMatchDay.id);

        expect(retrieved).toHaveLength(2);
        expect(retrieved.find(r => r.playerId === 'player1')?.isCaptain).toBe(true);
    });

    test('should snapshot all team rosters for a matchday', () => {
        const snapshots = rosterHistoryService.snapshotAllTeamRosters(testMatchDay.id, testUserId, UserRole.USER);

        expect(snapshots.has(testTeam.id)).toBe(true);
        const teamSnapshot = snapshots.get(testTeam.id);
        expect(teamSnapshot).toHaveLength(3); // 3 players in the team
        
        // Captain should be correctly identified
        const captainEntry = teamSnapshot?.find(entry => entry.isCaptain);
        expect(captainEntry?.playerId).toBe(testPlayers[0].id);
    });

    test('should prevent duplicate roster entries', () => {
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
        expect(finalRoster).toHaveLength(2);
        expect(finalRoster.find(r => r.playerId === 'player3')?.isCaptain).toBe(true);
        expect(finalRoster.find(r => r.playerId === 'player2')).toBeUndefined();
    });

    test('should check if roster history exists', () => {
        expect(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(false);
        
        const rosterEntries = [{ playerId: 'player1', isCaptain: true }];
        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        
        expect(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(true);
    });

    test('should remove roster history', () => {
        const rosterEntries = [{ playerId: 'player1', isCaptain: true }];
        rosterHistoryService.createRosterHistory(testTeam.id, testMatchDay.id, rosterEntries);
        
        expect(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(true);
        
        rosterHistoryService.removeRosterHistory(testTeam.id, testMatchDay.id);
        
        expect(rosterHistoryService.hasRosterHistory(testTeam.id, testMatchDay.id)).toBe(false);
    });
});
