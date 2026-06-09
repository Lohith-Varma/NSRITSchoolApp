import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Text,
  Pressable,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {colors, spacing, radius, shadows, typography} from '../../theme';
import {fetchFees} from '../../store/slices/feeSlice';
import useFeeAccess from '../../hooks/useFeeAccess';

import {ERPLayout} from '../../components';
import SummaryCard from './components/SummaryCard';
import QuickActionGrid from './components/QuickActionGrid';
import RecentTransactionList from './components/RecentTransactionList';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock transactions to seed alongside uploaded ones
const MOCK_TRANSACTIONS = [
  {
    studentName: 'Aarav Sharma',
    studentId: 'STU-2026-0043',
    receiptNo: 'REC-26-8941',
    amount: 15000,
    mode: 'Cash',
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
  },
  {
    studentName: 'Priya Patel',
    studentId: 'STU-2026-0102',
    receiptNo: 'REC-26-8939',
    amount: 12500,
    mode: 'Cash',
    date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
  },
  {
    studentName: 'Rohan Verma',
    studentId: 'STU-2026-0012',
    receiptNo: 'REC-26-8938',
    amount: 8000,
    mode: 'Cash',
    date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
];

const DashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const access = useFeeAccess();
  const {user} = useSelector(state => state.auth);
  const {records, payments, summary, loading} = useSelector(state => state.fees);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchFees(access));
  }, [access, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchFees(access));
    setRefreshing(false);
  };

  // Merge uploaded payments with mock payments to make a complete premium feed
  const combinedPayments = useMemo(() => {
    const uploaded = payments || [];
    // Filter out mock duplicates if any actual uploaded payments exist with same studentId
    const filteredMocks = MOCK_TRANSACTIONS.filter(
      mock => !uploaded.some(u => u.studentId === mock.studentId)
    );
    return [...uploaded, ...filteredMocks];
  }, [payments]);

  const quickActions = [
    {
      title: 'Record Payment',
      subtitle: 'Post offline cash dues',
      icon: 'cash-register',
      route: 'RecordPayment',
      color: colors.secondary,
      bgColor: colors.secondarySoft,
    },
    {
      title: 'Result Posting',
      subtitle: 'Post subject batch marks',
      icon: 'clipboard-check-outline',
      route: 'ResultPosting',
      color: colors.purple,
      bgColor: colors.purpleSoft,
    },
    {
      title: 'Fee Tracking',
      subtitle: 'Monitor overall ledgers',
      icon: 'currency-usd',
      route: 'FeeDashboard',
      color: colors.success,
      bgColor: colors.successSoft,
    },
    {
      title: 'Broadcast Alert',
      subtitle: 'Send financial reminders',
      icon: 'megaphone-outline',
      route: 'CreateNotification',
      color: colors.warning,
      bgColor: colors.warningSoft,
    },
  ];

  const formatCurrency = val => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <ERPLayout
      navigation={navigation}
      activeRoute="Dashboard"
      title="Finance Desk"
      breadcrumbs={['Dashboard', 'Finance Desk']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />
        }>
        {/* Summary Cards Row */}
        <View style={styles.metricsContainer}>
          <SummaryCard
            title="Total Collected"
            value={formatCurrency(summary.paidAmount)}
            subtitle={`${summary.paidStudents} paid student ledgers`}
            icon="cash-check"
            tone={colors.success}
            percentage={Math.round((summary.collectionRate || 0) * 100)}
            isIncrease={true}
            style={styles.metricCard}
          />
          <SummaryCard
            title="Total Outstanding"
            value={formatCurrency(summary.dueAmount)}
            subtitle={`${summary.dueStudents} pending student balances`}
            icon="cash-clock"
            tone={colors.danger}
            percentage={12} // Mock trend
            isIncrease={false}
            style={styles.metricCard}
          />
        </View>

        {/* Quick Actions Grid */}
        <QuickActionGrid navigation={navigation} actions={quickActions} />

        {/* Pending Marks Posting Section (Stitch UI Result Posting preview) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pending Task: Results</Text>
          <Pressable onPress={() => navigation.navigate('ResultPosting')}>
            <Text style={styles.viewAllText}>Manage</Text>
          </Pressable>
        </View>

        <View style={styles.tasksContainer}>
          <Pressable
            style={styles.taskCard}
            onPress={() => navigation.navigate('ResultPosting')}>
            <View style={styles.taskLeft}>
              <View style={[styles.taskIconCircle, {backgroundColor: colors.purpleSoft}]}>
                <MaterialCommunityIcons name="calculator" size={20} color={colors.purple} />
              </View>
              <View style={styles.taskDetails}>
                <Text style={styles.taskName}>Advanced Mathematics</Text>
                <Text style={styles.taskMeta}>Grade XII-A • Prof. M. Sharma</Text>
              </View>
            </View>
            <View style={styles.taskRight}>
              <View style={styles.readyBadge}>
                <Text style={styles.readyBadgeText}>Ready to Post</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSoft} />
            </View>
          </Pressable>

          <Pressable
            style={styles.taskCard}
            onPress={() => navigation.navigate('ResultPosting')}>
            <View style={styles.taskLeft}>
              <View style={[styles.taskIconCircle, {backgroundColor: colors.infoSoft}]}>
                <MaterialCommunityIcons name="flask-outline" size={20} color={colors.info} />
              </View>
              <View style={styles.taskDetails}>
                <Text style={styles.taskName}>Organic Chemistry</Text>
                <Text style={styles.taskMeta}>Grade XII-B • Dr. A. Sen</Text>
              </View>
            </View>
            <View style={styles.taskRight}>
              <View style={styles.readyBadge}>
                <Text style={styles.readyBadgeText}>Ready to Post</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSoft} />
            </View>
          </Pressable>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.transactionsWrapper}>
          <RecentTransactionList
            payments={combinedPayments}
            loading={loading}
            onViewAllPress={() => navigation.navigate('PaymentHistory')}
            limit={4}
          />
        </View>
      </ScrollView>
    </ERPLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  metricsContainer: {
    flexDirection: 'column',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  metricCard: {
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.primary,
  },
  viewAllText: {
    ...typography.bodyBold,
    color: colors.secondary,
  },
  tasksContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    ...shadows.soft,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  taskName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  taskMeta: {
    ...typography.caption,
    color: colors.textSoft,
    marginTop: 2,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  readyBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.success,
  },
  transactionsWrapper: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
});

export default DashboardScreen;
