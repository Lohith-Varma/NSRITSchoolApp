import auth, {
  getAuth,
  signInWithPhoneNumber,
  signInWithCredential,
  signOut,
  PhoneAuthProvider,
  getIdToken,
  onAuthStateChanged,
} from '@react-native-firebase/auth';
import { Platform } from 'react-native';
import {STORAGE_KEYS} from '../../config/constants';
import {authConfig, firebaseConfig, USE_EMULATOR} from '../../config/env';

if (USE_EMULATOR) {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  try {
    auth().useEmulator(`http://${host}:9099`);
    console.log(`Connected to Firebase Auth Emulator at http://${host}:9099`);
  } catch (e) {
    console.warn('Firebase Auth Emulator connection error:', e);
  }
}

import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {getJSON, removeStorageKeys, setJSON, storage} from '../storage/mmkvStorage';
import {errorResponse, successResponse} from '../../utils/firebaseResponse';
import {formatE164PhoneNumber} from '../../utils/phone';
import {USER_ROLES, USER_ROLE_PRIORITY} from '../../config/constants';
import parentService from '../parents/parentService';
import teacherService from '../teachers/teacherService';


const buildFullPhoneNumber = ({countryCode = '+91', phoneNumber}) => {
  return formatE164PhoneNumber({countryCode, phoneNumber});
};

const normalizeRole = role => String(role || '').toUpperCase();
const AUTH_STATE_WAIT_MS = 3000;

const waitForCurrentUser = authInstance => {
  if (authInstance.currentUser) {
    return Promise.resolve(authInstance.currentUser);
  }

  return new Promise(resolve => {
    let timeoutId;
    let settled = false;
    let unsubscribe = () => {};

    const finish = user => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
      resolve(user || authInstance.currentUser || null);
    };

    unsubscribe = onAuthStateChanged(authInstance, finish);
    timeoutId = setTimeout(() => finish(authInstance.currentUser || null), AUTH_STATE_WAIT_MS);
  });
};

const uniqueRoles = roles => {
  const seen = new Set();
  return (roles || [])
    .map(item => normalizeRole(item?.role || item))
    .filter(Boolean)
    .filter(role => {
      if (seen.has(role)) {
        return false;
      }
      seen.add(role);
      return true;
    });
};

const getProfileRoles = profile =>
  uniqueRoles([...(profile?.roles || []), profile?.role]);

const resolveDefaultRole = roles =>
  USER_ROLE_PRIORITY.find(role => roles.includes(role)) || roles[0] || null;

const resolveActiveRole = (roles, preferredRole) => {
  const preferred = normalizeRole(preferredRole);
  return preferred && roles.includes(preferred) ? preferred : resolveDefaultRole(roles);
};

const normalizeProfile = (profile, fallback = {}) => {
  const user = profile || {};

  return {
    id: user.id,
    uid: user.firebaseUID,
    firebaseUID: user.firebaseUID,
    fullName: user.fullName,
    name: user.fullName,
    countryCode: user.countryCode || fallback.countryCode,
    phoneNumber: user.phoneNumber || fallback.phoneNumber,
    role: user.role,
    roles: uniqueRoles(user.roles || fallback.roles || [user.role]),
    activeRole: user.role,
    primaryRole: user.primaryRole || fallback.primaryRole || user.role,
    employeeId: user.employeeId || fallback.employeeId || null,
    branchId: user.branchId || null,
    branchCode: user.branch?.branchCode || user.branchCode || fallback.branchCode || null,
    branchName: user.branch?.name || user.branchName || fallback.branchName || null,
    wingId: user.wingId || null,
    wing: user.wing || fallback.wing || null,
    coordinatorId: user.coordinatorId || fallback.coordinatorId || null,
    teacherId: user.teacherId || fallback.teacherId || null,
    accountantId: user.accountantId || fallback.accountantId || null,
    sectionId: user.sectionId || null,
    parentId: user.parentId || fallback.parentId || null,
    parentProfileId: user.parentProfileId || fallback.parentProfileId || null,
    status: user.status || fallback.status || (user.isActive === false ? 'INACTIVE' : 'ACTIVE'),
    isActive: user.isActive ?? true,
  };
};

const fetchUserProfile = async firebaseUID => {
  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CURRENT_USER, {
    firebaseUID,
  });

  return response.users?.[0] || null;
};

const fetchUserProfileByPhone = async phoneNumber => {
  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
    phoneNumber,
  });

  return response.users?.[0] || null;
};

const claimUserProfile = async id => {
  await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLAIM_USER_FIREBASE_UID, {
    id,
  });
};

const ensureCurrentUserLegacyRole = async () => {
  try {
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ENSURE_CURRENT_USER_LEGACY_ROLE);
  } catch (error) {
    console.log('[Auth] Legacy role backfill skipped:', error.message);
  }
};

const getFirstBranch = branches => (Array.isArray(branches) ? branches[0] : null);

const applyBranchProfile = (profile, branch) => ({
  ...profile,
  branchId: branch?.id || profile.branchId || null,
  branchCode: branch?.branchCode || profile.branchCode || null,
  branchName: branch?.name || profile.branchName || null,
});

const hydrateRoleProfile = async (profile, preferredRole) => {
  if (!profile) {
    return null;
  }

  const roles = getProfileRoles(profile);
  const role = resolveActiveRole(roles, preferredRole);
  const baseProfile = {
    ...profile,
    primaryRole: normalizeRole(profile.role),
    role,
    roles,
  };

  if (role === USER_ROLES.PRINCIPAL) {
    return applyBranchProfile(baseProfile, getFirstBranch(profile.principalBranches));
  }

  if (role === USER_ROLES.BRANCH_ADMIN) {
    return applyBranchProfile(baseProfile, getFirstBranch(profile.branchAdminBranches));
  }

  if (role === USER_ROLES.COORDINATOR) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_COORDINATOR_BY_USER, {
      userId: profile.id,
    });
    const coordinator = response.coordinators?.[0];
    return {
      ...baseProfile,
      coordinatorId: coordinator?.id || null,
      branchId: coordinator?.branchId || baseProfile.branchId || null,
      wing: coordinator?.wing || null,
    };
  }

  if (role === USER_ROLES.TEACHER || role === USER_ROLES.CLASS_TEACHER) {
    const teacher = await teacherService.getTeacherProfileByUser(profile.id);
    const assignments = teacher?.assignments || teacher?.teacherSectionAssignments_on_teacher || [];
    const classTeacherAssignment = assignments.find(item => item.isClassTeacher && item.isActive !== false);
    return {
      ...baseProfile,
      teacherId: teacher?.id || null,
      branchId: teacher?.branchId || baseProfile.branchId || null,
      sectionId: role === USER_ROLES.CLASS_TEACHER ? classTeacherAssignment?.sectionId || null : null,
      sectionName: role === USER_ROLES.CLASS_TEACHER ? classTeacherAssignment?.section?.name || null : null,
    };
  }

  if (role === USER_ROLES.ACCOUNTANT) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACCOUNTANT_BY_USER, {
      userId: profile.id,
    });
    const accountant = response.accountants?.[0];
    return {
      ...baseProfile,
      accountantId: accountant?.id || null,
      branchId: accountant?.branchId || baseProfile.branchId || null,
    };
  }

  if (role !== USER_ROLES.PARENT) {
    return baseProfile;
  }

  const parent = await parentService.getParentByUser(profile.id);
  return {
    ...baseProfile,
    parentId: profile.id,
    parentProfileId: parent?.id || null,
  };
};

export const authService = {
  async sendOtp({countryCode, phoneNumber}) {
    try {
      const fullPhoneNumber = buildFullPhoneNumber({countryCode, phoneNumber});
      const authInstance = getAuth();

      authInstance.settings.appVerificationDisabledForTesting =
        authConfig.disablePhoneAuthAppVerificationForTesting;
      
      const confirmation = await signInWithPhoneNumber(authInstance, fullPhoneNumber);
      storage.set(STORAGE_KEYS.OTP_VERIFICATION_ID, confirmation.verificationId);

      return successResponse(
        {
          verificationId: confirmation.verificationId,
          fullPhoneNumber,
        },
        'OTP sent successfully',
      );
    } catch (error) {
      return errorResponse(error, 'Unable to send OTP');
    }
  },

  async verifyOtp({verificationId, otp, countryCode, phoneNumber}) {
    try {
      console.log('authService: verifyOtp called with payload:', {verificationId, otp, countryCode, phoneNumber});
      const authInstance = getAuth();
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      console.log('authService: signing in with credential...');
      const result = await signInWithCredential(authInstance, credential);

      const credentialUser = result.user;
      console.log('authService: sign in successful, user UID:', credentialUser?.uid);

      const token = await getIdToken(credentialUser);
      console.log('authService: fetched ID token');
      
      console.log('authService: fetching user profile for UID:', credentialUser.uid);
      let rawProfile = await fetchUserProfile(credentialUser.uid);
      if (rawProfile) {
        await ensureCurrentUserLegacyRole();
        rawProfile = await fetchUserProfile(credentialUser.uid);
      }
      let profile = await hydrateRoleProfile(rawProfile);
      console.log('authService: profile fetched:', profile);
      const fullPhoneNumber =
        credentialUser.phoneNumber || buildFullPhoneNumber({countryCode, phoneNumber});

      if (!profile) {
        console.log('authService: profile is null, checking pending profile by phone:', fullPhoneNumber);
        const pendingProfile = await fetchUserProfileByPhone(fullPhoneNumber);
        console.log('authService: pending profile fetched:', pendingProfile);

        if (pendingProfile) {
          console.log('authService: pending profile found, claiming user profile ID:', pendingProfile.id);
          await claimUserProfile(pendingProfile.id);
          await ensureCurrentUserLegacyRole();
          profile = await hydrateRoleProfile(await fetchUserProfile(credentialUser.uid));
          console.log('authService: profile after claim:', profile);
        }
      }

      if (!profile) {
        console.warn(`authService: Unauthorized login attempt: Phone number ${fullPhoneNumber} (UID: ${credentialUser.uid}) is not registered.`);
        await signOut(authInstance);
        throw new Error('Your account has not been registered. Please contact your administrator.');
      }

      const user = normalizeProfile(profile, {
        countryCode,
        phoneNumber: fullPhoneNumber,
      });
      console.log('authService: normalized user profile:', user);

      setJSON(STORAGE_KEYS.AUTH_USER, user);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      console.log('authService: stored user and token in MMKV storage');

      return successResponse({user, token}, 'Login successful');
    } catch (error) {
      console.error('authService: error caught in verifyOtp:', error);
      return errorResponse(error, 'Unable to verify OTP');
    }
  },

  async logout() {
    const authInstance = getAuth();
    await signOut(authInstance);
    removeStorageKeys([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
      STORAGE_KEYS.OTP_VERIFICATION_ID,
    ]);
  },

  async getStoredSession() {
    const authInstance = getAuth();
    const currentUser = await waitForCurrentUser(authInstance);
    const storedUser = getJSON(STORAGE_KEYS.AUTH_USER);

    if (currentUser) {
      try {
        const token = await getIdToken(currentUser);
        let rawProfile = await fetchUserProfile(currentUser.uid);
        if (rawProfile) {
          await ensureCurrentUserLegacyRole();
          rawProfile = await fetchUserProfile(currentUser.uid);
        }
        const profile = await hydrateRoleProfile(rawProfile, storedUser?.role);

        if (profile) {
          const user = normalizeProfile(profile, {
            phoneNumber: currentUser.phoneNumber,
            roles: storedUser?.roles,
          });
          setJSON(STORAGE_KEYS.AUTH_USER, user);
          storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
          return {token, user};
        }
      } catch (error) {
        console.warn('Failed to fetch profile online, trying cached session:', error);
      }
    }

    if (storedUser) {
      removeStorageKeys([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
    }
    return null;
  },

  async switchRole(newRole) {
    const authInstance = getAuth();
    const currentUser = await waitForCurrentUser(authInstance);
    const storedUser = getJSON(STORAGE_KEYS.AUTH_USER);
    const role = normalizeRole(newRole);
    const roles = uniqueRoles(storedUser?.roles || []);

    if (!storedUser?.id || !role || !roles.includes(role)) {
      throw new Error('Requested role is not assigned to this user.');
    }
    if (!currentUser) {
      throw new Error('Authentication required. Please sign in again.');
    }

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.SWITCH_ROLE, {
      userId: storedUser.id,
      oldRole: normalizeRole(storedUser.role),
      newRole: role,
    });

    const token = await getIdToken(currentUser);
    const firebaseUID = currentUser.uid;
    const profile = await hydrateRoleProfile(await fetchUserProfile(firebaseUID), role);
    if (!profile) {
      throw new Error('Unable to refresh user profile for role switch.');
    }
    const user = normalizeProfile(profile, {
      ...storedUser,
      roles,
      phoneNumber: currentUser?.phoneNumber || storedUser.phoneNumber,
    });

    setJSON(STORAGE_KEYS.AUTH_USER, user);
    if (token) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
    }
    return {token, user};
  },
};

export default authService;
