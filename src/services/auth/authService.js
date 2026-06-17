import auth, {
  getAuth,
  signInWithPhoneNumber,
  signInWithCredential,
  signOut,
  PhoneAuthProvider,
  getIdToken,
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
import {USER_ROLES} from '../../config/constants';
import parentService from '../parents/parentService';
import teacherService from '../teachers/teacherService';


const buildFullPhoneNumber = ({countryCode = '+91', phoneNumber}) => {
  return formatE164PhoneNumber({countryCode, phoneNumber});
};

const normalizeRole = role => String(role || '').toUpperCase();

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
    employeeId: user.employeeId || fallback.employeeId || null,
    branchId: user.branchId || null,
    branchCode: user.branch?.branchCode || fallback.branchCode || null,
    branchName: user.branch?.name || fallback.branchName || null,
    wingId: user.wingId || null,
    wing: user.wing || fallback.wing || null,
    coordinatorId: user.coordinatorId || fallback.coordinatorId || null,
    teacherId: user.teacherId || fallback.teacherId || null,
    accountantId: user.accountantId || fallback.accountantId || null,
    sectionId: user.sectionId || null,
    parentId: user.parentId || fallback.parentId || null,
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

const hydrateRoleProfile = async profile => {
  if (!profile) {
    return null;
  }

  const role = normalizeRole(profile.role);

  if (role === USER_ROLES.COORDINATOR) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_COORDINATOR_BY_USER, {
      userId: profile.id,
    });
    const coordinator = response.coordinators?.[0];
    return {
      ...profile,
      coordinatorId: coordinator?.id || null,
      wing: coordinator?.wing || null,
    };
  }

  if (role === USER_ROLES.TEACHER) {
    const teacher = await teacherService.getTeacherProfileByUser(profile.id);
    return {
      ...profile,
      teacherId: teacher?.id || null,
    };
  }

  if (role === USER_ROLES.ACCOUNTANT) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ACCOUNTANT_BY_USER, {
      userId: profile.id,
    });
    const accountant = response.accountants?.[0];
    return {
      ...profile,
      accountantId: accountant?.id || null,
    };
  }

  if (role !== USER_ROLES.PARENT) {
    return profile;
  }

  const parent = await parentService.getParentByUser(profile.id);
  return {
    ...profile,
    parentId: parent?.id || null,
  };
};

export const authService = {
  async sendOtp({countryCode, phoneNumber}) {
    try {
      const fullPhoneNumber = buildFullPhoneNumber({countryCode, phoneNumber});

      if (authConfig.ENABLE_DEV_OTP_BYPASS && __DEV__) {
        console.log('[LOGIN BYPASS] sendOtp bypassing Firebase');
        const dummyVerificationId = 'dev-bypass-verification-id';
        storage.set(STORAGE_KEYS.OTP_VERIFICATION_ID, dummyVerificationId);
        return successResponse(
          {
            verificationId: dummyVerificationId,
            fullPhoneNumber,
          },
          'OTP sent successfully (Bypass)',
        );
      }

      const authInstance = getAuth();

      authInstance.settings.appVerificationDisabledForTesting =
        authConfig.disablePhoneAuthAppVerificationForTesting;
      
      console.log('[LOGIN] Calling Firebase');
      console.log('[LOGIN] Firebase Request Sent');
      const confirmation = await signInWithPhoneNumber(authInstance, fullPhoneNumber);
      console.log('[LOGIN] Firebase Response Received');
      console.log('[LOGIN] Verification ID Received:', confirmation.verificationId);
      storage.set(STORAGE_KEYS.OTP_VERIFICATION_ID, confirmation.verificationId);

      return successResponse(
        {
          verificationId: confirmation.verificationId,
          fullPhoneNumber,
        },
        'OTP sent successfully',
      );
    } catch (error) {
      console.log('[LOGIN ERROR] Full Error Object:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });
      return errorResponse(error, 'Unable to send OTP');
    }
  },

  async verifyOtp({verificationId, otp, countryCode, phoneNumber}) {
    try {
      console.log('authService: verifyOtp called with payload:', {verificationId, otp, countryCode, phoneNumber});

      if (authConfig.ENABLE_DEV_OTP_BYPASS && __DEV__ && verificationId === 'dev-bypass-verification-id') {
        if (otp !== '123456') {
          throw new Error('Invalid OTP');
        }
        console.log('[LOGIN BYPASS] verifyOtp verifying dummy token');
        const fullPhoneNumber = buildFullPhoneNumber({countryCode, phoneNumber});
        
        console.log('[LOGIN BYPASS] Fetching profile by phone:', fullPhoneNumber);
        let profile = null;
        try {
          const dbProfile = await fetchUserProfileByPhone(fullPhoneNumber);
          if (dbProfile) {
            profile = await hydrateRoleProfile(dbProfile);
          }
        } catch (dbError) {
          console.warn('[LOGIN BYPASS] Database query failed, using fallback mock profile:', dbError);
        }
        
        if (!profile) {
          // If no profile is found or connection is unauthenticated, generate a structured mock profile
          let role = USER_ROLES.MAIN_ADMIN;
          let fullName = 'Dev Admin';
          
          if (phoneNumber.includes('8888888888')) {
            role = USER_ROLES.PRINCIPAL;
            fullName = 'Dev Principal';
          } else if (phoneNumber.includes('7777777777')) {
            role = USER_ROLES.COORDINATOR;
            fullName = 'Dev Coordinator';
          } else if (phoneNumber.includes('6666666666')) {
            role = USER_ROLES.TEACHER;
            fullName = 'Dev Teacher';
          } else if (phoneNumber.includes('4444444444')) {
            role = USER_ROLES.PARENT;
            fullName = 'Dev Parent';
          } else if (phoneNumber.includes('5555555555')) {
            role = USER_ROLES.ACCOUNTANT;
            fullName = 'Dev Accountant';
          } else if (phoneNumber.includes('2222222222')) {
            role = USER_ROLES.FRONT_DESK;
            fullName = 'Dev Front Desk';
          }

          profile = {
            id: 'dev-mock-user-id-' + phoneNumber,
            firebaseUID: 'dev-mock-firebase-uid-' + phoneNumber,
            fullName,
            countryCode,
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
          console.log('[LOGIN BYPASS] Generated Mock Profile:', profile);
        }

        const user = normalizeProfile(profile, {
          countryCode,
          phoneNumber: fullPhoneNumber,
        });
        const token = 'dev-bypass-mock-token';

        setJSON(STORAGE_KEYS.AUTH_USER, user);
        storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
        console.log('[LOGIN BYPASS] Session created and saved in MMKV');

        return successResponse({user, token}, 'Login successful');
      }

      const authInstance = getAuth();
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      console.log('authService: signing in with credential...');
      const result = await signInWithCredential(authInstance, credential);

      const credentialUser = result.user;
      console.log('authService: sign in successful, user UID:', credentialUser?.uid);

      const token = await getIdToken(credentialUser);
      console.log('authService: fetched ID token');
      
      console.log('authService: fetching user profile for UID:', credentialUser.uid);
      let profile = await hydrateRoleProfile(await fetchUserProfile(credentialUser.uid));
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
    const currentUser = authInstance.currentUser;

    if (currentUser) {
      try {
        const token = await getIdToken(currentUser);
        const profile = await hydrateRoleProfile(await fetchUserProfile(currentUser.uid));

        if (profile) {
          const user = normalizeProfile(profile, {
            phoneNumber: currentUser.phoneNumber,
          });
          setJSON(STORAGE_KEYS.AUTH_USER, user);
          storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
          return {token, user};
        }
      } catch (error) {
        console.warn('Failed to fetch profile online, trying cached session:', error);
      }
    }

    const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    const user = getJSON(STORAGE_KEYS.AUTH_USER);
    return token && user ? {token, user} : null;
  },

  async fetchUsersByPhone(phoneNumber) {
    try {
      console.log('authService: fetchUsersByPhone called for:', phoneNumber);
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USERS_BY_PHONE, {
        phoneNumber,
      });
      return response.users || [];
    } catch (error) {
      console.warn('authService: fetchUsersByPhone error:', error);
      return [];
    }
  },

  async loadProfileForSwitch(dbProfile, countryCode, phoneNumber) {
    try {
      const profile = await hydrateRoleProfile(dbProfile);
      if (!profile) return null;
      const user = normalizeProfile(profile, {
        countryCode,
        phoneNumber,
      });
      return user;
    } catch (error) {
      console.warn('authService: loadProfileForSwitch error:', error);
      return null;
    }
  },
};

export default authService;
