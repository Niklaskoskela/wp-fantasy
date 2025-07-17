// Authentication and authorization middleware
import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../../../shared/dist/types';
import * as authService from '../services/authService';

// Extend Express Request interface to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

// Authentication middleware - verify JWT token and session
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const jwtResult = authService.verifyJWT(token);
    if (!jwtResult) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    const { user, sessionToken } = jwtResult;

    // If there's a session token, validate it against the database
    if (sessionToken) {
      const sessionUser = await authService.validateSession(sessionToken);
      if (!sessionUser) {
        res.status(401).json({ error: 'Session expired or invalid' });
        return;
      }
      req.user = sessionUser;
    } else {
      // Fallback: just verify the user exists and is active
      const currentUser = await authService.getUserById(user.id);
      if (!currentUser || !currentUser.isActive) {
        res.status(401).json({ error: 'User account is not active' });
        return;
      }
      req.user = currentUser;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Session-based authentication middleware
export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sessionToken = req.headers['x-session-token'] as string;

  if (!sessionToken) {
    res.status(401).json({ error: 'Session token required' });
    return;
  }

  try {
    const user = await authService.validateSession(sessionToken);
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
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
export function requireTeamOwnership(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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

// Middleware: allow any authenticated user (any role)
export function requireAuthenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}

// Optional authentication middleware - sets user if token is valid, but doesn't require it
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const jwtResult = authService.verifyJWT(token);
      if (jwtResult) {
        req.user = jwtResult.user;
      }
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
}

// Usage notes:
// - Use requireAuthenticatedUser for GET endpoints (players, teams, matchdays) and for regular user actions (create/edit own team)
// - Use requireTeamOwnership for actions that should only be allowed by the team owner (edit team, add/remove players)
// - Use requireAdmin only for admin-only endpoints
// - Do NOT use requireRole or requireAdmin for endpoints regular users should access
