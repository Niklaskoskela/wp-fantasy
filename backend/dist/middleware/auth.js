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
exports.authenticateToken = authenticateToken;
exports.authenticateSession = authenticateSession;
exports.requireRole = requireRole;
exports.requireAdmin = requireAdmin;
exports.requireTeamOwnership = requireTeamOwnership;
exports.requireAuthenticatedUser = requireAuthenticatedUser;
exports.optionalAuth = optionalAuth;
const types_1 = require("../../../shared/dist/types");
const authService = __importStar(require("../services/authService"));
// Authentication middleware - verify JWT token and session
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
                const sessionUser = yield authService.validateSession(sessionToken);
                if (!sessionUser) {
                    res.status(401).json({ error: 'Session expired or invalid' });
                    return;
                }
                req.user = sessionUser;
            }
            else {
                // Fallback: just verify the user exists and is active
                const currentUser = yield authService.getUserById(user.id);
                if (!currentUser || !currentUser.isActive) {
                    res.status(401).json({ error: 'User account is not active' });
                    return;
                }
                req.user = currentUser;
            }
            next();
        }
        catch (error) {
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    });
}
// Session-based authentication middleware
function authenticateSession(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessionToken = req.headers['x-session-token'];
        if (!sessionToken) {
            res.status(401).json({ error: 'Session token required' });
            return;
        }
        try {
            const user = yield authService.validateSession(sessionToken);
            if (!user) {
                res.status(403).json({ error: 'Invalid or expired session' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(403).json({ error: 'Invalid or expired session' });
        }
    });
}
// Authorization middleware - check user role
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (req.user.role !== role && req.user.role !== types_1.UserRole.ADMIN) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
// Admin-only middleware
function requireAdmin(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role !== types_1.UserRole.ADMIN) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}
// Team ownership middleware - ensure user can only access their own team
function requireTeamOwnership(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const teamId = req.params.teamId || req.body.teamId;
    // Admin can access any team
    if (req.user.role === types_1.UserRole.ADMIN) {
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
function requireAuthenticatedUser(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    next();
}
// Optional authentication middleware - sets user if token is valid, but doesn't require it
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            const jwtResult = authService.verifyJWT(token);
            if (jwtResult) {
                req.user = jwtResult.user;
            }
        }
        catch (error) {
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
//# sourceMappingURL=auth.js.map