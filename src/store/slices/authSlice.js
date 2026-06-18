import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import authService from '../../services/auth/authService';
import {
  applyBranchContextToUser,
  getMainAdminBranchContext,
} from '../../services/mainAdmin/mainAdminContextService';
import {USER_ROLES} from '../../config/constants';
import {unwrapResponse} from '../../utils/firebaseResponse';

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  console.log('authSlice: bootstrapAuth thunk started');
  try {
    const session = await authService.getStoredSession();
    console.log('authSlice: bootstrapAuth thunk got session:', session);
    const context = getMainAdminBranchContext();

    if (session?.user && context) {
      return {
        ...session,
        user: applyBranchContextToUser(session.user, context),
        mainAdminBranchContext: context,
      };
    }

    return session;
  } catch (error) {
    console.error('authSlice: bootstrapAuth thunk error:', error);
    throw error;
  }
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, {rejectWithValue}) => {
    try {
      return unwrapResponse(await authService.sendOtp(credentials));
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to login');
    }
  },
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (payload, {rejectWithValue}) => {
    try {
      return unwrapResponse(await authService.sendOtp(payload));
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to send OTP');
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload, {rejectWithValue}) => {
    try {
      return unwrapResponse(await authService.verifyOtp(payload));
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to verify OTP');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

// Switch User: separate Firebase session + clear auth storage.
// Does NOT wipe non-auth state so the app feels "ready for next login" vs "fully wiped".
export const switchUser = createAsyncThunk('auth/switchUser', async () => {
  await authService.switchUser();
});

export const switchActiveRole = createAsyncThunk(
  'auth/switchRole',
  async (role, {rejectWithValue}) => {
    try {
      return await authService.switchRole(role);
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to switch role');
    }
  },
);

const initialState = {
  isBootstrapping: true,
  isAuthenticated: false,
  isSwitchingUser: false,   // true when returning to login via Switch User (not full logout)
  token: null,
  user: null,
  role: null,
  mainAdminBranchContext: null,
  verificationId: null,
  pendingPhone: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },
    enterMainAdminBranchContext: (state, action) => {
      state.mainAdminBranchContext = action.payload;
      state.user = applyBranchContextToUser(state.user, action.payload);
      state.role = state.user?.role || state.role;
    },
    clearMainAdminBranchContext: state => {
      state.mainAdminBranchContext = null;
      if (String(state.user?.role || '').toUpperCase() === USER_ROLES.MAIN_ADMIN) {
        state.user = {
          ...state.user,
          branchId: null,
          branchCode: null,
          branchName: null,
          wingId: null,
          wing: null,
          mainAdminBranchContext: null,
        };
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(bootstrapAuth.pending, state => {
        console.log('authSlice: bootstrapAuth.pending');
        state.isBootstrapping = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        const session = action.payload;
        console.log('authSlice: bootstrapAuth.fulfilled with session:', session);
        state.isBootstrapping = false;
        state.isAuthenticated = Boolean(session?.token && session?.user);
        state.token = session?.token || null;
        state.user = session?.user || null;
        state.role = session?.user?.role || null;
        state.mainAdminBranchContext = session?.mainAdminBranchContext || null;
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        console.log('authSlice: bootstrapAuth.rejected, action error:', action.error);
        state.isBootstrapping = false;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.mainAdminBranchContext = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to login';
      })
      .addCase(sendOtp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationId = action.payload.verificationId;
        state.pendingPhone = action.payload.fullPhoneNumber;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to send OTP';
      })
      .addCase(verifyOtp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isSwitchingUser = false;  // clear switch flag on successful new login
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.mainAdminBranchContext = null;
        state.verificationId = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to verify OTP';
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isAuthenticated = false;
        state.isSwitchingUser = false;
        state.token = null;
        state.user = null;
        state.role = null;
        state.mainAdminBranchContext = null;
        state.verificationId = null;
        state.pendingPhone = null;
        state.error = null;
      })
      .addCase(switchUser.fulfilled, state => {
        // Clear auth state but mark as switching so Login screen can show context
        state.isAuthenticated = false;
        state.isSwitchingUser = true;
        state.token = null;
        state.user = null;
        state.role = null;
        state.verificationId = null;
        state.pendingPhone = null;
        state.error = null;
        // Intentionally keep mainAdminBranchContext so it can be reused by next login
      })
      .addCase(switchActiveRole.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchActiveRole.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token || state.token;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.mainAdminBranchContext = null;
      })
      .addCase(switchActiveRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to switch role';
      });
  },
});

export const {
  clearAuthError,
  enterMainAdminBranchContext,
  clearMainAdminBranchContext,
} = authSlice.actions;
export default authSlice.reducer;
