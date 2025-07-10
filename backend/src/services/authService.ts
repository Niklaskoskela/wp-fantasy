// Authentication service with security best practices
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole, UserSession } from '../../../shared/dist/types';
import { pool } from '../config/database';

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
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
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
    }) as jwt.JwtPayload & { id: string; username: string; email: string; role: UserRole };
    
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
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  // Check for existing user
  const existingUserCheck = await pool.query(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );
  
  if (existingUserCheck.rows.length > 0) {
    throw new Error('Username or email already exists');
  }
  
  // Hash password and create user
  const passwordHash = await hashPassword(password);
  
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, username, email, role, created_at, updated_at, is_active, last_login`,
    [username, email, passwordHash, role]
  );
  
  const userRow = result.rows[0];
  const user: User = {
    id: userRow.id.toString(),
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    isActive: userRow.is_active,
    lastLogin: userRow.last_login
  };
  
  // Generate session and JWT for new user
  const sessionToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const sessionResult = await pool.query(
    `INSERT INTO user_sessions (session_token, user_id, expires_at) 
     VALUES ($1, $2, $3) 
     RETURNING id, session_token, user_id, expires_at, created_at, is_active`,
    [sessionToken, user.id, expiresAt]
  );
  
  const sessionRow = sessionResult.rows[0];
  const session: UserSession = {
    id: sessionRow.id.toString(),
    sessionToken: sessionRow.session_token,
    userId: sessionRow.user_id.toString(),
    expiresAt: sessionRow.expires_at,
    createdAt: sessionRow.created_at,
    ipAddress: undefined,
    userAgent: undefined,
    isActive: sessionRow.is_active
  };
  
  const token = generateJWT(user);
  
  return { user, token, session };
}

// Login user
export async function loginUser(
  username: string, 
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: User; token: string; session: UserSession }> {
  // Get user from database
  const userResult = await pool.query(
    'SELECT id, username, email, role, password_hash, is_active, failed_login_attempts, account_locked_until, last_login FROM users WHERE username = $1 OR email = $1',
    [username]
  );
  
  if (userResult.rows.length === 0) {
    throw new Error('Invalid username or password');
  }
  
  const userRow = userResult.rows[0];
  
  // Check if account is locked
  if (userRow.account_locked_until && new Date(userRow.account_locked_until) > new Date()) {
    const remainingTime = Math.ceil((new Date(userRow.account_locked_until).getTime() - Date.now()) / 60000);
    throw new Error(`Account is locked. Try again in ${remainingTime} minutes.`);
  }
  
  // Check if account is active
  if (!userRow.is_active) {
    throw new Error('Account is deactivated');
  }
  
  // Verify password
  const isValidPassword = await verifyPassword(password, userRow.password_hash);
  
  if (!isValidPassword) {
    // Increment failed attempts
    const newFailedAttempts = userRow.failed_login_attempts + 1;
    
    // Lock account if too many failed attempts
    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockoutTime = new Date(Date.now() + LOCKOUT_TIME);
      await pool.query(
        'UPDATE users SET failed_login_attempts = $1, account_locked_until = $2 WHERE id = $3',
        [newFailedAttempts, lockoutTime, userRow.id]
      );
      throw new Error('Too many failed login attempts. Account has been locked.');
    } else {
      await pool.query(
        'UPDATE users SET failed_login_attempts = $1 WHERE id = $2',
        [newFailedAttempts, userRow.id]
      );
    }
    
    throw new Error('Invalid username or password');
  }
  
  // Reset failed attempts on successful login and update last login
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL, last_login = NOW() WHERE id = $1',
    [userRow.id]
  );
  
  const user: User = {
    id: userRow.id.toString(),
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    isActive: userRow.is_active,
    lastLogin: new Date()
  };
  
  // Generate session
  const sessionToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const sessionResult = await pool.query(
    `INSERT INTO user_sessions (session_token, user_id, expires_at, ip_address, user_agent) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, session_token, user_id, expires_at, created_at, is_active`,
    [sessionToken, user.id, expiresAt, ipAddress, userAgent]
  );
  
  const sessionRow = sessionResult.rows[0];
  const session: UserSession = {
    id: sessionRow.id.toString(),
    sessionToken: sessionRow.session_token,
    userId: sessionRow.user_id.toString(),
    expiresAt: sessionRow.expires_at,
    createdAt: sessionRow.created_at,
    ipAddress,
    userAgent,
    isActive: sessionRow.is_active
  };
  
  const token = generateJWT(user);
  
  return { user, token, session };
}

// Logout user
export async function logoutUser(sessionToken: string): Promise<void> {
  await pool.query(
    'UPDATE user_sessions SET is_active = FALSE WHERE session_token = $1',
    [sessionToken]
  );
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users WHERE id = $1',
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  const userRow = result.rows[0];
  return {
    id: userRow.id.toString(),
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    isActive: userRow.is_active,
    lastLogin: userRow.last_login
  };
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users WHERE username = $1',
    [username]
  );
  
  if (result.rows.length === 0) return null;
  
  const userRow = result.rows[0];
  return {
    id: userRow.id.toString(),
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    isActive: userRow.is_active,
    lastLogin: userRow.last_login
  };
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users WHERE email = $1',
    [email]
  );
  
  if (result.rows.length === 0) return null;
  
  const userRow = result.rows[0];
  return {
    id: userRow.id.toString(),
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    isActive: userRow.is_active,
    lastLogin: userRow.last_login
  };
}

// Update user
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const setClause = [];
  const values = [];
  let paramIndex = 1;
  
  if (updates.username !== undefined) {
    setClause.push(`username = $${paramIndex}`);
    values.push(updates.username);
    paramIndex++;
  }
  
  if (updates.email !== undefined) {
    setClause.push(`email = $${paramIndex}`);
    values.push(updates.email);
    paramIndex++;
  }
  
  if (updates.role !== undefined) {
    setClause.push(`role = $${paramIndex}`);
    values.push(updates.role);
    paramIndex++;
  }
  
  if (setClause.length === 0) {
    return getUserById(id);
  }
  
  setClause.push(`updated_at = NOW()`);
  values.push(id);
  
  const result = await pool.query(
    `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, role, created_at, updated_at, is_active, last_login`,
    values
  );
  
  if (result.rows.length === 0) return null;
  
  const userRow = result.rows[0];
  return {
    id: userRow.id.toString(),
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    isActive: userRow.is_active,
    lastLogin: userRow.last_login
  };
}

// Change password
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const result = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const currentHash = result.rows[0].password_hash;
  
  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, currentHash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join(', '));
  }
  
  // Hash and update password
  const newPasswordHash = await hashPassword(newPassword);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, userId]
  );
  
  // Invalidate all sessions for this user
  await pool.query(
    'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
    [userId]
  );
}

// Create password reset token
export async function createPasswordResetToken(email: string): Promise<string> {
  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  
  if (userResult.rows.length === 0) {
    // Don't reveal if email exists or not for security
    throw new Error('If this email is registered, you will receive a password reset email');
  }
  
  const userId = userResult.rows[0].id;
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES);
  
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
  
  return token;
}

// Reset password with token
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const result = await pool.query(
    'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL',
    [token]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid or expired reset token');
  }
  
  const userId = result.rows[0].user_id;
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors.join(', '));
  }
  
  // Hash and update password
  const newPasswordHash = await hashPassword(newPassword);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, userId]
  );
  
  // Mark token as used
  await pool.query(
    'UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1',
    [token]
  );
  
  // Invalidate all sessions for this user
  await pool.query(
    'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
    [userId]
  );
}

// Validate session
export async function validateSession(sessionToken: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT u.id, u.username, u.email, u.role, u.created_at, u.updated_at, u.is_active, u.last_login 
     FROM users u 
     JOIN user_sessions s ON u.id = s.user_id 
     WHERE s.session_token = $1 AND s.is_active = TRUE AND s.expires_at > NOW()`,
    [sessionToken]
  );
  
  if (result.rows.length === 0) return null;
  
  const userRow = result.rows[0];
  return {
    id: userRow.id.toString(),
    username: userRow.username,
    email: userRow.email,
    role: userRow.role,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at,
    isActive: userRow.is_active,
    lastLogin: userRow.last_login
  };
}

// Get all users (admin only)
export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query(
    'SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users ORDER BY created_at DESC'
  );
  
  return result.rows.map(row => ({
    id: row.id.toString(),
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isActive: row.is_active,
    lastLogin: row.last_login
  }));
}

// Deactivate user (admin only)
export async function deactivateUser(userId: string): Promise<void> {
  await pool.query(
    'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1',
    [userId]
  );
  
  // Invalidate all sessions for this user
  await pool.query(
    'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
    [userId]
  );
}

// Activate user (admin only)
export async function activateUser(userId: string): Promise<void> {
  await pool.query(
    'UPDATE users SET is_active = TRUE, failed_login_attempts = 0, account_locked_until = NULL, updated_at = NOW() WHERE id = $1',
    [userId]
  );
}
