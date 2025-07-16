import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Club, Player, PlayerWithStats } from '../../../shared/src/types';
import { API_URL } from '../config';

// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

export const contentApi = createApi({
  reducerPath: 'contentApi',
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
  tagTypes: ['Club', 'Player', 'PlayerStats'],
  endpoints: (builder) => ({
    getClubs: builder.query<Club[], void>({
      query: () => '/clubs',
      providesTags: ['Club'],
    }),
    getClub: builder.query<Club, string>({
      query: (id) => `/clubs/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Club', id }],
    }),
    createClub: builder.mutation<Club, { name: string }>({
      query: (body) => ({ url: '/clubs', method: 'POST', body }),
      invalidatesTags: ['Club'],
    }),
    getPlayers: builder.query<Player[], void>({
      query: () => '/players',
      providesTags: ['Player'],
    }),
    getPlayer: builder.query<Player, string>({
      query: (id) => `/players/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Player', id }],
    }),
    createPlayer: builder.mutation<
      Player,
      { name: string; position: string; clubId: string }
    >({
      query: (body) => ({ url: '/players', method: 'POST', body }),
      invalidatesTags: ['Player'],
    }),
    getPlayersWithStats: builder.query<
      PlayerWithStats[],
      { matchDayId?: string }
    >({
      query: ({ matchDayId }) => ({
        url: '/players/with-stats',
        params: matchDayId ? { matchDayId } : {},
      }),
      providesTags: ['PlayerStats'],
    }),
  }),
});

export const {
  useGetClubsQuery,
  useGetClubQuery,
  useCreateClubMutation,
  useGetPlayersQuery,
  useGetPlayerQuery,
  useCreatePlayerMutation,
  useGetPlayersWithStatsQuery,
} = contentApi;
