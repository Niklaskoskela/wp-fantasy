import { Request, Response } from 'express';
/**
 * POST /api/auth/register
 * Register a new user
 */
export declare function register(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/login
 * Login user
 */
export declare function login(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/logout
 * Logout user
 */
export declare function logout(req: Request, res: Response): Promise<void>;
/**
 * GET /api/auth/me
 * Get current user info
 */
export declare function getCurrentUser(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/change-password
 * Change user password
 */
export declare function changePassword(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
export declare function forgotPassword(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export declare function resetPassword(req: Request, res: Response): Promise<void>;
/**
 * GET /api/auth/users (Admin only)
 * Get all users
 */
export declare function getAllUsers(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/auth/users/:userId/deactivate (Admin only)
 * Deactivate user
 */
export declare function deactivateUser(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/auth/users/:userId/activate (Admin only)
 * Activate user
 */
export declare function activateUser(req: Request, res: Response): Promise<void>;
/**
 * POST /api/auth/admin/reset-password/:userId (Admin only)
 * Admin reset user password
 */
export declare function adminResetPassword(req: Request, res: Response): Promise<void>;
/**
 * PUT /api/auth/users/:userId (Admin only)
 * Update user details
 */
export declare function updateUser(req: Request, res: Response): Promise<void>;
