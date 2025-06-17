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
exports.ClubService = exports.pool = void 0;
// Club and Player services for content management
const pg_1 = require("pg");
exports.pool = new pg_1.Pool();
class ClubService {
    static createClub(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield exports.pool.query('INSERT INTO clubs (name) VALUES ($1) RETURNING id, name', [name]);
            return { id: result.rows[0].id.toString(), name: result.rows[0].name };
        });
    }
    static getAllClubs() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield exports.pool.query('SELECT id, name FROM clubs');
            return result.rows.map((row) => ({ id: row.id.toString(), name: row.name }));
        });
    }
    static getClubById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield exports.pool.query('SELECT id, name FROM clubs WHERE id = $1', [id]);
            if (result.rows.length === 0)
                return null;
            return { id: result.rows[0].id.toString(), name: result.rows[0].name };
        });
    }
}
exports.ClubService = ClubService;
//# sourceMappingURL=clubService.js.map