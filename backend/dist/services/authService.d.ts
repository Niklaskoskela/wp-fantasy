import { User, UserRole, UserSession } from '../../../shared/dist/types';
export declare function validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
};
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function generateSecureToken(): string;
export declare function generateJWT(user: User): string;
export declare function verifyJWT(token: string): User | null;
export declare function registerUser(username: string, email: string, password: string, role?: UserRole): Promise<{
    user: User;
    token: string;
    session: UserSession;
}>;
export declare function loginUser(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<{
    user: User;
    token: string;
    session: UserSession;
}>;
export declare function logoutUser(sessionToken: string): Promise<void>;
export declare function getUserById(id: string): Promise<User | null>;
export declare function getUserByUsername(username: string): Promise<User | null>;
export declare function getUserByEmail(email: string): Promise<User | null>;
export declare function updateUser(id: string, updates: Partial<User>): Promise<User | null>;
export declare function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
export declare function createPasswordResetToken(email: string): Promise<string>;
export declare function resetPasswordWithToken(token: string, newPassword: string): Promise<void>;
export declare function validateSession(sessionToken: string): Promise<User | null>;
export declare function getAllUsers(): Promise<User[]>;
export declare function deactivateUser(userId: string): Promise<void>;
export declare function activateUser(userId: string): Promise<void>;
