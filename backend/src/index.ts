import express from 'express';
import dotenv from 'dotenv';
import router from './routes/contentRoutes';
import cors from 'cors';
import teamRoutes from './routes/teamRoutes';
import matchDayRoutes from './routes/matchDayRoutes';
import rosterHistoryRoutes from './routes/rosterHistoryRoutes';

dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', router);
app.use('/api', teamRoutes);
app.use('/api', matchDayRoutes);
app.use('/api/roster-history', rosterHistoryRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});