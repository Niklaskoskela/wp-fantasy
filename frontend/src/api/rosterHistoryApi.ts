import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RosterHistory, RosterEntry } from '../../../shared/dist/types';
import { API_URL } from '../config';

// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

export const rosterHistoryApi = createApi({
  reducerPath: 'rosterHistoryApi',
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
  tagTypes: ['RosterHistory'],
  endpoints: (builder) => ({
    // Create roster history for a team on a specific matchday
    createRosterHistory: builder.mutation<
      RosterHistory[],
      { teamId: string; matchDayId: string; rosterEntries: RosterEntry[] }
    >({
      query: ({ teamId, matchDayId, rosterEntries }) => ({
        url: `/roster-history/${teamId}/${matchDayId}`,
        method: 'POST',
        body: rosterEntries,
      }),
      invalidatesTags: ['RosterHistory'],
    }),

    // Get roster history for a specific team and matchday
    getRosterHistory: builder.query<
      RosterHistory[],
      { teamId: string; matchDayId: string }
    >({
      query: ({ teamId, matchDayId }) => `/roster-history/${teamId}/${matchDayId}`,
      providesTags: (_result, _err, { teamId, matchDayId }) => [
        { type: 'RosterHistory', id: `${teamId}-${matchDayId}` },
      ],
    }),

    // Get all roster history for a specific team across all matchdays
    getTeamRosterHistory: builder.query<
      { [matchDayId: string]: RosterHistory[] },
      string
    >({
      query: (teamId) => `/roster-history/team/${teamId}`,
      providesTags: (_result, _err, teamId) => [
        { type: 'RosterHistory', id: `team-${teamId}` },
      ],
    }),

    // Get all roster history for a specific matchday across all teams
    getMatchDayRosterHistory: builder.query<
      { [teamId: string]: RosterHistory[] },
      string
    >({
      query: (matchDayId) => `/roster-history/matchday/${matchDayId}`,
      providesTags: (_result, _err, matchDayId) => [
        { type: 'RosterHistory', id: `matchday-${matchDayId}` },
      ],
    }),

    // Snapshot all current team rosters for a matchday
    snapshotAllTeamRosters: builder.mutation<
      { [teamId: string]: RosterHistory[] },
      string
    >({
      query: (matchDayId) => ({
        url: `/roster-history/snapshot/${matchDayId}`,
        method: 'POST',
      }),
      invalidatesTags: ['RosterHistory'],
    }),

    // Check if roster history exists for a team and matchday
    checkRosterHistory: builder.query<
      { exists: boolean },
      { teamId: string; matchDayId: string }
    >({
      query: ({ teamId, matchDayId }) => `/roster-history/check/${teamId}/${matchDayId}`,
      providesTags: (_result, _err, { teamId, matchDayId }) => [
        { type: 'RosterHistory', id: `check-${teamId}-${matchDayId}` },
      ],
    }),

    // Remove roster history for a specific team and matchday
    removeRosterHistory: builder.mutation<
      void,
      { teamId: string; matchDayId: string }
    >({
      query: ({ teamId, matchDayId }) => ({
        url: `/roster-history/${teamId}/${matchDayId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RosterHistory'],
    }),
  }),
});

export const {
  useCreateRosterHistoryMutation,
  useGetRosterHistoryQuery,
  useGetTeamRosterHistoryQuery,
  useGetMatchDayRosterHistoryQuery,
  useSnapshotAllTeamRostersMutation,
  useCheckRosterHistoryQuery,
  useRemoveRosterHistoryMutation,
} = rosterHistoryApi;
