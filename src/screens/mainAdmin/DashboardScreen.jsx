import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {AnimatedMetric, EmptyState, SectionHeader} from '../../components';
import {USER_ROLES} from '../../config/constants';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';
import {formatCurrency} from '../../utils/formatters/currency';

// Enterprise KPI card
const KpiCard = ({label, value, icon, color = colors.primary, sub, onPress, delay = 0, isNumeric = true}) => (
  <Animated.View
    entering={FadeInDown.delay(delay).duration(320).springify()}
    style={[styles.kpiCard, {borderTopColor: color, borderTopWidth: 3}]}>
    <Pressable onPress={onPress} style={styles.kpiInner}>
      <View style={styles.kpiTop}>
        <View style={[styles.kpiIcon, {backgroundColor: `${color}13`}]}>
          <MaterialCommunityIcons name={icon} size={18} color={color} />
        </View>
        {onPress ? (
          <MaterialCommunityIcons name="arrow-top-right" size={14} color={colors.textSoft} />
        ) : null}
      </View>
      <AnimatedMetric
        value={value}
        isNumeric={isNumeric}
        style={[typography.metric, {color: colors.text}]}
      />
      <Text style={styles.kpiLabel}>{label}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </Pressable>
  </Animated.View>
);

// Navigation action row item
const ActionRow = ({title, description, icon, color, onPress, delay = 0}) => (
  <Animated.View entering={FadeInRight.delay(delay).duration(280).springify()}>
    <Pressable onPress={onPress} style={styles.actionRow}>
      <View style={[styles.actionIcon, {backgroundColor: `${color}13`}]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        {description ? (
          <Text style={styles.actionDesc} numberOfLines={1}>{description}</Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
    </Pressable>
  </Animated.View>
);

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const {data: stats} = useAsyncResource(
    options => mainAdminService.getDashboardStatistics(options),
    [],
  );

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

      {/* ── Hero header ── */}
      <Animated.View
        entering={FadeInDown.duration(300).springify()}
        style={styles.header}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        <View style={styles.headerDecor3} />

        <View style={styles.headerTop}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {(user?.name || 'M').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.headerGreeting}>{getGreeting()}</Text>
            <Text style={styles.headerName} numberOfLines={1}>
              {user?.name || 'Main Admin'}
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

        <View style={styles.headerBottom}>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleLabel}>Global Administrator</Text>
          </View>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </Text>
        </View>
      </Animated.View>

      {/* ── KPI grid (2x2) ── */}
      <SectionHeader title="Global Overview" icon="earth" />
      <View style={styles.kpiGrid}>
        <KpiCard
          label="Total Branches"
          value={String(stats?.totalBranches || 0)}
          icon="domain"
          color={colors.secondary}
          sub={`${stats?.activeBranches || 0} active`}
          onPress={() => navigation.navigate('BranchList')}
          delay={60}
        />
        <KpiCard
          label="Students"
          value={String(stats?.totalStudents || 0)}
          icon="account-school"
          color={colors.success}
          sub="Enrolled globally"
          onPress={() => navigation.navigate('GlobalStudents')}
          delay={100}
        />
        <KpiCard
          label="Faculty"
          value={String(stats?.totalTeachers || 0)}
          icon="account-tie"
          color={colors.purple}
          sub="All branches"
          delay={140}
        />
        <KpiCard
          label="Attendance"
          value={`${stats?.todayAttendance || 0}%`}
          icon="calendar-check"
          color={colors.info}
          sub="Today global avg"
          isNumeric={false}
          delay={180}
        />
      </View>

      {/* ── Revenue strip ── */}
      <SectionHeader
        title="Revenue"
        icon="cash-multiple"
        actionLabel="Full Report"
        onAction={() => navigation.navigate('GlobalReports')}
      />
      <Animated.View
        entering={FadeInDown.delay(200).duration(340).springify()}
        style={styles.revenueCard}>
        <View style={styles.revenueBlob} />
        <View style={styles.revenueRow}>
          <View style={styles.revenueStat}>
            <Text style={styles.revenueLabel}>Collected</Text>
            <AnimatedMetric
              value={stats?.branchWiseCollection || 0}
              isNumeric={false}
              style={[styles.revenueValue, {color: colors.success}]}
            />
            <View style={styles.revenueBadge}>
              <MaterialCommunityIcons name="trending-up" size={10} color={colors.success} />
              <Text style={styles.revenueBadgeText}>{formatCurrency(stats?.branchWiseCollection || 0)}</Text>
            </View>
          </View>
          <View style={styles.revenueDiv} />
          <View style={styles.revenueStat}>
            <Text style={styles.revenueLabel}>Pending</Text>
            <AnimatedMetric
              value={stats?.branchWiseDues || 0}
              isNumeric={false}
              style={[styles.revenueValue, {color: colors.danger}]}
            />
            <View style={[styles.revenueBadge, {backgroundColor: colors.dangerSoft}]}>
              <MaterialCommunityIcons name="alert-outline" size={10} color={colors.danger} />
              <Text style={[styles.revenueBadgeText, {color: colors.danger}]}>{formatCurrency(stats?.branchWiseDues || 0)}</Text>
            </View>
          </View>
          <View style={styles.revenueDiv} />
          <View style={styles.revenueStat}>
            <Text style={styles.revenueLabel}>Concession</Text>
            <AnimatedMetric
              value={stats?.branchWiseConcessions || 0}
              isNumeric={false}
              style={[styles.revenueValue, {color: colors.info}]}
            />
            <View style={[styles.revenueBadge, {backgroundColor: colors.infoSoft}]}>
              <Text style={[styles.revenueBadgeText, {color: colors.info}]}>{formatCurrency(stats?.branchWiseConcessions || 0)}</Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.navigate('RevenueOverview')}
          style={styles.revenueAction}>
          <Text style={styles.revenueActionText}>View detailed breakdown</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color={colors.primary} />
        </Pressable>
      </Animated.View>

      {/* ── Navigation actions ── */}
      <SectionHeader title="Management" icon="cog-outline" />
      <Animated.View
        entering={FadeInDown.delay(220).duration(340).springify()}
        style={styles.actionGroup}>
        <ActionRow
          title="Branch Context"
          description="Mimic a branch as local admin"
          icon="office-building-cog"
          color={colors.primary}
          onPress={() => navigation.navigate('BranchContext')}
          delay={0}
        />
        <View style={styles.actionDivider} />
        <ActionRow
          title="Manage Branches"
          description="Create, edit, and configure branches"
          icon="domain"
          color={colors.secondary}
          onPress={() => navigation.navigate('BranchList')}
          delay={40}
        />
        <View style={styles.actionDivider} />
        <ActionRow
          title="Manage Users"
          description="Role assignments and access control"
          icon="account-cog-outline"
          color={colors.purple}
          onPress={() => navigation.navigate('ManageUsers')}
          delay={80}
        />
        <View style={styles.actionDivider} />
        <ActionRow
          title="Global Students"
          description="View all enrolled students"
          icon="account-school"
          color={colors.success}
          onPress={() => navigation.navigate('GlobalStudents')}
          delay={120}
        />
      </Animated.View>

      <SectionHeader title="Analytics & Logs" icon="chart-bar" />
      <Animated.View
        entering={FadeInDown.delay(260).duration(340).springify()}
        style={styles.actionGroup}>
        <ActionRow
          title="Global Analytics"
          description="Cross-branch performance charts"
          icon="chart-box-outline"
          color={colors.accent}
          onPress={() => navigation.navigate('Reports')}
          delay={0}
        />
        <View style={styles.actionDivider} />
        <ActionRow
          title="Audit Logs"
          description="System transaction and security trace"
          icon="clipboard-text-clock-outline"
          color={colors.warning}
          onPress={() => navigation.navigate('AuditLogs')}
          delay={40}
        />
        <View style={styles.actionDivider} />
        <ActionRow
          title="Class Fee Setup"
          description="Configure fee structures globally"
          icon="cash-multiple"
          color={colors.info}
          onPress={() => navigation.navigate('ClassFeeManagement')}
          delay={80}
        />
        <View style={styles.actionDivider} />
        <ActionRow
          title="Create Branch"
          description="Register a new school branch"
          icon="office-building-plus"
          color={colors.success}
          onPress={() => navigation.navigate('CreateBranch')}
          delay={120}
        />
      </Animated.View>

    </ScrollView>

    <UserMenuDrawer
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      navigation={navigation}
      profileRoute="Profile"
      settingsRoute="Settings"
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
    backgroundColor: colors.primaryDark,
    borderRadius: radius.card,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor1: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    height: 180,
    position: 'absolute',
    right: -40,
    top: -60,
    width: 180,
  },
  headerDecor2: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 80,
    bottom: -40,
    height: 130,
    left: -30,
    position: 'absolute',
    width: 130,
  },
  headerDecor3: {
    backgroundColor: 'rgba(21,94,239,0.3)',
    borderRadius: 60,
    height: 100,
    position: 'absolute',
    right: 60,
    top: 20,
    width: 100,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerGreeting: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.55)',
  },
  headerName: {
    ...typography.subtitle,
    color: colors.white,
    marginTop: 1,
  },
  logoutBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  roleDot: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  roleLabel: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
  },
  headerDate: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.5)',
  },
  // KPI grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  kpiCard: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    minWidth: '47%',
    overflow: 'hidden',
  },
  kpiInner: {
    padding: spacing.md,
  },
  kpiTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  kpiIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  kpiLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  kpiSub: {
    ...typography.overline,
    color: colors.textSoft,
    marginTop: 1,
  },
  // Revenue card
  revenueCard: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  revenueBlob: {
    backgroundColor: colors.successSoft,
    borderRadius: 60,
    height: 100,
    opacity: 0.6,
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  revenueStat: {
    alignItems: 'center',
    flex: 1,
  },
  revenueLabel: {
    ...typography.overline,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  revenueValue: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  revenueBadge: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 3,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  revenueBadgeText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: '700',
  },
  revenueDiv: {
    backgroundColor: colors.border,
    width: 1,
  },
  revenueAction: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingTop: spacing.md,
  },
  revenueActionText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  // Action rows
  actionGroup: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  actionDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  actionDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginLeft: 72,
  },
});

export default DashboardScreen;
