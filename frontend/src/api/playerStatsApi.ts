import {
  PlayerStatsWithDetails,
  PlayerStatsQuery,
} from 'backend/src/types/playerStats';
import { API_URL } from '../config';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total: number;
  message?: string;
}

export interface Matchday {
  id: number;
  name: string;
}

export const playerStatsApi = {
  async getPlayerStats(
    filters: PlayerStatsQuery
  ): Promise<ApiResponse<PlayerStatsWithDetails[]>> {
    const params = new URLSearchParams();

    if (filters.player_id)
      params.append('player_id', filters.player_id.toString());
    if (filters.matchday_id)
      params.append('matchday_id', filters.matchday_id.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${API_URL}/players/stats?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getPlayerStatsByMatchday(
    matchdayId: number
  ): Promise<ApiResponse<PlayerStatsWithDetails[]>> {
    const response = await fetch(
      `${API_URL}/players/stats/matchday/${matchdayId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getTopPerformers(
    matchdayId?: number,
    limit: number = 10
  ): Promise<ApiResponse<PlayerStatsWithDetails[]>> {
    const params = new URLSearchParams();

    if (matchdayId) params.append('matchday_id', matchdayId.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_URL}/players/stats/top?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getAvailableMatchdays(): Promise<ApiResponse<Matchday[]>> {
    const response = await fetch(`${API_URL}/players/matchdays`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
