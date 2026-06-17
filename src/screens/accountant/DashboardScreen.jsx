import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {useDispatch, useSelector} from 'react-redux';
import {
  AnimatedMetric,
  AnimatedProgressBar,
  EmptyState,
  PaymentCard,
  SectionHeader,
  LogoutButton,
} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {toISODate} from '../../utils/helpers/dateHelpers';
import {logoutUser} from '../../store/slices/authSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const isSameMonth = date => {
  const v = new Date(date);
  const n = new Date();
  return v.getFullYear() === n.getFullYear() && v.getMonth() === n.getMonth();
};

// Primary action tile
const ActionTile = ({icon, label, sub, color, onPress, delay = 0}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(280).springify()}
    style={styles.tileFlex}>
    <Pressable onPress={onPress} style={[styles.tile, {borderTopColor: color, borderTopWidth: 3}]}>
      <View style={[styles.tileIcon, {backgroundColor: `${color}14`}]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
      {sub ? <Text style={styles.tileSub}>{sub}</Text> : null}
    </Pressable>
  </Animated.View>
);

const DashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const access = useFeeAccess();

  const {data} = useQuery({
    queryKey: ['accountantFeeDashboard', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });

  const records = data?.records || [];
  const payments = data?.payments || [];
  const today = toISODate(new Date());
  const todaysCollections = payments
    .filter(p => p.paymentDate === today)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const monthlyCollections = payments
    .filter(p => isSameMonth(p.paymentDate))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const summary = data?.summary || feeService.getFeeSummary(records);
  const collectionRate = Math.round((summary.collectionRate || 0) * 100);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) {return 'Good morning';}
    if (h < 17) {return 'Good afternoon';}
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.header}>
        <View style={styles.headerDecor} />
        <View style={styles.headerTop}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {(user?.fullName || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user?.fullName || 'Accountant'}
            </Text>
          </View>
          <LogoutButton />
        </View>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </Text>
      </Animated.View>

      {/* ── Collection highlight ── */}
      <Animated.View
        entering={FadeInDown.delay(60).duration(320).springify()}
        style={styles.collectionCard}>
        <View style={styles.collectionBlob} />
        <Text style={styles.collectionLabel}>Today's Collections</Text>
        <AnimatedMetric
          value={todaysCollections}
          isNumeric={false}
          style={styles.collectionValue}
        />
        <Text style={styles.collectionFormatted}>{formatCurrency(todaysCollections)}</Text>
        <View style={styles.collectionMeta}>
          <View style={styles.collectionChip}>
            <MaterialCommunityIcons name="calendar-month" size={11} color={colors.primary} />
            <Text style={styles.collectionChipText}>
              Month: {formatCurrency(monthlyCollections)}
            </Text>
          </View>
          <View style={[styles.collectionChip, {backgroundColor: colors.dangerSoft}]}>
            <MaterialCommunityIcons name="alert-outline" size={11} color={colors.danger} />
            <Text style={[styles.collectionChipText, {color: colors.danger}]}>
              Due: {formatCurrency(summary.dueAmount || 0)}
            </Text>
          </View>
        </View>

        {/* Collection rate bar */}
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Collection Rate</Text>
          <Text style={[styles.ratePct, {color: collectionRate >= 70 ? colors.success : colors.warning}]}>
            {collectionRate}%
          </Text>
        </View>
        <AnimatedProgressBar
          progress={collectionRate}
          color={collectionRate >= 70 ? colors.success : colors.warning}
          trackColor="rgba(255,255,255,0.3)"
          height={6}
        />
      </Animated.View>

      {/* ── Primary actions ── */}
      <SectionHeader title="Fee Desk" icon="cash-register" />
      <View style={styles.tileGrid}>
        <ActionTile
          icon="cash-plus"
          label="Record Payment"
          sub="Accept cash / UPI / card"
          color={colors.success}
          onPress={() => navigation.navigate('FeeCollection')}
          delay={60}
        />
        <ActionTile
          icon="account-alert-outline"
          label="Due Students"
          sub="Follow up list"
          color={colors.danger}
          onPress={() => navigation.navigate('DueStudents')}
          delay={100}
        />
        <ActionTile
          icon="receipt-text-clock"
          label="Payment History"
          sub="Receipts & ledger"
          color={colors.info}
          onPress={() => navigation.navigate('PaymentHistory')}
          delay={140}
        />
        <ActionTile
          icon="file-chart-outline"
          label="Reports"
          sub="Class-wise analytics"
          color={colors.accent}
          onPress={() => navigation.navigate('FeeReports')}
          delay={180}
        />
      </View>

      {/* ── Summary stats ── */}
      <SectionHeader title="Financial Summary" icon="chart-pie" />
      <Animated.View
        entering={FadeInDown.delay(180).duration(320).springify()}
        style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryStat}>
            <MaterialCommunityIcons name="cash-check" size={18} color={colors.success} />
            <Text style={[styles.summaryValue, {color: colors.success}]}>
              {formatCurrency(summary.paidAmount || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Collected</Text>
          </View>
          <View style={styles.summaryDiv} />
          <View style={styles.summaryStat}>
            <MaterialCommunityIcons name="cash-clock" size={18} color={colors.danger} />
            <Text style={[styles.summaryValue, {color: colors.danger}]}>
              {formatCurrency(summary.dueAmount || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryDiv} />
          <View style={styles.summaryStat}>
            <MaterialCommunityIcons name="account-alert" size={18} color={colors.warning} />
            <Text style={[styles.summaryValue, {color: colors.warning}]}>
              {summary.dueStudents || 0}
            </Text>
            <Text style={styles.summaryLabel}>Due Students</Text>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('FeeDashboard')}
          style={styles.summaryAction}>
          <Text style={styles.summaryActionText}>Open full fee dashboard</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
        </Pressable>
      </Animated.View>

      {/* ── Recent payments ── */}
      <SectionHeader
        title="Recent Payments"
        icon="history"
        actionLabel="All History"
        onAction={() => navigation.navigate('PaymentHistory')}
      />
      {payments.length ? (
        payments.slice(0, 5).map((payment, i) => (
          <Animated.View
            key={payment.id}
            entering={FadeInRight.delay(i * 40).duration(260).springify()}>
            <PaymentCard payment={payment} />
          </Animated.View>
        ))
      ) : (
        <EmptyState
          compact
          icon="receipt-text-outline"
          title="No payments today"
          message="Payments recorded today will appear here."
        />
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + spacing.xl,
  },
  // Header
  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 90,
    height: 160,
    position: 'absolute',
    right: -30,
    top: -50,
    width: 160,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.6)',
  },
  name: {
    ...typography.subtitle,
    color: colors.white,
    marginTop: 1,
  },
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerDate: {
    ...typography.captionBold,
    color: 'rgba(255,255,255,0.6)',
  },
  // Collection highlight card
  collectionCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.card,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    ...shadows.medium,
  },
  collectionBlob: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 140,
  },
  collectionLabel: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xs,
  },
  collectionValue: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 2,
  },
  collectionFormatted: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  collectionMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  collectionChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  collectionChipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '700',
  },
  rateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rateLabel: {
    ...typography.captionBold,
    color: 'rgba(255,255,255,0.65)',
  },
  ratePct: {
    fontSize: 13,
    fontWeight: '800',
  },
  // Action tiles
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  tileFlex: {
    flex: 1,
    minWidth: '47%',
  },
  tile: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  tileIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 44,
  },
  tileLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 2,
  },
  tileSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Summary card
  summaryCard: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  summaryStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  summaryLabel: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 9,
  },
  summaryDiv: {
    backgroundColor: colors.border,
    width: 1,
  },
  summaryAction: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingTop: spacing.md,
  },
  summaryActionText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});

export default DashboardScreen;
