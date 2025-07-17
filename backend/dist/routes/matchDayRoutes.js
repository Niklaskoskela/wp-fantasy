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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const pointsCalculationService_1 = require("../services/pointsCalculationService");
const express_1 = require("express");
const matchDayController_1 = require("../controllers/matchDayController");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: path_1.default.join(__dirname, '/uploads/') });
const pointsService = new pointsCalculationService_1.PointsCalculationService(database_1.pool);
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
router.post('/matchdays', asyncHandler(matchDayController_1.createMatchDay));
router.post('/matchdays/:id/start', asyncHandler(matchDayController_1.startMatchDay));
router.post('/matchdays/:id/player-stats', asyncHandler(matchDayController_1.updatePlayerStats));
router.get('/matchdays/:id/player-stats', asyncHandler(matchDayController_1.getPlayerStats));
router.get('/matchdays/:id/calculate-points', asyncHandler(matchDayController_1.calculatePoints));
router.get('/matchdays', asyncHandler(matchDayController_1.getMatchDays));
router.post('/admin/upload-match-data/:matchdayId', upload.array('csvFiles'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const matchdayId = parseInt(req.params.matchdayId, 10);
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    try {
        const results = [];
        for (const file of files) {
            const result = yield pointsService.processMatchData(file.path, matchdayId);
            results.push(Object.assign({ file: file.originalname }, result));
        }
        res.json({ success: true, results });
    }
    catch (err) {
        console.error('Error processing uploaded files:', err);
        res.status(500).json({ error: 'Failed to process files' });
    }
}));
exports.default = router;
//# sourceMappingURL=matchDayRoutes.js.map