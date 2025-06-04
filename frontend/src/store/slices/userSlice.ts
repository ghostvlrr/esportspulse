import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: {
    matches: boolean;
    news: boolean;
    system: boolean;
  };
}

interface UserState {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  preferences: {
    language: 'tr',
    theme: 'dark',
    notifications: {
      matches: true,
      news: true,
      system: true,
    },
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPreferences, setLoading, setError } = userSlice.actions;
export default userSlice.reducer; 