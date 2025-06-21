// Authentication controller with security best practices
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/authService';
import { UserRole } from '../../../shared/dist/types';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const { username, email, password } = req.body;

    // Register user
    const result = await authService.registerUser(username, email, password, UserRole.USER);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: result.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Registration failed' 
    });
  }
}

/**
 * POST /api/auth/login
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Check for validation errors
    const errors = validationResult(req);
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
    const result = await authService.loginUser(username, password, ipAddress, userAgent);
    
    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
      expiresAt: result.session.expiresAt
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: error instanceof Error ? error.message : 'Login failed' 
    });
  }
}

/**
 * POST /api/auth/logout
 * Logout user
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const sessionToken = req.headers['x-session-token'] as string;
    
    if (sessionToken) {
      await authService.logoutUser(sessionToken);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}

/**
 * GET /api/auth/me
 * Get current user info
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
}

/**
 * POST /api/auth/change-password
 * Change user password
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    // Check for validation errors
    const errors = validationResult(req);
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

    await authService.changePassword(req.user.id, currentPassword, newPassword);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to change password' 
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const { email } = req.body;

    try {
      const token = await authService.createPasswordResetToken(email);
      
      // In production, send email with reset link
      // For now, return the token (remove this in production)
      res.json({ 
        message: 'If this email is registered, you will receive a password reset email',
        // Remove this token field in production
        token: process.env.NODE_ENV === 'development' ? token : undefined
      });
    } catch (error) {
      // Always return success message to prevent email enumeration
      res.json({ 
        message: 'If this email is registered, you will receive a password reset email' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const { token, newPassword } = req.body;

    await authService.resetPasswordWithToken(token, newPassword);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to reset password' 
    });
  }
}

/**
 * GET /api/auth/users (Admin only)
 * Get all users
 */
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = authService.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
}

/**
 * PUT /api/auth/users/:userId/deactivate (Admin only)
 * Deactivate user
 */
export async function deactivateUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    
    await authService.deactivateUser(userId);
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
}

/**
 * PUT /api/auth/users/:userId/activate (Admin only)
 * Activate user
 */
export async function activateUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    
    await authService.activateUser(userId);
    
    res.json({ message: 'User activated successfully' });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
}

/**
 * POST /api/auth/admin/reset-password/:userId (Admin only)
 * Admin reset user password
 */
export async function adminResetPassword(req: Request, res: Response): Promise<void> {
  try {
    // Check for validation errors
    const errors = validationResult(req);
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
    const token = await authService.createPasswordResetToken(user.email);
    await authService.resetPasswordWithToken(token, newPassword);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to reset password' 
    });
  }
}

/**
 * PUT /api/auth/users/:userId (Admin only)
 * Update user details
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    // Check for validation errors
    const errors = validationResult(req);
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
    const updatedUser = await authService.updateUser(userId, { username, email, role });
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
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to update user' 
    });
  }
}
