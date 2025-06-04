export declare enum PlayerPosition {
    FIELD = "field",
    GOALKEEPER = "goalkeeper"
}
export interface Stats {
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
    id?: string;
    name: string;
}
export interface MatchDay {
    id?: string;
    number: number;
    multiplier: number;
}
export interface Player {
    id?: string;
    name: string;
    captain: boolean;
    position: PlayerPosition;
    club: Club;
    statsHistory: Map<number, Stats>;
    scoreHistory: Map<number, number>;
}
export interface Team {
    id?: string;
    teamName: string;
    players: Player[];
    teamCaptain: Player;
    scoreHistory: Map<number, number>;
}
export declare function createDefaultStats(): Stats;
export declare function createDefaultClub(name: string): Club;
export declare function createDefaultPlayer(name: string, position: PlayerPosition, club: Club): Player;
export declare function createDefaultTeam(teamName: string): Team;
export interface SerializedStats extends Stats {
}
export interface SerializedClub extends Club {
}
export interface SerializedMatchDay extends MatchDay {
}
export interface SerializedPlayer {
    id?: string;
    name: string;
    captain: boolean;
    position: PlayerPosition;
    club: Club;
    statsHistory: Record<number, Stats>;
    scoreHistory: Record<number, number>;
}
export interface SerializedTeam {
    id?: string;
    teamName: string;
    players: SerializedPlayer[];
    teamCaptain: SerializedPlayer;
    scoreHistory: Record<number, number>;
}
export declare function serializePlayer(player: Player): SerializedPlayer;
export declare function deserializePlayer(serializedPlayer: SerializedPlayer): Player;
export declare function serializeTeam(team: Team): SerializedTeam;
export declare function deserializeTeam(serializedTeam: SerializedTeam): Team;
