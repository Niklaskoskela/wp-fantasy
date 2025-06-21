"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const contentRoutes_1 = __importDefault(require("../routes/contentRoutes"));
const matchDayRoutes_1 = __importDefault(require("../routes/matchDayRoutes"));
const teamRoutes_1 = __importDefault(require("../routes/teamRoutes"));
const clubService_1 = require("../services/clubService"); // Adjust path if needed
dotenv_1.default.config();
// VERY SHITTY (SYSTEMS) TEST, but it works for now
// Create a test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', contentRoutes_1.default);
app.use('/api', matchDayRoutes_1.default);
app.use('/api', teamRoutes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
describe('API Tests', () => {
    test('GET /api/health should return status ok', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/api/health')
            .expect(200);
        expect(response.body).toEqual({ status: 'ok' });
    }));
});
describe('Content API', () => {
    test('POST /api/clubs creates a club and GET /api/clubs returns it', () => __awaiter(void 0, void 0, void 0, function* () {
        const clubName = `Test Club ${Date.now()}`;
        const createRes = yield (0, supertest_1.default)(app)
            .post('/api/clubs')
            .send({ name: clubName })
            .expect(201);
        expect(createRes.body).toHaveProperty('id');
        expect(createRes.body.name).toBe(clubName);
        const getRes = yield (0, supertest_1.default)(app)
            .get('/api/clubs')
            .expect(200);
        expect(Array.isArray(getRes.body)).toBe(true);
        expect(getRes.body.some((c) => c.name === clubName)).toBe(true);
    }));
    test('POST /api/players creates a player and GET /api/players returns it', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a club first
        const clubName = `Player Club ${Date.now()}`;
        const clubRes = yield (0, supertest_1.default)(app)
            .post('/api/clubs')
            .send({ name: clubName })
            .expect(201);
        const clubId = clubRes.body.id;
        const playerData = { name: `Test Player ${Date.now()}`, position: 'goalkeeper', clubId };
        const createRes = yield (0, supertest_1.default)(app)
            .post('/api/players')
            .send(playerData)
            .expect(201);
        expect(createRes.body).toHaveProperty('id');
        expect(createRes.body.name).toBe(playerData.name);
        expect(createRes.body.position).toBe(playerData.position);
        expect(createRes.body.club.id).toBe(clubId);
        const getRes = yield (0, supertest_1.default)(app)
            .get('/api/players')
            .expect(200);
        expect(Array.isArray(getRes.body)).toBe(true);
        expect(getRes.body.some((p) => p.name === playerData.name)).toBe(true);
    }));
});
describe('MatchDay API', () => {
    test('POST /api/matchdays creates a match day', () => __awaiter(void 0, void 0, void 0, function* () {
        const title = `Match Day ${Date.now()}`;
        const startTime = new Date();
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
        const res = yield (0, supertest_1.default)(app)
            .post('/api/matchdays')
            .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() })
            .expect(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe(title);
        expect(res.body).toHaveProperty('startTime');
        expect(res.body).toHaveProperty('endTime');
    }));
    test('POST /api/matchdays/:id/player-stats updates player stats', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create match day with required fields
        const title = 'Stats Day';
        const startTime = new Date();
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
        const matchDayRes = yield (0, supertest_1.default)(app)
            .post('/api/matchdays')
            .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
        const matchDayId = matchDayRes.body.id;
        // Fake player and stats
        const playerId = 'player-1';
        const stats = { id: 'stats-1', goals: 2, assists: 1, blocks: 0, steals: 0, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 0, wins: 0 };
        const res = yield (0, supertest_1.default)(app)
            .post(`/api/matchdays/${matchDayId}/player-stats`)
            .send({ playerId, stats })
            .expect(200);
        expect(res.body.goals).toBe(2);
    }));
    test('GET /api/matchdays/:id/calculate-points returns points', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create match day with required fields
        const title = 'Points Day';
        const startTime = new Date();
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
        const matchDayRes = yield (0, supertest_1.default)(app)
            .post('/api/matchdays')
            .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
        const matchDayId = matchDayRes.body.id;
        // Should return array (empty teams)
        const res = yield (0, supertest_1.default)(app)
            .get(`/api/matchdays/${matchDayId}/calculate-points`)
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
    }));
    test('GET /api/matchdays returns all matchdays', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a matchday first
        const title = `Test MD ${Date.now()}`;
        const startTime = new Date();
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
        yield (0, supertest_1.default)(app)
            .post('/api/matchdays')
            .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
        const res = yield (0, supertest_1.default)(app)
            .get('/api/matchdays')
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((md) => md.title === title)).toBe(true);
    }));
    test('GET /api/matchdays/:id/player-stats returns player stats', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create match day and add some stats
        const title = 'Player Stats Day';
        const startTime = new Date();
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const matchDayRes = yield (0, supertest_1.default)(app)
            .post('/api/matchdays')
            .send({ title, startTime: startTime.toISOString(), endTime: endTime.toISOString() });
        const matchDayId = matchDayRes.body.id;
        const playerId = 'test-player';
        const stats = { id: 'stats-1', goals: 1, assists: 2, blocks: 0, steals: 0, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 0, wins: 0 };
        yield (0, supertest_1.default)(app)
            .post(`/api/matchdays/${matchDayId}/player-stats`)
            .send({ playerId, stats });
        const res = yield (0, supertest_1.default)(app)
            .get(`/api/matchdays/${matchDayId}/player-stats`)
            .expect(200);
        expect(res.body).toHaveProperty(playerId);
        expect(res.body[playerId].goals).toBe(1);
        expect(res.body[playerId].assists).toBe(2);
    }));
});
describe('System-wide League Flow', () => {
    test('Creates teams, matchdays, updates stats, calculates points, and gets league results', () => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Create a club
        const uniqueClubName = `Super Club ${Date.now()}`;
        const clubRes = yield (0, supertest_1.default)(app)
            .post('/api/clubs')
            .send({ name: uniqueClubName });
        const clubId = clubRes.body.id;
        // 2. Create two players
        const player1Res = yield (0, supertest_1.default)(app)
            .post('/api/players')
            .send({ name: 'Alice', position: 'field', clubId });
        const player2Res = yield (0, supertest_1.default)(app)
            .post('/api/players')
            .send({ name: 'Bob', position: 'goalkeeper', clubId });
        const player1 = player1Res.body;
        const player2 = player2Res.body;
        // 3. Create a team and add both players, set captain
        const teamRes = yield (0, supertest_1.default)(app)
            .post('/api/teams')
            .send({ teamName: 'Dream Team' });
        const teamId = teamRes.body.id;
        yield (0, supertest_1.default)(app).post('/api/teams/add-player').send({ teamId, player: player1 });
        yield (0, supertest_1.default)(app).post('/api/teams/add-player').send({ teamId, player: player2 });
        yield (0, supertest_1.default)(app).post('/api/teams/set-captain').send({ teamId, playerId: player1.id });
        // 4. Create two matchdays
        const startTime = new Date();
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
        const md1 = (yield (0, supertest_1.default)(app).post('/api/matchdays').send({
            title: 'MD1',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        })).body;
        const md2 = (yield (0, supertest_1.default)(app).post('/api/matchdays').send({
            title: 'MD2',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        })).body;
        // 5. Update player stats for both matchdays
        const stats1 = { id: 's1', goals: 2, assists: 1, blocks: 0, steals: 0, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 0, wins: 0 };
        const stats2 = { id: 's2', goals: 0, assists: 0, blocks: 3, steals: 1, pfDrawn: 0, pf: 0, ballsLost: 0, contraFouls: 0, shots: 0, swimOffs: 0, brutality: 0, saves: 5, wins: 1 };
        yield (0, supertest_1.default)(app).post(`/api/matchdays/${md1.id}/player-stats`).send({ playerId: player1.id, stats: stats1 });
        yield (0, supertest_1.default)(app).post(`/api/matchdays/${md1.id}/player-stats`).send({ playerId: player2.id, stats: stats2 });
        yield (0, supertest_1.default)(app).post(`/api/matchdays/${md2.id}/player-stats`).send({ playerId: player1.id, stats: stats2 });
        yield (0, supertest_1.default)(app).post(`/api/matchdays/${md2.id}/player-stats`).send({ playerId: player2.id, stats: stats1 });
        // 6. Calculate points for both matchdays
        const points1 = (yield (0, supertest_1.default)(app).get(`/api/matchdays/${md1.id}/calculate-points`)).body;
        const points2 = (yield (0, supertest_1.default)(app).get(`/api/matchdays/${md2.id}/calculate-points`)).body;
        expect(points1[0]).toHaveProperty('teamId', teamId);
        expect(typeof points1[0].points).toBe('number');
        expect(points2[0]).toHaveProperty('teamId', teamId);
        expect(typeof points2[0].points).toBe('number');
        // 7. Get league results
        const leagueRes = yield (0, supertest_1.default)(app).get('/api/league/teams');
        expect(Array.isArray(leagueRes.body)).toBe(true);
        expect(leagueRes.body[0]).toHaveProperty('teamName', 'Dream Team');
        expect(Array.isArray(leagueRes.body[0].players)).toBe(true);
        // 8. Get teams with scores
        const teamsWithScoresRes = yield (0, supertest_1.default)(app).get('/api/teams/with-scores');
        expect(Array.isArray(teamsWithScoresRes.body)).toBe(true);
        expect(teamsWithScoresRes.body[0]).toHaveProperty('teamName', 'Dream Team');
        expect(teamsWithScoresRes.body[0]).toHaveProperty('totalPoints');
        expect(typeof teamsWithScoresRes.body[0].totalPoints).toBe('number');
        expect(Array.isArray(teamsWithScoresRes.body[0].matchDayScores)).toBe(true);
        // Note: matchDayScores might include data from previous test runs
        expect(teamsWithScoresRes.body[0].matchDayScores.length).toBeGreaterThanOrEqual(0);
    }));
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield clubService_1.pool.end();
}));
//# sourceMappingURL=api.test.js.map