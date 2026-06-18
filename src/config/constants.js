export const APP_NAME = 'NSRIT Connect';

export const USER_ROLES = {
  MAIN_ADMIN: 'MAIN_ADMIN',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  COORDINATOR: 'COORDINATOR',
  TEACHER: 'TEACHER',
  CLASS_TEACHER: 'CLASS_TEACHER',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
  FRONT_DESK: 'FRONT_DESK',
};

export const STAFF_TYPES = {
  TEACHING: 'TEACHING',
  SUPPORTING: 'SUPPORTING',
};

export const STAFF_TYPE_LABELS = {
  [STAFF_TYPES.TEACHING]: 'Teaching Staff',
  [STAFF_TYPES.SUPPORTING]: 'Supporting Staff',
};

export const ROLE_LABELS = {
  [USER_ROLES.MAIN_ADMIN]: 'Main Admin',
  [USER_ROLES.BRANCH_ADMIN]: 'Branch Admin',
  [USER_ROLES.PRINCIPAL]: 'Principal',
  [USER_ROLES.COORDINATOR]: 'Coordinator',
  [USER_ROLES.TEACHER]: 'Teacher',
  [USER_ROLES.CLASS_TEACHER]: 'Class Teacher',
  [USER_ROLES.PARENT]: 'Parent',
  [USER_ROLES.ACCOUNTANT]: 'Accountant',
  [USER_ROLES.FRONT_DESK]: 'Front Desk',
};

export const USER_ROLE_PRIORITY = [
  USER_ROLES.MAIN_ADMIN,
  USER_ROLES.BRANCH_ADMIN,
  USER_ROLES.PRINCIPAL,
  USER_ROLES.COORDINATOR,
  USER_ROLES.TEACHER,
  USER_ROLES.CLASS_TEACHER,
  USER_ROLES.ACCOUNTANT,
  USER_ROLES.FRONT_DESK,
  USER_ROLES.PARENT,
];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth.token',
  AUTH_USER: 'auth.user',
  MAIN_ADMIN_BRANCH_CONTEXT: 'mainAdmin.branchContext',
  OTP_VERIFICATION_ID: 'auth.otpVerificationId',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HOLIDAY: 'HOLIDAY',
  LATE: 'LATE',
};

export const COLLECTIONS = {
  USERS: 'users',
  BRANCHES: 'branches',
  CLASSES: 'classes',
  SECTIONS: 'sections',
  TEACHER_ASSIGNMENTS: 'teacherAssignments',
  ATTENDANCE: 'attendance',
  FEES: 'fees',
  PAYMENTS: 'payments',
};

export const FEE_STATUS = {
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  DUE: 'DUE',
  OVERDUE: 'OVERDUE',
};

export const USER_ROLE_ALIASES = {
  MAIN_ADMIN: ['MAIN_ADMIN', 'main_admin'],
  BRANCH_ADMIN: ['BRANCH_ADMIN', 'branch_admin'],
  PRINCIPAL: ['PRINCIPAL', 'principal'],
  COORDINATOR: ['COORDINATOR', 'coordinator'],
  TEACHER: ['TEACHER', 'teacher'],
  CLASS_TEACHER: ['CLASS_TEACHER', 'class_teacher'],
  PARENT: ['PARENT', 'parent'],
  ACCOUNTANT: ['ACCOUNTANT', 'accountant'],
  FRONT_DESK: ['FRONT_DESK', 'front_desk'],
};
