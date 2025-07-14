import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../../../shared/dist/types';
declare module 'express-serve-static-core' {
    interface Request {
        user?: User;
    }
}
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): void;
export declare function authenticateSession(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireRole(role: UserRole): (req: Request, res: Response, next: NextFunction) => void;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): void;
export declare function requireTeamOwnership(req: Request, res: Response, next: NextFunction): void;
export declare function requireAuthenticatedUser(req: Request, res: Response, next: NextFunction): void;
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): void;
