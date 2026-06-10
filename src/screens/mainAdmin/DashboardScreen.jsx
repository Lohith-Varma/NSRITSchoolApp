import React from 'react';
import {RoleDashboard} from '../../components';
import {USER_ROLES} from '../../config/constants';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const DashboardScreen = ({navigation}) => {
  const {data: stats} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

  return (
    <RoleDashboard
      role={USER_ROLES.MAIN_ADMIN}
      navigation={navigation}
      subtitle="Global branches, users, fees, and operations"
      primaryActions={[
        {
          title: 'Branch Context',
          value: 'Enter',
          icon: 'office-building-cog',
          route: 'BranchContext',
        },
        {
          title: 'Classes',
          value: 'All',
          icon: 'google-classroom',
          route: 'GlobalClasses',
          tone: colors.info,
        },
        {
          title: 'Students',
          value: 'Track',
          icon: 'account-school',
          route: 'GlobalStudents',
          tone: colors.success,
        },
        {
          title: 'Reports',
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
          title: 'Total Branches',
          value: String(stats?.totalBranches || 0),
          icon: 'domain',
          tone: colors.secondary,
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
