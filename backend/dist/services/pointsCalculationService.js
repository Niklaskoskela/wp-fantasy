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
exports.PointsCalculationService = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
class PointsCalculationService {
    constructor(database) {
        this.db = database;
    }
    processMatchData(csvFilePath, matchdayId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const matchData = yield this.parseCsvFile(csvFilePath);
                const processedData = yield this.saveMatchData(matchData, matchdayId);
                return {
                    success: true,
                    matchesProcessed: processedData.length,
                    pointsCalculated: processedData.length,
                    data: processedData,
                };
            }
            catch (error) {
                console.error('Error processing match data:', error);
                throw error;
            }
        });
    }
    parseCsvFile(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            if (!fs_1.default.existsSync(filePath)) {
                console.error(`CSV file does not exist: ${filePath}`);
                reject(new Error(`File not found: ${filePath}`));
                return;
            }
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)({ separator: ';' }))
                .on('data', (data) => {
                const mappedData = {
                    team: data.TEAM || '',
                    player_id: parseInt(data.PLAYER) || 0,
                    player_name: data.PLAYER_NAME || `Player ${data.PLAYER}`,
                    goals: parseInt(data.GOALS) || 0,
                    assists: parseInt(data.ASSISTS) || 0,
                    blocks: parseInt(data.BLOCKS) || 0,
                    steals: parseInt(data.STEALS) || 0,
                    pf_drawn: parseInt(data['PF DRAWN']) || 0,
                    pf: parseInt(data['PERSONAL FOULS']) || 0,
                    balls_lost: parseInt(data['BALLS LOST']) || 0,
                    contra_fouls: parseInt(data['OFFENSIVE FOULS']) || 0,
                    shots: parseInt(data.ATTEMPTS) || 0,
                    swim_offs: parseInt(data.SWIMOFFS) || 0,
                    brutality: parseInt(data.BRUTALITY) || 0,
                    saves: parseInt(data.SAVES) || 0,
                    wins: parseInt(data.WINS) || 0,
                };
                results.push(mappedData);
            })
                .on('end', () => {
                resolve(results);
            })
                .on('error', (error) => {
                console.error('Error parsing CSV:', error);
                reject(error);
            });
        });
    }
    saveMatchData(matchData, matchdayId) {
        return __awaiter(this, void 0, void 0, function* () {
            const savedData = [];
            // STEP 0: Group players by team and sum goals
            const teamGoalsMap = {};
            for (const data of matchData) {
                const team = data.team;
                if (!teamGoalsMap[team])
                    teamGoalsMap[team] = 0;
                teamGoalsMap[team] += data.goals;
            }
            const [teamA, teamB] = Object.keys(teamGoalsMap);
            const teamAGoals = teamGoalsMap[teamA];
            const teamBGoals = teamGoalsMap[teamB];
            // Determine the winning team (or null for a tie)
            let winningTeam = null;
            if (teamAGoals > teamBGoals) {
                winningTeam = teamA;
            }
            else if (teamBGoals > teamAGoals) {
                winningTeam = teamB;
            }
            const winPoints = matchdayId < 12 ? 2 : 5;
            for (const data of matchData) {
                try {
                    const playerQuery = `SELECT id FROM players WHERE name = $1 LIMIT 1`;
                    const cleanName = data.player_name.replace(/^Player\s+/i, '').trim();
                    const result = yield this.db.query(playerQuery, [cleanName]);
                    if (!result.rows || result.rows.length === 0) {
                        console.warn(`⚠️ Player not found in database: ${cleanName}. Skipping.`);
                        continue;
                    }
                    const playerId = result.rows[0].id;
                    const wins = data.team === winningTeam ? 5 : 0;
                    const playerDataWithWins = Object.assign(Object.assign({}, data), { wins, player_id: playerId });
                    const points = this.calculatePlayerPoints(playerDataWithWins, winPoints);
                    const insertQuery = `
        INSERT INTO player_stats (
          player_id, matchday_id, goals, assists, blocks, steals, pf_drawn,
          pf, balls_lost, contra_fouls, shots, swim_offs, brutality, saves, wins, points
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        ON CONFLICT (player_id, matchday_id) DO UPDATE SET
          goals = EXCLUDED.goals,
          assists = EXCLUDED.assists,
          blocks = EXCLUDED.blocks,
          steals = EXCLUDED.steals,
          pf_drawn = EXCLUDED.pf_drawn,
          pf = EXCLUDED.pf,
          balls_lost = EXCLUDED.balls_lost,
          contra_fouls = EXCLUDED.contra_fouls,
          shots = EXCLUDED.shots,
          swim_offs = EXCLUDED.swim_offs,
          brutality = EXCLUDED.brutality,
          saves = EXCLUDED.saves,
          wins = EXCLUDED.wins,
          points = EXCLUDED.points;
      `;
                    const values = [
                        playerId,
                        matchdayId,
                        data.goals,
                        data.assists,
                        data.blocks,
                        data.steals,
                        data.pf_drawn,
                        data.pf,
                        data.balls_lost,
                        data.contra_fouls,
                        data.shots,
                        data.swim_offs,
                        data.brutality,
                        data.saves,
                        wins,
                        points,
                    ];
                    yield this.db.query(insertQuery, values);
                    savedData.push(Object.assign(Object.assign({}, data), { player_id: playerId, wins }));
                }
                catch (error) {
                    console.error(`❌ Error saving data for player ${data.player_name}:`, error);
                    throw error;
                }
            }
            return savedData;
        });
    }
    calculatePlayerPoints(playerData, winPointsPerWin) {
        var _a;
        let points;
        if (playerData.player_id === 1 || playerData.player_id === 13) {
            points = playerData.goals * 33 + playerData.saves;
        }
        else {
            points =
                playerData.goals * 5 +
                    playerData.assists * 3 +
                    2 * (playerData.pf_drawn + playerData.swim_offs + playerData.blocks + playerData.steals) +
                    ((_a = playerData.wins) !== null && _a !== void 0 ? _a : 0) * winPointsPerWin +
                    playerData.saves -
                    playerData.pf -
                    playerData.shots -
                    playerData.contra_fouls -
                    playerData.balls_lost -
                    playerData.brutality * 30;
        }
        return points;
    }
}
exports.PointsCalculationService = PointsCalculationService;
//# sourceMappingURL=pointsCalculationService.js.map