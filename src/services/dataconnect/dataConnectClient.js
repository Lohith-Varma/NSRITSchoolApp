import {getAuth, getIdToken} from '@react-native-firebase/auth';
import {STORAGE_KEYS, USER_ROLES} from '../../config/constants';
import {dataConnectConfig, firebaseConfig} from '../../config/env';
import {getJSON, storage} from '../storage/mmkvStorage';
import {getMainAdminBranchContext} from '../mainAdmin/mainAdminContextService';

const buildConnectorName = () =>
  `projects/${dataConnectConfig.projectId}/locations/${dataConnectConfig.location}/services/${dataConnectConfig.serviceId}/connectors/${dataConnectConfig.connectorId}`;

const getAuthToken = async () => {
  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;

  if (!currentUser) {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN) || null;
  }

  const token = await getIdToken(currentUser);
  storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  return token;
};

const AUDIT_OPERATION = 'RecordAuditLog';

const ACTING_AS_BY_MUTATION = {
  CreateBranch: USER_ROLES.MAIN_ADMIN,
  UpdateBranch: USER_ROLES.MAIN_ADMIN,
  AssignBranchAdmin: USER_ROLES.MAIN_ADMIN,
  AssignPrincipal: USER_ROLES.MAIN_ADMIN,
  CreateCoordinator: USER_ROLES.PRINCIPAL,
  UpdateCoordinator: USER_ROLES.PRINCIPAL,
  CreateTeacher: USER_ROLES.PRINCIPAL,
  UpdateTeacher: USER_ROLES.PRINCIPAL,
  CreateAccountant: USER_ROLES.PRINCIPAL,
  UpdateAccountant: USER_ROLES.PRINCIPAL,
  CreateSection: USER_ROLES.PRINCIPAL,
  UpdateSection: USER_ROLES.PRINCIPAL,
  RemoveSection: USER_ROLES.PRINCIPAL,
  AssignTeacherClassTeacher: USER_ROLES.PRINCIPAL,
  TransferTeacher: USER_ROLES.PRINCIPAL,
  ActivateClass: USER_ROLES.PRINCIPAL,
  DeactivateClass: USER_ROLES.PRINCIPAL,
  CreateStudent: USER_ROLES.COORDINATOR,
  UpdateStudent: USER_ROLES.COORDINATOR,
  TransferStudent: USER_ROLES.COORDINATOR,
  BulkAssignStudents: USER_ROLES.COORDINATOR,
  UpdateStudentStatus: USER_ROLES.COORDINATOR,
  PromoteStudents: USER_ROLES.PRINCIPAL,
  RecordPromotion: USER_ROLES.PRINCIPAL,
  CreateAttendance: USER_ROLES.TEACHER,
  UpdateAttendance: USER_ROLES.TEACHER,
  CreateFeeCategory: USER_ROLES.ACCOUNTANT,
  UpdateFeeCategory: USER_ROLES.ACCOUNTANT,
  CreateFeePlan: USER_ROLES.ACCOUNTANT,
  UpdateFeePlan: USER_ROLES.ACCOUNTANT,
  RecordPayment: USER_ROLES.ACCOUNTANT,
  ReversePayment: USER_ROLES.ACCOUNTANT,
};

const entityTypeForMutation = operationName =>
  String(operationName || '')
    .replace(/^(Create|Update|Assign|Remove|Record|Reverse|Activate|Deactivate|Transfer|Bulk)/, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();

const extractEntityId = data => {
  const values = Object.values(data || {});
  const direct = values.find(value => typeof value === 'string');
  if (direct) {
    return direct;
  }
  const objectWithId = values.find(value => value && typeof value === 'object' && value.id);
  return objectWithId?.id ? String(objectWithId.id) : null;
};

const compactJSON = value => {
  if (!value) {
    return null;
  }
  const serialized = JSON.stringify(value);
  return serialized.length > 6000 ? `${serialized.slice(0, 6000)}...` : serialized;
};

const maybeRecordMainAdminAudit = async ({operationName, variables, data, token}) => {
  if (operationName === AUDIT_OPERATION) {
    return;
  }

  const user = getJSON(STORAGE_KEYS.AUTH_USER);
  const role = String(user?.role || '').toUpperCase();

  if (role !== USER_ROLES.MAIN_ADMIN) {
    return;
  }

  const context = getMainAdminBranchContext();
  const branchId = variables?.branchId || context?.branchId || user?.branchId || null;
  const actingAs = ACTING_AS_BY_MUTATION[operationName] || USER_ROLES.MAIN_ADMIN;

  await executeConnectorOperation({
    operationName: AUDIT_OPERATION,
    type: 'mutation',
    variables: {
      performedBy: user?.fullName || user?.name || USER_ROLES.MAIN_ADMIN,
      performedRole: USER_ROLES.MAIN_ADMIN,
      actingAs,
      branchId,
      action: operationName,
      entityType: entityTypeForMutation(operationName),
      entityId: extractEntityId(data) || variables?.id || variables?.studentId || null,
      oldData: null,
      newData: compactJSON(variables),
    },
    tokenOverride: token,
    skipAudit: true,
  });
};

const executeConnectorOperation = async ({
  operationName,
  variables = {},
  type,
  tokenOverride,
  skipAudit = false,
}) => {
  const token = tokenOverride || (await getAuthToken());
  const apiKey = firebaseConfig.apiKey;
  const connectorName = buildConnectorName();
  const endpoint = type === 'mutation' ? 'executeMutation' : 'executeQuery';

  if (!token) {
    throw new Error('Authentication required. Please sign in again.');
  }

  const response = await fetch(
    `${dataConnectConfig.apiBaseURL}/${connectorName}:${endpoint}?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Client': 'gl-js/ rn/nsrit-connect',
        ...(firebaseConfig.appId ? {'x-firebase-gmpid': firebaseConfig.appId} : {}),
        ...(token ? {'X-Firebase-Auth-Token': token} : {}),
      },
      body: JSON.stringify({
        name: connectorName,
        operationName,
        variables,
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok || payload.errors?.length) {
    console.log('Data Connect Request Failed. Response Status:', response.status);
    console.log('Data Connect Error Payload:', JSON.stringify(payload, null, 2));
    const message = payload.errors?.[0]?.message || 'Data Connect request failed';
    throw new Error(message);
  }

  const data = payload.data || {};

  if (!skipAudit && type === 'mutation') {
    await maybeRecordMainAdminAudit({operationName, variables, data, token});
  }

  return data;
};

export const dataConnectClient = {
  async query(operationName, variables) {
    return executeConnectorOperation({operationName, variables, type: 'query'});
  },

  async mutate(operationName, variables) {
    return executeConnectorOperation({operationName, variables, type: 'mutation'});
  },
};

export default dataConnectClient;
