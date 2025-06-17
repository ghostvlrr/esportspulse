import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Team {
  name: string;
  logo: string;
}

interface Score {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  status: 'live' | 'upcoming' | 'completed';
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  date: string;
  tournament: string;
}

interface MatchesState {
  items: Match[];
  loading: boolean;
  error: string | null;
}

const initialState: MatchesState = {
  items: [],
  loading: false,
  error: null,
};

const matchesSlice = createSlice({
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

export const { setMatches, setLoading, setError } = matchesSlice.actions;
export default matchesSlice.reducer; 