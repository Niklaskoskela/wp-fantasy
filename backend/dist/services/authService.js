"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = validatePassword;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateSecureToken = generateSecureToken;
exports.generateJWT = generateJWT;
exports.verifyJWT = verifyJWT;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.getUserById = getUserById;
exports.getUserByUsername = getUserByUsername;
exports.getUserByEmail = getUserByEmail;
exports.updateUser = updateUser;
exports.changePassword = changePassword;
exports.createPasswordResetToken = createPasswordResetToken;
exports.resetPasswordWithToken = resetPasswordWithToken;
exports.validateSession = validateSession;
exports.getAllUsers = getAllUsers;
exports.deactivateUser = deactivateUser;
exports.activateUser = activateUser;
// Authentication service with security best practices
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const types_1 = require("../../../shared/dist/types");
const database_1 = require("../config/database");
// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const PASSWORD_RESET_EXPIRES = 60 * 60 * 1000; // 1 hour
// Password strength validation
function validatePassword(password) {
    const errors = [];
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
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.hash(password, SALT_ROUNDS);
    });
}
// Verify password
function verifyPassword(password, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(password, hash);
    });
}
// Generate secure random token
function generateSecureToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
// Generate JWT token
function generateJWT(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'wp-fantasy',
        audience: 'wp-fantasy-users'
    });
}
// Verify JWT token
function verifyJWT(token) {
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
            issuer: 'wp-fantasy',
            audience: 'wp-fantasy-users'
        });
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
    }
    catch (error) {
        return null;
    }
}
// Register user
function registerUser(username_1, email_1, password_1) {
    return __awaiter(this, arguments, void 0, function* (username, email, password, role = types_1.UserRole.USER) {
        // Validate input
        const errors = [];
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
        const existingUserCheck = yield database_1.pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUserCheck.rows.length > 0) {
            throw new Error('Username or email already exists');
        }
        // Hash password and create user
        const passwordHash = yield hashPassword(password);
        const result = yield database_1.pool.query(`INSERT INTO users (username, email, password_hash, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, username, email, role, created_at, updated_at, is_active, last_login`, [username, email, passwordHash, role]);
        const userRow = result.rows[0];
        const user = {
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
        const sessionResult = yield database_1.pool.query(`INSERT INTO user_sessions (session_token, user_id, expires_at) 
     VALUES ($1, $2, $3) 
     RETURNING id, session_token, user_id, expires_at, created_at, is_active`, [sessionToken, user.id, expiresAt]);
        const sessionRow = sessionResult.rows[0];
        const session = {
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
    });
}
// Login user
function loginUser(username, password, ipAddress, userAgent) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get user from database
        const userResult = yield database_1.pool.query('SELECT id, username, email, role, password_hash, is_active, failed_login_attempts, account_locked_until, last_login FROM users WHERE username = $1 OR email = $1', [username]);
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
        const isValidPassword = yield verifyPassword(password, userRow.password_hash);
        if (!isValidPassword) {
            // Increment failed attempts
            const newFailedAttempts = userRow.failed_login_attempts + 1;
            // Lock account if too many failed attempts
            if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
                const lockoutTime = new Date(Date.now() + LOCKOUT_TIME);
                yield database_1.pool.query('UPDATE users SET failed_login_attempts = $1, account_locked_until = $2 WHERE id = $3', [newFailedAttempts, lockoutTime, userRow.id]);
                throw new Error('Too many failed login attempts. Account has been locked.');
            }
            else {
                yield database_1.pool.query('UPDATE users SET failed_login_attempts = $1 WHERE id = $2', [newFailedAttempts, userRow.id]);
            }
            throw new Error('Invalid username or password');
        }
        // Reset failed attempts on successful login and update last login
        yield database_1.pool.query('UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL, last_login = NOW() WHERE id = $1', [userRow.id]);
        const user = {
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
        const sessionResult = yield database_1.pool.query(`INSERT INTO user_sessions (session_token, user_id, expires_at, ip_address, user_agent) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, session_token, user_id, expires_at, created_at, is_active`, [sessionToken, user.id, expiresAt, ipAddress, userAgent]);
        const sessionRow = sessionResult.rows[0];
        const session = {
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
    });
}
// Logout user
function logoutUser(sessionToken) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE session_token = $1', [sessionToken]);
    });
}
// Get user by ID
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0)
            return null;
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
    });
}
// Get user by username
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0)
            return null;
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
    });
}
// Get user by email
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0)
            return null;
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
    });
}
// Update user
function updateUser(id, updates) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const result = yield database_1.pool.query(`UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, role, created_at, updated_at, is_active, last_login`, values);
        if (result.rows.length === 0)
            return null;
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
    });
}
// Change password
function changePassword(userId, currentPassword, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        const currentHash = result.rows[0].password_hash;
        // Verify current password
        const isValidPassword = yield verifyPassword(currentPassword, currentHash);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }
        // Hash and update password
        const newPasswordHash = yield hashPassword(newPassword);
        yield database_1.pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, userId]);
        // Invalidate all sessions for this user
        yield database_1.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [userId]);
    });
}
// Create password reset token
function createPasswordResetToken(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const userResult = yield database_1.pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // Don't reveal if email exists or not for security
            throw new Error('If this email is registered, you will receive a password reset email');
        }
        const userId = userResult.rows[0].id;
        const token = generateSecureToken();
        const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES);
        yield database_1.pool.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [userId, token, expiresAt]);
        return token;
    });
}
// Reset password with token
function resetPasswordWithToken(token, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL', [token]);
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
        const newPasswordHash = yield hashPassword(newPassword);
        yield database_1.pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, userId]);
        // Mark token as used
        yield database_1.pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1', [token]);
        // Invalidate all sessions for this user
        yield database_1.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [userId]);
    });
}
// Validate session
function validateSession(sessionToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query(`SELECT u.id, u.username, u.email, u.role, u.created_at, u.updated_at, u.is_active, u.last_login 
     FROM users u 
     JOIN user_sessions s ON u.id = s.user_id 
     WHERE s.session_token = $1 AND s.is_active = TRUE AND s.expires_at > NOW()`, [sessionToken]);
        if (result.rows.length === 0)
            return null;
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
    });
}
// Get all users (admin only)
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT id, username, email, role, created_at, updated_at, is_active, last_login FROM users ORDER BY created_at DESC');
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
    });
}
// Deactivate user (admin only)
function deactivateUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.pool.query('UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [userId]);
        // Invalidate all sessions for this user
        yield database_1.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [userId]);
    });
}
// Activate user (admin only)
function activateUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.pool.query('UPDATE users SET is_active = TRUE, failed_login_attempts = 0, account_locked_until = NULL, updated_at = NOW() WHERE id = $1', [userId]);
    });
}
//# sourceMappingURL=authService.js.map