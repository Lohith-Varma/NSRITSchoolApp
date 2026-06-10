import {USER_ROLES} from '../../config/constants';
import {getClassWing} from '../../config/academic';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {applyRoleFilter} from '../rbacScope';
import {validateStudentPayload} from '../../utils/studentValidation';
import parentService from '../parents/parentService';
import AdmissionNumberService from './AdmissionNumberService';
import studentRepository from '../../repositories/studentRepository';
import {assertBranchAccess, assertCoordinatorWing} from '../academics/academicAccess';
import {formatE164PhoneNumber} from '../../utils/phone';
import {parseCsv} from '../../utils/csvParser';

const currentYear = () => new Date().getFullYear();
const normalizeRole = role => String(role || '').toUpperCase();

const resolveBranchCode = async (scope, branchId) => {
  if (scope?.branchCode) {
    return scope.branchCode;
  }
  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCHES, {
    limit: 1000,
    offset: 0,
  });
  const branch = response.branches?.find(item => item.id === branchId);
  if (!branch?.branchCode) {
    throw new Error('Branch code is required to generate admission number.');
  }
  return branch.branchCode;
};

const normalizeStudentPayload = (payload, scope = {}) => {
  const branchId = payload.branchId || scope.branchId;
  const branchCode = payload.branchCode || scope.branchCode;
  const countryCode = payload.countryCode || '+91';
  const parentPhoneNumber = payload.parentPhoneNumber || payload.phoneNumber || '';
  const phoneNumber = parentPhoneNumber
    ? formatE164PhoneNumber({countryCode, phoneNumber: parentPhoneNumber})
    : '';

  return {
    ...payload,
    branchId,
    branchCode,
    countryCode,
    phoneNumber,
    parentPhoneNumber: phoneNumber,
    admissionYear: Number(payload.admissionYear || currentYear()),
    admissionDate: payload.admissionDate || new Date().toISOString().slice(0, 10),
    parentName: payload.fatherName || payload.parentName,
    className: payload.className || payload.academicClass?.name,
    wingId: payload.wingId || payload.academicClass?.wingId || payload.section?.wingId,
    wingCode:
      payload.wingCode ||
      payload.wing?.code ||
      payload.academicClass?.wing?.code ||
      getClassWing(payload.className || payload.academicClass?.name),
  };
};

const toStudentMutationPayload = payload => ({
  studentId: payload.studentId,
  admissionYear: Number(payload.admissionYear),
  branchCode: payload.branchCode,
  serialNumber: Number(payload.serialNumber),
  fullName: payload.fullName,
  gender: payload.gender || null,
  dateOfBirth: payload.dateOfBirth || null,
  photoUrl: payload.photoUrl || null,
  aadhaarNumber: payload.aadhaarNumber || null,
  bloodGroup: payload.bloodGroup || null,
  branchId: payload.branchId,
  wingId: payload.wingId,
  wingCode: payload.wingCode,
  academicClassId: payload.academicClassId,
  sectionId: payload.sectionId,
  parentId: payload.parentId,
  countryCode: payload.countryCode || '+91',
  phoneNumber: payload.phoneNumber || payload.parentPhoneNumber || null,
  address: payload.address || null,
  city: payload.city || null,
  state: payload.state || null,
  pincode: payload.pincode || null,
  emergencyContact: payload.emergencyContact || null,
  transportRequired: Boolean(payload.transportRequired),
  admissionDate: payload.admissionDate,
});

const assertStudentRecordAccess = (scope, student) => {
  assertBranchAccess(scope, student?.branchId || scope?.branchId);
  const role = normalizeRole(scope?.role);
  if (role === USER_ROLES.COORDINATOR) {
    const wing = student?.academicClass?.wing?.code || getClassWing(student?.academicClass?.name);
    assertCoordinatorWing(scope, wing);
  }
};

const filterStudentsForScope = (students, scope) => {
  const role = normalizeRole(scope?.role);
  if (role === USER_ROLES.COORDINATOR) {
    return students.filter(item => item.academicClass?.wing?.code === scope?.wing);
  }
  return applyRoleFilter(students, scope);
};

const mapCsvRow = row => ({
  rowNumber: row.rowNumber,
  fullName: row['Full Name'] || row['Student Name'],
  gender: row.Gender,
  dateOfBirth: row.DOB || row['Date of Birth'],
  fatherName: row['Father Name'],
  motherName: row['Mother Name'],
  parentPhoneNumber: row['Parent Mobile'] || row['Parent Phone'],
  className: row.Class,
  sectionName: row.Section,
  admissionDate: row['Admission Date'] || new Date().toISOString().slice(0, 10),
});

export const studentService = {
  async getStudents({branchId, limit = 50, offset = 0}, scope) {
    const role = normalizeRole(scope?.role);
    if (!branchId && role === USER_ROLES.MAIN_ADMIN) {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_GLOBAL_STUDENTS, {
        limit,
        offset,
      });
      return response.students || [];
    }

    assertBranchAccess(scope, branchId);
    try {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENTS, {
        branchId,
        limit,
        offset,
      });
      return filterStudentsForScope(response.students || [], scope);
    } catch (error) {
      console.log('[Students] Failed to fetch students:', {branchId, limit, offset, role, error});
      throw error;
    }
  },

  async getStudentsByBranch(branchId, options = {}) {
    if (!branchId) {
      return [];
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENTS, {
      branchId,
      limit: options.limit || 50,
      offset: options.offset || 0,
    });
    return response.students || [];
  },

  async getStudentsBySection(sectionId, options = {}) {
    if (!sectionId) {
      return [];
    }

    try {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENTS_BY_SECTION, {
        sectionId,
        limit: options.limit || 500,
        offset: options.offset || 0,
      });
      return response.students || [];
    } catch (error) {
      console.log('[Students] Failed to fetch section students:', {sectionId, error});
      throw error;
    }
  },

  async getStudentDetails(studentId, scope) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_DETAILS, {
      studentId,
    });
    if (!response.student) {
      return null;
    }
    assertStudentRecordAccess(scope, response.student);
    return response;
  },

  async searchStudents({branchId, searchText, classId, sectionId, status, limit = 25}, scope) {
    if (!branchId || !searchText?.trim()) {
      return [];
    }

    assertBranchAccess(scope, branchId);
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.SEARCH_STUDENTS, {
      branchId,
      searchText: searchText.trim(),
      limit,
    });

    return filterStudentsForScope(response.students || [], scope).filter(item => {
      const classMatches = !classId || item.academicClassId === classId;
      const sectionMatches = !sectionId || item.sectionId === sectionId;
      const statusMatches = !status || item.status === status;
      return classMatches && sectionMatches && statusMatches;
    });
  },

  async getStudentsForRole(scope, options = {}) {
    if (scope?.sectionId) {
      return this.getStudentsBySection(scope.sectionId, options);
    }

    return this.getStudents({branchId: scope?.branchId, ...options}, scope);
  },

  async getNextStudentIdSeed({admissionYear, branchCode}) {
    return AdmissionNumberService.getNextAdmissionNumber({
      year: admissionYear,
      branchCode,
    });
  },

  async getStudentsByWing({branchId, wing, limit, offset}, scope) {
    assertBranchAccess(scope, branchId);
    assertCoordinatorWing(scope, wing);
    return studentRepository.getStudentsByWing({branchId, wing, limit, offset});
  },

  async createStudent(payload, scope) {
    const normalized = normalizeStudentPayload(payload, scope);
    normalized.branchCode = await resolveBranchCode(scope, normalized.branchId);

    console.log('[StudentCreate] Normalized form payload:', {
      selectedClassId: normalized.academicClassId,
      selectedClassName: normalized.className,
      selectedSectionId: normalized.sectionId,
      branchId: normalized.branchId,
      branchCode: normalized.branchCode,
      wingId: normalized.wingId,
      wingCode: normalized.wingCode,
    });

    assertBranchAccess(scope, normalized.branchId);
    assertCoordinatorWing(scope, normalized.wingCode || normalized.className || normalized.wing);

    const validationError = validateStudentPayload(normalized);
    if (validationError) {
      throw new Error(validationError);
    }

    const idPayload =
      normalized.studentId && normalized.serialNumber
        ? normalized
        : await this.getNextStudentIdSeed({
            admissionYear: normalized.admissionYear,
            branchCode: normalized.branchCode,
          });

    console.log('[StudentCreate] Generated admission number:', {
      admissionNumber: idPayload.studentId,
      admissionYear: idPayload.admissionYear,
      serialNumber: idPayload.serialNumber,
    });

    const parentId =
      normalized.parentId ||
      (
        await parentService.createParent({
          branchId: normalized.branchId,
          fullName: normalized.fatherName,
          fatherName: normalized.fatherName,
          motherName: normalized.motherName,
          countryCode: normalized.countryCode || '+91',
          phoneNumber: normalized.parentPhoneNumber,
          address: normalized.address || null,
        })
      ).id;

    console.log('[StudentCreate] Parent link resolved:', {parentId});

    const mutationPayload = toStudentMutationPayload({
      ...normalized,
      ...idPayload,
      parentId,
    });

    console.log('[StudentCreate] CreateStudent mutation payload:', mutationPayload);

    const response = await dataConnectClient.mutate(
      DATA_CONNECT_MUTATIONS.CREATE_STUDENT,
      mutationPayload,
    );

    console.log('[StudentCreate] CreateStudent mutation response:', response);

    return {
      id: response.student_insert?.id || response.student_insert,
      ...normalized,
      ...idPayload,
      parentId,
      status: 'ACTIVE',
      isActive: true,
    };
  },

  async updateStudent(payload, scope) {
    const normalized = normalizeStudentPayload(payload, scope);
    assertBranchAccess(scope, normalized.branchId);
    assertCoordinatorWing(scope, normalized.className || normalized.wing);

    const validationError = validateStudentPayload(normalized);
    if (validationError) {
      throw new Error(validationError);
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_STUDENT, {
      studentId: normalized.studentId || normalized.id,
      parentId: normalized.parentId,
      branchId: normalized.branchId,
      fullName: normalized.fullName,
      gender: normalized.gender,
      dateOfBirth: normalized.dateOfBirth,
      photoUrl: normalized.photoUrl || null,
      aadhaarNumber: normalized.aadhaarNumber || null,
      bloodGroup: normalized.bloodGroup || null,
      academicClassId: normalized.academicClassId,
      sectionId: normalized.sectionId,
      countryCode: normalized.countryCode || '+91',
      phoneNumber: normalized.phoneNumber,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      transportRequired: Boolean(normalized.transportRequired),
      admissionDate: normalized.admissionDate,
      fatherName: normalized.fatherName,
      motherName: normalized.motherName,
      parentPhoneNumber: normalized.parentPhoneNumber,
    });

    return {id: response.student_update?.id || normalized.studentId || normalized.id, ...normalized};
  },

  async transferStudent(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    assertCoordinatorWing(scope, payload.targetWing || payload.className);
    return studentRepository.transferStudent({
      studentId: payload.studentId,
      oldSectionId: payload.oldSectionId,
      newSectionId: payload.newSectionId,
      newClassId: payload.newClassId,
      changedById: scope?.userId,
    });
  },

  async bulkAssignStudents(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    assertCoordinatorWing(scope, payload.targetWing || payload.className);
    return studentRepository.bulkAssignStudents({
      studentIds: payload.studentIds,
      sectionId: payload.sectionId,
      academicClassId: payload.academicClassId,
    });
  },

  async updateStudentStatus(payload, scope) {
    const role = normalizeRole(scope?.role);
    if (![USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN, USER_ROLES.COORDINATOR].includes(role)) {
      throw new Error('Student status access denied.');
    }
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    return studentRepository.updateStudentStatus({
      studentId: payload.studentId,
      status: payload.status,
    });
  },

  async importStudents({csvText, classes = [], sections = []}, scope, onProgress) {
    const rows = parseCsv(csvText).map(mapCsvRow);
    const created = [];
    const failed = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const academicClass = classes.find(item => item.name === String(row.className));
      const section = sections.find(
        item =>
          item.name === String(row.sectionName) &&
          item.academicClassId === academicClass?.id,
      );

      try {
        if (!academicClass) {
          throw new Error(`Class ${row.className} does not exist.`);
        }
        if (!section) {
          throw new Error(`Section ${row.sectionName} does not exist for class ${row.className}.`);
        }

        const student = await this.createStudent(
          {
            ...row,
            branchId: scope.branchId,
            branchCode: scope.branchCode,
            academicClassId: academicClass.id,
            className: academicClass.name,
            sectionId: section.id,
          },
          scope,
        );
        created.push(student);
      } catch (error) {
        failed.push({rowNumber: row.rowNumber, row, error: error.message});
      }

      if (onProgress) {
        onProgress({completed: index + 1, total: rows.length});
      }
    }

    return {
      successCount: created.length,
      failedCount: failed.length,
      errors: failed,
      created,
    };
  },

  async promoteStudents(payload, scope) {
    assertBranchAccess(scope, payload.branchId || scope?.branchId);
    return studentRepository.promoteStudents({
      studentIds: payload.studentIds,
      fromClassId: payload.fromClassId,
      toClassId: payload.toClassId,
      fromSectionId: payload.fromSectionId,
      toSectionId: payload.toSectionId,
      promotedById: scope?.userId,
    });
  },
};

export default studentService;
