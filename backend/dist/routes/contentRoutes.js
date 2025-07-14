"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Content management routes for clubs and players
const express_1 = require("express");
const contentController_1 = require("../controllers/contentController");
const router = (0, express_1.Router)();
// Helper to wrap async route handlers and forward errors
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
// Club routes
router.post('/clubs', asyncHandler(contentController_1.ClubController.createClub));
router.get('/clubs', asyncHandler(contentController_1.ClubController.getAllClubs));
router.get('/clubs/:id', asyncHandler(contentController_1.ClubController.getClub));
router.post('/clubs/clear-cache', asyncHandler(contentController_1.ClubController.clearClubsCache));
// Player routes
router.post('/players', asyncHandler(contentController_1.PlayerController.createPlayer));
router.get('/players', asyncHandler(contentController_1.PlayerController.getAllPlayers));
router.get('/players/with-stats', asyncHandler(contentController_1.PlayerController.getPlayersWithStats));
router.get('/players/:id', asyncHandler(contentController_1.PlayerController.getPlayer));
router.post('/players/clear-cache', asyncHandler(contentController_1.PlayerController.clearPlayersCache));
exports.default = router;
//# sourceMappingURL=contentRoutes.js.map