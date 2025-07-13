// frontend/src/contexts/PlayerStatsContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PlayerStatsWithDetails } from '../types/playerStats';
import { Matchday } from '../api/playerStatsApi';

interface PlayerStatsState {
  stats: PlayerStatsWithDetails[];
  matchdays: Matchday[];
  selectedMatchday: number | null;
  loading: boolean;
  error: string | null;
}

type PlayerStatsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STATS'; payload: PlayerStatsWithDetails[] }
  | { type: 'SET_MATCHDAYS'; payload: Matchday[] }
  | { type: 'SET_SELECTED_MATCHDAY'; payload: number | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: PlayerStatsState = {
  stats: [],
  matchdays: [],
  selectedMatchday: null,
  loading: false,
  error: null,
};

const playerStatsReducer = (
  state: PlayerStatsState,
  action: PlayerStatsAction
): PlayerStatsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload, loading: false };
    case 'SET_MATCHDAYS':
      return { ...state, matchdays: action.payload };
    case 'SET_SELECTED_MATCHDAY':
      return { ...state, selectedMatchday: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface PlayerStatsContextValue {
  state: PlayerStatsState;
  dispatch: React.Dispatch<PlayerStatsAction>;
}

const PlayerStatsContext = createContext<PlayerStatsContextValue | undefined>(
  undefined
);

export const usePlayerStats = () => {
  const context = useContext(PlayerStatsContext);
  if (!context) {
    throw new Error('usePlayerStats must be used within a PlayerStatsProvider');
  }
  return context;
};

interface PlayerStatsProviderProps {
  children: ReactNode;
}

export const PlayerStatsProvider: React.FC<PlayerStatsProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(playerStatsReducer, initialState);

  return (
    <PlayerStatsContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerStatsContext.Provider>
  );
};
