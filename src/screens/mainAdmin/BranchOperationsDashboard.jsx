import React, {useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {Button, Card, Text} from 'react-native-paper';
import {
  DashboardCard,
  EmptyState,
  Header,
  LoadingScreen,
  ScreenContainer,
  StatusBadge,
} from '../../components';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {
  buildMainAdminBranchContext,
  clearMainAdminBranchContext as clearStoredBranchContext,
  saveMainAdminBranchContext,
} from '../../services/mainAdmin/mainAdminContextService';
import {
  clearMainAdminBranchContext,
  enterMainAdminBranchContext,
} from '../../store/slices/authSlice';
import {colors, radius, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const modules = [
  {title: 'Overview', value: 'Branch', icon: 'view-dashboard-outline', route: 'BranchDetails'},
  {title: 'Students', value: 'Manage', icon: 'account-school-outline', route: 'StudentManagement'},
  {title: 'Teachers', value: 'Manage', icon: 'account-tie-outline', route: 'TeacherManagement'},
  {title: 'Class Teachers', value: 'Assign', icon: 'account-switch-outline', route: 'AssignClassTeacher'},
  {title: 'Coordinators', value: 'Manage', icon: 'account-supervisor-outline', route: 'CoordinatorManagement'},
  {title: 'Accountants', value: 'Manage', icon: 'account-cash-outline', route: 'AccountantManagement'},
  {title: 'Attendance', value: 'View/Edit', icon: 'calendar-check-outline', route: 'ViewAllAttendance'},
  {title: 'Fees', value: 'Collect', icon: 'cash-register', route: 'FeeDashboard'},
  {title: 'Sections', value: 'Manage', icon: 'select-group', route: 'SectionManagement'},
  {title: 'Classes', value: 'Activate', icon: 'google-classroom', route: 'ClassManagement'},
  {title: 'Reports', value: 'Global', icon: 'chart-box-outline', route: 'GlobalReports'},
  {title: 'Branch Settings', value: 'Configure', icon: 'cog-outline', route: 'BranchSettings'},
  {title: 'Parent Data', value: 'Search', icon: 'account-child-outline', route: 'GlobalStudents'},
];

const BranchOperationsDashboard = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {branchId} = route.params || {};
  const detailsQuery = useQuery({
    queryKey: ['mainAdminBranchOperations', branchId],
    queryFn: () => mainAdminService.getBranchDetails(branchId, {forceRefresh: true}),
    enabled: Boolean(branchId),
  });

  useEffect(() => {
    if (detailsQuery.data?.branch) {
      const context = buildMainAdminBranchContext(detailsQuery.data.branch);
      saveMainAdminBranchContext(context);
      dispatch(enterMainAdminBranchContext(context));
    }
  }, [detailsQuery.data?.branch, dispatch]);

  const leaveContext = () => {
    clearStoredBranchContext();
    dispatch(clearMainAdminBranchContext());
    navigation.navigate('BranchContext');
  };

  if (detailsQuery.isLoading && !detailsQuery.data) {
    return <LoadingScreen message="Loading branch operations" />;
  }

  if (!detailsQuery.data?.branch) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Branch unavailable"
          message={detailsQuery.error?.message || 'Select a branch to enter operations.'}
        />
      </ScreenContainer>
    );
  }

  const {branch, summary} = detailsQuery.data;

  return (
    <ScreenContainer>
      <Header
        title={branch.name}
        subtitle={`Main Admin operating in Branch ${branch.branchCode}`}
      />

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Branch Context Active</Text>
              <Text style={styles.subtitle}>
                Performed By: Main Admin | Acting As: selected module role
              </Text>
            </View>
            <StatusBadge status="info" label={branch.branchCode} />
          </View>
          <View style={styles.metrics}>
            <Metric label="Students" value={summary.totalStudents} />
            <Metric label="Teachers" value={summary.totalTeachers} />
            <Metric label="Attendance" value={`${summary.attendancePercent}%`} />
            <Metric label="Pending Fees" value={formatCurrency(summary.pendingFees)} />
          </View>
          <Button icon="logout" mode="outlined" onPress={leaveContext} style={styles.leaveButton}>
            Leave Context
          </Button>
        </Card.Content>
      </Card>

      <FlatList
        data={modules}
        keyExtractor={item => item.title}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({item}) => (
          <View style={styles.module}>
            <DashboardCard
              title={item.title}
              value={item.value}
              icon={item.icon}
              onPress={() => navigation.navigate(item.route, {branchId: branch.id})}
            />
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const Metric = ({label, value}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value ?? 0}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metric: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flexBasis: '48%',
    flexGrow: 1,
    padding: spacing.sm,
  },
  metricValue: {
    ...typography.subtitle,
    color: colors.primary,
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: 2,
  },
  leaveButton: {
    marginTop: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  module: {
    flex: 1,
  },
});

export default BranchOperationsDashboard;
