import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { getApiError } from '../../utils/apiError';

const storedToken = localStorage.getItem('cybernest_token');
const storedUser = localStorage.getItem('cybernest_user');

export const registerUser = createAsyncThunk('auth/register', async (data, thunkAPI) => {
  try {
    return await authService.register(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiError(error));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, thunkAPI) => {
  try {
    return await authService.login(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiError(error));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => { state.error = null; },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('cybernest_token');
      localStorage.removeItem('cybernest_user');
      localStorage.removeItem('cybernest_refresh_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => [registerUser.pending.type, loginUser.pending.type].includes(action.type),
        (state) => { state.isLoading = true; state.error = null; },
      )
      .addMatcher(
        (action) => [registerUser.fulfilled.type, loginUser.fulfilled.type].includes(action.type),
        (state, action) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          localStorage.setItem('cybernest_token', action.payload.token);
          localStorage.setItem('cybernest_user', JSON.stringify(action.payload.user));
          if (action.payload.refreshToken) localStorage.setItem('cybernest_refresh_token', action.payload.refreshToken);
        },
      )
      .addMatcher(
        (action) => [registerUser.rejected.type, loginUser.rejected.type].includes(action.type),
        (state, action) => { state.isLoading = false; state.error = action.payload; },
      );
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
