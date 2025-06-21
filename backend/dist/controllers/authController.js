"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.getAllUsers = getAllUsers;
exports.deactivateUser = deactivateUser;
exports.activateUser = activateUser;
exports.adminResetPassword = adminResetPassword;
exports.updateUser = updateUser;
const express_validator_1 = require("express-validator");
const authService = __importStar(require("../services/authService"));
const types_1 = require("../../../shared/dist/types");
/**
 * POST /api/auth/register
 * Register a new user
 */
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { username, email, password } = req.body;
            // Register user
            const result = yield authService.registerUser(username, email, password, types_1.UserRole.USER);
            res.status(201).json({
                message: 'User registered successfully',
                user: result.user
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Registration failed'
            });
        }
    });
}
/**
 * POST /api/auth/login
 * Login user
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { username, password } = req.body;
            const ipAddress = req.ip;
            const userAgent = req.get('User-Agent');
            // Login user
            const result = yield authService.loginUser(username, password, ipAddress, userAgent);
            res.json({
                message: 'Login successful',
                user: result.user,
                token: result.token,
                expiresAt: result.session.expiresAt
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({
                error: error instanceof Error ? error.message : 'Login failed'
            });
        }
    });
}
/**
 * POST /api/auth/logout
 * Logout user
 */
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sessionToken = req.headers['x-session-token'];
            if (sessionToken) {
                yield authService.logoutUser(sessionToken);
            }
            res.json({ message: 'Logout successful' });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    });
}
/**
 * GET /api/auth/me
 * Get current user info
 */
function getCurrentUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            res.json({ user: req.user });
        }
        catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({ error: 'Failed to get user info' });
        }
    });
}
/**
 * POST /api/auth/change-password
 * Change user password
 */
function changePassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            yield authService.changePassword(req.user.id, currentPassword, newPassword);
            res.json({ message: 'Password changed successfully' });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to change password'
            });
        }
    });
}
/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
function forgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { email } = req.body;
            try {
                const token = yield authService.createPasswordResetToken(email);
                // In production, send email with reset link
                // For now, return the token (remove this in production)
                res.json({
                    message: 'If this email is registered, you will receive a password reset email',
                    // Remove this token field in production
                    token: process.env.NODE_ENV === 'development' ? token : undefined
                });
            }
            catch (error) {
                // Always return success message to prevent email enumeration
                res.json({
                    message: 'If this email is registered, you will receive a password reset email'
                });
            }
        }
        catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
function resetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { token, newPassword } = req.body;
            yield authService.resetPasswordWithToken(token, newPassword);
            res.json({ message: 'Password reset successfully' });
        }
        catch (error) {
            console.error('Reset password error:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to reset password'
            });
        }
    });
}
/**
 * GET /api/auth/users (Admin only)
 * Get all users
 */
function getAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = authService.getAllUsers();
            res.json({ users });
        }
        catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    });
}
/**
 * PUT /api/auth/users/:userId/deactivate (Admin only)
 * Deactivate user
 */
function deactivateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            yield authService.deactivateUser(userId);
            res.json({ message: 'User deactivated successfully' });
        }
        catch (error) {
            console.error('Deactivate user error:', error);
            res.status(500).json({ error: 'Failed to deactivate user' });
        }
    });
}
/**
 * PUT /api/auth/users/:userId/activate (Admin only)
 * Activate user
 */
function activateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            yield authService.activateUser(userId);
            res.json({ message: 'User activated successfully' });
        }
        catch (error) {
            console.error('Activate user error:', error);
            res.status(500).json({ error: 'Failed to activate user' });
        }
    });
}
/**
 * POST /api/auth/admin/reset-password/:userId (Admin only)
 * Admin reset user password
 */
function adminResetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { userId } = req.params;
            const { newPassword } = req.body;
            // Get user
            const user = authService.getUserById(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            // Create a password reset token and use it immediately
            const token = yield authService.createPasswordResetToken(user.email);
            yield authService.resetPasswordWithToken(token, newPassword);
            res.json({ message: 'Password reset successfully' });
        }
        catch (error) {
            console.error('Admin reset password error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to reset password'
            });
        }
    });
}
/**
 * PUT /api/auth/users/:userId (Admin only)
 * Update user details
 */
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check for validation errors
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
                return;
            }
            const { userId } = req.params;
            const { username, email, role } = req.body;
            // Get user
            const user = authService.getUserById(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            // Check if new username/email already exists (excluding current user)
            if (username && username !== user.username) {
                const existingUser = authService.getUserByUsername(username);
                if (existingUser && existingUser.id !== user.id) {
                    res.status(409).json({ error: 'Username already exists' });
                    return;
                }
            }
            if (email && email !== user.email) {
                const existingUser = authService.getUserByEmail(email);
                if (existingUser && existingUser.id !== user.id) {
                    res.status(409).json({ error: 'Email already exists' });
                    return;
                }
            }
            // Update user
            const updatedUser = yield authService.updateUser(userId, { username, email, role });
            if (!updatedUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({
                message: 'User updated successfully',
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    isActive: updatedUser.isActive,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                    lastLogin: updatedUser.lastLogin
                }
            });
        }
        catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Failed to update user'
            });
        }
    });
}
//# sourceMappingURL=authController.js.map