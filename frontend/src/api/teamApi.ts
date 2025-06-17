import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Team, Player, TeamWithScores } from '../../../shared/dist/types';
import { API_URL } from '../config';

export const teamApi = createApi({
  reducerPath: 'teamApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
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
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamsWithScoresQuery,
  useCreateTeamMutation,
  useAddPlayerToTeamMutation,
  useRemovePlayerFromTeamMutation,
  useSetTeamCaptainMutation,
} = teamApi;
