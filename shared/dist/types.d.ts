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
}
export interface Player {
    id: string;
    name: string;
    position: PlayerPosition;
    club: Club;
    statsHistory: Map<MatchDay, Stats>;
}
export interface Team {
    id: string;
    teamName: string;
    players: Player[];
    teamCaptain?: Player;
    scoreHistory: Map<MatchDay, number>;
}
