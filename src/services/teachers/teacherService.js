import {USER_ROLES} from '../../config/constants';
import {WINGS} from '../../config/academic';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import {assertBranchAccess} from '../academics/academicAccess';
import StaffIdService from '../staff/StaffIdService';
import {formatE164PhoneNumber, normalizePhoneNumber} from '../../utils/phone';

const validWings = Object.values(WINGS);

const today = () => new Date().toISOString().slice(0, 10);

const normalizeRole = role => String(role || '').toUpperCase();

const buildPendingFirebaseUID = ({branchId, phoneNumber}) =>
  `pending:teacher:${branchId}:${normalizePhoneNumber(phoneNumber)}`;

const canManageTeachers = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN, USER_ROLES.COORDINATOR].includes(
    normalizeRole(role),
  );

const canViewTeachers = role =>
  [USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN, USER_ROLES.COORDINATOR].includes(
    normalizeRole(role),
  );

const assertTeacherWingAccess = (scope, wing) => {
  const role = normalizeRole(scope?.role);
  if (role === USER_ROLES.COORDINATOR && scope?.wing !== wing) {
    throw new Error('Coordinators can manage teachers only inside their assigned wing.');
  }
};

const validateTeacher = payload => {
  if (!payload.fullName?.trim()) {
    return 'Full name is required.';
  }
  if (normalizePhoneNumber(payload.phoneNumber).length < 10) {
    return 'Enter a valid mobile number.';
  }
  if (!payload.gender) {
    return 'Gender is required.';
  }
  if (!payload.joiningDate) {
    return 'Joining date is required.';
  }
  if (!payload.designation?.trim()) {
    return 'Designation is required.';
  }
  if (!validWings.includes(payload.wing)) {
    return 'Select a valid wing.';
  }
  return '';
};

const normalizeTeacherPayload = (payload, scope) => {
  const role = normalizeRole(scope?.role);
  const branchId = payload.branchId || scope?.branchId;
  const wing = role === USER_ROLES.COORDINATOR ? scope?.wing : payload.wing;
  const countryCode = payload.countryCode || '+91';
  const phoneNumber = formatE164PhoneNumber({
    countryCode,
    phoneNumber: payload.phoneNumber,
  });

  return {
    ...payload,
    branchId,
    wing,
    countryCode,
    phoneNumber,
    joiningDate: payload.joiningDate || today(),
    fullName: payload.fullName?.trim(),
    designation: payload.designation?.trim(),
  };
};

const flattenTeacher = teacher => ({
  ...teacher,
  fullName: teacher.user?.fullName,
  phoneNumber: teacher.user?.phoneNumber,
  countryCode: teacher.user?.countryCode,
  role: teacher.user?.role,
  subjects:
    (teacher.subjects || teacher.teacherSubjects_on_teacher || [])
      .map(item => item.subject)
      .filter(Boolean) || [],
  assignments: (teacher.assignments || teacher.teacherSectionAssignments_on_teacher || []).filter(
    item => item.isActive !== false,
  ),
  attendanceMarked:
    teacher.attendanceMarked?.attendances_on_markedBy ||
    teacher.attendanceMarked?.profileMarkedAttendance ||
    teacher.user?.dashboardMarkedAttendance ||
    teacher.user?.profileMarkedAttendance ||
    teacher.user?.attendances_on_markedBy ||
    [],
});

export const teacherService = {
  async getTeachers({branchId, wing, limit = 50, offset = 0}, scope) {
    if (!branchId) {
      return [];
    }

    if (!canViewTeachers(scope?.role)) {
      throw new Error('Teacher list access denied.');
    }

    assertBranchAccess(scope, branchId);

    const role = normalizeRole(scope?.role);
    if (role === USER_ROLES.COORDINATOR) {
      const coordinatorWing = scope?.wing;
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_COORDINATOR_TEACHERS_BY_WING, {
        branchId,
        wing: coordinatorWing,
        limit,
        offset,
      });
      return (response.teachers || []).map(flattenTeacher);
    }

    const operationName = wing
      ? DATA_CONNECT_QUERIES.GET_TEACHERS_BY_WING
      : DATA_CONNECT_QUERIES.GET_TEACHERS;
    const variables = wing ? {branchId, wing, limit, offset} : {branchId, limit, offset};
    const response = await dataConnectClient.query(operationName, variables);
    return (response.teachers || []).map(flattenTeacher);
  },

  async getTeachersByBranch(branchId, scope) {
    return this.getTeachers({branchId}, scope);
  },

  async getTeacherProfile(teacherId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHER_PROFILE, {
      teacherId,
    });
    return response.teacher ? flattenTeacher(response.teacher) : null;
  },

  async getTeacherProfileByUser(userId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHER_PROFILE_BY_USER, {
      userId,
    });
    return response.teachers?.[0] || null;
  },

  async getTeacherDashboard(teacherId) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_TEACHER_DASHBOARD, {
      teacherId,
    });
    const teacher = response.teacher ? flattenTeacher(response.teacher) : null;
    const assignments = teacher?.assignments || [];
    const sections = assignments.map(item => item.section).filter(Boolean);
    const todayDate = new Date().toISOString().slice(0, 10);
    const activeAssignments = assignments.filter(item => item.isActive !== false);
    const attendanceMarked = teacher?.attendanceMarked || [];
    const todayRecords = sections.flatMap(section =>
      (
        section.dashboardSectionAttendance ||
        section.profileSectionAttendance ||
        section.sectionAttendance ||
        section.attendances_on_section ||
        []
      ).filter(item => item.attendanceDate === todayDate),
    );
    const assignedSubjects = teacher?.subjects || [];
    const totalStudents = sections.reduce(
      (sum, section) =>
        sum +
        (
          section.dashboardActiveStudents ||
          section.profileActiveStudents ||
          section.activeStudents ||
          section.students_on_section ||
          []
        ).filter(student =>
          ['ACTIVE', undefined, null].includes(student.status),
        ).length,
      0,
    );
    const pendingAttendance = sections.filter(section => {
      const students =
        section.dashboardActiveStudents ||
        section.profileActiveStudents ||
        section.activeStudents ||
        section.students_on_section ||
        [];
      const markedIds = new Set(
        (
          section.dashboardSectionAttendance ||
          section.profileSectionAttendance ||
          section.sectionAttendance ||
          section.attendances_on_section ||
          []
        )
          .filter(item => item.attendanceDate === todayDate)
          .map(item => item.studentId),
      );
      return students.some(student => !markedIds.has(student.id));
    }).length;

    return {
      teacher,
      assignedSections: sections,
      assignments: activeAssignments,
      assignedSubjects,
      totalStudents,
      subjectsAssigned: assignedSubjects.length,
      todaysAttendance: todayRecords.length,
      pendingAttendance,
      classTeacherAssignments: activeAssignments.filter(item => item.isClassTeacher),
      attendanceRecordsMarked: attendanceMarked.length,
    };
  },

  async getAssignments(filters = {}) {
    if (!filters.teacherId) {
      return [];
    }

    const teacher = await this.getTeacherProfile(filters.teacherId);
    return (teacher?.assignments || []).map(item => ({
      id: item.id,
      teacherId: teacher.id,
      branchId: teacher.branchId,
      wing: teacher.wing,
      sectionId: item.section?.id || item.sectionId,
      academicClassId: item.section?.academicClass?.id,
      isClassTeacher: item.isClassTeacher,
      section: item.section,
    }));
  },

  async createTeacher(payload, scope) {
    if (!canManageTeachers(scope?.role)) {
      throw new Error('Teacher management access denied.');
    }

    const normalized = normalizeTeacherPayload(payload, scope);
    assertBranchAccess(scope, normalized.branchId);
    assertTeacherWingAccess(scope, normalized.wing);

    const error = validateTeacher(normalized);
    if (error) {
      throw new Error(error);
    }

    const existingUser = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber: normalized.phoneNumber,
    });
    if (existingUser.users?.length) {
      throw new Error('A user with this phone number already exists.');
    }

    const joiningYear = Number(String(normalized.joiningDate).slice(2, 4));
    const staffId = await StaffIdService.getNextStaffId({
      branchId: normalized.branchId,
      branchCode: scope?.branchCode,
      joiningYear,
    });

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_TEACHER, {
      firebaseUID:
        normalized.firebaseUID ||
        buildPendingFirebaseUID({
          branchId: normalized.branchId,
          phoneNumber: normalized.phoneNumber,
        }),
      fullName: normalized.fullName,
      countryCode: normalized.countryCode,
      phoneNumber: normalized.phoneNumber,
      alternateMobileNumber: normalized.alternateMobileNumber || null,
      email: normalized.email || null,
      dateOfBirth: normalized.dateOfBirth || null,
      gender: normalized.gender,
      joiningDate: normalized.joiningDate,
      designation: normalized.designation,
      qualification: normalized.qualification || null,
      experience: normalized.experience || null,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      bloodGroup: normalized.bloodGroup || null,
      employeeId: staffId.employeeId,
      joiningYear: staffId.joiningYear,
      branchCode: staffId.branchCode,
      serialNumber: staffId.serialNumber,
      branchId: normalized.branchId,
      wing: normalized.wing,
    });

    return {
      id: response.teacher_insert?.id || response.teacher_insert,
      userId: response.user_insert?.id || response.user_insert,
      ...normalized,
      ...staffId,
      role: USER_ROLES.TEACHER,
      isActive: true,
    };
  },

  async updateTeacher(payload, scope) {
    const normalized = normalizeTeacherPayload(payload, scope);
    assertBranchAccess(scope, normalized.branchId);
    assertTeacherWingAccess(scope, normalized.wing);

    const error = validateTeacher(normalized);
    if (error) {
      throw new Error(error);
    }

    const oldWing = payload.currentWing || payload.oldWing;
    if (oldWing && oldWing !== normalized.wing) {
      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_TEACHER, {
        teacherId: normalized.teacherId,
        userId: normalized.userId,
        fullName: normalized.fullName,
        countryCode: normalized.countryCode,
        phoneNumber: normalized.phoneNumber,
        alternateMobileNumber: normalized.alternateMobileNumber || null,
        email: normalized.email || null,
        dateOfBirth: normalized.dateOfBirth || null,
        gender: normalized.gender,
        joiningDate: normalized.joiningDate,
        designation: normalized.designation,
        qualification: normalized.qualification || null,
        experience: normalized.experience || null,
        address: normalized.address || null,
        city: normalized.city || null,
        state: normalized.state || null,
        pincode: normalized.pincode || null,
        emergencyContact: normalized.emergencyContact || null,
        bloodGroup: normalized.bloodGroup || null,
        branchId: normalized.branchId,
        wing: oldWing,
        isActive: normalized.isActive ?? true,
      });

      return this.transferTeacher(
        {
          teacherId: normalized.teacherId,
          oldWing,
          newWing: normalized.wing,
          changedById: scope?.userId,
          branchId: normalized.branchId,
        },
        scope,
      );
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_TEACHER, {
      teacherId: normalized.teacherId,
      userId: normalized.userId,
      fullName: normalized.fullName,
      countryCode: normalized.countryCode,
      phoneNumber: normalized.phoneNumber,
      alternateMobileNumber: normalized.alternateMobileNumber || null,
      email: normalized.email || null,
      dateOfBirth: normalized.dateOfBirth || null,
      gender: normalized.gender,
      joiningDate: normalized.joiningDate,
      designation: normalized.designation,
      qualification: normalized.qualification || null,
      experience: normalized.experience || null,
      address: normalized.address || null,
      city: normalized.city || null,
      state: normalized.state || null,
      pincode: normalized.pincode || null,
      emergencyContact: normalized.emergencyContact || null,
      bloodGroup: normalized.bloodGroup || null,
      branchId: normalized.branchId,
      wing: normalized.wing,
      isActive: normalized.isActive ?? true,
    });

    return {id: response.teacher_update?.id || response.teacher_update, ...normalized};
  },

  async transferTeacher(payload, scope) {
    const role = normalizeRole(scope?.role);
    if (![USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(role)) {
      throw new Error('Only principals can transfer teachers across wings.');
    }
    assertBranchAccess(scope, payload.branchId);

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.TRANSFER_TEACHER, {
      ...payload,
      changedById: payload.changedById || scope?.userId,
    });
    return {id: response.teacher_update?.id || payload.teacherId, ...payload};
  },

  async assignTeacherSubjects({teacher, teacherId, subjectIds = []}, scope) {
    const resolvedTeacherId = teacherId || teacher?.id;
    if (!resolvedTeacherId) {
      throw new Error('Select a teacher.');
    }
    assertBranchAccess(scope, teacher?.branchId || scope?.branchId);
    assertTeacherWingAccess(scope, teacher?.wing);

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLEAR_TEACHER_SUBJECTS, {
      teacherId: resolvedTeacherId,
      branchId: teacher?.branchId || scope?.branchId,
    });

    await Promise.all(
      subjectIds.map(subjectId =>
        dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_TEACHER_SUBJECT, {
          teacherId: resolvedTeacherId,
          subjectId,
          branchId: teacher?.branchId || scope?.branchId,
        }),
      ),
    );

    return {teacherId: resolvedTeacherId, subjectIds};
  },

  async assignClassTeacher({teacher, teacherId, sectionId, branchId}, scope) {
    const resolvedTeacher = teacher || {};
    const resolvedTeacherId = teacherId || resolvedTeacher.id;
    const teacherUserId = resolvedTeacher.userId || resolvedTeacher.user?.id;

    if (!resolvedTeacherId || !teacherUserId || !sectionId) {
      throw new Error('Select a teacher and section.');
    }

    assertBranchAccess(scope, branchId || resolvedTeacher.branchId || scope?.branchId);
    assertTeacherWingAccess(scope, resolvedTeacher.wing);

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.ASSIGN_CLASS_TEACHER, {
      sectionId,
      teacherId: resolvedTeacherId,
      teacherUserId,
      branchId: branchId || resolvedTeacher.branchId || scope?.branchId,
    });

    return {id: response.teacherSectionAssignment_insert?.id, sectionId, teacherId: resolvedTeacherId};
  },
};

export default teacherService;
