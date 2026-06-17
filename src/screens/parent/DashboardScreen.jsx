import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  AnimatedMetric,
  AttendanceRing,
  DashboardCard,
  EmptyState,
  SectionHeader,
} from '../../components';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

// Quick action pill for the action strip
const QuickAction = ({icon, label, onPress, color = colors.primary, delay = 0}) => (
  <Animated.View entering={FadeInRight.delay(delay).duration(280).springify()}>
    <Pressable onPress={onPress} style={styles.quickAction}>
      <View style={[styles.qaIcon, {backgroundColor: `${color}15`}]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.qaLabel} numberOfLines={1}>{label}</Text>
    </Pressable>
  </Animated.View>
);

// Metric chip used inside the hero card
const HeroMetric = ({label, value, color = colors.success, icon}) => (
  <View style={[styles.heroMetric, {borderColor: `${color}30`}]}>
    <View style={[styles.heroMetricIcon, {backgroundColor: `${color}12`}]}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
    </View>
    <View>
      <Text style={[styles.heroMetricValue, {color}]}>{value}</Text>
      <Text style={styles.heroMetricLabel}>{label}</Text>
    </View>
  </View>
);

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const parentId = user?.parentId;

  const {data, error, isLoading} = useQuery({
    queryKey: ['parentDashboard', parentId],
    queryFn: () => parentService.getParentDashboard(parentId),
    enabled: Boolean(parentId),
  });

  const children = data?.children || [];
  const selectedChild = data?.selectedChild;
  const attendancePct = selectedChild?.attendanceSummary?.percentage || 0;
  const totalDue = data?.totalDue || 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) {return 'Good morning';}
    if (h < 17) {return 'Good afternoon';}
    return 'Good evening';
  };

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View entering={FadeInDown.duration(320).springify()} style={styles.header}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.parentName} numberOfLines={1}>
              {user?.fullName || user?.name || 'Parent'}
            </Text>
          </View>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.logoutBtn} hitSlop={6}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={20}
              color="rgba(255,255,255,0.85)"
            />
          </Pressable>
        </View>

        <Text style={styles.headerSub}>
          {new Date().toLocaleDateString('en-IN', {weekday: 'long', day: 'numeric', month: 'long'})}
        </Text>
      </Animated.View>

      {/* ── Hero child card with attendance ring ── */}
      {selectedChild ? (
        <Animated.View
          entering={FadeInDown.delay(80).duration(380).springify()}
          style={styles.heroCard}>
          {/* Decorative blob */}
          <View style={styles.heroBlob} />

          <View style={styles.heroTop}>
            {/* Left: child info */}
            <View style={styles.heroLeft}>
              <View style={styles.childAvatar}>
                <MaterialCommunityIcons
                  name="account-school"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName} numberOfLines={1}>
                  {selectedChild.fullName}
                </Text>
                <Text style={styles.childMeta}>
                  {selectedChild.academicClass?.name || '—'}
                  {' · '}
                  {selectedChild.section?.name || '—'}
                </Text>
                <Text style={styles.childId}>{selectedChild.studentId}</Text>
              </View>
            </View>

            {/* Right: attendance ring */}
            <AttendanceRing
              percentage={attendancePct}
              size={90}
              strokeWidth={8}
              color={attendancePct >= 75 ? colors.success : colors.danger}
              trackColor={colors.border}
              bgColor={colors.white}>
              <Text style={[styles.ringPct, {color: attendancePct >= 75 ? colors.success : colors.danger}]}>
                {attendancePct}%
              </Text>
              <Text style={styles.ringLabel}>ATT</Text>
            </AttendanceRing>
          </View>

          {/* Metric chips row */}
          <View style={styles.heroMetrics}>
            <HeroMetric
              icon="calendar-check"
              label="Attendance"
              value={`${attendancePct}%`}
              color={attendancePct >= 75 ? colors.success : colors.danger}
            />
            <HeroMetric
              icon="cash-clock"
              label="Fee Due"
              value={formatCurrency(selectedChild.feeSummary?.due || 0)}
              color={colors.warning}
            />
            <HeroMetric
              icon="school-outline"
              label="Class"
              value={selectedChild.academicClass?.name || '—'}
              color={colors.info}
            />
          </View>

          {/* Tap to change child */}
          <Pressable
            onPress={() => navigation.navigate('Students')}
            style={styles.changeChildBtn}>
            <MaterialCommunityIcons name="swap-horizontal" size={13} color={colors.primary} />
            <Text style={styles.changeChildText}>Switch child</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(80).duration(350).springify()}>
          <EmptyState
            icon="account-child-outline"
            title="No child linked"
            message="Once admission is complete, your child's record will appear here."
            actionLabel="Select Child"
            onAction={() => navigation.navigate('Students')}
          />
        </Animated.View>
      )}

      {/* ── Summary bar when no selected child ── */}
      {!selectedChild && children.length > 0 ? (
        <DashboardCard
          title="Select Child"
          value={`${children.length} linked`}
          description="Tap to choose which child to view"
          icon="account-child-outline"
          tone={colors.primary}
          onPress={() => navigation.navigate('Students')}
        />
      ) : null}

      {/* ── Quick actions strip ── */}
      <SectionHeader title="Quick Actions" icon="lightning-bolt" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.qaStrip}>
        <QuickAction
          icon="chart-donut"
          label="Attendance"
          color={colors.success}
          delay={0}
          onPress={() =>
            navigation.navigate('Attendance',
              selectedChild ? {studentId: selectedChild.id} : undefined)
          }
        />
        <QuickAction
          icon="cash-multiple"
          label="Fee Ledger"
          color={colors.warning}
          delay={60}
          onPress={() => navigation.navigate('FeeLedger')}
        />
        <QuickAction
          icon="cash-register"
          label="Pay Fees"
          color={colors.success}
          delay={90}
          onPress={() => navigation.navigate('Payments')}
        />
        <QuickAction
          icon="bell-outline"
          label="Notices"
          color={colors.info}
          delay={120}
          onPress={() => navigation.navigate('ParentNotices')}
        />
        <QuickAction
          icon="message-text-outline"
          label="Suggestions"
          color={colors.accent}
          delay={180}
          onPress={() => navigation.navigate('ParentSuggestions')}
        />
        <QuickAction
          icon="account-switch"
          label="Switch Child"
          color={colors.secondary}
          delay={240}
          onPress={() => navigation.navigate('Students')}
        />
        <QuickAction
          icon="account-circle-outline"
          label="Profile"
          color={colors.purple}
          delay={300}
          onPress={() => navigation.navigate('Profile')}
        />
      </ScrollView>

      {/* ── Fees overview ── */}
      <SectionHeader
        title="Fee Summary"
        icon="cash-multiple"
        actionLabel="View All"
        onAction={() => navigation.navigate('FeeLedger')}
      />
      <Animated.View
        entering={FadeInDown.delay(150).duration(320).springify()}
        style={styles.feeCard}>
        <View style={styles.feeRow}>
          <View style={styles.feeStat}>
            <MaterialCommunityIcons name="cash-check" size={20} color={colors.success} />
            <Text style={[styles.feeValue, {color: colors.success}]}>
              {formatCurrency(data?.totalPaid || 0)}
            </Text>
            <Text style={styles.feeStatLabel}>Paid</Text>
          </View>
          <View style={styles.feeDivider} />
          <View style={styles.feeStat}>
            <MaterialCommunityIcons name="cash-clock" size={20} color={colors.danger} />
            <Text style={[styles.feeValue, {color: colors.danger}]}>
              {formatCurrency(totalDue)}
            </Text>
            <Text style={styles.feeStatLabel}>Due</Text>
          </View>
          <View style={styles.feeDivider} />
          <View style={styles.feeStat}>
            <MaterialCommunityIcons name="sale" size={20} color={colors.info} />
            <Text style={[styles.feeValue, {color: colors.info}]}>
              {formatCurrency(data?.totalConcession || 0)}
            </Text>
            <Text style={styles.feeStatLabel}>Concession</Text>
          </View>
        </View>

        {totalDue > 0 ? (
          <Pressable
            onPress={() => navigation.navigate('FeeLedger')}
            style={styles.payNowBtn}>
            <MaterialCommunityIcons name="credit-card-outline" size={15} color={colors.white} />
            <Text style={styles.payNowText}>Pay Now</Text>
          </Pressable>
        ) : (
          <View style={styles.feeClearBadge}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} />
            <Text style={styles.feeClearText}>All fees cleared</Text>
          </View>
        )}
      </Animated.View>

      {/* ── Children list ── */}
      {children.length > 1 ? (
        <>
          <SectionHeader title="All Children" icon="account-group-outline" />
          {children.map((child, i) => (
            <Animated.View
              key={child.id}
              entering={FadeInDown.delay(i * 60).duration(300).springify()}>
              <DashboardCard
                title={child.fullName}
                value={`${child.attendanceSummary?.percentage || 0}% att.`}
                description={`${child.academicClass?.name || '—'}-${child.section?.name || '—'} · Due: ${formatCurrency(child.feeSummary?.due || 0)}`}
                icon="account-school-outline"
                tone={colors.primary}
                onPress={() => navigation.navigate('Attendance', {studentId: child.id})}
              />
            </Animated.View>
          ))}
        </>
      ) : null}

      {error ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Could not load dashboard"
          message={error.message}
        />
      ) : null}
    </ScrollView>

    <UserMenuDrawer
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      navigation={navigation}
      profileRoute="Profile"
    />
    </>
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
  headerDecor1: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -30,
    width: 140,
  },
  headerDecor2: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 60,
    bottom: -20,
    height: 90,
    left: -10,
    position: 'absolute',
    width: 90,
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.65)',
  },
  parentName: {
    ...typography.title,
    color: colors.white,
    marginTop: 2,
  },
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerSub: {
    ...typography.captionBold,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.xs,
  },
  // Hero child card
  heroCard: {
    ...shadows.medium,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  heroBlob: {
    backgroundColor: colors.primarySoft,
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -30,
    top: -20,
    width: 140,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  heroLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 0,
  },
  childAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryFaint,
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  childInfo: {
    flex: 1,
    minWidth: 0,
  },
  childName: {
    ...typography.heading,
    color: colors.text,
  },
  childMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  childId: {
    ...typography.overline,
    color: colors.textSoft,
    marginTop: 2,
  },
  // Ring labels
  ringPct: {
    fontSize: 16,
    fontWeight: '900',
  },
  ringLabel: {
    ...typography.overline,
    color: colors.textSoft,
    fontSize: 8,
  },
  // Hero metrics row
  heroMetrics: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroMetric: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  heroMetricIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  heroMetricValue: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  heroMetricLabel: {
    ...typography.overline,
    color: colors.textSoft,
    fontSize: 8,
  },
  changeChildBtn: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
  },
  changeChildText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
  },
  // Quick action strip
  qaStrip: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 72,
  },
  qaIcon: {
    alignItems: 'center',
    borderRadius: radius.card,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  qaLabel: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
  },
  // Fee card
  feeCard: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  feeStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  feeStatLabel: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 9,
  },
  feeDivider: {
    backgroundColor: colors.border,
    width: 1,
  },
  payNowBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  payNowText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  feeClearBadge: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  feeClearText: {
    ...typography.captionBold,
    color: colors.success,
  },
});

export default DashboardScreen;
