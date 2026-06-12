import {FEE_STATUS, USER_ROLES} from '../../config/constants';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import studentService from '../students/studentService';

const normalizeRole = role => String(role || '').toUpperCase();
const currentYear = () => new Date().getFullYear();
const today = () => new Date().toISOString().slice(0, 10);
const toAmount = value => Math.max(Number(value || 0), 0);
const padBranchCode = branchCode => String(branchCode || '').padStart(2, '0').slice(-2);
const formatReceiptNumber = ({year, branchCode, sequence}) =>
  `RCPT-${year}-${padBranchCode(branchCode)}-${String(sequence).padStart(5, '0')}`;

const FEE_CATEGORY_NAMES = {
  TERM1: '1st Term Tuition',
  TERM2: '2nd Term Tuition',
  TERM3: '3rd Term Tuition',
  BOOKS: 'Books Fee',
  TRANSPORT: 'Transport Fee',
};

const DEFAULT_FEE_CATEGORIES = [
  FEE_CATEGORY_NAMES.TERM1,
  FEE_CATEGORY_NAMES.TERM2,
  FEE_CATEGORY_NAMES.TERM3,
  'Tuition Fee',
  FEE_CATEGORY_NAMES.BOOKS,
  FEE_CATEGORY_NAMES.TRANSPORT,
  'Admission Fee',
  'Uniform Fee',
  'Exam Fee',
];

const canManageFeePlans = role =>
  [USER_ROLES.COORDINATOR, USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

const canGrantConcessions = role =>
  [USER_ROLES.COORDINATOR, USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

const canRecordPayments = role =>
  [USER_ROLES.ACCOUNTANT, USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

const canReversePayments = role =>
  [USER_ROLES.ACCOUNTANT, USER_ROLES.PRINCIPAL, USER_ROLES.MAIN_ADMIN].includes(normalizeRole(role));

const canViewReports = role =>
  [
    USER_ROLES.COORDINATOR,
    USER_ROLES.PRINCIPAL,
    USER_ROLES.BRANCH_ADMIN,
    USER_ROLES.MAIN_ADMIN,
    USER_ROLES.ACCOUNTANT,
  ].includes(normalizeRole(role));

const canViewPaymentTimeline = role =>
  [
    USER_ROLES.COORDINATOR,
    USER_ROLES.PRINCIPAL,
    USER_ROLES.BRANCH_ADMIN,
    USER_ROLES.MAIN_ADMIN,
    USER_ROLES.ACCOUNTANT,
    USER_ROLES.PARENT,
  ].includes(normalizeRole(role));

const isCoordinator = role => normalizeRole(role) === USER_ROLES.COORDINATOR;
const isTeacher = role => normalizeRole(role) === USER_ROLES.TEACHER;
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

const categoryName = item => String(item?.categoryName || item?.category?.name || '').trim().toLowerCase();
const categoryAmount = (plan, names = []) => {
  const targets = names.map(name => name.toLowerCase());
  return getPlanItems(plan)
    .filter(item => targets.includes(categoryName(item)))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
};

const calculateConcessionAmount = ({grossAmount, concessionType, concessionValue}) => {
  const type = String(concessionType || '').toUpperCase();
  const value = toAmount(concessionValue);
  if (!value || !grossAmount) {
    return 0;
  }
  if (type === 'PERCENTAGE') {
    return Math.min((grossAmount * value) / 100, grossAmount);
  }
  if (type === 'AMOUNT') {
    return Math.min(value, grossAmount);
  }
  return 0;
};

const calculatePlanAmounts = payload => {
  const term1Fee = toAmount(payload.term1Fee);
  const term2Fee = toAmount(payload.term2Fee);
  const term3Fee = toAmount(payload.term3Fee);
  const booksFee = toAmount(payload.booksFee);
  const transportFee = toAmount(payload.transportFee);
  const itemTotal = (payload.items || []).reduce((sum, item) => sum + toAmount(item.amount), 0);
  const tuitionTotal = term1Fee + term2Fee + term3Fee;
  const grossAmount = payload.grossAmount !== undefined ? toAmount(payload.grossAmount) : tuitionTotal + booksFee + transportFee || itemTotal;
  const concessionType = payload.concessionType || null;
  const concessionValue = toAmount(payload.concessionValue);
  const concessionAmount = calculateConcessionAmount({grossAmount, concessionType, concessionValue});
  const totalAmount = Math.max(grossAmount - concessionAmount, 0);
  return {
    term1Fee,
    term2Fee,
    term3Fee,
    booksFee,
    transportFee,
    concessionType,
    concessionValue,
    concessionAmount,
    grossAmount,
    totalAmount,
  };
};

const getPlanTotal = plan => {
  if (!plan) {
    return 0;
  }
  const calculated = calculatePlanAmounts({
    term1Fee: plan.term1Fee || categoryAmount(plan, [FEE_CATEGORY_NAMES.TERM1]),
    term2Fee: plan.term2Fee || categoryAmount(plan, [FEE_CATEGORY_NAMES.TERM2]),
    term3Fee: plan.term3Fee || categoryAmount(plan, [FEE_CATEGORY_NAMES.TERM3]),
    booksFee: plan.booksFee || categoryAmount(plan, [FEE_CATEGORY_NAMES.BOOKS]),
    transportFee: plan.transportFee || categoryAmount(plan, [FEE_CATEGORY_NAMES.TRANSPORT]),
    concessionType: plan.concessionType,
    concessionValue: plan.concessionValue,
    grossAmount: plan.grossAmount,
    items: getPlanItems(plan),
  });
  return Number(plan.totalAmount || calculated.totalAmount || getPlanItems(plan).reduce((sum, item) => sum + Number(item.amount || 0), 0));
};

const serializeFeePlanSnapshot = ({studentId, academicYear, totalAmount, items = [], amounts = {}}) =>
  JSON.stringify({
    studentId,
    academicYear,
    totalAmount: Number(totalAmount || 0),
    ...amounts,
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

const buildFeeRecord = (student, plan = null, options = {}) => {
  const plans = getStudentFeePlans(student);
  const selectedPlan = plan || plans.find(item => item.isActive !== false) || plans[0];
  const allPayments = getPlanPayments(selectedPlan);
  const activePayments = allPayments.filter(isActivePayment);
  const amounts = calculatePlanAmounts({
    term1Fee: selectedPlan?.term1Fee || categoryAmount(selectedPlan, [FEE_CATEGORY_NAMES.TERM1]),
    term2Fee: selectedPlan?.term2Fee || categoryAmount(selectedPlan, [FEE_CATEGORY_NAMES.TERM2]),
    term3Fee: selectedPlan?.term3Fee || categoryAmount(selectedPlan, [FEE_CATEGORY_NAMES.TERM3]),
    booksFee: selectedPlan?.booksFee || categoryAmount(selectedPlan, [FEE_CATEGORY_NAMES.BOOKS]),
    transportFee: selectedPlan?.transportFee || categoryAmount(selectedPlan, [FEE_CATEGORY_NAMES.TRANSPORT]),
    concessionType: selectedPlan?.concessionType,
    concessionValue: selectedPlan?.concessionValue,
    grossAmount: selectedPlan?.grossAmount,
    items: getPlanItems(selectedPlan),
  });
  const totalFee = getPlanTotal(selectedPlan);
  const paidAmount = activePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const dueAmount = Math.max(totalFee - paidAmount, 0);
  const status =
    !selectedPlan ? FEE_STATUS.DUE : dueAmount <= 0 ? FEE_STATUS.PAID : paidAmount > 0 ? FEE_STATUS.PARTIAL : FEE_STATUS.DUE;
  const payments = options.includePayments === false ? [] : allPayments;

  return {
    id: selectedPlan?.id || student?.id,
    feePlanId: selectedPlan?.id || null,
    classFeeTemplateId: selectedPlan?.classFeeTemplateId,
    studentId: student?.id,
    admissionNumber: student?.studentId,
    studentName: student?.fullName || '',
    className: student?.academicClass?.name || '',
    academicClassId: student?.academicClass?.id || student?.academicClassId,
    wing: getStudentWing(student),
    sectionName: student?.section?.name || '',
    branchId: student?.branchId || student?.branch?.id,
    branchCode: student?.branch?.branchCode,
    branchName: student?.branch?.name,
    parent: student?.parent,
    academicYear: selectedPlan?.academicYear || currentYear(),
    categories: getPlanItems(selectedPlan),
    term1Fee: amounts.term1Fee,
    term2Fee: amounts.term2Fee,
    term3Fee: amounts.term3Fee,
    booksFee: amounts.booksFee,
    transportFee: amounts.transportFee,
    concessionType: amounts.concessionType,
    concessionValue: amounts.concessionValue,
    concessionAmount: Number(selectedPlan?.concessionAmount || amounts.concessionAmount || 0),
    grossAmount: Number(selectedPlan?.grossAmount || amounts.grossAmount || totalFee),
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
    throw new Error('Coordinators can manage fees only for students in their assigned wing.');
  }
};

const filterRecordsByAccess = (records, access = {}) =>
  isCoordinator(access.role)
    ? records.filter(record => record.wing === access.wing)
    : records;

const buildStandardItems = (categories, amounts) => {
  const byName = new Map(categories.map(category => [String(category.name || '').toLowerCase(), category]));
  return [
    {name: FEE_CATEGORY_NAMES.TERM1, amount: amounts.term1Fee},
    {name: FEE_CATEGORY_NAMES.TERM2, amount: amounts.term2Fee},
    {name: FEE_CATEGORY_NAMES.TERM3, amount: amounts.term3Fee},
    {name: FEE_CATEGORY_NAMES.BOOKS, amount: amounts.booksFee},
    {name: FEE_CATEGORY_NAMES.TRANSPORT, amount: amounts.transportFee},
  ]
    .map(item => ({...item, category: byName.get(item.name.toLowerCase())}))
    .filter(item => item.category && Number(item.amount) > 0)
    .map(item => ({categoryId: item.category.id, categoryName: item.name, amount: Number(item.amount)}));
};

export const feeService = {
  canManageFeePlans,
  canGrantConcessions,
  canRecordPayments,
  canReversePayments,
  canViewReports,
  canViewPaymentTimeline,

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
    return filterRecordsByAccess(
      (response.students || []).map(student => buildFeeRecord(student, null, {includePayments: !isTeacher(access.role)})),
      access,
    );
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
    const record = buildFeeRecord(response.student, null, {includePayments: !isTeacher(access.role)});
    assertCoordinatorWingAccess(access, record);
    return record;
  },

  async getClassFees(access = {}, filters = {}) {
    if (!access.branchId && normalizeRole(access.role) !== USER_ROLES.MAIN_ADMIN) {
      return [];
    }
    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CLASS_FEES, {
      branchId: filters.branchId || access.branchId,
      academicYear: filters.academicYear ? Number(filters.academicYear) : null,
      limit: filters.limit || 200,
      offset: filters.offset || 0,
    });
    return (response.academicYearFeeTemplates || []).sort(
      (a, b) => Number(a.academicClass?.sortOrder || 0) - Number(b.academicClass?.sortOrder || 0),
    );
  },

  async saveClassFee(payload, access = {}) {
    if (!canManageFeePlans(access.role)) {
      throw new Error('Class fee management access denied.');
    }
    const branchId = payload.branchId || access.branchId;
    if (!branchId || !payload.academicClassId) {
      throw new Error('Branch and class are required.');
    }
    const term1Fee = toAmount(payload.term1Fee);
    const term2Fee = toAmount(payload.term2Fee);
    const term3Fee = toAmount(payload.term3Fee);
    const totalTuitionFee = term1Fee + term2Fee + term3Fee;
    const variables = {
      branchId,
      academicClassId: payload.academicClassId,
      academicYear: Number(payload.academicYear || currentYear()),
      term1Fee,
      term2Fee,
      term3Fee,
      totalTuitionFee,
      applyToFuture: payload.applyToFuture !== false,
      status: payload.status || 'ACTIVE',
    };
    const response = payload.id
      ? await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_CLASS_FEE, {
          classFeeId: payload.id,
          ...variables,
        })
      : await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_CLASS_FEE, {
          ...variables,
          createdById: access.userId,
        });
    return {
      id: response.academicYearFeeTemplate_insert?.id || response.academicYearFeeTemplate_update?.id || payload.id,
      ...payload,
      ...variables,
    };
  },

  async applyClassFee(classFee, access = {}, applyTo = 'BOTH') {
    if (!canManageFeePlans(access.role)) {
      throw new Error('Class fee application access denied.');
    }
    const shouldApplyExisting = ['EXISTING', 'BOTH'].includes(String(applyTo || '').toUpperCase());
    if (!shouldApplyExisting) {
      return {applied: 0};
    }

    const categories = await this.ensureDefaultFeeCategories(access);
    const students = await studentService.getStudents(
      {branchId: classFee.branchId || access.branchId, limit: 1000, offset: 0},
      access,
    );
    const targetStudents = students.filter(student => (student.academicClassId || student.academicClass?.id) === classFee.academicClassId);
    const amounts = {
      term1Fee: classFee.term1Fee,
      term2Fee: classFee.term2Fee,
      term3Fee: classFee.term3Fee,
      booksFee: 0,
      transportFee: 0,
      concessionType: null,
      concessionValue: 0,
    };
    const items = buildStandardItems(categories, amounts);

    for (const student of targetStudents) {
      await this.saveFeePlan(
        {
          studentId: student.id,
          academicYear: classFee.academicYear,
          classFeeTemplateId: classFee.id,
          ...amounts,
          items,
        },
        access,
      );
    }
    return {applied: targetStudents.length};
  },

  async getPaymentHistory(access = {}) {
    if (access.studentId) {
      const profile = await this.getStudentFeeProfile(access.studentId, access);
      return profile?.payments || [];
    }

    if (!access.branchId || !canViewReports(access.role)) {
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

    const existingNames = new Set(categories.map(category => String(category.name || '').trim().toLowerCase()));
    const defaultNames = new Set(DEFAULT_FEE_CATEGORIES.map(name => name.toLowerCase()));
    const missingCategories = DEFAULT_FEE_CATEGORIES.filter(name => !existingNames.has(name.toLowerCase()));
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

  async saveFeePlan({studentId, academicYear = currentYear(), items = [], ...feePayload}, access = {}) {
    if (!canManageFeePlans(access.role)) {
      throw new Error('Fee plan access denied.');
    }
    if (!studentId) {
      throw new Error('Select a student.');
    }
    if ((feePayload.concessionType || feePayload.concessionValue) && !canGrantConcessions(access.role)) {
      throw new Error('Concession access denied.');
    }
    const amounts = calculatePlanAmounts({...feePayload, items});
    const normalizedItems = items
      .filter(item => item.categoryId && Number(item.amount) > 0)
      .map(item => ({...item, amount: Number(item.amount)}));
    if (!normalizedItems.length && amounts.totalAmount <= 0) {
      throw new Error('Add at least one fee item or amount.');
    }
    const profile = await this.getStudentFeeProfile(studentId, access);
    assertCoordinatorWingAccess(access, profile);
    const targetBranchId = access.branchId || profile?.branchId;
    if (!targetBranchId) {
      throw new Error('Student branch is required to save a fee plan.');
    }
    const existingPlan = getStudentFeePlans(profile?.rawStudent).find(plan => Number(plan.academicYear) === Number(academicYear));
    const newSnapshot = serializeFeePlanSnapshot({studentId, academicYear, totalAmount: amounts.totalAmount, items: normalizedItems, amounts});
    let feePlanId = existingPlan?.id;
    const mutationVariables = {
      studentId,
      academicYear: Number(academicYear),
      classFeeTemplateId: feePayload.classFeeTemplateId || null,
      ...amounts,
      totalAmount: amounts.totalAmount,
      branchId: targetBranchId,
      actorRole: normalizeRole(access.role),
      oldValue: null,
      newValue: newSnapshot,
    };
    if (feePlanId) {
      const oldAmounts = calculatePlanAmounts({
        term1Fee: existingPlan.term1Fee,
        term2Fee: existingPlan.term2Fee,
        term3Fee: existingPlan.term3Fee,
        booksFee: existingPlan.booksFee,
        transportFee: existingPlan.transportFee,
        concessionType: existingPlan.concessionType,
        concessionValue: existingPlan.concessionValue,
        grossAmount: existingPlan.grossAmount,
        items: getPlanItems(existingPlan),
      });
      const oldSnapshot = serializeFeePlanSnapshot({
        studentId,
        academicYear: existingPlan.academicYear,
        totalAmount: getPlanTotal(existingPlan),
        items: getPlanItems(existingPlan),
        amounts: oldAmounts,
      });
      await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_FEE_PLAN, {
        feePlanId,
        ...mutationVariables,
        isActive: true,
        updatedById: access.userId,
        oldValue: oldSnapshot,
      });
    } else {
      const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_FEE_PLAN, {
        ...mutationVariables,
        createdById: access.userId,
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
    return {id: feePlanId, studentId, academicYear, ...amounts, items: normalizedItems};
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

  async updatePayment(payload, access = {}) {
    if (!canRecordPayments(access.role)) {
      throw new Error('Only accountants or principals can edit payments.');
    }
    const paymentDate = payload.paymentDate || today();
    if (paymentDate !== today()) {
      throw new Error('Only same-day payments can be edited.');
    }
    const oldValue = serializePaymentSnapshot(payload.original || payload);
    const newValue = serializePaymentSnapshot({...payload, status: 'RECORDED'});
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_PAYMENT, {
      paymentId: payload.paymentId || payload.id,
      studentId: payload.studentId,
      branchId: payload.branchId || access.branchId,
      amount: Number(payload.amount),
      paymentDate,
      paymentMode: payload.paymentMode || payload.mode || 'Cash',
      referenceNumber: payload.referenceNumber || null,
      remarks: payload.remarks || null,
      updatedById: access.userId,
      actorRole: normalizeRole(access.role),
      oldValue,
      newValue,
    });
    return response.feePayment_update;
  },

  async reversePayment(payload, access = {}) {
    if (!canReversePayments(access.role)) {
      throw new Error('Payment reversal access denied.');
    }
    const oldValue = serializePaymentSnapshot(payload);
    const newValue = serializePaymentSnapshot({...payload, status: 'REVERSED'});
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.REVERSE_PAYMENT, {
      paymentId: payload.paymentId || payload.id,
      studentId: payload.studentId,
      branchId: payload.branchId || access.branchId,
      reversedById: access.userId,
      reason: payload.reason || null,
      actorRole: normalizeRole(access.role),
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
    const grossAmount = records.reduce((sum, item) => sum + Number(item.grossAmount || item.totalFee || 0), 0);
    const paidAmount = records.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
    const concessionAmount = records.reduce((sum, item) => sum + Number(item.concessionAmount || 0), 0);
    const dueAmount = Math.max(totalFee - paidAmount, 0);

    return {
      totalFee,
      grossAmount,
      paidAmount,
      dueAmount,
      concessionAmount,
      pendingAmount: dueAmount,
      studentsWithFeePlans: records.filter(item => Boolean(item.feePlanId)).length,
      studentsMissingFeePlans: records.filter(item => !item.feePlanId).length,
      paidStudents: records.filter(item => item.totalFee > 0 && item.dueAmount <= 0).length,
      partialStudents: records.filter(item => item.paidAmount > 0 && item.dueAmount > 0).length,
      dueStudents: records.filter(item => item.dueAmount > 0).length,
      concessionStudents: records.filter(item => Number(item.concessionAmount || 0) > 0).length,
      transportStudents: records.filter(item => Number(item.transportFee || 0) > 0).length,
      booksStudents: records.filter(item => Number(item.booksFee || 0) > 0).length,
      collectionRate: totalFee ? paidAmount / totalFee : 0,
    };
  },

  async getFeeReports(access = {}) {
    const records = await this.getFeeRecords(access);
    const payments = canViewReports(access.role) ? await this.getPaymentHistory(access) : [];
    return {
      records,
      payments,
      summary: this.getFeeSummary(records),
      classWise: Object.values(
        records.reduce((acc, record) => {
          const key = record.className || 'Unassigned';
          acc[key] = acc[key] || {className: key, totalFee: 0, paidAmount: 0, dueAmount: 0, concessionAmount: 0, students: 0};
          acc[key].totalFee += record.totalFee;
          acc[key].paidAmount += record.paidAmount;
          acc[key].dueAmount += record.dueAmount;
          acc[key].concessionAmount += record.concessionAmount;
          acc[key].students += 1;
          return acc;
        }, {}),
      ),
    };
  },
};

export default feeService;
