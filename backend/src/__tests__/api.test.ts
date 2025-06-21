import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import contentRoutes from '../routes/contentRoutes';
import matchDayRoutes from '../routes/matchDayRoutes';
import teamRoutes from '../routes/teamRoutes';
import authRoutes from '../routes/authRoutes';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../services/clubService'; // Adjust path if needed

dotenv.config();
// VERY SHITTY (SYSTEMS) TEST, but it works for now
// Create a test app that mirrors the main app structure
const app = express();
app.use(express.json());

// Health check (public)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api', authenticateToken, contentRoutes);
app.use('/api', authenticateToken, matchDayRoutes);
app.use('/api', authenticateToken, teamRoutes);

describe('API Tests', () => {
  test('GET /api/health should return status ok', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('Content API', () => {
  test.skip('POST /api/clubs creates a club and GET /api/clubs returns it (REQUIRES ADMIN)', async () => {
    // This test requires admin privileges - skipped in current implementation
    // Admin functionality should be tested separately with proper admin setup
  });

  test.skip('POST /api/players creates a player and GET /api/players returns it (REQUIRES ADMIN)', async () => {
    // This test requires admin privileges - skipped in current implementation  
    // Admin functionality should be tested separately with proper admin setup
  });
});

describe('MatchDay API', () => {
  test.skip('POST /api/matchdays creates a match day (REQUIRES ADMIN)', async () => {
    // This test requires admin privileges - skipped in current implementation
  });

  test('POST /api/matchdays/:id/player-stats updates player stats', async () => {
    // Create match day with required fields
    const title = 'Stats Day';
    const startTime = new Date();
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
    const matchDayRes = await request(app)
      .post('/api/matchdays')
      .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
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
    // Create match day with required fields
    const title = 'Points Day';
    const startTime = new Date();
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
    const matchDayRes = await request(app)
      .post('/api/matchdays')
      .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
    const matchDayId = matchDayRes.body.id;
    // Should return array (empty teams)
    const res = await request(app)
      .get(`/api/matchdays/${matchDayId}/calculate-points`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/matchdays returns all matchdays', async () => {
    // Create a matchday first
    const title = `Test MD ${Date.now()}`;
    const startTime = new Date();
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await request(app)
      .post('/api/matchdays')
      .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
    
    const res = await request(app)
      .get('/api/matchdays')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((md: any) => md.title === title)).toBe(true);
  });

  test('GET /api/matchdays/:id/player-stats returns player stats', async () => {
    // Create match day and add some stats
    const title = 'Player Stats Day';
    const startTime = new Date();
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const matchDayRes = await request(app)
      .post('/api/matchdays')
      .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
    const matchDayId = matchDayRes.body.id;
    
    const playerId = 'test-player';
    const stats = { id: 'stats-1', goals: 1, assists: 2, blocks: 0, steals: 0, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 0, wins: 0 };
    await request(app)
      .post(`/api/matchdays/${matchDayId}/player-stats`)
      .send({ playerId, stats });
    
    const res = await request(app)
      .get(`/api/matchdays/${matchDayId}/player-stats`)
      .expect(200);
    expect(res.body).toHaveProperty(playerId);
    expect(res.body[playerId].goals).toBe(1);
    expect(res.body[playerId].assists).toBe(2);
  });
});

describe('System-wide League Flow', () => {
  test('Creates teams, updates stats, calculates points, and gets league results (with auth)', async () => {
    // 0. Create a user and authenticate
    const userEmail = `test${Date.now()}@example.com`;
    const username = `testuser${Date.now()}`;
    const userPassword = 'TestPassword123!';
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: username,
        email: userEmail,
        password: userPassword
      });
    
    expect(userRes.status).toBe(201);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: userEmail,
        password: userPassword
      });
    
    expect(loginRes.status).toBe(200);
    
    const token = loginRes.body.token;  // Use 'token' field, not 'sessionToken'
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 1. Create a team (this should work for authenticated users)
    const teamRes = await request(app)
      .post('/api/teams')
      .set(authHeaders)
      .send({ teamName: 'Dream Team' });
    
    expect(teamRes.status).toBe(201);
    const teamId = teamRes.body.id;
    
    // 2. For clubs and players, we'll use mock data since admin is required for creation
    // This tests the team management flow which is the core user functionality
    const mockPlayer1 = { id: 'player1', name: 'Alice', position: 'field', clubId: 'club1' };
    const mockPlayer2 = { id: 'player2', name: 'Bob', position: 'goalkeeper', clubId: 'club1' };
    
    // 3. Add players to team (with auth)
    await request(app)
      .post('/api/teams/add-player')
      .set(authHeaders)
      .send({ teamId, player: mockPlayer1 })
      .expect(200);
      
    await request(app)
      .post('/api/teams/add-player') 
      .set(authHeaders)
      .send({ teamId, player: mockPlayer2 })
      .expect(200);
      
    // 4. Set team captain (with auth)
    await request(app)
      .post('/api/teams/set-captain')
      .set(authHeaders)
      .send({ teamId, playerId: mockPlayer1.id })
      .expect(200);

    // 5. Get teams with scores (requires auth) - this will include our team
    const teamsWithScoresRes = await request(app)
      .get('/api/teams/with-scores')
      .set(authHeaders);
    
    expect(teamsWithScoresRes.status).toBe(200);
    expect(Array.isArray(teamsWithScoresRes.body)).toBe(true);
    
    // Find our team in the results
    const ourTeam = teamsWithScoresRes.body.find((team: any) => team.id === teamId);
    if (ourTeam) {
      expect(ourTeam.teamName).toBe('Dream Team');
      expect(ourTeam).toHaveProperty('totalPoints');
      expect(typeof ourTeam.totalPoints).toBe('number');
    }
  });
});

afterAll(async () => {
  await pool.end();
});
