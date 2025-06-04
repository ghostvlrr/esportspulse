import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface News {
  id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  author: string;
  publishedAt: Date;
  tags: string[];
}

interface NewsState {
  items: News[];
  loading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  items: [],
  loading: false,
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNews: (state, action: PayloadAction<News[]>) => {
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

export const { setNews, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer; 