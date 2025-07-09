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
// Routes for roster history management
const express_1 = require("express");
const rosterHistoryController = __importStar(require("../controllers/rosterHistoryController"));
const router = (0, express_1.Router)();
// More specific routes first to avoid conflicts
// Get all roster history for a specific team across all matchdays
router.get('/team/:teamId', rosterHistoryController.getTeamRosterHistory);
// Get all roster history for a specific matchday across all teams
router.get('/matchday/:matchDayId', rosterHistoryController.getMatchDayRosterHistory);
// Snapshot all current team rosters for a matchday
router.post('/snapshot/:matchDayId', rosterHistoryController.snapshotAllTeamRosters);
// Check if roster history exists for a team and matchday
router.get('/check/:teamId/:matchDayId', rosterHistoryController.checkRosterHistory);
// Generic routes with parameters last
// Create roster history for a team on a specific matchday
router.post('/:teamId/:matchDayId', rosterHistoryController.createRosterHistory);
// Get roster history for a specific team and matchday
router.get('/:teamId/:matchDayId', rosterHistoryController.getRosterHistory);
// Remove roster history for a specific team and matchday
router.delete('/:teamId/:matchDayId', rosterHistoryController.removeRosterHistory);
exports.default = router;
//# sourceMappingURL=rosterHistoryRoutes.js.map