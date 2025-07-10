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
exports.PlayerService = void 0;
const database_1 = require("../config/database");
class PlayerService {
    static createPlayer(name, position, clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield database_1.pool.query('INSERT INTO players (name, position, club_id) VALUES ($1, $2, $3) RETURNING id, name, position, club_id', [name, position, clubId]);
            // Fetch the club name for the created player
            const clubResult = yield database_1.pool.query('SELECT name FROM clubs WHERE id = $1', [clubId]);
            const clubName = ((_a = clubResult.rows[0]) === null || _a === void 0 ? void 0 : _a.name) || '';
            return {
                id: result.rows[0].id.toString(),
                name: result.rows[0].name,
                position: result.rows[0].position,
                club: { id: result.rows[0].club_id.toString(), name: clubName },
                statsHistory: new Map()
            };
        });
    }
    static getAllPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.pool.query('SELECT p.id, p.name, p.position, p.club_id, c.name as club_name FROM players p JOIN clubs c ON p.club_id = c.id');
            return result.rows.map((row) => ({
                id: row.id.toString(),
                name: row.name,
                position: row.position,
                club: { id: row.club_id.toString(), name: row.club_name },
                statsHistory: new Map()
            }));
        });
    }
    static getPlayerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.pool.query('SELECT p.id, p.name, p.position, p.club_id, c.name as club_name FROM players p JOIN clubs c ON p.club_id = c.id WHERE p.id = $1', [id]);
            if (result.rows.length === 0)
                return null;
            return {
                id: result.rows[0].id.toString(),
                name: result.rows[0].name,
                position: result.rows[0].position,
                club: { id: result.rows[0].club_id.toString(), name: result.rows[0].club_name },
                statsHistory: new Map()
            };
        });
    }
}
exports.PlayerService = PlayerService;
//# sourceMappingURL=playerService.js.map