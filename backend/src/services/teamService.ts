// Service for managing teams: create, update players, set captain
import { Team, Player, MatchDay } from '../../../shared/dist/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for demo (replace with DB in production)
const teams: Team[] = [];

export function createTeam(teamName: string): Team {
    const newTeam: Team = {
        id: uuidv4(),
        teamName,
        players: [],
        scoreHistory: new Map<MatchDay, number>()
    };
    teams.push(newTeam);
    return newTeam;
}

export function addPlayerToTeam(teamId: string, player: Player): Team | null {
    const team = teams.find((t: Team) => t.id === teamId);
    if (!team) return null;
    if (team.players.length >= 6) throw new Error('Team already has 6 players');
    if (player.position === 'goalkeeper' && team.players.some((p: Player) => p.position === 'goalkeeper')) {
        throw new Error('Team already has a goalkeeper');
    }
    team.players.push(player);
    return team;
}

export function removePlayerFromTeam(teamId: string, playerId: string): Team | null {
    const team = teams.find((t: Team) => t.id === teamId);
    if (!team) return null;
    team.players = team.players.filter((p: Player) => p.id !== playerId);
    if (team.teamCaptain && team.teamCaptain.id === playerId) {
        team.teamCaptain = undefined;
    }
    return team;
}

export function setTeamCaptain(teamId: string, playerId: string): Team | null {
    const team = teams.find((t: Team) => t.id === teamId);
    if (!team) return null;
    const player = team.players.find((p: Player) => p.id === playerId);
    if (!player) throw new Error('Player not in team');
    team.teamCaptain = player;
    return team;
}

export function getTeams(): Team[] {
    return teams;
}
