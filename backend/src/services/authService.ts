// Authentication service with security best practices
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole, UserSession } from '../../../shared/dist/types';

// In-memory stores (replace with database integration in production)
const users: (User & { passwordHash: string; failedLoginAttempts: number; accountLockedUntil?: Date })[] = [];
const sessions: UserSession[] = [];
const passwordResetTokens: { id: string; userId: string; token: string; expiresAt: Date; usedAt?: Date }[] = [];

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const PASSWORD_RESET_EXPIRES = 60 * 60 * 1000; // 1 hour

// Password strength validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate secure random token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate JWT token
export function generateJWT(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'wp-fantasy',
    audience: 'wp-fantasy-users'
  } as jwt.SignOptions);
}

// Verify JWT token
export function verifyJWT(token: string): User | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: 'wp-fantasy',
      audience: 'wp-fantasy-users'
    }) as any;
    
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      teamId: payload.teamId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
  } catch (error) {
    return null;
  }
}

// Register user
export async function registerUser(
  username: string, 
  email: string, 
  password: string,
  role: UserRole = UserRole.USER
): Promise<{ user: User; token: string; session: UserSession }> {
  // Validate input
  const errors: string[] = [];
  
  if (!username || username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }
  
  // Check for existing user
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    errors.push('Username or email already exists');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const user: User & { passwordHash: string; failedLoginAttempts: number } = {
    id: crypto.randomUUID(),
    username,
    email,
    role,
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    failedLoginAttempts: 0
  };
  
  users.push(user);
  
  // Generate session and JWT for new user
  const sessionToken = generateSecureToken();
  const session: UserSession = {
    id: crypto.randomUUID(),
    sessionToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
    ipAddress: undefined,
    userAgent: undefined,
    isActive: true
  };
  
  sessions.push(session);
  
  const { passwordHash: _, failedLoginAttempts: __, ...userResponse } = user;
  const token = generateJWT(userResponse);
  
  return { user: userResponse, token, session };
}

// Login user
export async function loginUser(
  username: string, 
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: User; token: string; session: UserSession }> {
  const user = users.find(u => u.username === username || u.email === username);
  
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  // Check if account is locked
  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    const remainingTime = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
    throw new Error(`Account is locked. Try again in ${remainingTime} minutes.`);
  }
  
  // Check if account is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  
  if (!isValidPassword) {
    // Increment failed attempts
    user.failedLoginAttempts += 1;
    
    // Lock account if too many failed attempts
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.accountLockedUntil = new Date(Date.now() + LOCKOUT_TIME);
      throw new Error('Too many failed login attempts. Account has been locked.');
    }
    
    throw new Error('Invalid username or password');
  }
  
  // Reset failed attempts on successful login
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;
  user.lastLogin = new Date();
  
  // Generate session
  const sessionToken = generateSecureToken();
  const session: UserSession = {
    id: crypto.randomUUID(),
    sessionToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
    ipAddress,
    userAgent,
    isActive: true
  };
  
  sessions.push(session);
  
  // Generate JWT
  const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___, ...userResponse } = user;
  const token = generateJWT(userResponse);
  
  return { user: userResponse, token, session };
}

// Logout user
export async function logoutUser(sessionToken: string): Promise<void> {
  const session = sessions.find(s => s.sessionToken === sessionToken);
  if (session) {
    session.isActive = false;
  }
}

// Get user by ID
export function getUserById(id: string): User | null {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  
  const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___, ...userResponse } = user;
  return userResponse;
}

// Get user by username
export function getUserByUsername(username: string): User | null {
  const user = users.find(u => u.username === username);
  if (!user) return null;
  
  const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___, ...userResponse } = user;
  return userResponse;
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const user = users.find(u => u.email === email);
  if (!user) return null;
  
  const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___, ...userResponse } = user;
  return userResponse;
}

// Update user
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date() };
  
  const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___, ...userResponse } = users[userIndex];
  return userResponse;
}

// Change password
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join(', '));
  }
  
  // Hash and update password
  user.passwordHash = await hashPassword(newPassword);
  user.updatedAt = new Date();
  
  // Invalidate all sessions for this user
  sessions.forEach(session => {
    if (session.userId === userId) {
      session.isActive = false;
    }
  });
}

// Create password reset token
export async function createPasswordResetToken(email: string): Promise<string> {
  const user = users.find(u => u.email === email);
  if (!user) {
    // Don't reveal if email exists or not for security
    throw new Error('If this email is registered, you will receive a password reset email');
  }
  
  const token = generateSecureToken();
  const resetToken = {
    id: crypto.randomUUID(),
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRES),
    createdAt: new Date()
  };
  
  passwordResetTokens.push(resetToken);
  return token;
}

// Reset password with token
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const resetToken = passwordResetTokens.find(t => t.token === token && !t.usedAt);
  
  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error('Invalid or expired reset token');
  }
  
  const user = users.find(u => u.id === resetToken.userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join(', '));
  }
  
  // Hash and update password
  user.passwordHash = await hashPassword(newPassword);
  user.updatedAt = new Date();
  
  // Mark token as used
  resetToken.usedAt = new Date();
  
  // Invalidate all sessions for this user
  sessions.forEach(session => {
    if (session.userId === user.id) {
      session.isActive = false;
    }
  });
}

// Validate session
export function validateSession(sessionToken: string): User | null {
  const session = sessions.find(s => s.sessionToken === sessionToken && s.isActive);
  
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  
  return getUserById(session.userId);
}

// Get all users (admin only)
export function getAllUsers(): User[] {
  return users.map(user => {
    const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___, ...userResponse } = user;
    return userResponse;
  });
}

// Deactivate user (admin only)
export async function deactivateUser(userId: string): Promise<void> {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.isActive = false;
    user.updatedAt = new Date();
    
    // Invalidate all sessions for this user
    sessions.forEach(session => {
      if (session.userId === userId) {
        session.isActive = false;
      }
    });
  }
}

// Activate user (admin only)
export async function activateUser(userId: string): Promise<void> {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.isActive = true;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.updatedAt = new Date();
  }
}
