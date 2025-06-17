import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import matchReducer from './slices/matchSlice';
import teamReducer from './slices/teamSlice';
import newsReducer from './slices/newsSlice';
import userReducer from './slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    matches: matchReducer,
    teams: teamReducer,
    news: newsReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Date objelerini serialize etmeyi engelle
        ignoredActions: ['matches/setMatches', 'news/setNews'],
        ignoredPaths: ['matches.items', 'news.items'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Redux hooks için özel tipler
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 