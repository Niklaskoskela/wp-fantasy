/**
 * Water Polo Fantasy League Types
 */

// Enums for better type safety
export enum PlayerPosition {
    FIELD = 'field',
    GOALKEEPER = 'goalkeeper'
}

// Core Stats interface
export interface Stats {
    id: string
    goals: number;
    assists: number;
    blocks: number;
    steals: number;
    pfDrawn: number; // PF drawn
    pf: number; // PF
    ballsLost: number;
    contraFouls: number;
    shots: number;
    swimOffs: number;
    brutality: number;
    saves: number;
    wins: number;
}

// Club interface
export interface Club {
    id: string;
    name: string;
}

// MatchDay interface
export interface MatchDay {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
}

// Player interface, many teams can use the same player as it does not have any team-specific data
export interface Player {
    id: string;
    name: string;
    position: PlayerPosition;
    club: Club;
    statsHistory: Map<MatchDay, Stats>; // matchday -> stats
}

// Team interface, team contains all team specific data.
export interface Team {
    id: string;
    teamName: string;
    players: Player[];
    teamCaptain?: Player;
    scoreHistory: Map<MatchDay, number>; // matchday -> team score
}

// Enhanced team interface with calculated scores for league display
export interface TeamWithScores extends Team {
    totalPoints: number;
    matchDayScores: {
        matchDayId: string;
        matchDayTitle: string;
        points: number;
    }[];
}
