"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchDayController_1 = require("../controllers/matchDayController");
const router = (0, express_1.Router)();
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
router.post('/matchdays', asyncHandler(matchDayController_1.createMatchDay));
router.post('/matchdays/:id/player-stats', asyncHandler(matchDayController_1.updatePlayerStats));
router.get('/matchdays/:id/player-stats', asyncHandler(matchDayController_1.getPlayerStats));
router.get('/matchdays/:id/calculate-points', asyncHandler(matchDayController_1.calculatePoints));
router.get('/matchdays', asyncHandler(matchDayController_1.getMatchDays));
exports.default = router;
//# sourceMappingURL=matchDayRoutes.js.map