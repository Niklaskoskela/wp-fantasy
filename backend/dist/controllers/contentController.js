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
exports.PlayerController = exports.ClubController = void 0;
const clubService_1 = require("../services/clubService");
const playerService_1 = require("../services/playerService");
class ClubController {
    static createClub(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.body;
                if (!name) {
                    return res.status(400).json({ error: 'Club name is required' });
                }
                const club = yield clubService_1.ClubService.createClub(name);
                res.status(201).json(club);
            }
            catch (error) {
                console.error('Error in createClub:', error);
                res.status(500).json({ error: 'Failed to create club' });
            }
        });
    }
    static getAllClubs(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clubs = yield clubService_1.ClubService.getAllClubs();
                res.json(clubs);
            }
            catch (error) {
                console.error('Error in getAllClubs:', error);
                res.status(500).json({ error: 'Failed to fetch clubs' });
            }
        });
    }
    static getClub(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    return res.status(400).json({ error: 'Club id is required' });
                const club = yield clubService_1.ClubService.getClubById(id);
                if (!club)
                    return res.status(404).json({ error: 'Club not found' });
                res.json(club);
            }
            catch (error) {
                console.error('Error in getClub:', error);
                res.status(500).json({ error: 'Failed to fetch club' });
            }
        });
    }
}
exports.ClubController = ClubController;
class PlayerController {
    static createPlayer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, position, clubId } = req.body;
                if (!name || !position || !clubId) {
                    return res.status(400).json({ error: 'Missing required fields' });
                }
                const player = yield playerService_1.PlayerService.createPlayer(name, position, clubId);
                res.status(201).json(player);
            }
            catch (error) {
                console.error('Error in createPlayer:', error);
                res.status(500).json({ error: 'Failed to create player' });
            }
        });
    }
    static getAllPlayers(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const players = yield playerService_1.PlayerService.getAllPlayers();
                res.json(players);
            }
            catch (error) {
                console.error('Error in getAllPlayers:', error);
                res.status(500).json({ error: 'Failed to fetch players' });
            }
        });
    }
    static getPlayer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    return res.status(400).json({ error: 'Player id is required' });
                const player = yield playerService_1.PlayerService.getPlayerById(id);
                if (!player)
                    return res.status(404).json({ error: 'Player not found' });
                res.json(player);
            }
            catch (error) {
                console.error('Error in getPlayer:', error);
                res.status(500).json({ error: 'Failed to fetch player' });
            }
        });
    }
}
exports.PlayerController = PlayerController;
//# sourceMappingURL=contentController.js.map