import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { contentApi } from './api/contentApi';
import { teamApi } from './api/teamApi';
import { matchDayApi } from './api/matchDayApi';
import { rosterHistoryApi } from './api/rosterHistoryApi';

export const store = configureStore({
  reducer: {
    [contentApi.reducerPath]: contentApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer,
    [matchDayApi.reducerPath]: matchDayApi.reducer,
    [rosterHistoryApi.reducerPath]: rosterHistoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      contentApi.middleware,
      teamApi.middleware,
      matchDayApi.middleware,
      rosterHistoryApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
