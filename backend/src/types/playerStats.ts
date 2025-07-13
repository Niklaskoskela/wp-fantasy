export interface PlayerStats {
    id: number;
    player_id: number;
    matchday_id: number;
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
    points: number;
  }
  
  export interface PlayerStatsWithDetails extends PlayerStats {
    player_name?: string;
    team_name?: string;
    matchday_name?: string;
  }
  
  export interface PlayerStatsQuery {
    player_id?: number;
    matchday_id?: number;
    limit?: number;
    offset?: number;
  }