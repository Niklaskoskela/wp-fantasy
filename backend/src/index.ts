import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import router from './routes/contentRoutes';
import teamRoutes from './routes/teamRoutes';
import matchDayRoutes from './routes/matchDayRoutes';
import rosterHistoryRoutes from './routes/rosterHistoryRoutes';
import authRoutes from './routes/authRoutes';
import { generalLimiter } from './middleware/rateLimiting';
import { authenticateToken, requireAdmin } from './middleware/auth';

dotenv.config();

const app = express();

// Logging middleware - log HTTP requests to console
app.use(morgan('tiny'));

// Security middleware
app.use(helmet({
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
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token'],
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Health check (public)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api', authenticateToken, router);
app.use('/api', authenticateToken, teamRoutes);
app.use('/api', authenticateToken, matchDayRoutes);
app.use('/api/roster-history', authenticateToken, rosterHistoryRoutes);

// Admin-only routes
app.use('/api/admin', authenticateToken, requireAdmin);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.all('/{*any}', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security features enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});