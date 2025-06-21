// Authentication and authorization middleware
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../shared/dist/types';
import * as authService from '../services/authService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Authentication middleware - verify JWT token
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const user = authService.verifyJWT(token);
    if (!user) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Session-based authentication middleware
export function authenticateSession(req: Request, res: Response, next: NextFunction): void {
  const sessionToken = req.headers['x-session-token'] as string;
  
  if (!sessionToken) {
    res.status(401).json({ error: 'Session token required' });
    return;
  }

  try {
    const user = authService.validateSession(sessionToken);
    if (!user) {
      res.status(403).json({ error: 'Invalid or expired session' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired session' });
  }
}

// Authorization middleware - check user role
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role !== role && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

// Admin-only middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

// Team ownership middleware - ensure user can only access their own team
export function requireTeamOwnership(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const teamId = req.params.teamId || req.body.teamId;
  
  // Admin can access any team
  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  // User can only access their own team
  if (req.user.teamId !== teamId) {
    res.status(403).json({ error: 'You can only manage your own team' });
    return;
  }

  next();
}

// Optional authentication middleware - sets user if token is valid, but doesn't require it
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const user = authService.verifyJWT(token);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
}
