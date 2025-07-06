"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const contentRoutes_1 = __importDefault(require("./routes/contentRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const matchDayRoutes_1 = __importDefault(require("./routes/matchDayRoutes"));
const rosterHistoryRoutes_1 = __importDefault(require("./routes/rosterHistoryRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const rateLimiting_1 = require("./middleware/rateLimiting");
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token'],
}));
// Rate limiting
app.use(rateLimiting_1.generalLimiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check (public)
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Authentication routes (public)
app.use('/api/auth', authRoutes_1.default);
// Protected routes (require authentication)
app.use('/api', auth_1.authenticateToken, contentRoutes_1.default);
app.use('/api', auth_1.authenticateToken, teamRoutes_1.default);
app.use('/api', auth_1.authenticateToken, matchDayRoutes_1.default);
app.use('/api/roster-history', auth_1.authenticateToken, rosterHistoryRoutes_1.default);
// Admin-only routes
app.use('/api/admin', auth_1.authenticateToken, auth_1.requireAdmin);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('/{*any}', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔒 Security features enabled`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=index.js.map