import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Geçici olarak varsayılan bir kullanıcı tanımlıyoruz
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  { user: User; token: string; refreshToken: string },
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return Promise.reject(new Error('Bu özellik şu anda kullanılamıyor'));
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Giriş başarısız');
  }
});

export const register = createAsyncThunk<
  { user: User; token: string; refreshToken: string },
  RegisterData,
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    return Promise.reject(new Error('Bu özellik şu anda kullanılamıyor'));
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Kayıt başarısız');
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      return Promise.reject(new Error('Bu özellik şu anda kullanılamıyor'));
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Çıkış başarısız');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Giriş başarısız';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Kayıt başarısız';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload || 'Çıkış başarısız';
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer; 