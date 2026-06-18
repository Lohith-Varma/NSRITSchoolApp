import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {AnimatedProgressBar, SectionHeader, StatCard} from '../../components';
import {USER_ROLES} from '../../config/constants';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

const NavRow = ({icon, label, desc, color, onPress, delay = 0}) => (
  <Animated.View entering={FadeInRight.delay(delay).duration(260).springify()}>
    <Pressable onPress={onPress} style={styles.navRow}>
      <View style={[styles.navIcon, {backgroundColor: `${color}13`}]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.navCopy}>
        <Text style={styles.navLabel}>{label}</Text>
        {desc ? <Text style={styles.navDesc}>{desc}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
    </Pressable>
  </Animated.View>
);

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const access = useFeeAccess();

  const {data} = useQuery({
    queryKey: ['branchAdminFeeDashboard', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });
  const summary = data?.summary || {};
  const collectionRate = Math.round((summary.collectionRate || 0) * 100);

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
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.header}>
        <View style={styles.headerDecor} />
        <View style={styles.headerTop}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons name="domain" size={24} color={colors.white} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name || 'Branch Admin'}
            </Text>
          </View>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.logoutBtn} hitSlop={6}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>
        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>Branch Administrator</Text>
        </View>
      </Animated.View>

      {/* ── KPI cards ── */}
      <SectionHeader title="Branch Snapshot" icon="office-building-outline" />
      <View style={styles.kpiGrid}>
        <StatCard
          title="Students"
          value={String(summary.studentsWithFeePlans || 0)}
          icon="account-school"
          tone={colors.primary}
          onPress={() => navigation.navigate('ManageStudents')}
        />
        <StatCard
          title="Fee Collected"
          value={formatCurrency(summary.paidAmount || 0)}
          icon="cash-check"
          tone={colors.success}
        />
        <StatCard
          title="Pending Due"
          value={formatCurrency(summary.dueAmount || 0)}
          icon="cash-clock"
          tone={colors.danger}
          onPress={() => navigation.navigate('FeeDashboard')}
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          icon="chart-line"
          tone={collectionRate >= 70 ? colors.success : colors.warning}
        />
      </View>

      {/* ── Fee progress ── */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(320).springify()}
        style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Fee Collection Progress</Text>
          <Text style={[styles.progressPct, {color: collectionRate >= 70 ? colors.success : colors.warning}]}>
            {collectionRate}%
          </Text>
        </View>
        <AnimatedProgressBar
          progress={collectionRate}
          color={collectionRate >= 70 ? colors.success : colors.warning}
          trackColor={colors.border}
          height={8}
        />
        <View style={styles.progressMeta}>
          <Text style={styles.progressMetaText}>
            Collected {formatCurrency(summary.paidAmount || 0)} of {formatCurrency(summary.totalFee || 0)}
          </Text>
        </View>
      </Animated.View>

      {/* ── Student management ── */}
      <SectionHeader title="Student Management" icon="account-school-outline" />
      <Animated.View
        entering={FadeInDown.delay(120).duration(320).springify()}
        style={styles.group}>
        <NavRow icon="account-plus-outline" label="Add Student" desc="Enrol a new student" color={colors.success} onPress={() => navigation.navigate('CreateStudent')} delay={0} />
        <View style={styles.div} />
        <NavRow icon="account-school" label="All Students" desc="View and manage student records" color={colors.primary} onPress={() => navigation.navigate('ManageStudents')} delay={40} />
        <View style={styles.div} />
        <NavRow icon="file-upload-outline" label="Bulk CSV Import" desc="Upload multiple students at once" color={colors.info} onPress={() => navigation.navigate('BulkStudentUpload')} delay={80} />
      </Animated.View>

      {/* ── Staff management ── */}
      <SectionHeader title="Staff & Attendance" icon="account-tie-outline" />
      <Animated.View
        entering={FadeInDown.delay(160).duration(320).springify()}
        style={styles.group}>
        <NavRow icon="account-tie" label="Manage Teachers" desc="Teacher roster for this branch" color={colors.purple} onPress={() => navigation.navigate('ManageTeachers')} delay={0} />
        <View style={styles.div} />
        <NavRow icon="account-switch-outline" label="Assign Class Teacher" desc="Link teacher to section" color={colors.secondary} onPress={() => navigation.navigate('AssignClassTeacher')} delay={40} />
        <View style={styles.div} />
        <NavRow icon="clipboard-text-clock" label="Attendance Overview" desc="Branch-wide attendance log" color={colors.info} onPress={() => navigation.navigate('AttendanceOverview')} delay={80} />
        <View style={styles.div} />
        <NavRow icon="finance" label="Fee Overview" desc="Branch fee collection desk" color={colors.accent} onPress={() => navigation.navigate('FeeDashboard')} delay={120} />
        <View style={styles.div} />
        <NavRow icon="chart-box-outline" label="Branch Analytics" desc="Fee collection and performance data" color={colors.purple} onPress={() => navigation.navigate('BranchAnalytics')} delay={160} />
        <View style={styles.div} />
        <NavRow icon="cog-outline" label="Branch Settings" desc="Configuration and preferences" color={colors.textMuted} onPress={() => navigation.navigate('BranchSettings')} delay={200} />
      </Animated.View>

    </ScrollView>

    <UserMenuDrawer
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      navigation={navigation}
      profileRoute="BranchAdminProfile"
      settingsRoute="BranchSettings"
      notificationsRoute="NotificationCenter"
      composeNotificationRoute="CreateNotification"
    />
    </>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, paddingBottom: spacing.xxxl + spacing.xl},
  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginBottom: spacing.xl,
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
  headerTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 46, width: 46,
    justifyContent: 'center',
  },
  headerCopy: {flex: 1, minWidth: 0},
  greeting: {...typography.overline, color: 'rgba(255,255,255,0.6)'},
  name: {...typography.subtitle, color: colors.white, marginTop: 1},
  logoutBtn: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md, height: 36, justifyContent: 'center', width: 36,
  },
  roleBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  roleDot: {backgroundColor: colors.success, borderRadius: radius.pill, height: 6, width: 6},
  roleText: {color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600'},
  kpiGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md},
  progressCard: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  progressHeader: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md},
  progressTitle: {...typography.bodyBold, color: colors.text},
  progressPct: {fontSize: 14, fontWeight: '800'},
  progressMeta: {marginTop: spacing.sm},
  progressMetaText: {...typography.caption, color: colors.textMuted},
  group: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  navRow: {
    alignItems: 'center', flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  navIcon: {alignItems: 'center', borderRadius: radius.md, height: 40, justifyContent: 'center', width: 40},
  navCopy: {flex: 1, minWidth: 0},
  navLabel: {...typography.bodyBold, color: colors.text},
  navDesc: {...typography.caption, color: colors.textMuted, marginTop: 1},
  div: {backgroundColor: colors.border, height: 1, marginLeft: 72},
});

export default DashboardScreen;
