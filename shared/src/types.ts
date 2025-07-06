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

// Roster History interface - tracks team composition for each matchday
export interface RosterHistory {
    id: string;
    teamId: string;
    matchDayId: string;
    playerId: string;
    isCaptain: boolean;
    createdAt: Date;
}

// Roster Entry interface - used for creating/updating roster history
export interface RosterEntry {
    playerId: string;
    isCaptain: boolean;
}

// Team interface, team contains all team specific data.
export interface Team {
    id: string;
    teamName: string;
    players: Player[];
    teamCaptain?: Player;
    scoreHistory: Map<MatchDay, number>; // matchday -> team score
    rosterHistory?: Map<string, RosterHistory[]>; // matchdayId -> roster entries
    ownerId?: string; // Added for permission checks
}

// User and Authentication Types
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    teamId?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    lastLogin?: Date;
}

export interface UserSession {
    id: string;
    sessionToken: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    ipAddress?: string;
    userAgent?: string;
    isActive: boolean;
}

// Authentication request/response types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    expiresAt: Date;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
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
