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
export interface PlayerWithStats extends Player {
    stats: Stats;
    totalPoints: number;
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
    ownerId?: string;
}
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
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
export interface TeamWithScores extends Team {
    totalPoints: number;
    matchDayScores: {
        matchDayId: string;
        matchDayTitle: string;
        points: number;
    }[];
}
