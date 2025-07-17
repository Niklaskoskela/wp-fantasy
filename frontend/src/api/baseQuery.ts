import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { API_URL } from '../config';

// Get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Global logout handler - will be set by the auth context
let globalLogoutHandler: (() => void) | null = null;

// Function to set the logout handler from the auth context
export const setLogoutHandler = (logoutFn: () => void) => {
  globalLogoutHandler = logoutFn;
};

// Clear authentication data and handle logout
const handleAuthFailure = () => {
  // Clear localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');

  // Call the global logout handler if available
  if (globalLogoutHandler) {
    globalLogoutHandler();
  }

  // Fallback: force navigation to auth page
  if (window.location.pathname !== '/auth') {
    window.location.href = '/auth';
  }
};

// Base query with automatic token handling
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Enhanced base query that handles authentication errors
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);

  // Check if the request failed due to authentication issues
  if (result.error) {
    const { status } = result.error;

    // Handle authentication errors (401) and certain 403 errors that might indicate expired tokens
    if (status === 401) {
      console.warn(
        'Authentication failed - token expired or invalid. Logging out user.'
      );

      // Handle auth failure
      handleAuthFailure();

      // Return a custom error message
      return {
        error: {
          status: 401,
          data: { message: 'Session expired. Please log in again.' },
        },
      };
    }

    // Handle 403 errors that might be token-related
    if (
      status === 403 &&
      result.error.data &&
      typeof result.error.data === 'object' &&
      'message' in result.error.data
    ) {
      const message = (result.error.data.message as string).toLowerCase();
      if (
        message.includes('token') ||
        message.includes('session') ||
        message.includes('expired')
      ) {
        console.warn(
          'Session expired based on 403 error message. Logging out user.'
        );
        handleAuthFailure();

        return {
          error: {
            status: 401,
            data: { message: 'Session expired. Please log in again.' },
          },
        };
      }
    }
  }

  return result;
};

// Auth-specific base query (for auth endpoints that don't need automatic logout)
export const authBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/auth`,
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
