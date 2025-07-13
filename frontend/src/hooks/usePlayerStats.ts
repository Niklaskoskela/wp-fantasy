import { useCallback } from 'react';
import { playerStatsApi } from '../api/playerStatsApi';
import { usePlayerStats } from '../contexts/PlayerStatsContext';
import { PlayerStatsQuery } from '../types/playerStats';

export const usePlayerStatsData = () => {
  const { state, dispatch } = usePlayerStats();

  const loadMatchdays = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await playerStatsApi.getAvailableMatchdays();
      dispatch({ type: 'SET_MATCHDAYS', payload: response.data });

      if (response.data.length > 0 && !state.selectedMatchday) {
        dispatch({
          type: 'SET_SELECTED_MATCHDAY',
          payload: response.data[0].id,
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load matchdays' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, state.selectedMatchday]);

  const loadAllStats = useCallback(
    async (filters: PlayerStatsQuery = {}) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const response = await playerStatsApi.getPlayerStats({
          limit: 100,
          ...filters,
        });
        dispatch({ type: 'SET_STATS', payload: response.data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load player stats' });
      }
    },
    [dispatch]
  );

  const loadMatchdayStats = useCallback(
    async (matchdayId: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const response =
          await playerStatsApi.getPlayerStatsByMatchday(matchdayId);
        dispatch({ type: 'SET_STATS', payload: response.data });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load matchday stats',
        });
      }
    },
    [dispatch]
  );

  const loadTopPerformers = useCallback(
    async (matchdayId?: number, limit: number = 20) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        const response = await playerStatsApi.getTopPerformers(
          matchdayId,
          limit
        );
        dispatch({ type: 'SET_STATS', payload: response.data });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load top performers',
        });
      }
    },
    [dispatch]
  );

  const setSelectedMatchday = useCallback(
    (matchdayId: number | null) => {
      dispatch({ type: 'SET_SELECTED_MATCHDAY', payload: matchdayId });
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    ...state,
    loadMatchdays,
    loadAllStats,
    loadMatchdayStats,
    loadTopPerformers,
    setSelectedMatchday,
    clearError,
    reset,
  };
};
