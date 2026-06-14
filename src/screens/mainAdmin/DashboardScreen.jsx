import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RoleDashboard} from '../../components';
import {USER_ROLES} from '../../config/constants';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const {data: stats} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

  useEffect(() => {
    console.log('[MainAdminDashboard] Navigation access:', {
      role: user?.role,
      canCreateBranch: String(user?.role || '').toUpperCase() === USER_ROLES.MAIN_ADMIN,
      routes: ['CreateBranch', 'BranchList', 'BranchDetails', 'BranchContext'],
    });
  }, [user?.role]);

  return (
    <RoleDashboard
      role={USER_ROLES.MAIN_ADMIN}
      navigation={navigation}
      subtitle="Global branches, users, fees, and operations"
      primaryActions={[
        {
          title: 'Manage Branches',
          value: 'All',
          icon: 'domain',
          route: 'BranchList',
          tone: colors.secondary,
        },
        {
          title: 'Branch Context',
          value: 'Enter',
          icon: 'office-building-cog',
          route: 'BranchContext',
        },
        {
          title: 'Manage Users',
          value: 'Access',
          icon: 'account-cog-outline',
          route: 'ManageUsers',
          tone: colors.primary,
        },
        {
          title: 'Create Branch',
          value: 'New',
          icon: 'office-building-plus',
          route: 'CreateBranch',
          tone: colors.success,
        },
        {
          title: 'Students',
          value: 'Track',
          icon: 'account-school',
          route: 'GlobalStudents',
          tone: colors.success,
        },
        {
          title: 'Classes',
          value: 'All',
          icon: 'google-classroom',
          route: 'GlobalClasses',
          tone: colors.info,
        },
        {
          title: 'Class Fees',
          value: 'Setup',
          icon: 'cash-multiple',
          route: 'ClassFeeManagement',
          tone: colors.info,
        },
        {
          title: 'View Branch Reports',
          value: 'View',
          icon: 'chart-box-outline',
          route: 'GlobalReports',
          tone: colors.accent,
        },
        {
          title: 'Audit Logs',
          value: 'Trace',
          icon: 'clipboard-text-clock-outline',
          route: 'AuditLogs',
          tone: colors.warning,
        },
      ]}
      stats={[
        {
          title: 'Branches',
          value: String(stats?.totalBranches || 0),
          icon: 'domain',
          tone: colors.secondary,
        },
        {
          title: 'Active Branches',
          value: String(stats?.activeBranches || 0),
          icon: 'office-building-marker',
          tone: colors.success,
        },
        {
          title: 'Inactive Branches',
          value: String(stats?.inactiveBranches || 0),
          icon: 'office-building-remove',
          tone: colors.warning,
        },
        {
          title: 'Total Classes',
          value: String(stats?.totalClasses || 0),
          icon: 'google-classroom',
          tone: colors.info,
        },
        {
          title: 'Total Teachers',
          value: String(stats?.totalTeachers || 0),
          icon: 'account-tie',
          tone: colors.purple,
        },
        {
          title: 'Total Students',
          value: String(stats?.totalStudents || 0),
          icon: 'account-school',
          tone: colors.success,
        },
        {
          title: "Today's Attendance",
          value: `${stats?.todayAttendance || 0}%`,
          icon: 'calendar-check',
          tone: colors.primary,
        },
        {
          title: 'Branch Collections',
          value: formatCurrency(stats?.branchWiseCollection || 0),
          icon: 'cash-check',
          tone: colors.success,
        },
        {
          title: 'Branch Dues',
          value: formatCurrency(stats?.branchWiseDues || 0),
          icon: 'cash-clock',
          tone: colors.danger,
        },
        {
          title: 'Branch Concessions',
          value: formatCurrency(stats?.branchWiseConcessions || 0),
          icon: 'sale-outline',
          tone: colors.info,
        },
        {
          title: 'Pending Fees',
          value: formatCurrency(stats?.pendingFees || 0),
          icon: 'cash-clock',
          tone: colors.danger,
        },
      ]}
    />
  );
};

export default DashboardScreen;
