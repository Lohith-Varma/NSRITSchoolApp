const SERIAL_WIDTH = 3;
const BRANCH_CODE_WIDTH = 2;
const STAFF_CODE = 'ST';

export const normalizeStaffBranchCode = branchCode =>
  String(branchCode || '').padStart(BRANCH_CODE_WIDTH, '0').slice(-BRANCH_CODE_WIDTH);

export const normalizeJoiningYear = joiningYear =>
  Number(String(joiningYear || new Date().getFullYear()).slice(-2));

export const formatStaffId = ({joiningYear, branchCode, serialNumber}) => {
  const year = String(normalizeJoiningYear(joiningYear)).padStart(2, '0');
  const normalizedBranchCode = normalizeStaffBranchCode(branchCode);
  const serial = String(serialNumber).padStart(SERIAL_WIDTH, '0');

  return `${year}${normalizedBranchCode}${STAFF_CODE}${serial}`;
};

export const getNextStaffSerialNumber = lastSerialNumber =>
  Number(lastSerialNumber || 0) + 1;

export const buildStaffIdPayload = ({joiningYear, branchCode, lastSerialNumber}) => {
  const serialNumber = getNextStaffSerialNumber(lastSerialNumber);
  const normalizedJoiningYear = normalizeJoiningYear(joiningYear);
  const normalizedBranchCode = normalizeStaffBranchCode(branchCode);

  return {
    joiningYear: normalizedJoiningYear,
    branchCode: normalizedBranchCode,
    serialNumber,
    employeeId: formatStaffId({
      joiningYear: normalizedJoiningYear,
      branchCode: normalizedBranchCode,
      serialNumber,
    }),
  };
};
