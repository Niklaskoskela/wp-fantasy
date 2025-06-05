import express from 'express';
import dotenv from 'dotenv';
import router from './routes/contentRoutes';
import teamRoutes from './routes/teamRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', router);
app.use('/api', teamRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});