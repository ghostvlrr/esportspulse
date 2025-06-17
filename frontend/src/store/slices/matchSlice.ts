import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Match } from '../../types/match';

interface MatchState {
  matches: Match[];
  loading: boolean;
  error: string | null;
  selectedMatch: Match | null;
}

const initialState: MatchState = {
  matches: [],
  loading: false,
  error: null,
  selectedMatch: null,
};

const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setMatches: (state, action: PayloadAction<Match[]>) => {
      state.matches = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedMatch: (state, action: PayloadAction<Match | null>) => {
      state.selectedMatch = action.payload;
    },
    updateMatch: (state, action: PayloadAction<Match>) => {
      const index = state.matches.findIndex(match => match.id === action.payload.id);
      if (index !== -1) {
        state.matches[index] = action.payload;
      }
    },
  },
});

export const {
  setMatches,
  setLoading,
  setError,
  setSelectedMatch,
  updateMatch,
} = matchSlice.actions;

export default matchSlice.reducer; 