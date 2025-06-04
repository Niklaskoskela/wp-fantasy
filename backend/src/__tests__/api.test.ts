import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Create a test app
const app = express();
app.use(express.json());

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
