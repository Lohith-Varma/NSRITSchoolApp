export const APP_NAME = 'NSRIT Connect';

export const USER_ROLES = {
  MAIN_ADMIN: 'MAIN_ADMIN',
  BRANCH_ADMIN: 'BRANCH_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  COORDINATOR: 'COORDINATOR',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
  FRONT_DESK: 'FRONT_DESK',
};

export const ROLE_LABELS = {
  [USER_ROLES.MAIN_ADMIN]: 'Main Admin',
  [USER_ROLES.BRANCH_ADMIN]: 'Branch Admin',
  [USER_ROLES.PRINCIPAL]: 'Principal',
  [USER_ROLES.COORDINATOR]: 'Coordinator',
  [USER_ROLES.TEACHER]: 'Teacher',
  [USER_ROLES.PARENT]: 'Parent',
  [USER_ROLES.ACCOUNTANT]: 'Accountant',
  [USER_ROLES.FRONT_DESK]: 'Front Desk',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth.token',
  AUTH_USER: 'auth.user',
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
