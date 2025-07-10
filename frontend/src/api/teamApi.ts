import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Team, Player, TeamWithScores } from '../../../shared/src/types';
import { API_URL } from '../config';

// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

export const teamApi = createApi({
  reducerPath: 'teamApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    getTeams: builder.query<Team[], void>({
      query: () => '/teams',
      providesTags: ['Team'],
    }),
    getTeamsWithScores: builder.query<TeamWithScores[], void>({
      query: () => '/teams/with-scores',
      providesTags: ['Team'],
    }),
    createTeam: builder.mutation<Team, { teamName: string }>({
      query: (body) => ({ url: '/teams', method: 'POST', body }),
      invalidatesTags: ['Team'],
    }),
    addPlayerToTeam: builder.mutation<Team, { teamId: string; player: Player }>(
      {
        query: (body) => ({ url: '/teams/add-player', method: 'POST', body }),
        invalidatesTags: ['Team'],
      }
    ),
    removePlayerFromTeam: builder.mutation<
      Team,
      { teamId: string; playerId: string }
    >({
      query: (body) => ({ url: '/teams/remove-player', method: 'POST', body }),
      invalidatesTags: ['Team'],
    }),
    setTeamCaptain: builder.mutation<
      Team,
      { teamId: string; playerId: string }
    >({
      query: (body) => ({ url: '/teams/set-captain', method: 'POST', body }),
      invalidatesTags: ['Team'],
    }),
    clearTeamsCache: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/teams/clear-cache', method: 'POST' }),
      invalidatesTags: ['Team'],
    }),
    clearAllCaches: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/cache/clear-all', method: 'POST' }),
      invalidatesTags: ['Team'],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamsWithScoresQuery,
  useCreateTeamMutation,
  useAddPlayerToTeamMutation,
  useRemovePlayerFromTeamMutation,
  useSetTeamCaptainMutation,
  useClearTeamsCacheMutation,
  useClearAllCachesMutation,
} = teamApi;
