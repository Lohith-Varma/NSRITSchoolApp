import {USER_ROLES} from '../../config/constants';
import {formatE164PhoneNumber, normalizePhoneNumber} from '../../utils/phone';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

const CACHE_TTL = 60 * 1000;
const cache = new Map();

const todayKey = () => new Date().toISOString().slice(0, 10);

const readCache = key => {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.createdAt > CACHE_TTL) {
    return null;
  }
  return entry.value;
};

const writeCache = (key, value) => {
  cache.set(key, {createdAt: Date.now(), value});
  return value;
};

const withCache = async (key, loader, forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = readCache(key);
    if (cached) {
      return cached;
    }
  }

  return writeCache(key, await loader());
};

const invalidate = (...prefixes) => {
  [...cache.keys()].forEach(key => {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      cache.delete(key);
    }
  });
};

const asArray = value => (Array.isArray(value) ? value : []);

const isPresent = status => String(status || '').toUpperCase() === 'PRESENT';
const isAbsent = status => String(status || '').toUpperCase() === 'ABSENT';
const isTeacherRole = role => String(role || '').toUpperCase() === USER_ROLES.TEACHER;

const percent = (part, total) => {
  if (!total) {
    return 0;
  }
  return Math.round((part / total) * 100);
};

const feeCollectionPercent = fees => {
  const total = asArray(fees).reduce((sum, item) => sum + Number(item.totalFee || 0), 0);
  const paid = asArray(fees).reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
  return percent(paid, total);
};

const attendancePercent = records => {
  const attendance = asArray(records).filter(item => isPresent(item.status) || isAbsent(item.status));
  return percent(attendance.filter(item => isPresent(item.status)).length, attendance.length);
};

const normalizeBranch = branch => ({
  ...branch,
  code: branch?.branchCode,
  contactNumber: branch?.phone,
  status: branch?.status || (branch?.isActive ? 'ACTIVE' : 'INACTIVE'),
});

const roleVariant = role => {
  const normalized = String(role || '').trim();
  return {
    role: normalized,
    alternateRole: normalized.toUpperCase(),
  };
};

const buildPendingFirebaseUID = ({role, branchId, phoneNumber}) =>
  `pending:${String(role).toLowerCase()}:${branchId}:${normalizePhoneNumber(phoneNumber)}`;

const matchesText = (values, searchText) => {
  const needle = String(searchText || '').trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return values.some(value => String(value || '').toLowerCase().includes(needle));
};

const buildBranchList = data => {
  const classes = asArray(data.academicClasses);
  const students = asArray(data.students);
  const users = asArray(data.users);

  return asArray(data.branches).map(branch => {
    const branchClasses = classes.filter(item => item.branchId === branch.id && item.isActive !== false);
    const branchStudents = students.filter(item => item.branchId === branch.id && item.isActive !== false);
    const branchTeachers = users.filter(
      item => item.branchId === branch.id && isTeacherRole(item.role),
    );

    return {
      ...normalizeBranch(branch),
      totalClasses: branchClasses.length,
      totalStudents: branchStudents.length,
      totalTeachers: branchTeachers.length,
    };
  });
};

const enrichClasses = data => {
  const students = asArray(data.students).filter(student => student.isActive !== false);
  const assignments = asArray(data.teacherAssignments);
  const attendance = asArray(data.attendances);
  const fees = asArray(data.studentFees);

  return asArray(data.sections).map(section => {
    const sectionStudents = students.filter(student => student.sectionId === section.id);
    const sectionAttendance = attendance.filter(record => record.sectionId === section.id);
    const sectionFees = fees.filter(fee =>
      sectionStudents.some(student => student.id === fee.student?.id || student.id === fee.studentId),
    );
    const classTeacher = assignments.find(
      item => item.sectionId === section.id && item.isClassTeacher,
    )?.teacher;

    return {
      id: section.id,
      branchId: section.branchId,
      classId: section.academicClassId,
      branchName: section.branch?.name || 'Branch',
      branchCode: section.branch?.branchCode,
      className: section.academicClass?.name || 'Class',
      section: section.name,
      classTeacher: classTeacher?.fullName || 'Unassigned',
      totalStudents: sectionStudents.length,
      attendancePercent: attendancePercent(sectionAttendance),
      feeCollectionPercent: feeCollectionPercent(sectionFees),
      isActive: section.isActive,
      raw: section,
    };
  });
};

const enrichStudents = data => {
  const attendance = asArray(data.attendances);
  const fees = asArray(data.studentFees);

  return asArray(data.students).map(student => {
    const studentAttendance = attendance.filter(item => item.studentId === student.id);
    const studentFees = fees.filter(item => item.studentId === student.id);
    const pendingAmount = studentFees.reduce(
      (sum, item) => sum + Number(item.remainingAmount || 0),
      0,
    );

    return {
      ...student,
      admissionNumber: student.studentId,
      branchName: student.branch?.name || 'Branch',
      className: student.academicClass?.name || 'Class',
      sectionName: student.section?.name || '',
      parentPhone: student.parent?.phoneNumber || student.phoneNumber,
      attendancePercent: attendancePercent(studentAttendance),
      feeStatus: pendingAmount > 0 ? 'PENDING' : 'PAID',
      pendingAmount,
    };
  });
};

const summarizeProfile = data => {
  const attendance = asArray(data.attendances);
  const fees = asArray(data.studentFees);
  const payments = asArray(data.payments);
  const presentDays = attendance.filter(item => isPresent(item.status)).length;
  const absentDays = attendance.filter(item => isAbsent(item.status)).length;

  return {
    student: data.student,
    attendance,
    fees,
    payments,
    summary: {
      presentDays,
      absentDays,
      attendancePercent: percent(presentDays, presentDays + absentDays),
      totalFees: fees.reduce((sum, item) => sum + Number(item.totalFee || 0), 0),
      paidAmount: fees.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
      pendingAmount: fees.reduce((sum, item) => sum + Number(item.remainingAmount || 0), 0),
      nextDueDate: fees.find(item => Number(item.remainingAmount || 0) > 0)?.dueDate || null,
    },
  };
};

const mainAdminService = {
  invalidate,

  async getAllBranches({forceRefresh = false} = {}) {
    const data = await withCache(
      'branches:all',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_DASHBOARD_STATISTICS),
      forceRefresh,
    );
    const branchData = await withCache(
      'branches:list',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCHES, {limit: 1000, offset: 0}),
      forceRefresh,
    );

    return buildBranchList({...data, branches: branchData.branches || []});
  },

  async getBranchDetails(branchId, {forceRefresh = false} = {}) {
    const data = await withCache(
      `branch:${branchId}`,
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_BRANCH_DETAILS, {branchId}),
      forceRefresh,
    );
    const students = asArray(data.students).filter(student => student.isActive !== false);
    const teachers = asArray(data.users).filter(user => isTeacherRole(user.role));
    const activeClasses = asArray(data.academicClasses).filter(item => item.isActive !== false);

    return {
      ...data,
      branch: normalizeBranch(data.branch),
      summary: {
        totalClasses: activeClasses.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        attendancePercent: attendancePercent(data.attendances),
        feeCollectionPercent: feeCollectionPercent(data.studentFees),
        totalFees: asArray(data.studentFees).reduce((sum, item) => sum + Number(item.totalFee || 0), 0),
        paidFees: asArray(data.studentFees).reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
        pendingFees: asArray(data.studentFees).reduce(
          (sum, item) => sum + Number(item.remainingAmount || 0),
          0,
        ),
      },
    };
  },

  async updateBranch(payload) {
    const status = payload.status || 'ACTIVE';
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_BRANCH, {
      id: payload.id,
      name: payload.name,
      address: payload.address || null,
      city: payload.city || null,
      state: payload.state || null,
      pincode: payload.pincode || null,
      phone: payload.phone || null,
      email: payload.email || null,
      status,
      isActive: status.toUpperCase() === 'ACTIVE',
    });
    invalidate('branch:', 'branches:', 'dashboard:');
    return payload;
  },

  async searchUsersByRole({role, searchText = '', limit = 25}) {
    const roles = roleVariant(role);
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USERS_BY_ROLE, {
      ...roles,
      searchText,
      limit,
    });
    return data.users || [];
  },

  async findUserByPhone(phoneNumber) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber,
    });
    return data.users?.[0] || null;
  },

  async createBranchRoleUser({branchId, fullName, countryCode = '+91', phoneNumber, role}) {
    const trimmedName = String(fullName || '').trim();
    const fullPhoneNumber = formatE164PhoneNumber({countryCode, phoneNumber});

    if (!trimmedName) {
      throw new Error('Full name is required.');
    }

    if (normalizePhoneNumber(phoneNumber).length < 10) {
      throw new Error('Enter a valid phone number.');
    }

    const existingUser = await this.findUserByPhone(fullPhoneNumber);
    if (existingUser) {
      throw new Error('A user with this phone number already exists.');
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_USER, {
      firebaseUID: buildPendingFirebaseUID({role, branchId, phoneNumber: fullPhoneNumber}),
      fullName: trimmedName,
      countryCode,
      phoneNumber: fullPhoneNumber,
      role,
      branchId,
    });

    return {
      id: response.user_insert.id,
      fullName: trimmedName,
      countryCode,
      phoneNumber: fullPhoneNumber,
      role,
      branchId,
      isActive: true,
    };
  },

  async ensureAssignable(userId, branchId, assignmentType) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_ASSIGNMENT_CONFLICTS, {
      userId,
    });
    const key = assignmentType === 'principal' ? 'principalBranches' : 'branchAdminBranches';
    const conflicts = asArray(data[key]).filter(branch => branch.id !== branchId);

    if (conflicts.length) {
      throw new Error(
        `${assignmentType === 'principal' ? 'Principal' : 'Branch admin'} is already assigned to ${conflicts[0].name}.`,
      );
    }
  },

  async assignBranchAdmin({branchId, userId, allowMultipleAssignments = false}) {
    if (!allowMultipleAssignments) {
      await this.ensureAssignable(userId, branchId, 'branchAdmin');
    }
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_BRANCH_ADMIN, {
      branchId,
      branchAdminId: userId,
    });
    invalidate('branch:', 'branches:');
  },

  async createAndAssignBranchAdmin(payload) {
    const user = await this.createBranchRoleUser({
      ...payload,
      role: USER_ROLES.BRANCH_ADMIN,
    });
    await this.assignBranchAdmin({
      branchId: payload.branchId,
      userId: user.id,
      allowMultipleAssignments: true,
    });
    return user;
  },

  async assignPrincipal({branchId, userId, allowMultipleAssignments = false}) {
    if (!allowMultipleAssignments) {
      await this.ensureAssignable(userId, branchId, 'principal');
    }
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_PRINCIPAL, {
      branchId,
      principalId: userId,
    });
    invalidate('branch:', 'branches:');
  },

  async createAndAssignPrincipal(payload) {
    const user = await this.createBranchRoleUser({
      ...payload,
      role: USER_ROLES.PRINCIPAL,
    });
    await this.assignPrincipal({
      branchId: payload.branchId,
      userId: user.id,
      allowMultipleAssignments: true,
    });
    return user;
  },

  async getGlobalClasses({filters = {}, searchText = '', forceRefresh = false} = {}) {
    const data = await withCache(
      'classes:global',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_GLOBAL_CLASSES, {limit: 1000, offset: 0}),
      forceRefresh,
    );
    return enrichClasses(data).filter(item => {
      const matchesFilters =
        (!filters.branchId || item.branchId === filters.branchId) &&
        (!filters.grade || item.className === filters.grade) &&
        (!filters.section || item.section === filters.section);
      return (
        matchesFilters &&
        matchesText(
          [item.branchName, item.branchCode, item.className, item.section, item.classTeacher],
          searchText,
        )
      );
    });
  },

  async getClassDetails(sectionId, {forceRefresh = false} = {}) {
    const data = await withCache(
      `class:${sectionId}`,
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CLASS_DETAILS, {sectionId}),
      forceRefresh,
    );
    return {
      ...data,
      classInfo: enrichClasses({
        sections: data.section ? [data.section] : [],
        students: data.students,
        teacherAssignments: data.teacherAssignments,
        attendances: data.attendances,
        studentFees: data.studentFees,
      })[0],
    };
  },

  async getGlobalStudents({
    filters = {},
    searchText = '',
    page = 1,
    pageSize = 25,
    forceRefresh = false,
  } = {}) {
    const data = await withCache(
      'students:global',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_GLOBAL_STUDENTS, {limit: 1000, offset: 0}),
      forceRefresh,
    );
    const filtered = enrichStudents(data).filter(student => {
      const matchesFilters =
        (!filters.branchId || student.branchId === filters.branchId) &&
        (!filters.classId || student.academicClassId === filters.classId) &&
        (!filters.sectionId || student.sectionId === filters.sectionId) &&
        (!filters.gender || student.gender === filters.gender) &&
        (!filters.status ||
          (filters.status === 'ACTIVE' ? student.isActive !== false : student.isActive === false));
      return (
        matchesFilters &&
        matchesText(
          [student.fullName, student.studentId, student.parentPhone, student.phoneNumber],
          searchText,
        )
      );
    });
    const start = (page - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      hasNextPage: start + pageSize < filtered.length,
      hasPreviousPage: page > 1,
    };
  },

  async getStudentProfile(studentId, {forceRefresh = false} = {}) {
    const data = await withCache(
      `student:${studentId}`,
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_PROFILE, {studentId}),
      forceRefresh,
    );
    return summarizeProfile(data);
  },

  async getStudentAttendance(studentId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_ATTENDANCE, {
      studentId,
    });
    return data.attendances || [];
  },

  async getStudentFeeHistory(studentId) {
    const data = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_FEE_HISTORY, {
      studentId,
    });
    return data;
  },

  async getDashboardStatistics({forceRefresh = false} = {}) {
    const data = await withCache(
      'dashboard:stats',
      () => dataConnectClient.query(DATA_CONNECT_QUERIES.GET_DASHBOARD_STATISTICS),
      forceRefresh,
    );
    const teachers = asArray(data.users).filter(user => isTeacherRole(user.role));
    const todayAttendance = asArray(data.attendances).filter(record =>
      String(record.attendanceDate || '').startsWith(todayKey()),
    );

    return {
      totalBranches: asArray(data.branches).filter(branch => branch.isActive !== false).length,
      totalClasses: asArray(data.academicClasses).filter(item => item.isActive !== false).length,
      totalTeachers: teachers.length,
      totalStudents: asArray(data.students).length,
      totalUsers: asArray(data.users).length,
      revenue: asArray(data.studentFees).reduce(
        (sum, item) => sum + Number(item.paidAmount || 0),
        0,
      ),
      todayAttendance: attendancePercent(todayAttendance),
      pendingFees: asArray(data.studentFees).reduce(
        (sum, item) => sum + Number(item.remainingAmount || 0),
        0,
      ),
      rawBranches: asArray(data.branches),
      rawUsers: asArray(data.users),
    };
  },
};

export default mainAdminService;
