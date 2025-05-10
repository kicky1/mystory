import { AuthResponse, authService, ErrorResponse, User } from '@/services/auth';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: ErrorResponse }
>('auth/login', async (credentials, { rejectWithValue }) => {
  const response = await authService.login(credentials.email, credentials.password);
  if ('message' in response) {
    return rejectWithValue(response);
  }
  return response;
});

export const register = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string },
  { rejectValue: ErrorResponse }
>('auth/register', async (userData, { rejectWithValue }) => {
  const response = await authService.register(
    userData.username,
    userData.email,
    userData.password
  );
  if ('message' in response) {
    return rejectWithValue(response);
  }
  return response;
});

export const sendVerificationCode = createAsyncThunk<
  { success: boolean },
  string,
  { rejectValue: ErrorResponse }
>('auth/sendVerificationCode', async (email, { rejectWithValue }) => {
  const response = await authService.sendVerificationCode(email);
  if ('message' in response) {
    return rejectWithValue(response);
  }
  return response;
});

export const verifyCode = createAsyncThunk<
  { success: boolean },
  { email: string; code: string },
  { rejectValue: ErrorResponse }
>('auth/verifyCode', async ({ email, code }, { rejectWithValue }) => {
  const response = await authService.verifyCode(email, code);
  if ('message' in response) {
    return rejectWithValue(response);
  }
  return response;
});

export const resetPassword = createAsyncThunk<
  { success: boolean },
  { email: string; newPassword: string },
  { rejectValue: ErrorResponse }
>('auth/resetPassword', async ({ email, newPassword }, { rejectWithValue }) => {
  const response = await authService.resetPassword(email, newPassword);
  if ('message' in response) {
    return rejectWithValue(response);
  }
  return response;
});

export const getCurrentUser = createAsyncThunk<
  User,
  string,
  { rejectValue: ErrorResponse }
>('auth/getCurrentUser', async (token, { rejectWithValue }) => {
  const response = await authService.getCurrentUser(token);
  if ('message' in response) {
    return rejectWithValue(response);
  }
  return response;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      });

    // Send Verification Code
    builder
      .addCase(sendVerificationCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendVerificationCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendVerificationCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send verification code';
      });

    // Verify Code
    builder
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to verify code';
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to reset password';
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get current user';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 