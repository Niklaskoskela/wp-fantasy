import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { pool } from '../config/database';
dotenv.config();

const router = express.Router();

// GET /api/budgetplayers?search=...&position=...&minPrice=...&maxPrice=...
router.get('/', async (req, res) => {
  try {
    const { search, position, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM budget_players WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }
    if (position) {
      params.push(position);
      query += ` AND position = $${params.length}`;
    }
    if (minPrice) {
      params.push(Number(minPrice));
      query += ` AND price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      query += ` AND price <= $${params.length}`;
    }
    query += ' ORDER BY price DESC, points DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching budget players:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

export default router;
