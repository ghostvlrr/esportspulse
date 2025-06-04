import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Team {
  id: string;
  name: string;
  logo: string;
  ranking: number;
  stats: {
    winRate: number;
    totalMatches: number;
    wins: number;
    losses: number;
  };
}

interface TeamState {
  items: Team[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  items: [],
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<Team[]>) => {
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

export const { setTeams, setLoading, setError } = teamSlice.actions;
export default teamSlice.reducer; 