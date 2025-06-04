import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'completed';
  score?: {
    home: number;
    away: number;
  };
  tournament: string;
}

interface MatchState {
  items: Match[];
  loading: boolean;
  error: string | null;
}

const initialState: MatchState = {
  items: [],
  loading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setMatches: (state, action: PayloadAction<Match[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMatches, setLoading, setError } = matchSlice.actions;
export default matchSlice.reducer; 