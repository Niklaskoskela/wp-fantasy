// Authentication API using RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserRole } from '../../../shared/src/types';
import { API_URL } from '../config';

// Authentication types
export interface LoginRequest {
  username: string; // Can be username or email
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser; // Use AuthUser instead of User to ensure proper typing
  token: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/auth`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Public endpoints
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/register',
        method: 'POST',
        body: credentials,
      }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),

    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: '/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Protected endpoints
    getCurrentUser: builder.query<AuthUser, void>({
      query: () => '/me',
      providesTags: ['User'],
    }),

    changePassword: builder.mutation<
      { message: string },
      ChangePasswordRequest
    >({
      query: (data) => ({
        url: '/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Admin endpoints
    getAllUsers: builder.query<AuthUser[], void>({
      query: () => '/users',
      transformResponse: (response: { users: AuthUser[] }) => response.users,
      providesTags: ['User'],
    }),

    activateUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),

    deactivateUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),

    adminResetPassword: builder.mutation<
      { message: string; tempPassword: string },
      string
    >({
      query: (userId) => ({
        url: `/admin/reset-password/${userId}`,
        method: 'POST',
      }),
    }),

    updateUser: builder.mutation<
      { message: string; user: AuthUser },
      {
        userId: string;
        updates: { username?: string; email?: string; role?: UserRole };
      }
    >({
      query: ({ userId, updates }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useGetAllUsersQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useAdminResetPasswordMutation,
  useUpdateUserMutation,
} = authApi;
