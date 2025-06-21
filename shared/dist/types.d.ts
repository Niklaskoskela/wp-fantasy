export declare enum PlayerPosition {
    FIELD = "field",
    GOALKEEPER = "goalkeeper"
}
export interface Stats {
    id: string;
    goals: number;
    assists: number;
    blocks: number;
    steals: number;
    pfDrawn: number;
    pf: number;
    ballsLost: number;
    contraFouls: number;
    shots: number;
    swimOffs: number;
    brutality: number;
    saves: number;
    wins: number;
}
export interface Club {
    id: string;
    name: string;
}
export interface MatchDay {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
}
export interface Player {
    id: string;
    name: string;
    position: PlayerPosition;
    club: Club;
    statsHistory: Map<MatchDay, Stats>;
}
export interface RosterHistory {
    id: string;
    teamId: string;
    matchDayId: string;
    playerId: string;
    isCaptain: boolean;
    createdAt: Date;
}
export interface RosterEntry {
    playerId: string;
    isCaptain: boolean;
}
export interface Team {
    id: string;
    teamName: string;
    players: Player[];
    teamCaptain?: Player;
    scoreHistory: Map<MatchDay, number>;
    rosterHistory?: Map<string, RosterHistory[]>;
}
export interface TeamWithScores extends Team {
    totalPoints: number;
    matchDayScores: {
        matchDayId: string;
        matchDayTitle: string;
        points: number;
    }[];
}
