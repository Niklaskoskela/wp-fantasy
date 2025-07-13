import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

interface MatchData {
  player_id: number;
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
  wins: number;
}

interface AggregatedPlayerData extends MatchData {
  matchday_id: number;
  points: number;
}

export class PointsCalculationService {
  private db: any;

  constructor(database: any) {
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
  
    for (const data of matchData) {
      try {
        // STEP 1: Look up the player by name
        const playerQuery = `SELECT id FROM players WHERE name = $1 LIMIT 1`;

        // Remove "Player " prefix (case-insensitive) from name
        const cleanName = data.player_name.replace(/^Player\s+/i, '').trim();
        const result = await this.db.query(playerQuery, [cleanName]);

        if (!result.rows || result.rows.length === 0) {
          console.warn(`⚠️ Player not found in database: ${cleanName}. Skipping.`);
          continue;
        }

        const playerId = result.rows[0].id;
  
        // STEP 2: Proceed with insert/update using the found playerId
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
        const initialPoints = this.calculatePlayerPoints(data);
  
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
          data.wins,
          initialPoints,
        ];
  
        await this.db.query(insertQuery, values);
        savedData.push({ ...data, player_id: playerId }); // update with the correct player_id
      } catch (error) {
        console.error(`❌ Error saving data for player ${data.player_name}:`, error);
        throw error;
      }
    }
  
    return savedData;
  }
  

  private calculatePlayerPoints(playerData: MatchData): number {
    let points: number;

    // Assuming players 1 and 13 are goalkeepers based on original logic
    if (playerData.player_id === 1 || playerData.player_id === 13) {
      points = playerData.goals * 33 + playerData.saves;
    } else {
      points =
        playerData.goals * 5 + 
        playerData.assists * 3 +
        2 * (playerData.pf_drawn + playerData.swim_offs + playerData.blocks + playerData.steals) + 
        playerData.wins * 2 +
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