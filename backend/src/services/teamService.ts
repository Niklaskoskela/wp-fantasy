// Service for managing teams: create, update players, set captain
import { Team, Player, MatchDay, UserRole } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demo (replace with DB in production)
const teams: (Team & { ownerId: string })[] = [];

export function createTeam(teamName: string, ownerId: string): Team {
    // Check if user already has a team
    const existingTeam = teams.find(t => t.ownerId === ownerId);
    if (existingTeam) {
        throw new Error('User already has a team');
    }

    const newTeam: Team & { ownerId: string } = {
        id: uuidv4(),
        teamName,
        players: [],
        scoreHistory: new Map<MatchDay, number>(),
        ownerId
    };
    teams.push(newTeam);
    
    // Return team without ownerId for API response
    const { ownerId: _, ...teamResponse } = newTeam;
    return teamResponse;
}

export function addPlayerToTeam(teamId: string, player: Player, userId: string, userRole: UserRole): Team | null {
    const team = teams.find((t: Team & { ownerId: string }) => t.id === teamId);
    if (!team) return null;
    
    // Check ownership (admin can modify any team)
    if (userRole !== UserRole.ADMIN && team.ownerId !== userId) {
        throw new Error('You can only modify your own team');
    }
    
    if (team.players.length >= 6) throw new Error('Team already has 6 players');
    if (player.position === 'goalkeeper' && team.players.some((p: Player) => p.position === 'goalkeeper')) {
        throw new Error('Team already has a goalkeeper');
    }
    team.players.push(player);
    
    const { ownerId: _, ...teamResponse } = team;
    return teamResponse;
}

export function removePlayerFromTeam(teamId: string, playerId: string, userId: string, userRole: UserRole): Team | null {
    const team = teams.find((t: Team & { ownerId: string }) => t.id === teamId);
    if (!team) return null;
    
    // Check ownership (admin can modify any team)
    if (userRole !== UserRole.ADMIN && team.ownerId !== userId) {
        throw new Error('You can only modify your own team');
    }
    
    team.players = team.players.filter((p: Player) => p.id !== playerId);
    if (team.teamCaptain && team.teamCaptain.id === playerId) {
        team.teamCaptain = undefined;
    }
    
    const { ownerId: _, ...teamResponse } = team;
    return teamResponse;
}

export function setTeamCaptain(teamId: string, playerId: string, userId: string, userRole: UserRole): Team | null {
    const team = teams.find((t: Team & { ownerId: string }) => t.id === teamId);
    if (!team) return null;
    
    // Check ownership (admin can modify any team)
    if (userRole !== UserRole.ADMIN && team.ownerId !== userId) {
        throw new Error('You can only modify your own team');
    }
    
    const player = team.players.find((p: Player) => p.id === playerId);
    if (!player) throw new Error('Player not in team');
    team.teamCaptain = player;
    
    const { ownerId: _, ...teamResponse } = team;
    return teamResponse;
}

export function getTeams(userId?: string, userRole?: UserRole): Team[] {
    // All authenticated users can see all teams
    return teams.map(team => {
        // Return ownerId for frontend permission checks
        const { ...teamResponse } = team;
        return teamResponse;
    });
}

export function getUserTeam(userId: string): Team | null {
    const team = teams.find(t => t.ownerId === userId);
    if (!team) return null;
    
    const { ownerId: _, ...teamResponse } = team;
    return teamResponse;
}

export function getTeamsWithScores(userId?: string, userRole?: UserRole): any[] {
    const { getMatchDays, calculatePoints } = require('./matchDayService');
    const allMatchDays = getMatchDays();
    // All authenticated users can see all teams with scores
    const userTeams = getTeams();
    return userTeams.map(team => {
        let totalPoints = 0;
        const matchDayScores: { matchDayId: string; matchDayTitle: string; points: number }[] = [];
        
        // Calculate points for each match day
        for (const matchDay of allMatchDays) {
            const matchDayResults: { teamId: string; points: number }[] = calculatePoints(matchDay.id);
            const teamResult = matchDayResults.find((result: { teamId: string; points: number }) => result.teamId === team.id);
            const points = teamResult ? teamResult.points : 0;
            
            totalPoints += points;
            matchDayScores.push({
                matchDayId: matchDay.id,
                matchDayTitle: matchDay.title,
                points
            });
        }
        
        return {
            ...team,
            totalPoints,
            matchDayScores
        };
    });
}
