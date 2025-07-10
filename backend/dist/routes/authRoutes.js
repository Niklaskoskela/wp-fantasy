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
Object.defineProperty(exports, "__esModule", { value: true });
// Authentication routes
const express_1 = require("express");
const authController = __importStar(require("../controllers/authController"));
const authValidation = __importStar(require("../validation/auth"));
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const router = (0, express_1.Router)();
// Public routes (with rate limiting)
router.post('/register', rateLimiting_1.registrationLimiter, authValidation.validateRegistration, authController.register);
router.post('/login', rateLimiting_1.authLimiter, authValidation.validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', rateLimiting_1.passwordResetLimiter, authValidation.validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', rateLimiting_1.authLimiter, authValidation.validateResetPassword, authController.resetPassword);
// Protected routes (require authentication)
router.get('/me', auth_1.authenticateToken, authController.getCurrentUser);
router.post('/change-password', auth_1.authenticateToken, authValidation.validateChangePassword, authController.changePassword);
// Admin-only routes
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, authController.getAllUsers);
router.put('/users/:userId/deactivate', auth_1.authenticateToken, auth_1.requireAdmin, authController.deactivateUser);
router.put('/users/:userId/activate', auth_1.authenticateToken, auth_1.requireAdmin, authController.activateUser);
router.post('/admin/reset-password/:userId', auth_1.authenticateToken, auth_1.requireAdmin, authController.adminResetPassword);
router.put('/users/:userId', auth_1.authenticateToken, auth_1.requireAdmin, authValidation.validateUpdateUser, authController.updateUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map