import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MatchDay, Stats } from '../../../shared/src/types';
import { API_URL } from '../config';

// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

export const matchDayApi = createApi({
  reducerPath: 'matchDayApi',
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
  tagTypes: ['MatchDay', 'PlayerStats'],
  endpoints: (builder) => ({
    getMatchDays: builder.query<MatchDay[], void>({
      query: () => '/matchdays',
      providesTags: ['MatchDay'],
    }),
    createMatchDay: builder.mutation<
      MatchDay,
      { title: string; startTime: string; endTime: string }
    >({
      query: (body) => ({ url: '/matchdays', method: 'POST', body }),
      invalidatesTags: ['MatchDay'],
    }),
    updatePlayerStats: builder.mutation<
      Stats,
      { matchDayId: string; playerId: string; stats: Stats }
    >({
      query: ({ matchDayId, ...body }) => ({
        url: `/matchdays/${matchDayId}/player-stats`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { matchDayId }) => [
        'PlayerStats',
        { type: 'PlayerStats', id: matchDayId },
      ],
    }),
    getPlayerStats: builder.query<{ [playerId: string]: Stats }, string>({
      query: (matchDayId) => `/matchdays/${matchDayId}/player-stats`,
      providesTags: (_result, _err, matchDayId) => [
        { type: 'PlayerStats', id: matchDayId },
      ],
    }),
    calculatePoints: builder.query<
      { teamId: string; points: number }[],
      string
    >({
      query: (matchDayId) => `/matchdays/${matchDayId}/calculate-points`,
      providesTags: (_result, _err, matchDayId) => [
        { type: 'PlayerStats', id: matchDayId },
      ],
    }),
    startMatchDay: builder.mutation<
      { message: string; matchDayId: string },
      string
    >({
      query: (matchDayId) => ({
        url: `/matchdays/${matchDayId}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['MatchDay'],
    }),
  }),
});

export const {
  useGetMatchDaysQuery,
  useCreateMatchDayMutation,
  useUpdatePlayerStatsMutation,
  useGetPlayerStatsQuery,
  useCalculatePointsQuery,
  useLazyCalculatePointsQuery,
  useStartMatchDayMutation,
} = matchDayApi;
