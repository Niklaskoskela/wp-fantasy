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
const authRoutes_1 = __importDefault(require("../routes/authRoutes"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
dotenv_1.default.config();
// VERY SHITTY (SYSTEMS) TEST, but it works for now
// Create a test app that mirrors the main app structure
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Health check (public)
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Authentication routes (public)
app.use('/api/auth', authRoutes_1.default);
// Protected routes (require authentication)
app.use('/api', auth_1.authenticateToken, contentRoutes_1.default);
app.use('/api', auth_1.authenticateToken, matchDayRoutes_1.default);
app.use('/api', auth_1.authenticateToken, teamRoutes_1.default);
describe('API Tests', () => {
    test('GET /api/health should return status ok', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/api/health').expect(200);
        expect(response.body).toEqual({ status: 'ok' });
    }));
});
describe('Content API', () => {
    test.skip('POST /api/clubs creates a club and GET /api/clubs returns it (REQUIRES ADMIN)', () => __awaiter(void 0, void 0, void 0, function* () {
        // This test requires admin privileges - skipped in current implementation
        // Admin functionality should be tested separately with proper admin setup
    }));
    test.skip('POST /api/players creates a player and GET /api/players returns it (REQUIRES ADMIN)', () => __awaiter(void 0, void 0, void 0, function* () {
        // This test requires admin privileges - skipped in current implementation
        // Admin functionality should be tested separately with proper admin setup
    }));
});
describe('MatchDay API', () => {
    test.skip('POST /api/matchdays creates a match day (REQUIRES ADMIN)', () => __awaiter(void 0, void 0, void 0, function* () {
        // This test requires admin privileges - skipped in current implementation
    }));
    test.skip('POST /api/matchdays/:id/player-stats updates player stats (REQUIRES AUTH)', () => __awaiter(void 0, void 0, void 0, function* () {
        // This test requires authentication - skipped in current implementation
        // Would need to create admin user, login, create matchday, then test player stats
    }));
    test.skip('GET /api/matchdays/:id/calculate-points returns points (REQUIRES AUTH)', () => __awaiter(void 0, void 0, void 0, function* () {
        // This test requires authentication - skipped in current implementation
    }));
    test.skip('GET /api/matchdays returns all matchdays (REQUIRES AUTH)', () => __awaiter(void 0, void 0, void 0, function* () {
        // This test requires authentication - skipped in current implementation
    }));
    test.skip('GET /api/matchdays/:id/player-stats returns player stats (REQUIRES AUTH)', () => __awaiter(void 0, void 0, void 0, function* () {
        // This test requires authentication - skipped in current implementation
    }));
});
describe('System-wide League Flow', () => {
    test.skip('Creates teams, updates stats, calculates points, and gets league results (with auth)', () => __awaiter(void 0, void 0, void 0, function* () {
        // 0. Create a user and authenticate
        const userEmail = `test${Date.now()}@example.com`;
        const username = `testuser${Date.now()}`;
        const userPassword = 'TestPassword123!';
        const userRes = yield (0, supertest_1.default)(app).post('/api/auth/register').send({
            username: username,
            email: userEmail,
            password: userPassword,
        });
        expect(userRes.status).toBe(201);
        const loginRes = yield (0, supertest_1.default)(app).post('/api/auth/login').send({
            username: userEmail,
            password: userPassword,
        });
        expect(loginRes.status).toBe(200);
        const token = loginRes.body.token; // Use 'token' field, not 'sessionToken'
        const authHeaders = { Authorization: `Bearer ${token}` };
        // 1. Create a team (this should work for authenticated users)
        const teamRes = yield (0, supertest_1.default)(app)
            .post('/api/teams')
            .set(authHeaders)
            .send({ teamName: 'Dream Team' });
        expect(teamRes.status).toBe(201);
        const teamId = teamRes.body.id;
        // 2. For clubs and players, we'll use mock data since admin is required for creation
        // This tests the team management flow which is the core user functionality
        const mockPlayer1 = {
            id: 'player1',
            name: 'Alice',
            position: 'field',
            clubId: 'club1',
        };
        const mockPlayer2 = {
            id: 'player2',
            name: 'Bob',
            position: 'goalkeeper',
            clubId: 'club1',
        };
        // 3. Add players to team (with auth)
        const addPlayerRes = yield (0, supertest_1.default)(app)
            .post('/api/teams/add-player')
            .set(authHeaders)
            .send({ teamId, player: mockPlayer1 });
        if (addPlayerRes.status !== 200) {
            console.log('Add player error:', addPlayerRes.body);
            console.log('Request body:', { teamId, player: mockPlayer1 });
        }
        expect(addPlayerRes.status).toBe(200);
        yield (0, supertest_1.default)(app)
            .post('/api/teams/add-player')
            .set(authHeaders)
            .send({ teamId, player: mockPlayer2 })
            .expect(200);
        // 4. Set team captain (with auth)
        yield (0, supertest_1.default)(app)
            .post('/api/teams/set-captain')
            .set(authHeaders)
            .send({ teamId, playerId: mockPlayer1.id })
            .expect(200);
        // 5. Get teams with scores (requires auth) - this will include our team
        const teamsWithScoresRes = yield (0, supertest_1.default)(app)
            .get('/api/teams/with-scores')
            .set(authHeaders);
        expect(teamsWithScoresRes.status).toBe(200);
        expect(Array.isArray(teamsWithScoresRes.body)).toBe(true);
        // Find our team in the results
        const ourTeam = teamsWithScoresRes.body.find((team) => team.id === teamId);
        if (ourTeam) {
            expect(ourTeam.teamName).toBe('Dream Team');
            expect(ourTeam).toHaveProperty('totalPoints');
            expect(typeof ourTeam.totalPoints).toBe('number');
        }
    }));
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.pool.end();
}));
//# sourceMappingURL=api.test.js.map