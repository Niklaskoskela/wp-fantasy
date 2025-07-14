import { Team, Player, MatchDay, UserRole } from '../../../shared/dist/types';
interface TeamWithScores {
    id: string;
    teamName: string;
    players: Player[];
    captain?: Player;
    teamCaptain?: Player;
    scoreHistory: Map<MatchDay, number>;
    totalScore: number;
    totalPoints: number;
    matchDayScores: {
        matchDayId: string;
        matchDayTitle: string;
        points: number;
    }[];
    ownerId: string;
}
export declare function createTeam(teamName: string, ownerId: string): Promise<Team>;
export declare function addPlayerToTeam(teamId: string, player: Player, userId: string, userRole: UserRole): Promise<Team | null>;
export declare function removePlayerFromTeam(teamId: string, playerId: string, userId: string, userRole: UserRole): Promise<Team | null>;
export declare function setTeamCaptain(teamId: string, playerId: string, userId: string, userRole: UserRole): Promise<Team | null>;
export declare function getTeams(): Promise<Team[]>;
export declare function getUserTeam(userId: string): Promise<Team | null>;
export declare function invalidateTeamsWithScoresCache(): void;
export declare function getTeamsWithScores(): Promise<TeamWithScores[]>;
export {};
