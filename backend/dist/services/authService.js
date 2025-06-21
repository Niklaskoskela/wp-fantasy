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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
// In-memory stores (replace with database integration in production)
const users = [];
const sessions = [];
const passwordResetTokens = [];
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
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
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
        // Check for existing user
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            errors.push('Username or email already exists');
        }
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        // Hash password and create user
        const passwordHash = yield hashPassword(password);
        const user = {
            id: crypto_1.default.randomUUID(),
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
        // Return user without password
        const { passwordHash: _, failedLoginAttempts: __ } = user, userResponse = __rest(user, ["passwordHash", "failedLoginAttempts"]);
        return { user: userResponse };
    });
}
// Login user
function loginUser(username, password, ipAddress, userAgent) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const isValidPassword = yield verifyPassword(password, user.passwordHash);
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
        const session = {
            id: crypto_1.default.randomUUID(),
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
        const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___ } = user, userResponse = __rest(user, ["passwordHash", "failedLoginAttempts", "accountLockedUntil"]);
        const token = generateJWT(userResponse);
        return { user: userResponse, token, session };
    });
}
// Logout user
function logoutUser(sessionToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = sessions.find(s => s.sessionToken === sessionToken);
        if (session) {
            session.isActive = false;
        }
    });
}
// Get user by ID
function getUserById(id) {
    const user = users.find(u => u.id === id);
    if (!user)
        return null;
    const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___ } = user, userResponse = __rest(user, ["passwordHash", "failedLoginAttempts", "accountLockedUntil"]);
    return userResponse;
}
// Get user by username
function getUserByUsername(username) {
    const user = users.find(u => u.username === username);
    if (!user)
        return null;
    const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___ } = user, userResponse = __rest(user, ["passwordHash", "failedLoginAttempts", "accountLockedUntil"]);
    return userResponse;
}
// Get user by email
function getUserByEmail(email) {
    const user = users.find(u => u.email === email);
    if (!user)
        return null;
    const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___ } = user, userResponse = __rest(user, ["passwordHash", "failedLoginAttempts", "accountLockedUntil"]);
    return userResponse;
}
// Update user
function updateUser(id, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1)
            return null;
        users[userIndex] = Object.assign(Object.assign(Object.assign({}, users[userIndex]), updates), { updatedAt: new Date() });
        const _a = users[userIndex], { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___ } = _a, userResponse = __rest(_a, ["passwordHash", "failedLoginAttempts", "accountLockedUntil"]);
        return userResponse;
    });
}
// Change password
function changePassword(userId, currentPassword, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = users.find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isValidPassword = yield verifyPassword(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }
        // Hash and update password
        user.passwordHash = yield hashPassword(newPassword);
        user.updatedAt = new Date();
        // Invalidate all sessions for this user
        sessions.forEach(session => {
            if (session.userId === userId) {
                session.isActive = false;
            }
        });
    });
}
// Create password reset token
function createPasswordResetToken(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = users.find(u => u.email === email);
        if (!user) {
            // Don't reveal if email exists or not for security
            throw new Error('If this email is registered, you will receive a password reset email');
        }
        const token = generateSecureToken();
        const resetToken = {
            id: crypto_1.default.randomUUID(),
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRES),
            createdAt: new Date()
        };
        passwordResetTokens.push(resetToken);
        return token;
    });
}
// Reset password with token
function resetPasswordWithToken(token, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
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
        user.passwordHash = yield hashPassword(newPassword);
        user.updatedAt = new Date();
        // Mark token as used
        resetToken.usedAt = new Date();
        // Invalidate all sessions for this user
        sessions.forEach(session => {
            if (session.userId === user.id) {
                session.isActive = false;
            }
        });
    });
}
// Validate session
function validateSession(sessionToken) {
    const session = sessions.find(s => s.sessionToken === sessionToken && s.isActive);
    if (!session || session.expiresAt < new Date()) {
        return null;
    }
    return getUserById(session.userId);
}
// Get all users (admin only)
function getAllUsers() {
    return users.map(user => {
        const { passwordHash: _, failedLoginAttempts: __, accountLockedUntil: ___ } = user, userResponse = __rest(user, ["passwordHash", "failedLoginAttempts", "accountLockedUntil"]);
        return userResponse;
    });
}
// Deactivate user (admin only)
function deactivateUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
// Activate user (admin only)
function activateUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = users.find(u => u.id === userId);
        if (user) {
            user.isActive = true;
            user.failedLoginAttempts = 0;
            user.accountLockedUntil = undefined;
            user.updatedAt = new Date();
        }
    });
}
//# sourceMappingURL=authService.js.map