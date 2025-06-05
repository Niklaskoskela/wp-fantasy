import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Club, Player } from '../../../shared/dist/types';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Club', 'Player'],
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
  }),
});

export const {
  useGetClubsQuery,
  useGetClubQuery,
  useCreateClubMutation,
  useGetPlayersQuery,
  useGetPlayerQuery,
  useCreatePlayerMutation,
} = contentApi;
