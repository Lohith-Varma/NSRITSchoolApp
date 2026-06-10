import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {USER_ROLES} from '../../config/constants';
import {normalizePhoneNumber} from '../../utils/phone';
import {summarizeAttendance} from '../attendance/attendanceService';

const buildPendingFirebaseUID = ({branchId, phoneNumber}) =>
  `pending:parent:${branchId}:${normalizePhoneNumber(phoneNumber)}`;

const normalizeRole = role => String(role || '').toUpperCase();
const getFeePlans = student => student?.feePlans || student?.parentFeePlans || [];
const getFeeItems = plan => plan?.items || plan?.parentFeeItems || [];
const getFeePayments = plan => plan?.payments || plan?.parentFeePayments || [];

export const parentService = {
  async getParentChildren(parentId) {
    if (!parentId) {
      return [];
    }

    try {
      const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PARENT_CHILDREN, {
        parentId,
      });
      return (response.students || []).map(student => {
        const attendance = student.attendance || [];
        const feePlans = getFeePlans(student);
        const activePlan = feePlans.find(plan => plan.isActive !== false) || feePlans[0];
        const planItems = getFeeItems(activePlan);
        const planPayments = getFeePayments(activePlan);
        const paid = planPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const total = Number(
          activePlan?.totalAmount ||
            planItems.reduce((sum, item) => sum + Number(item.amount || 0), 0) ||
            0,
        );
        const legacyFees = student.fees || [];
        const legacyFeeSummary = legacyFees.reduce(
          (summary, fee) => ({
            total: summary.total + Number(fee.totalFee || 0),
            paid: summary.paid + Number(fee.paidAmount || 0),
            due: summary.due + Number(fee.remainingAmount || 0),
          }),
          {total: 0, paid: 0, due: 0},
        );
        const feeSummary = activePlan
          ? {total, paid, due: Math.max(total - paid, 0)}
          : legacyFeeSummary;
        return {
          ...student,
          attendanceSummary: summarizeAttendance(attendance),
          feeSummary,
          feePlan: activePlan ? {...activePlan, items: planItems, payments: planPayments} : null,
          payments: planPayments,
          recentAttendance: student.recentAttendance || [],
        };
      });
    } catch (error) {
      console.log('[ParentPortal] Failed to load linked children:', {parentId, error});
      throw error;
    }
  },

  async getParentDashboard(parentId) {
    const children = await this.getParentChildren(parentId);
    const selectedChild = children[0] || null;
    const totalDue = children.reduce((sum, child) => sum + Number(child.feeSummary?.due || 0), 0);
    return {
      children,
      selectedChild,
      totalDue,
      childCount: children.length,
    };
  },

  async createParent(payload) {
    if (!payload.branchId || !payload.phoneNumber) {
      throw new Error('Parent branch and phone number are required.');
    }

    const existingParent = await this.getParentByPhone({
      branchId: payload.branchId,
      phoneNumber: payload.phoneNumber,
    });
    if (existingParent) {
      console.log('[StudentCreate] Existing parent linked:', {
        parentId: existingParent.id,
        phoneNumber: payload.phoneNumber,
      });
      return existingParent;
    }

    const existingUserResponse = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_USER_BY_PHONE, {
      phoneNumber: payload.phoneNumber,
    });
    const existingUser = existingUserResponse.users?.[0];

    if (existingUser && normalizeRole(existingUser.role) !== USER_ROLES.PARENT) {
      throw new Error('Parent mobile number is already registered to another role.');
    }

    if (existingUser?.branchId && existingUser.branchId !== payload.branchId) {
      throw new Error('Parent mobile number is already registered in another branch.');
    }

    const mutationPayload = {
      branchId: payload.branchId,
      fullName: payload.fullName,
      fatherName: payload.fatherName || null,
      motherName: payload.motherName || null,
      countryCode: payload.countryCode || '+91',
      phoneNumber: payload.phoneNumber,
      address: payload.address || null,
    };

    const response = existingUser
      ? await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_PARENT, {
          ...mutationPayload,
          userId: existingUser.id,
        })
      : await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_PARENT_WITHOUT_USER, {
          ...mutationPayload,
          firebaseUID:
            payload.firebaseUID ||
            buildPendingFirebaseUID({
              branchId: payload.branchId,
              phoneNumber: payload.phoneNumber,
            }),
        });

    const parentId = response.parent_insert?.id || response.parent_insert;
    console.log('[StudentCreate] Parent created:', {
      parentId,
      userId: response.user_insert?.id || existingUser?.id || null,
      phoneNumber: payload.phoneNumber,
    });

    return {
      id: parentId,
      userId: response.user_insert?.id || existingUser?.id || payload.userId || null,
      ...mutationPayload,
      isActive: true,
    };
  },

  async getParentByUser(userId) {
    if (!userId) {
      return null;
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PARENT_BY_USER, {
      userId,
    });
    return response.parents?.[0] || null;
  },

  async getParentByPhone({branchId, phoneNumber}) {
    if (!branchId || !phoneNumber) {
      return null;
    }

    const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_PARENT_BY_PHONE, {
      branchId,
      phoneNumber,
    });
    return response.parents?.[0] || null;
  },
};

export default parentService;
