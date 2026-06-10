import {FEE_STATUS, USER_ROLES} from '../../config/constants';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

const normalizeRole = role => String(role || '').toUpperCase();
const currentYear = () => new Date().getFullYear();
const today = () => new Date().toISOString().slice(0, 10);
const padBranchCode = branchCode => String(branchCode || '').padStart(2, '0').slice(-2);
const formatReceiptNumber = ({year, branchCode, sequence}) =>
  `RCPT-${year}-${padBranchCode(branchCode)}-${String(sequence).padStart(5, '0')}`;

const DEFAULT_FEE_CATEGORIES = [
  'Admission Fee',
  'Tuition Fee',
  'Transport Fee',
  'Books Fee',
  'Uniform Fee',
  'Exam Fee',
];

const canManageFeePlans = role =>
  [USER_ROLES.COORDINATOR, USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

const canRecordPayments = role =>
  [USER_ROLES.ACCOUNTANT, USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

const isCoordinator = role => normalizeRole(role) === USER_ROLES.COORDINATOR;
const isActivePayment = payment => !['REVERSED', 'CANCELLED'].includes(String(payment?.status || 'RECORDED').toUpperCase());

const getStudentWing = student =>
  student?.academicClass?.wing?.code || student?.academicClass?.wing || student?.wing?.code || student?.wing;

const getStudentFeePlans = student =>
  student?.feePlans ||
  student?.parentFeePlans ||
  student?.studentDetailFeePlans ||
  student?.profileFeePlans ||
  student?.reportFeePlans ||
  [];

const getPlanItems = plan =>
  plan?.items ||
  plan?.parentFeeItems ||
  plan?.detailFeeItems ||
  plan?.profileFeeItems ||
  plan?.reportFeeItems ||
  plan?.studentFeeItems_on_feePlan ||
  [];

const getPlanPayments = plan =>
  plan?.payments ||
  plan?.parentFeePayments ||
  plan?.detailFeePayments ||
  plan?.profileFeePayments ||
  plan?.reportFeePayments ||
  plan?.feePayments_on_feePlan ||
  [];

const getPlanTotal = plan =>
  Number(plan?.totalAmount || getPlanItems(plan).reduce((sum, item) => sum + Number(item.amount || 0), 0));

const serializeFeePlanSnapshot = ({studentId, academicYear, totalAmount, items = []}) =>
  JSON.stringify({
    studentId,
    academicYear,
    totalAmount: Number(totalAmount || 0),
    items: items.map(item => ({
      categoryId: item.categoryId || item.category?.id,
      categoryName: item.categoryName || item.category?.name,
      amount: Number(item.amount || 0),
    })),
  });

const serializePaymentSnapshot = payment =>
  JSON.stringify({
    studentId: payment.studentId,
    feePlanId: payment.feePlanId,
    amount: Number(payment.amount || 0),
    paymentDate: payment.paymentDate,
    paymentMode: payment.paymentMode || payment.mode,
    receiptNumber: payment.receiptNumber,
    status: payment.status || 'RECORDED',
  });

const buildFeeRecord = (student, plan = null) => {
  const plans = getStudentFeePlans(student);
  const selectedPlan = plan || plans.find(item => item.isActive !== false) || plans[0];
  const payments = getPlanPayments(selectedPlan);
  const activePayments = payments.filter(isActivePayment);
  const totalFee = getPlanTotal(selectedPlan);
  const paidAmount = activePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const dueAmount = Math.max(totalFee - paidAmount, 0);
  const status =
    !selectedPlan ? FEE_STATUS.DUE : dueAmount <= 0 ? FEE_STATUS.PAID : paidAmount > 0 ? FEE_STATUS.PARTIAL : FEE_STATUS.DUE;

  return {
    id: selectedPlan?.id || student?.id,
    feePlanId: selectedPlan?.id || null,
    studentId: student?.id,
    admissionNumber: student?.studentId,
    studentName: student?.fullName || '',
    className: student?.academicClass?.name || '',
    wing: getStudentWing(student),
    sectionName: student?.section?.name || '',
    branchId: student?.branchId || student?.branch?.id,
    branchCode: student?.branch?.branchCode,
    branchName: student?.branch?.name,
    parent: student?.parent,
    academicYear: selectedPlan?.academicYear || currentYear(),
    categories: getPlanItems(selectedPlan),
    totalFee,
    paidAmount,
    dueAmount,
    pendingAmount: dueAmount,
    status,
    payments,
    activePayments,
    recentPayments: payments.slice(0, 5),
    dueDate: selectedPlan?.dueDate || '',
    rawStudent: student,
    rawPlan: selectedPlan,
  };
};

const assertBranchAccess = (access = {}, branchId) => {
  const role = normalizeRole(access.role);
  if (role !== USER_ROLES.MAIN_ADMIN && access.branchId && branchId && access.branchId !== branchId) {
    throw new Error('You can access only your assigned branch.');
  }
};

const assertCoordinatorWingAccess = (access = {}, feeRecordOrStudent = {}) => {
  if (!isCoordinator(access.role)) {
    return;
  }

  const targetWing = getStudentWing(feeRecordOrStudent) || feeRecordOrStudent.wing;
  if (!targetWing || targetWing !== access.wing) {
    throw new Error('Coordinators can manage fee plans only for students in their assigned wing.');
  }
};

const filterRecordsByAccess = (records, access = {}) =>
  isCoordinator(access.role)
    ? records.filter(record => record.wing === access.wing)
    : records;

export const feeService = {
  canManageFeePlans,
  canRecordPayments,

  async getFeeRecords(access = {}) {
    if (access.studentId) {
      const profile = await this.getStudentFeeProfile(access.studentId, access);
      return profile ? [profile] : [];
    }

    if (!access.branchId && normalizeRole(access.role) !== USER_ROLES.MAIN_ADMIN) {
      return [];
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_FEE_REPORTS, {
      branchId: access.branchId,
      limit: access.limit || 1000,
      offset: access.offset || 0,
    });
    return filterRecordsByAccess((response.students || []).map(student => buildFeeRecord(student)), access);
  },

  async getStudentFeeProfile(studentId, access = {}) {
    if (!studentId) {
      return null;
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_STUDENT_FEE_PROFILE, {
      studentId,
    });
    if (!response.student) {
      return null;
    }
    assertBranchAccess(access, response.student.branchId);
    const record = buildFeeRecord(response.student);
    assertCoordinatorWingAccess(access, record);
    return record;
  },

  async getPaymentHistory(access = {}) {
    if (access.studentId) {
      const profile = await this.getStudentFeeProfile(access.studentId, access);
      return profile?.payments || [];
    }

    if (!access.branchId) {
      return [];
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PAYMENT_HISTORY, {
      branchId: access.branchId,
      studentId: access.studentId || null,
      fromDate: access.fromDate || '2000-01-01',
      toDate: access.toDate || today(),
      limit: access.limit || 500,
      offset: access.offset || 0,
    });

    const payments = (response.feePayments || []).map(payment => ({
      ...payment,
      studentName: payment.student?.fullName,
      className: payment.student?.academicClass?.name,
      sectionName: payment.student?.section?.name,
      mode: payment.paymentMode,
      date: payment.paymentDate,
      receiptNo: payment.receiptNumber,
      collectedByName: payment.collectedBy?.fullName,
    }));
    return filterRecordsByAccess(payments.map(payment => ({...payment, wing: getStudentWing(payment.student)})), access);
  },

  async getDueStudents(access = {}) {
    const records = await this.getFeeRecords(access);
    return records.filter(item => item.dueAmount > 0);
  },

  async getPaidStudents(access = {}) {
    const records = await this.getFeeRecords(access);
    return records.filter(item => item.totalFee > 0 && item.dueAmount <= 0);
  },

  async getFeeCategories() {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_FEE_CATEGORIES, {
      limit: 200,
      offset: 0,
    });
    return response.feeCategories || [];
  },

  async ensureDefaultFeeCategories(access = {}) {
    const categories = await this.getFeeCategories();
    if (!canManageFeePlans(access.role)) {
      return categories;
    }

    const existingNames = new Set(
      categories.map(category => String(category.name || '').trim().toLowerCase()),
    );
    const defaultNames = new Set(DEFAULT_FEE_CATEGORIES.map(name => name.toLowerCase()));
    const missingCategories = DEFAULT_FEE_CATEGORIES.filter(
      name => !existingNames.has(name.toLowerCase()),
    );
    const inactiveDefaultCategories = categories.filter(
      category =>
        defaultNames.has(String(category.name || '').trim().toLowerCase()) &&
        String(category.status || 'ACTIVE').toUpperCase() !== 'ACTIVE',
    );

    if (!missingCategories.length && !inactiveDefaultCategories.length) {
      return categories;
    }

    for (const category of inactiveDefaultCategories) {
      await this.saveFeeCategory({...category, status: 'ACTIVE'}, access);
    }

    for (const name of missingCategories) {
      try {
        await this.saveFeeCategory({name, status: 'ACTIVE'}, access);
      } catch (error) {
        if (!String(error.message || '').toLowerCase().includes('duplicate')) {
          throw error;
        }
      }
    }

    return this.getFeeCategories();
  },

  async saveFeeCategory(payload, access = {}) {
    if (!canManageFeePlans(access.role)) {
      throw new Error('Fee category access denied.');
    }
    if (!payload.name?.trim()) {
      throw new Error('Category name is required.');
    }
    const mutation = payload.id ? DATA_CONNECT_MUTATIONS.UPDATE_FEE_CATEGORY : DATA_CONNECT_MUTATIONS.CREATE_FEE_CATEGORY;
    const variables = payload.id
      ? {categoryId: payload.id, name: payload.name.trim(), status: payload.status || 'ACTIVE'}
      : {name: payload.name.trim(), status: payload.status || 'ACTIVE'};
    const response = await dataConnectClient.mutate(mutation, variables);
    return {id: response.feeCategory_insert?.id || response.feeCategory_update?.id || payload.id, ...payload};
  },

  async saveFeePlan({studentId, academicYear = currentYear(), items = []}, access = {}) {
    if (!canManageFeePlans(access.role)) {
      throw new Error('Fee plan access denied.');
    }
    if (!studentId) {
      throw new Error('Select a student.');
    }
    const normalizedItems = items
      .filter(item => item.categoryId && Number(item.amount) > 0)
      .map(item => ({...item, amount: Number(item.amount)}));
    if (!normalizedItems.length) {
      throw new Error('Add at least one fee item.');
    }
    const totalAmount = normalizedItems.reduce((sum, item) => sum + item.amount, 0);
    const profile = await this.getStudentFeeProfile(studentId, access);
    assertCoordinatorWingAccess(access, profile);
    const targetBranchId = access.branchId || profile?.branchId;
    if (!targetBranchId) {
      throw new Error('Student branch is required to save a fee plan.');
    }
    const existingPlan = getStudentFeePlans(profile?.rawStudent).find(
      plan => Number(plan.academicYear) === Number(academicYear),
    );
    const newSnapshot = serializeFeePlanSnapshot({studentId, academicYear, totalAmount, items: normalizedItems});
    let feePlanId = existingPlan?.id;
    if (feePlanId) {
      const oldSnapshot = serializeFeePlanSnapshot({
        studentId,
        academicYear: existingPlan.academicYear,
        totalAmount: getPlanTotal(existingPlan),
        items: getPlanItems(existingPlan),
      });
      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_FEE_PLAN, {
        feePlanId,
        studentId,
        totalAmount,
        isActive: true,
        branchId: targetBranchId,
        updatedById: access.userId,
        actorRole: normalizeRole(access.role),
        oldValue: oldSnapshot,
        newValue: newSnapshot,
      });
    } else {
      const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_FEE_PLAN, {
        studentId,
        academicYear: Number(academicYear),
        totalAmount,
        createdById: access.userId,
        branchId: targetBranchId,
        actorRole: normalizeRole(access.role),
        oldValue: null,
        newValue: newSnapshot,
      });
      feePlanId = response.studentFeePlan_insert?.id || response.studentFeePlan_insert;
    }
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CLEAR_FEE_PLAN_ITEMS, {feePlanId, branchId: targetBranchId});
    await Promise.all(
      normalizedItems.map(item =>
        dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_FEE_PLAN_ITEM, {
          feePlanId,
          categoryId: item.categoryId,
          amount: item.amount,
          branchId: targetBranchId,
        }),
      ),
    );
    return {id: feePlanId, studentId, academicYear, totalAmount, items: normalizedItems};
  },

  async generateReceipt({branchCode, year = currentYear()}) {
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_RECEIPT_SEQUENCE, {
      year,
      branchCode: padBranchCode(branchCode),
    });
    const lastSequence = response.receiptSequences?.[0]?.lastSequence || 0;
    const sequence = lastSequence + 1;
    return {
      receiptYear: year,
      branchCode: padBranchCode(branchCode),
      receiptSequence: sequence,
      receiptNumber: formatReceiptNumber({year, branchCode, sequence}),
    };
  },

  async recordPayment(payload, access = {}) {
    if (!canRecordPayments(access.role)) {
      throw new Error('Only accountants or principals can record payments.');
    }
    if (!payload.studentId || !payload.feePlanId) {
      throw new Error('Open a student fee profile before recording payment.');
    }
    if (Number(payload.amount) <= 0) {
      throw new Error('Enter a valid payment amount.');
    }
    const branchCode = payload.branchCode || access.branchCode;
    if (!branchCode) {
      throw new Error('Branch code is required to generate receipt.');
    }
    const receipt = payload.receiptNumber
      ? {
          receiptNumber: payload.receiptNumber,
          receiptYear: currentYear(),
          branchCode: padBranchCode(branchCode),
          receiptSequence: Number(String(payload.receiptNumber).split('-').pop()) || 0,
        }
      : await this.generateReceipt({branchCode, year: Number(String(payload.paymentDate || today()).slice(0, 4))});

    const paymentSnapshot = serializePaymentSnapshot({
      ...payload,
      receiptNumber: receipt.receiptNumber,
      paymentDate: payload.paymentDate || today(),
      paymentMode: payload.paymentMode || payload.mode || 'Cash',
      status: 'RECORDED',
    });
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.RECORD_PAYMENT, {
      studentId: payload.studentId,
      feePlanId: payload.feePlanId,
      amount: Number(payload.amount),
      paymentDate: payload.paymentDate || today(),
      paymentMode: payload.paymentMode || payload.mode || 'Cash',
      referenceNumber: payload.referenceNumber || null,
      receiptNumber: receipt.receiptNumber,
      remarks: payload.remarks || null,
      collectedById: access.userId,
      branchId: payload.branchId || access.branchId,
      receiptYear: receipt.receiptYear,
      branchCode: receipt.branchCode,
      receiptSequence: receipt.receiptSequence,
      actorRole: normalizeRole(access.role),
      oldValue: null,
      newValue: paymentSnapshot,
    });
    return {
      id: response.feePayment_insert?.id || response.feePayment_insert,
      ...payload,
      ...receipt,
      amount: Number(payload.amount),
      date: payload.paymentDate || today(),
      mode: payload.paymentMode || payload.mode || 'Cash',
      status: 'RECORDED',
    };
  },

  async reversePayment(payload, access = {}) {
    const role = normalizeRole(access.role);
    if (![USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(role)) {
      throw new Error('Only principals can reverse payments.');
    }
    const oldValue = serializePaymentSnapshot(payload);
    const newValue = serializePaymentSnapshot({...payload, status: 'REVERSED'});
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.REVERSE_PAYMENT, {
      paymentId: payload.paymentId || payload.id,
      studentId: payload.studentId,
      branchId: payload.branchId || access.branchId,
      reversedById: access.userId,
      reason: payload.reason || null,
      actorRole: role,
      oldValue,
      newValue,
    });
    return response.feePayment_update;
  },

  async uploadOfflinePayment(payload, scope) {
    return this.recordPayment(payload, scope);
  },

  getFeeSummary(records = []) {
    const totalFee = records.reduce((sum, item) => sum + Number(item.totalFee || 0), 0);
    const paidAmount = records.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
    const dueAmount = Math.max(totalFee - paidAmount, 0);

    return {
      totalFee,
      paidAmount,
      dueAmount,
      pendingAmount: dueAmount,
      studentsWithFeePlans: records.filter(item => Boolean(item.feePlanId)).length,
      studentsMissingFeePlans: records.filter(item => !item.feePlanId).length,
      paidStudents: records.filter(item => item.totalFee > 0 && item.dueAmount <= 0).length,
      dueStudents: records.filter(item => item.dueAmount > 0).length,
      collectionRate: totalFee ? paidAmount / totalFee : 0,
    };
  },

  async getFeeReports(access = {}) {
    const records = await this.getFeeRecords(access);
    const payments = canRecordPayments(access.role) ? await this.getPaymentHistory(access) : [];
    return {
      records,
      payments,
      summary: this.getFeeSummary(records),
      classWise: Object.values(
        records.reduce((acc, record) => {
          const key = record.className || 'Unassigned';
          acc[key] = acc[key] || {className: key, totalFee: 0, paidAmount: 0, dueAmount: 0, students: 0};
          acc[key].totalFee += record.totalFee;
          acc[key].paidAmount += record.paidAmount;
          acc[key].dueAmount += record.dueAmount;
          acc[key].students += 1;
          return acc;
        }, {}),
      ),
    };
  },
};

export default feeService;
