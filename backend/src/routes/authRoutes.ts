// Authentication routes
import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as authValidation from '../validation/auth';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
} from '../middleware/rateLimiting';

const router = Router();

// Public routes (with rate limiting)
router.post(
  '/register',
  registrationLimiter,
  authValidation.validateRegistration,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  authValidation.validateLogin,
  authController.login
);

router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  authValidation.validateForgotPassword,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  authValidation.validateResetPassword,
  authController.resetPassword
);

// Protected routes (require authentication)
router.get('/me', authenticateToken, authController.getCurrentUser);

router.post(
  '/change-password',
  authenticateToken,
  authValidation.validateChangePassword,
  authController.changePassword
);

// Admin-only routes
router.get(
  '/users',
  authenticateToken,
  requireAdmin,
  authController.getAllUsers
);

router.put(
  '/users/:userId/deactivate',
  authenticateToken,
  requireAdmin,
  authController.deactivateUser
);

router.put(
  '/users/:userId/activate',
  authenticateToken,
  requireAdmin,
  authController.activateUser
);

router.post(
  '/admin/reset-password/:userId',
  authenticateToken,
  requireAdmin,
  authController.adminResetPassword
);

router.put(
  '/users/:userId',
  authenticateToken,
  requireAdmin,
  authValidation.validateUpdateUser,
  authController.updateUser
);

export default router;
