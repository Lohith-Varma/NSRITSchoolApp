import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {buildStaffIdPayload, normalizeStaffBranchCode} from '../../utils/staffIdGenerator';

const currentJoiningYear = () => Number(String(new Date().getFullYear()).slice(-2));

const resolveBranchCode = async ({branchId, branchCode}) => {
  if (branchCode) {
    return normalizeStaffBranchCode(branchCode);
  }

  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCHES, {
    limit: 1000,
    offset: 0,
  });
  const branch = response.branches?.find(item => item.id === branchId);

  if (!branch?.branchCode) {
    throw new Error('Branch code is required to generate employee ID.');
  }

  return normalizeStaffBranchCode(branch.branchCode);
};

export const StaffIdService = {
  async getNextStaffId({branchId, branchCode, joiningYear = currentJoiningYear()}) {
    const resolvedBranchCode = await resolveBranchCode({branchId, branchCode});
    const normalizedJoiningYear = Number(String(joiningYear).slice(-2));

    const [employeeResponse, staffResponse] = await Promise.all([
      dataConnectClient.query(DATA_CONNECT_QUERIES.GET_EMPLOYEE_SEQUENCE, {
        year: normalizedJoiningYear,
        branchCode: resolvedBranchCode,
      }),
      dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STAFF_ID_SEQUENCE, {
        joiningYear: normalizedJoiningYear,
        branchCode: resolvedBranchCode,
      })
    ]);

    const employeeSeq = employeeResponse.employeeSequences?.[0]?.lastSequence || 0;
    const staffSeq = staffResponse.staffIdSequences?.[0]?.lastSerialNumber || 0;
    const maxSequence = Math.max(employeeSeq, staffSeq);

    return buildStaffIdPayload({
      joiningYear: normalizedJoiningYear,
      branchCode: resolvedBranchCode,
      lastSerialNumber: maxSequence,
    });
  },
};

export default StaffIdService;
