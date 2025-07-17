import csvParser from 'csv-parser';
import fs from 'fs';
import { Pool } from 'pg';

interface MatchData {
  team: string;
  player_name: string;
  goals: number;
  assists: number;
  blocks: number;
  steals: number;
  pf_drawn: number;
  pf: number;
  balls_lost: number;
  contra_fouls: number;
  shots: number;
  swim_offs: number;
  brutality: number;
  saves: number;
  wins?: number;
  player_id?: number;
}


export class PointsCalculationService {
  private db: Pool;

  constructor(database: Pool) {
    this.db = database;
  }
  

  async processMatchData(csvFilePath: string, matchdayId: number) {
    try {
      const matchData = await this.parseCsvFile(csvFilePath);
      const processedData = await this.saveMatchData(matchData, matchdayId);
      

      return {
        success: true,
        matchesProcessed: processedData.length,
        pointsCalculated: processedData.length,
        data: processedData,
      };
    } catch (error) {
      console.error('Error processing match data:', error);
      throw error;
    }
  }

  private parseCsvFile(filePath: string): Promise<MatchData[]> {
    return new Promise((resolve, reject) => {
      const results: MatchData[] = [];

      if (!fs.existsSync(filePath)) {
        console.error(`CSV file does not exist: ${filePath}`);
        reject(new Error(`File not found: ${filePath}`));
        return;
      }

      fs.createReadStream(filePath)
        .pipe(csvParser({ separator: ';' }))
        .on('data', (data: any) => {
          
          const mappedData: MatchData = {
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
        .on('error', (error: any) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        });
    });
  }

  private async saveMatchData(matchData: MatchData[], matchdayId: number): Promise<MatchData[]> {
  const savedData: MatchData[] = [];

  // STEP 0: Group players by team and sum goals
  const teamGoalsMap: Record<string, number> = {};

  for (const data of matchData) {
    const team = data.team;
    if (!teamGoalsMap[team]) teamGoalsMap[team] = 0;
    teamGoalsMap[team] += data.goals;
  }

  const [teamA, teamB] = Object.keys(teamGoalsMap);
  const teamAGoals = teamGoalsMap[teamA];
  const teamBGoals = teamGoalsMap[teamB];

  // Determine the winning team (or null for a tie)
  let winningTeam: string | null = null;
  if (teamAGoals > teamBGoals) {
    winningTeam = teamA;
  } else if (teamBGoals > teamAGoals) {
    winningTeam = teamB;
  }

  const winPoints = matchdayId < 12 ? 2 : 5;

  for (const data of matchData) {
    try {
      const playerQuery = `SELECT id FROM players WHERE name = $1 LIMIT 1`;

      const cleanName = data.player_name.replace(/^Player\s+/i, '').trim();
      const result = await this.db.query(playerQuery, [cleanName]);

      if (!result.rows || result.rows.length === 0) {
        console.warn(`⚠️ Player not found in database: ${cleanName}. Skipping.`);
        continue;
      }

      const playerId = result.rows[0].id;

      const wins = data.team === winningTeam ? 1 : 0;

      const playerDataWithWins = { ...data, wins, player_id: playerId };
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

      await this.db.query(insertQuery, values);
      savedData.push({ ...data, player_id: playerId, wins });
    } catch (error) {
      console.error(`❌ Error saving data for player ${data.player_name}:`, error);
      throw error;
    }
  }

  return savedData;
}

  private calculatePlayerPoints(playerData: MatchData, winPointsPerWin: number): number {
    let points: number;

    if (playerData.player_id === 1 || playerData.player_id === 13) {
        points = playerData.goals * 33 + playerData.saves;
    } else {
        points =
        playerData.goals * 5 + 
        playerData.assists * 3 +
        2 * (playerData.pf_drawn + playerData.swim_offs + playerData.blocks + playerData.steals) + 
        (playerData.wins ?? 0) * winPointsPerWin +
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