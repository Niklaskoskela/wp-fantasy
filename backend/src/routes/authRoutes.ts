// Authentication routes
console.log('🔥 authRoutes.ts loaded');
import { Router } from 'express';
import express from 'express';
import * as authController from '../controllers/authController';
import * as authValidation from '../validation/auth';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { authLimiter, passwordResetLimiter, registrationLimiter } from '../middleware/rateLimiting';
import multer from 'multer';
import db from '../db'

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {

    }
  }
});
// Public routes (with rate limiting)
router.post('/register', 
  registrationLimiter,
  authValidation.validateRegistration,
  authController.register
);

router.post('/login', 
  authLimiter,
  authValidation.validateLogin,
  authController.login
);

router.post('/logout', 
  authController.logout
);

router.post('/forgot-password', 
  passwordResetLimiter,
  authValidation.validateForgotPassword,
  authController.forgotPassword
);

router.post('/reset-password', 
  authLimiter,
  authValidation.validateResetPassword,
  authController.resetPassword
);

// Protected routes (require authentication)
router.get('/me', 
  authenticateToken,
  authController.getCurrentUser
);

router.post('/change-password', 
  authenticateToken,
  authValidation.validateChangePassword,
  authController.changePassword
);

// Admin-only routes
router.get('/users', 
  authenticateToken,
  requireAdmin,
  authController.getAllUsers
);

router.put('/users/:userId/deactivate', 
  authenticateToken,
  requireAdmin,
  authController.deactivateUser
);

router.put('/users/:userId/activate', 
  authenticateToken,
  requireAdmin,
  authController.activateUser
);

router.post('/admin/reset-password/:userId', 
  authenticateToken,
  requireAdmin,
  authController.adminResetPassword
);

router.put('/users/:userId', 
  authenticateToken,
  requireAdmin,
  authValidation.validateUpdateUser,
  authController.updateUser
);

router.post('/upload-match-data/:matchdayId', (req, res, next) => {
  next();
}, upload.single('csvFile'), (req, res, next) => {
  next();
}, authController.uploadMatchData);

router.post('/test-upload', (req, res) => {
  console.log('🧪 Received test upload');
  res.json({ message: 'Test upload received!' });
});

export default router;
