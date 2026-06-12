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
    queryKey: ['coordinatorFeeDashboard', access.branchId, access.wing],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });
  const summary = data?.summary || {};

  return (
    <RoleDashboard
      role={USER_ROLES.COORDINATOR}
      navigation={navigation}
      subtitle="Wing attendance, teacher assignments, corrections, and fee plans"
      primaryActions={[
        {
          title: 'Students',
          value: 'Manage',
          icon: 'account-school-outline',
          route: 'StudentManagement',
        },
        {
          title: 'Teachers',
          value: 'Manage',
          icon: 'account-switch-outline',
          route: 'TeacherManagement',
        },
        {
          title: 'Class Teacher',
          value: 'Assign',
          icon: 'teach',
          route: 'AssignClassTeacher',
        },
        {
          title: 'Wing',
          value: 'View',
          icon: 'view-grid-outline',
          route: 'WingAttendance',
        },
        {
          title: 'Correct',
          value: 'Edit',
          icon: 'playlist-edit',
          route: 'EditAttendance',
        },
        {
          title: 'Fees',
          value: 'Plans',
          icon: 'cash-clock',
          route: 'FeeDashboard',
          tone: colors.accent,
        },
      ]}
      stats={[
        {
          title: 'With Fee Plans',
          value: String(summary.studentsWithFeePlans || 0),
          icon: 'account-check-outline',
          tone: colors.success,
        },
        {
          title: 'Missing Plans',
          value: String(summary.studentsMissingFeePlans || 0),
          icon: 'account-alert-outline',
          tone: colors.warning,
        },
        {
          title: 'Fee Assigned',
          value: formatCurrency(summary.totalFee),
          icon: 'cash-multiple',
          tone: colors.primary,
        },
        {
          title: 'Outstanding',
          value: formatCurrency(summary.dueAmount),
          icon: 'cash-clock',
          tone: colors.danger,
        },
        {
          title: 'Students With Dues',
          value: String(summary.dueStudents || 0),
          icon: 'account-alert-outline',
          tone: colors.danger,
        },
        {
          title: 'Concessions',
          value: String(summary.concessionStudents || 0),
          icon: 'sale-outline',
          tone: colors.info,
        },
        {
          title: 'Collection Status',
          value: `${Math.round((summary.collectionRate || 0) * 100)}%`,
          icon: 'chart-line',
          tone: colors.accent,
        },
      ]}
    />
  );
};

export default DashboardScreen;
