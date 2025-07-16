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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubService = void 0;
const database_1 = require("../config/database");
// Cache storage
let allClubsCache = null;
const clubByIdCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds (clubs change less frequently)
class ClubService {
    // Function to invalidate all club caches
    static invalidateClubCaches() {
        allClubsCache = null;
        clubByIdCache.clear();
    }
    static createClub(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.pool.query('INSERT INTO clubs (name) VALUES ($1) RETURNING id, name', [name]);
            // Invalidate caches since new club was created
            ClubService.invalidateClubCaches();
            return { id: result.rows[0].id.toString(), name: result.rows[0].name };
        });
    }
    static getAllClubs() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check cache first
            if (allClubsCache &&
                Date.now() - allClubsCache.timestamp < CACHE_DURATION) {
                return allClubsCache.data;
            }
            const result = yield database_1.pool.query('SELECT id, name FROM clubs ORDER BY name');
            const clubs = result.rows.map((row) => ({
                id: row.id.toString(),
                name: row.name,
            }));
            // Cache the result
            allClubsCache = {
                data: clubs,
                timestamp: Date.now(),
            };
            return clubs;
        });
    }
    static getClubById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check cache first
            const cached = clubByIdCache.get(id);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.data;
            }
            const result = yield database_1.pool.query('SELECT id, name FROM clubs WHERE id = $1', [id]);
            const club = result.rows.length === 0
                ? null
                : { id: result.rows[0].id.toString(), name: result.rows[0].name };
            // Cache the result
            clubByIdCache.set(id, {
                data: club,
                timestamp: Date.now(),
            });
            return club;
        });
    }
}
exports.ClubService = ClubService;
//# sourceMappingURL=clubService.js.map