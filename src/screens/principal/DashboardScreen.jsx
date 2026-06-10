import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {RoleDashboard} from '../../components';
import {USER_ROLES} from '../../config/constants';
import {colors} from '../../theme';
import principalDashboardService from '../../services/principal/principalDashboardService';
import {getAccessScope} from '../../services/rbacScope';
import feeService from '../../services/fees/feeService';
import {formatCurrency} from '../../utils/formatters/currency';

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const {data} = useQuery({
    queryKey: ['principalDashboard', user?.branchId],
    queryFn: () => principalDashboardService.getDashboard(user.branchId, scope),
    enabled: Boolean(user?.branchId),
  });
  const {data: feeData} = useQuery({
    queryKey: ['principalFeeSummary', user?.branchId],
    queryFn: () => feeService.getFeeReports(scope),
    enabled: Boolean(user?.branchId),
  });
  const feeSummary = feeData?.summary || {};
  const feeRecordCount = feeData?.records?.length || 0;

  return (
    <RoleDashboard
      role={USER_ROLES.PRINCIPAL}
      navigation={navigation}
      subtitle="Academic structure, coordinators, sections, promotions, and fees"
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
          icon: 'account-tie-outline',
          route: 'TeacherManagement',
        },
        {
          title: 'Subjects',
          value: 'Master',
          icon: 'book-open-page-variant-outline',
          route: 'SubjectManagement',
          tone: colors.secondary,
        },
        {
          title: 'Coordinators',
          value: 'Wings',
          icon: 'account-tie',
          route: 'CoordinatorManagement',
        },
        {
          title: 'Classes',
          value: 'Master',
          icon: 'school',
          route: 'ClassManagement',
        },
        {
          title: 'Sections',
          value: 'Yearly',
          icon: 'google-classroom',
          route: 'SectionManagement',
        },
        {
          title: 'Class Teacher',
          value: 'Assign',
          icon: 'teach',
          route: 'AssignClassTeacher',
        },
        {
          title: 'Promotions',
          value: 'Approve',
          icon: 'school-outline',
          route: 'PromotionManagement',
          tone: colors.warning,
        },
        {
          title: 'Attendance',
          value: 'All',
          icon: 'clipboard-text-clock',
          route: 'ViewAllAttendance',
        },
        {
          title: 'Fees',
          value: 'Branch',
          icon: 'finance',
          route: 'FeeDashboard',
          tone: colors.accent,
        },
        {
          title: 'Accountants',
          value: 'Manage',
          icon: 'cash-register',
          route: 'AccountantManagement',
          tone: colors.info,
        },
      ]}
      stats={[
        {
          title: 'Students',
          value: String(data?.totalStudents || 0),
          icon: 'account-school',
          tone: colors.primary,
        },
        {
          title: 'Teachers',
          value: String(data?.totalTeachers || 0),
          icon: 'account-tie',
          tone: colors.secondary,
        },
        {
          title: 'Coordinators',
          value: String(data?.totalCoordinators || 0),
          icon: 'account-supervisor',
          tone: colors.accent,
        },
        {
          title: 'Sections',
          value: String(data?.totalSections || 0),
          icon: 'view-grid-outline',
          tone: colors.success,
        },
        {
          title: 'Promotions',
          value: String(data?.pendingPromotions || 0),
          icon: 'alert-circle-outline',
          tone: colors.warning,
        },
        {
          title: 'Fee Assigned',
          value: formatCurrency(feeSummary.totalFee),
          icon: 'cash-multiple',
          tone: colors.primary,
        },
        {
          title: 'Fee Collected',
          value: formatCurrency(feeSummary.paidAmount),
          icon: 'cash-check',
          tone: colors.success,
        },
        {
          title: 'Pending Fee',
          value: formatCurrency(feeSummary.dueAmount),
          icon: 'cash-clock',
          tone: colors.danger,
        },
        {
          title: 'Collection Trend',
          value: `${Math.round((feeSummary.collectionRate || 0) * 100)}%`,
          icon: 'chart-line',
          tone: colors.accent,
        },
        {
          title: 'Branch Fee Summary',
          value: `${feeSummary.studentsWithFeePlans || 0}/${feeRecordCount}`,
          icon: 'office-building-outline',
          tone: colors.info,
        },
      ]}
    />
  );
};

export default DashboardScreen;
