import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import contentRoutes from '../routes/contentRoutes';
import matchDayRoutes from '../routes/matchDayRoutes';
import { pool } from '../services/clubService'; // Adjust path if needed

dotenv.config();
// VERY SHITTY (SYSTEMS) TEST, but it works for now
// Create a test app
const app = express();
app.use(express.json());
app.use('/api', contentRoutes);
app.use('/api', matchDayRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

describe('API Tests', () => {
  test('GET /api/health should return status ok', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('Content API', () => {
  test('POST /api/clubs creates a club and GET /api/clubs returns it', async () => {
    const clubName = `Test Club ${Date.now()}`;
    const createRes = await request(app)
      .post('/api/clubs')
      .send({ name: clubName })
      .expect(201);
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe(clubName);

    const getRes = await request(app)
      .get('/api/clubs')
      .expect(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.some((c: any) => c.name === clubName)).toBe(true);
  });

  test('POST /api/players creates a player and GET /api/players returns it', async () => {
    // Create a club first
    const clubName = `Player Club ${Date.now()}`;
    const clubRes = await request(app)
      .post('/api/clubs')
      .send({ name: clubName })
      .expect(201);
    const clubId = clubRes.body.id;
    const playerData = { name: `Test Player ${Date.now()}`, position: 'goalkeeper', clubId };
    const createRes = await request(app)
      .post('/api/players')
      .send(playerData)
      .expect(201);
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe(playerData.name);
    expect(createRes.body.position).toBe(playerData.position);
    expect(createRes.body.club.id).toBe(clubId);

    const getRes = await request(app)
      .get('/api/players')
      .expect(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.some((p: any) => p.name === playerData.name)).toBe(true);
  });
});

describe('MatchDay API', () => {
  test('POST /api/matchdays creates a match day', async () => {
    const title = `Match Day ${Date.now()}`;
    const res = await request(app)
      .post('/api/matchdays')
      .send({ title })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(title);
  });

  test('POST /api/matchdays/:id/player-stats updates player stats', async () => {
    // Create match day
    const matchDayRes = await request(app)
      .post('/api/matchdays')
      .send({ title: 'Stats Day' });
    const matchDayId = matchDayRes.body.id;
    // Fake player and stats
    const playerId = 'player-1';
    const stats = { id: 'stats-1', goals: 2, assists: 1, blocks: 0, steals: 0, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 0, wins: 0 };
    const res = await request(app)
      .post(`/api/matchdays/${matchDayId}/player-stats`)
      .send({ playerId, stats })
      .expect(200);
    expect(res.body.goals).toBe(2);
  });

  test('GET /api/matchdays/:id/calculate-points returns points', async () => {
    // Create match day
    const matchDayRes = await request(app)
      .post('/api/matchdays')
      .send({ title: 'Points Day' });
    const matchDayId = matchDayRes.body.id;
    // Should return array (empty teams)
    const res = await request(app)
      .get(`/api/matchdays/${matchDayId}/calculate-points`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(async () => {
  await pool.end();
});
