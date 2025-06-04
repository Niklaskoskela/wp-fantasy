// Backend types example and utility functions
import { 
  Player, 
  Team, 
  Stats, 
  Club, 
  MatchDay,
  PlayerPosition,
  createDefaultStats,
  createDefaultPlayer,
  createDefaultTeam,
  serializePlayer,
  deserializePlayer,
  serializeTeam,
  deserializeTeam,
  SerializedPlayer,
  SerializedTeam
} from 'shared';

// Re-export types for backend usage
export {
  Player,
  Team,
  Stats,
  Club,
  MatchDay,
  PlayerPosition,
  SerializedPlayer,
  SerializedTeam
};

// Backend-specific utility functions
export class PlayerService {
  static calculatePlayerScore(stats: Stats, matchDay: MatchDay): number {
    // Example scoring logic - you can adjust this based on your fantasy rules
    const baseScore = 
      stats.goals * 5 +
      stats.assists * 3 +
      stats.blocks * 2 +
      stats.steals * 2 +
      stats.pfDrawn * 1 +
      stats.saves * 4 +
      stats.wins * 3 -
      stats.pf * 1 -
      stats.ballsLost * 0.5 -
      stats.contraFouls * 1 -
      stats.brutality * 2;
    
    return Math.round(baseScore * matchDay.multiplier);
  }

  static updatePlayerStats(player: Player, matchDayNumber: number, stats: Stats): Player {
    const updatedPlayer = { ...player };
    updatedPlayer.statsHistory.set(matchDayNumber, stats);
    return updatedPlayer;
  }
}

export class TeamService {
  static calculateTeamScore(team: Team, matchDayNumber: number, matchDay: MatchDay): number {
    let totalScore = 0;
    
    for (const player of team.players) {
      const playerStats = player.statsHistory.get(matchDayNumber);
      if (playerStats) {
        let playerScore = PlayerService.calculatePlayerScore(playerStats, matchDay);
        
        // Captain gets double points
        if (player.captain) {
          playerScore *= 2;
        }
        
        totalScore += playerScore;
        
        // Update player's score history
        player.scoreHistory.set(matchDayNumber, playerScore);
      }
    }
    
    // Update team's score history
    team.scoreHistory.set(matchDayNumber, totalScore);
    
    return totalScore;
  }

  static setTeamCaptain(team: Team, playerId: string): Team {
    const updatedTeam = { ...team };
    
    // Remove captain status from all players
    updatedTeam.players = updatedTeam.players.map(player => ({
      ...player,
      captain: false
    }));
    
    // Set new captain
    const captainIndex = updatedTeam.players.findIndex(player => player.id === playerId);
    if (captainIndex !== -1) {
      updatedTeam.players[captainIndex].captain = true;
      updatedTeam.teamCaptain = updatedTeam.players[captainIndex];
    }
    
    return updatedTeam;
  }
}

// Database-related types for PostgreSQL
export interface DatabasePlayer extends Omit<SerializedPlayer, 'club'> {
  club_id: string;
}

export interface DatabaseTeam extends Omit<SerializedTeam, 'players' | 'teamCaptain'> {
  captain_id: string;
}

// Utility functions for database conversion
export function playerToDatabase(player: SerializedPlayer, clubId: string): DatabasePlayer {
  const { club, ...rest } = player;
  return {
    ...rest,
    club_id: clubId
  };
}

export function playerFromDatabase(dbPlayer: DatabasePlayer, club: Club): SerializedPlayer {
  const { club_id, ...rest } = dbPlayer;
  return {
    ...rest,
    club
  };
}
