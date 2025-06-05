import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MatchDay, Stats } from '../../../shared/dist/types';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const matchDayApi = createApi({
  reducerPath: 'matchDayApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['MatchDay', 'PlayerStats'],
  endpoints: (builder) => ({
    getMatchDays: builder.query<MatchDay[], void>({
      query: () => '/matchdays',
      providesTags: ['MatchDay'],
    }),
    createMatchDay: builder.mutation<MatchDay, { title: string }>({
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
      invalidatesTags: ['PlayerStats'],
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
  }),
});

export const {
  useGetMatchDaysQuery,
  useCreateMatchDayMutation,
  useUpdatePlayerStatsMutation,
  useCalculatePointsQuery,
  useLazyCalculatePointsQuery,
} = matchDayApi;
