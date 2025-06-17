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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatchDay = createMatchDay;
exports.updatePlayerStats = updatePlayerStats;
exports.calculatePoints = calculatePoints;
exports.getMatchDays = getMatchDays;
exports.getPlayerStats = getPlayerStats;
const matchDayService = __importStar(require("../services/matchDayService"));
function createMatchDay(req, res) {
    const { title, startTime, endTime } = req.body;
    if (!title || !startTime || !endTime) {
        return res.status(400).json({ error: 'title, startTime, and endTime are required' });
    }
    const matchDay = matchDayService.createMatchDay(title, new Date(startTime), new Date(endTime));
    return res.status(201).json(matchDay);
}
function updatePlayerStats(req, res) {
    const { id: matchDayId } = req.params;
    const { playerId, stats } = req.body;
    if (!playerId || !stats)
        return res.status(400).json({ error: 'playerId and stats required' });
    const updated = matchDayService.updatePlayerStats(matchDayId, playerId, stats);
    if (!updated)
        return res.status(404).json({ error: 'MatchDay not found' });
    return res.json(updated);
}
function calculatePoints(req, res) {
    const { id: matchDayId } = req.params;
    const results = matchDayService.calculatePoints(matchDayId);
    return res.json(results);
}
function getMatchDays(_req, res) {
    return res.json(matchDayService.getMatchDays());
}
function getPlayerStats(req, res) {
    const { id: matchDayId } = req.params;
    const stats = matchDayService.getPlayerStats(matchDayId);
    return res.json(stats);
}
//# sourceMappingURL=matchDayController.js.map