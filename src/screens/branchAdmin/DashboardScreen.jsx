import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {RoleDashboard} from '../../components';
import {USER_ROLES} from '../../config/constants';
import {colors} from '../../theme';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';

const DashboardScreen = ({navigation}) => {
  const access = useFeeAccess();
  const {data} = useQuery({
    queryKey: ['branchAdminFeeDashboard', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });
  const summary = data?.summary || {};

  return (
    <RoleDashboard
      role={USER_ROLES.BRANCH_ADMIN}
      navigation={navigation}
      subtitle="Branch users, students, attendance, and fee visibility"
      primaryActions={[
      {
        title: 'Teachers',
        value: 'Team',
        icon: 'account-tie',
        route: 'ManageTeachers',
      },
      {
        title: 'Students',
        value: 'Roster',
        icon: 'account-school',
        route: 'ManageStudents',
      },
      {
        title: 'Attendance',
        value: 'View',
        icon: 'calendar-check',
        route: 'AttendanceOverview',
      },
      {
        title: 'Fees',
        value: 'Branch',
        icon: 'cash-multiple',
        route: 'FeeDashboard',
        tone: colors.accent,
      },
    ]}
      stats={[
      {
        title: 'Fee Assigned',
        value: formatCurrency(summary.totalFee),
        icon: 'cash-multiple',
        tone: colors.primary,
      },
      {
        title: 'Collected',
        value: formatCurrency(summary.paidAmount),
        icon: 'cash-check',
        tone: colors.success,
      },
      {
        title: 'Outstanding',
        value: formatCurrency(summary.dueAmount),
        icon: 'cash-clock',
        tone: colors.danger,
      },
      {
        title: 'Concessions',
        value: formatCurrency(summary.concessionAmount),
        icon: 'sale-outline',
        tone: colors.info,
      },
    ]}
    />
  );
};

export default DashboardScreen;
