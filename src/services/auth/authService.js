import {
  getAuth,
  signInWithPhoneNumber,
  signInWithCredential,
  signOut,
  PhoneAuthProvider,
  getIdToken,
} from '@react-native-firebase/auth';
import {STORAGE_KEYS} from '../../config/constants';
import {authConfig} from '../../config/env';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {getJSON, removeStorageKeys, setJSON, storage} from '../storage/mmkvStorage';
import {errorResponse, successResponse} from '../../utils/firebaseResponse';
import {formatE164PhoneNumber} from '../../utils/phone';
import {USER_ROLES} from '../../config/constants';
import parentService from '../parents/parentService';

const buildFullPhoneNumber = ({countryCode = '+91', phoneNumber}) => {
  return formatE164PhoneNumber({countryCode, phoneNumber});
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
    branchId: user.branchId || null,
    wingId: user.wingId || null,
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

  if (profile.role !== USER_ROLES.PARENT) {
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
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const authInstance = getAuth();

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
    }

    const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    const user = getJSON(STORAGE_KEYS.AUTH_USER);
    return token && user ? {token, user} : null;
  },
};

export default authService;
