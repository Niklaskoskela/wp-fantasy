"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teamController_1 = require("../controllers/teamController");
const router = (0, express_1.Router)();
// Helper to wrap async route handlers and forward errors
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
router.post('/teams', asyncHandler(teamController_1.createTeam));
router.post('/teams/add-player', asyncHandler(teamController_1.addPlayerToTeam));
router.post('/teams/remove-player', asyncHandler(teamController_1.removePlayerFromTeam));
router.post('/teams/set-captain', asyncHandler(teamController_1.setTeamCaptain));
router.get('/teams', asyncHandler(teamController_1.getTeams));
router.get('/teams/with-scores', asyncHandler(teamController_1.getTeamsWithScores));
router.get('/league/teams', asyncHandler(teamController_1.getTeamsWithScores));
router.post('/teams/clear-cache', asyncHandler(teamController_1.clearTeamsCache));
router.post('/cache/clear-all', asyncHandler(teamController_1.clearAllCaches));
exports.default = router;
//# sourceMappingURL=teamRoutes.js.map