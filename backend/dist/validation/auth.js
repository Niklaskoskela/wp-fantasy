"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateUser = exports.validateAdminResetPassword = exports.validateResetPassword = exports.validateForgotPassword = exports.validateChangePassword = exports.validateLogin = exports.validateRegistration = void 0;
// Input validation for authentication endpoints
const express_validator_1 = require("express-validator");
// Registration validation
exports.validateRegistration = [
    (0, express_validator_1.body)('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];
// Login validation
exports.validateLogin = [
    (0, express_validator_1.body)('username')
        .notEmpty()
        .withMessage('Username or email is required')
        .isLength({ max: 255 })
        .withMessage('Username/email must be less than 255 characters'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ max: 255 })
        .withMessage('Password must be less than 255 characters'),
];
// Change password validation
exports.validateChangePassword = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];
// Forgot password validation
exports.validateForgotPassword = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
];
// Reset password validation
exports.validateResetPassword = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Invalid token format'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];
// Admin reset password validation
exports.validateAdminResetPassword = [
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];
// Update user validation (admin only)
exports.validateUpdateUser = [
    (0, express_validator_1.body)('username')
        .optional()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['admin', 'user'])
        .withMessage('Role must be either "admin" or "user"'),
];
//# sourceMappingURL=auth.js.map