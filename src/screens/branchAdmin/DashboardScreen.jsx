import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View, ScrollView, Pressable} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Text, Card, ProgressBar} from 'react-native-paper';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ERPLayout, LoadingScreen} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const DashboardScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const branchId = user?.branchId || 'demo-branch';

  const {data: branchData, loading, refresh} = useAsyncResource(
    options => mainAdminService.getBranchDetails(branchId, options),
    [branchId],
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const newAdmissions = useMemo(() => {
    if (!branchData?.students) return 0;
    return branchData.students.filter(s => s.admissionYear === 2026 && s.isActive !== false).length;
  }, [branchData]);

  const activities = useMemo(() => {
    const list = [];
    const students = branchData?.students || [];
    
    if (students.length > 0) {
      const latestStudent = students[students.length - 1];
      list.push({
        id: `stu-${latestStudent.id}`,
        title: `New Admission: ${latestStudent.fullName}`,
        time: 'Class Allocation Complete',
        icon: 'school',
        tone: colors.success,
      });
    }

    const payments = branchData?.studentFees || [];
    const recentPayment = payments.find(p => p.paidAmount > 0);
    if (recentPayment) {
      list.push({
        id: `pay-${recentPayment.id}`,
        title: `Fee collected: ${formatCurrency(recentPayment.paidAmount)}`,
        time: 'Payment Reference Updated',
        icon: 'cash-multiple',
        tone: colors.primary,
      });
    }

    list.push({
      id: 'branch-ok',
      title: 'Branch operations normal',
      time: 'System check passed',
      icon: 'check-circle-outline',
      tone: colors.info,
    });

    return list.slice(0, 4);
  }, [branchData]);

  if (loading && !branchData) {
    return <LoadingScreen message="Loading Branch Dashboard..." />;
  }

  const kpis = [
    {
      title: 'Total Students',
      value: String(branchData?.summary?.totalStudents || 0),
      icon: 'school',
      tone: colors.primary,
    },
    {
      title: 'Total Staff',
      value: String(branchData?.summary?.totalTeachers || 0),
      icon: 'account-tie',
      tone: colors.secondary,
    },
    {
      title: "Today's Attendance",
      value: `${branchData?.summary?.attendancePercent || 0}%`,
      icon: 'calendar-check',
      tone: colors.success,
    },
    {
      title: 'New Admissions',
      value: String(newAdmissions),
      icon: 'account-plus',
      tone: colors.purple,
    },
  ];

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Dashboard"
      title="Branch Console"
      breadcrumbs={['Dashboard', 'Branch Console']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>
            {branchData?.branch?.name || 'Branch Administration'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Branch Code: {branchData?.branch?.branchCode || 'N/A'} • Campus Performance Overview
          </Text>
        </View>

        {/* Section 1: KPIs Overview */}
        <Text style={styles.sectionHeader}>Overview</Text>
        <View style={styles.kpiGrid}>
          {kpis.map(kpi => (
            <Card key={kpi.title} mode="outlined" style={styles.kpiCard}>
              <Card.Content style={styles.kpiContent}>
                <View style={[styles.kpiIconWrapper, {backgroundColor: `${kpi.tone}12`}]}>
                  <MaterialCommunityIcons name={kpi.icon} size={28} color={kpi.tone} />
                </View>
                <View style={styles.kpiMeta}>
                  <Text numberOfLines={1} style={styles.kpiValue}>{kpi.value}</Text>
                  <Text numberOfLines={1} style={styles.kpiTitle}>{kpi.title}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Section 2: Fee & Revenue Analytics */}
        <Text style={styles.sectionHeader}>Fee Collection Summary</Text>
        <Card mode="outlined" style={styles.financeCard}>
          <View style={styles.financeRow}>
            <View style={styles.financeCol}>
              <Text style={styles.financeLabel}>Total Collections</Text>
              <Text style={styles.financeVal}>
                {formatCurrency(branchData?.summary?.paidFees || 0)}
              </Text>
            </View>
            <View style={styles.financeCol}>
              <Text style={styles.financeLabel}>Outstanding Balance</Text>
              <Text style={[styles.financeVal, {color: colors.danger}]}>
                {formatCurrency(branchData?.summary?.pendingFees || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.progressWrapper}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.financeLabel}>Collection Rate</Text>
              <Text style={styles.financeVal}>
                {branchData?.summary?.feeCollectionPercent || 0}%
              </Text>
            </View>
            <ProgressBar
              progress={(branchData?.summary?.feeCollectionPercent || 0) / 100}
              color={colors.success}
              style={styles.progressBar}
            />
          </View>
        </Card>

        {/* Section 3: Recent Activities */}
        <Text style={styles.sectionHeader}>Recent Activities</Text>
        <Card mode="outlined" style={styles.panelCard}>
          <Card.Content style={styles.activityList}>
            {activities.map((item, idx) => (
              <View key={item.id} style={[styles.activityItem, idx === activities.length - 1 && styles.lastActivityItem]}>
                <View style={styles.timelineLineContainer}>
                  <View style={[styles.activityIconCircle, {backgroundColor: `${item.tone}12`}]}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.tone} />
                  </View>
                  {idx !== activities.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.activityTextWrapper}>
                  <Text style={styles.activityTextTitle}>{item.title}</Text>
                  <Text style={styles.activityTextTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Section 4: Quick Actions */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('ManageStudents')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.primary}12`}]}>
              <MaterialCommunityIcons name="school" size={28} color={colors.primary} />
            </View>
            <Text style={styles.quickTitle}>Manage Students</Text>
            <Text style={styles.quickSubtitle}>View and add branch students</Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('ManageTeachers')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.secondary}12`}]}>
              <MaterialCommunityIcons name="account-tie" size={28} color={colors.secondary} />
            </View>
            <Text style={styles.quickTitle}>Manage Staff</Text>
            <Text style={styles.quickSubtitle}>Manage teachers & operations</Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('AttendanceOverview')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.success}12`}]}>
              <MaterialCommunityIcons name="calendar-check" size={28} color={colors.success} />
            </View>
            <Text style={styles.quickTitle}>Attendance</Text>
            <Text style={styles.quickSubtitle}>Review today's registers</Text>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => navigation.navigate('FeeDashboard')}>
            <View style={[styles.quickIconCircle, {backgroundColor: `${colors.purple}12`}]}>
              <MaterialCommunityIcons name="cash-multiple" size={28} color={colors.purple} />
            </View>
            <Text style={styles.quickTitle}>Fees Desk</Text>
            <Text style={styles.quickSubtitle}>Check receipts & payment status</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  welcomeBanner: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  welcomeTitle: {
    ...typography.title,
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.textSoft,
  },
  sectionHeader: {
    ...typography.sectionTitle,
    color: colors.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '47%',
    ...shadows.soft,
  },
  kpiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  kpiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiMeta: {
    flex: 1,
  },
  kpiValue: {
    ...typography.metric,
    color: colors.text,
    fontSize: 22,
  },
  kpiTitle: {
    ...typography.caption,
    color: colors.textSoft,
    marginTop: 2,
  },
  financeCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  financeCol: {
    flex: 1,
  },
  financeLabel: {
    ...typography.caption,
    color: colors.textSoft,
  },
  financeVal: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 16,
    marginTop: 2,
  },
  progressWrapper: {
    marginTop: spacing.xs,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: radius.pill,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  quickCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '47%',
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.soft,
  },
  quickIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  quickSubtitle: {
    ...typography.caption,
    color: colors.textSoft,
    fontSize: 10,
    textAlign: 'center',
  },
  panelCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  activityList: {
    paddingVertical: spacing.xs,
  },
  activityItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  lastActivityItem: {
    marginBottom: 0,
  },
  timelineLineContainer: {
    alignItems: 'center',
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 2,
  },
  activityTextWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTextTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 13,
  },
  activityTextTime: {
    ...typography.caption,
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});

export default DashboardScreen;
