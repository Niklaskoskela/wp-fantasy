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
// PlayerService split from clubService for player management
const pg_1 = require("pg");
const pool = new pg_1.Pool();
class PlayerService {
    static createPlayer(name, position, clubId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('INSERT INTO players (name, position, club_id) VALUES ($1, $2, $3) RETURNING id, name, position, club_id', [name, position, clubId]);
            return {
                id: result.rows[0].id.toString(),
                name: result.rows[0].name,
                position: result.rows[0].position,
                club: { id: result.rows[0].club_id.toString(), name: '' }, // Name can be fetched with a join if needed
                statsHistory: new Map()
            };
        });
    }
    static getAllPlayers() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT id, name, position, club_id FROM players');
            return result.rows.map((row) => ({
                id: row.id.toString(),
                name: row.name,
                position: row.position,
                club: { id: row.club_id.toString(), name: '' },
                statsHistory: new Map()
            }));
        });
    }
    static getPlayerById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT id, name, position, club_id FROM players WHERE id = $1', [id]);
            if (result.rows.length === 0)
                return null;
            return {
                id: result.rows[0].id.toString(),
                name: result.rows[0].name,
                position: result.rows[0].position,
                club: { id: result.rows[0].club_id.toString(), name: '' },
                statsHistory: new Map()
            };
        });
    }
}
exports.PlayerService = PlayerService;
//# sourceMappingURL=playerService.js.map