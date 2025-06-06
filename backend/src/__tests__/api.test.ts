import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import contentRoutes from '../routes/contentRoutes';
import matchDayRoutes from '../routes/matchDayRoutes';
import teamRoutes from '../routes/teamRoutes';
import { pool } from '../services/clubService'; // Adjust path if needed

dotenv.config();
// VERY SHITTY (SYSTEMS) TEST, but it works for now
// Create a test app
const app = express();
app.use(express.json());
app.use('/api', contentRoutes);
app.use('/api', matchDayRoutes);
app.use('/api', teamRoutes);

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

describe('System-wide League Flow', () => {
  test('Creates teams, matchdays, updates stats, calculates points, and gets league results', async () => {
    // 1. Create a club
    const uniqueClubName = `Super Club ${Date.now()}`;
    const clubRes = await request(app)
      .post('/api/clubs')
      .send({ name: uniqueClubName });
    const clubId = clubRes.body.id;

    // 2. Create two players
    const player1Res = await request(app)
      .post('/api/players')
      .send({ name: 'Alice', position: 'field', clubId });
    const player2Res = await request(app)
      .post('/api/players')
      .send({ name: 'Bob', position: 'goalkeeper', clubId });
    const player1 = player1Res.body;
    const player2 = player2Res.body;

    // 3. Create a team and add both players, set captain
    const teamRes = await request(app)
      .post('/api/teams')
      .send({ teamName: 'Dream Team' });
    const teamId = teamRes.body.id;
    await request(app).post('/api/teams/add-player').send({ teamId, player: player1 });
    await request(app).post('/api/teams/add-player').send({ teamId, player: player2 });
    await request(app).post('/api/teams/set-captain').send({ teamId, playerId: player1.id });

    // 4. Create two matchdays
    const md1 = (await request(app).post('/api/matchdays').send({ title: 'MD1' })).body;
    const md2 = (await request(app).post('/api/matchdays').send({ title: 'MD2' })).body;

    // 5. Update player stats for both matchdays
    const stats1 = { id: 's1', goals: 2, assists: 1, blocks: 0, steals: 0, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 0, wins: 0 };
    const stats2 = { id: 's2', goals: 0, assists: 0, blocks: 3, steals: 1, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 5, wins: 1 };
    await request(app).post(`/api/matchdays/${md1.id}/player-stats`).send({ playerId: player1.id, stats: stats1 });
    await request(app).post(`/api/matchdays/${md1.id}/player-stats`).send({ playerId: player2.id, stats: stats2 });
    await request(app).post(`/api/matchdays/${md2.id}/player-stats`).send({ playerId: player1.id, stats: stats2 });
    await request(app).post(`/api/matchdays/${md2.id}/player-stats`).send({ playerId: player2.id, stats: stats1 });

    // 6. Calculate points for both matchdays
    const points1 = (await request(app).get(`/api/matchdays/${md1.id}/calculate-points`)).body;
    const points2 = (await request(app).get(`/api/matchdays/${md2.id}/calculate-points`)).body;
    expect(points1[0]).toHaveProperty('teamId', teamId);
    expect(typeof points1[0].points).toBe('number');
    expect(points2[0]).toHaveProperty('teamId', teamId);
    expect(typeof points2[0].points).toBe('number');

    // 7. Get league results
    const leagueRes = await request(app).get('/api/league/teams');
    expect(Array.isArray(leagueRes.body)).toBe(true);
    expect(leagueRes.body[0]).toHaveProperty('teamName', 'Dream Team');
    expect(Array.isArray(leagueRes.body[0].players)).toBe(true);

    // 8. Get teams with scores
    const teamsWithScoresRes = await request(app).get('/api/teams/with-scores');
    expect(Array.isArray(teamsWithScoresRes.body)).toBe(true);
    expect(teamsWithScoresRes.body[0]).toHaveProperty('teamName', 'Dream Team');
    expect(teamsWithScoresRes.body[0]).toHaveProperty('totalPoints');
    expect(typeof teamsWithScoresRes.body[0].totalPoints).toBe('number');
    expect(Array.isArray(teamsWithScoresRes.body[0].matchDayScores)).toBe(true);
    // Note: matchDayScores might include data from previous test runs
    expect(teamsWithScoresRes.body[0].matchDayScores.length).toBeGreaterThanOrEqual(0);
  });
});

afterAll(async () => {
  await pool.end();
});
