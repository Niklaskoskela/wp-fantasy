import express from 'express';
import multer from 'multer';
import path from 'path';
import { PointsCalculationService } from '../services/pointsCalculationService';
import { Router, Request, Response, NextFunction } from 'express';
import {
  createMatchDay,
  updatePlayerStats,
  calculatePoints,
  getMatchDays,
  getPlayerStats,
  startMatchDay,
} from '../controllers/matchDayController';
import { pool } from '../config/database';

const router = Router();
const upload = multer({ dest: path.join(__dirname, '/uploads/') });

const pointsService = new PointsCalculationService(pool);

function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next?: NextFunction
  ) => Promise<void | Response>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/matchdays', asyncHandler(createMatchDay));
router.post('/matchdays/:id/start', asyncHandler(startMatchDay));
router.post('/matchdays/:id/player-stats', asyncHandler(updatePlayerStats));
router.get('/matchdays/:id/player-stats', asyncHandler(getPlayerStats));
router.get('/matchdays/:id/calculate-points', asyncHandler(calculatePoints));
router.get('/matchdays', asyncHandler(getMatchDays));

router.post(
  '/admin/upload-match-data/:matchdayId',
  upload.array('csvFiles'),
  async (req, res) => {
    const matchdayId = parseInt(req.params.matchdayId, 10);
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
      const results = [];
      for (const file of files) {
        const result = await pointsService.processMatchData(file.path, matchdayId);
        results.push({ file: file.originalname, ...result });
      }
      res.json({ success: true, results });
    } catch (err) {
      console.error('Error processing uploaded files:', err);
      res.status(500).json({ error: 'Failed to process files' });
    }
  }
);

export default router;
