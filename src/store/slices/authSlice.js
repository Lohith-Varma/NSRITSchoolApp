import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import authService from '../../services/auth/authService';
import {
  applyBranchContextToUser,
  getMainAdminBranchContext,
} from '../../services/mainAdmin/mainAdminContextService';
import {USER_ROLES} from '../../config/constants';
import {unwrapResponse} from '../../utils/firebaseResponse';
import {authConfig} from '../../config/env';

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

export const switchRole = createAsyncThunk(
  'auth/switchRole',
  async ({role, profileData, countryCode, phoneNumber}, {rejectWithValue}) => {
    try {
      if (authConfig.ENABLE_DEV_OTP_BYPASS && __DEV__) {
        console.log('[LOGIN BYPASS] Switching to role:', role);
        const fullPhoneNumber = phoneNumber || '+919100046512';
        let fullName = `Dev ${role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}`;
        
        const profile = {
          id: 'dev-mock-user-id-' + fullPhoneNumber,
          firebaseUID: 'dev-mock-firebase-uid-' + fullPhoneNumber,
          fullName,
          countryCode: countryCode || '+91',
          phoneNumber: fullPhoneNumber,
          role,
          isActive: true,
          branchId: 'dev-mock-branch-id',
          branch: {
            id: 'dev-mock-branch-id',
            branchCode: '01',
            name: 'Dev Branch',
          },
          coordinatorId: role === USER_ROLES.COORDINATOR ? 'dev-mock-coord-id' : null,
          teacherId: role === USER_ROLES.TEACHER ? 'dev-mock-teacher-id' : null,
          accountantId: role === USER_ROLES.ACCOUNTANT ? 'dev-mock-acct-id' : null,
          parentId: role === USER_ROLES.PARENT ? 'dev-mock-parent-id' : null,
        };

        const user = {
          id: profile.id,
          uid: profile.firebaseUID,
          firebaseUID: profile.firebaseUID,
          fullName: profile.fullName,
          name: profile.fullName,
          countryCode: profile.countryCode,
          phoneNumber: profile.phoneNumber,
          role: profile.role,
          employeeId: null,
          branchId: profile.branchId,
          branchCode: profile.branch.branchCode,
          branchName: profile.branch.name,
          wingId: null,
          wing: null,
          coordinatorId: profile.coordinatorId,
          teacherId: profile.teacherId,
          accountantId: profile.accountantId,
          parentId: profile.parentId,
          isActive: true,
        };
        const token = 'dev-bypass-mock-token';

        const {setJSON, storage} = require('../../services/storage/mmkvStorage');
        const {STORAGE_KEYS} = require('../../config/constants');
        
        setJSON(STORAGE_KEYS.AUTH_USER, user);
        storage.set(STORAGE_KEYS.AUTH_TOKEN, token);

        return {user, token};
      } else {
        const user = await authService.loadProfileForSwitch(profileData, countryCode, phoneNumber);
        if (!user) throw new Error('Failed to load profile for role ' + role);
        
        const {setJSON, storage} = require('../../services/storage/mmkvStorage');
        const {STORAGE_KEYS} = require('../../config/constants');
        setJSON(STORAGE_KEYS.AUTH_USER, user);
        
        return {user, token: storage.getString(STORAGE_KEYS.AUTH_TOKEN)};
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const initialState = {
  isBootstrapping: true,
  isAuthenticated: false,
  token: null,
  user: null,
  role: null,
  mainAdminBranchContext: null,
  verificationId: null,
  pendingPhone: null,
  loading: false,
  error: null,
  isNewLogin: false,
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
    clearNewLoginFlag: state => {
      state.isNewLogin = false;
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
        state.isNewLogin = false;
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
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.mainAdminBranchContext = null;
        state.verificationId = null;
        state.isNewLogin = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to verify OTP';
      })
      .addCase(switchRole.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchRole.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.token = action.payload.token;
        state.mainAdminBranchContext = null;
      })
      .addCase(switchRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to switch role';
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.role = null;
        state.mainAdminBranchContext = null;
        state.verificationId = null;
        state.pendingPhone = null;
      });
  },
});

export const {
  clearAuthError,
  enterMainAdminBranchContext,
  clearMainAdminBranchContext,
  clearNewLoginFlag,
} = authSlice.actions;
export default authSlice.reducer;
