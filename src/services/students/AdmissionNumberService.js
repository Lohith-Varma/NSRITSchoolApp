import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {buildStudentIdPayload} from '../../utils/studentIdGenerator';

export const AdmissionNumberService = {
  async getNextAdmissionNumber({year, branchCode}) {
    if (!year || !branchCode) {
      throw new Error('Admission year and branch code are required to generate admission number.');
    }

    const normalizedBranchCode = String(branchCode).padStart(2, '0');
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GENERATE_ADMISSION_NUMBER, {
      year: Number(year),
      branchCode: normalizedBranchCode,
    });
    const sequence = response.studentSequences?.[0];
    const lastStudentResponse = await dataConnectClient.query(
      DATA_CONNECT_QUERIES.GET_LAST_STUDENT_SERIAL,
      {
        admissionYear: Number(year),
        branchCode: normalizedBranchCode,
      },
    );
    const lastStudent = lastStudentResponse.students?.[0];
    const lastSerialNumber = Math.max(
      Number(sequence?.lastSerial || 0),
      Number(lastStudent?.serialNumber || 0),
    );

    console.log('[StudentCreate] Admission sequence resolved:', {
      year: Number(year),
      branchCode: normalizedBranchCode,
      sequenceLastSerial: sequence?.lastSerial || 0,
      lastStudentSerial: lastStudent?.serialNumber || 0,
      nextSerialNumber: lastSerialNumber + 1,
    });

    return buildStudentIdPayload({
      admissionYear: Number(year),
      branchCode: normalizedBranchCode,
      lastSerialNumber,
    });
  },
};

export default AdmissionNumberService;
