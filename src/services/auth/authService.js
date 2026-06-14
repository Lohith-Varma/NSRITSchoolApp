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
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const authInstance = getAuth();
      const result = await signInWithCredential(authInstance, credential);
      const credentialUser = result.user;

      const token = await getIdToken(credentialUser);
      let profile = await hydrateRoleProfile(await fetchUserProfile(credentialUser.uid));
      const fullPhoneNumber =
        credentialUser.phoneNumber || buildFullPhoneNumber({countryCode, phoneNumber});

      if (!profile) {
        const pendingProfile = await fetchUserProfileByPhone(fullPhoneNumber);

        if (pendingProfile) {
          await claimUserProfile(pendingProfile.id);
          profile = await hydrateRoleProfile(await fetchUserProfile(credentialUser.uid));
        }
      }

      if (!profile) {
        await authInstance.signOut();
        throw new Error('Phone number not linked with the school');
      }

      const user = normalizeProfile(profile, {
        countryCode,
        phoneNumber: fullPhoneNumber,
      });

      setJSON(STORAGE_KEYS.AUTH_USER, user);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);

      return successResponse({user, token}, 'Login successful');
    } catch (error) {
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
