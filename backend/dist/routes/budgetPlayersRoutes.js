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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
dotenv_1.default.config();
const router = express_1.default.Router();
// GET /api/budgetplayers?search=...&position=...&minPrice=...&maxPrice=...
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, position, minPrice, maxPrice } = req.query;
        let query = 'SELECT * FROM budget_players WHERE 1=1';
        const params = [];
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
        const result = yield database_1.pool.query(query, params);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching budget players:', err);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
}));
exports.default = router;
//# sourceMappingURL=budgetPlayersRoutes.js.map