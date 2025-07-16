"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchDay = createMatchDay;
exports.updatePlayerStats = updatePlayerStats;
exports.calculatePoints = calculatePoints;
exports.getMatchDays = getMatchDays;
exports.startMatchDay = startMatchDay;
exports.getPlayerStats = getPlayerStats;
const matchDayService = __importStar(require("../services/matchDayService"));
function createMatchDay(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, startTime, endTime } = req.body;
        if (!title || !startTime || !endTime) {
            res
                .status(400)
                .json({ error: 'title, startTime, and endTime are required' });
            return;
        }
        const matchDay = yield matchDayService.createMatchDay(title, new Date(startTime), new Date(endTime));
        res.status(201).json(matchDay);
    });
}
function updatePlayerStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: matchDayId } = req.params;
        const { playerId, stats } = req.body;
        if (!playerId || !stats) {
            res.status(400).json({ error: 'playerId and stats required' });
            return;
        }
        const updated = yield matchDayService.updatePlayerStats(matchDayId, playerId, stats);
        if (!updated) {
            res.status(404).json({ error: 'MatchDay not found' });
            return;
        }
        res.json(updated);
    });
}
function calculatePoints(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: matchDayId } = req.params;
        const results = yield matchDayService.calculatePoints(matchDayId);
        res.json(results);
    });
}
function getMatchDays(_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchDays = yield matchDayService.getMatchDays();
        res.json(matchDays);
    });
}
function startMatchDay(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: matchDayId } = req.params;
        try {
            const result = yield matchDayService.startMatchDay(matchDayId);
            if (!result) {
                res.status(404).json({ error: 'MatchDay not found' });
                return;
            }
            res.json({ message: 'MatchDay started successfully', matchDayId });
        }
        catch (error) {
            console.error('Error starting matchday:', error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}
function getPlayerStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id: matchDayId } = req.params;
        const stats = yield matchDayService.getPlayerStats(matchDayId);
        res.json(stats);
    });
}
//# sourceMappingURL=matchDayController.js.map