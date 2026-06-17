import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  AnimatedMetric,
  AnimatedProgressBar,
  DashboardCard,
  SectionHeader,
  StatCard,
} from '../../components';
import {USER_ROLES} from '../../config/constants';
import principalDashboardService from '../../services/principal/principalDashboardService';
import {getAccessScope} from '../../services/rbacScope';
import feeService from '../../services/fees/feeService';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import UserMenuDrawer from '../../components/common/UserMenuDrawer';

// Navigation action row
const NavRow = ({icon, label, desc, color, onPress, delay = 0}) => (
  <Animated.View entering={FadeInRight.delay(delay).duration(260).springify()}>
    <Pressable onPress={onPress} style={styles.navRow}>
      <View style={[styles.navIcon, {backgroundColor: `${color}13`}]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.navCopy}>
        <Text style={styles.navLabel}>{label}</Text>
        {desc ? <Text style={styles.navDesc} numberOfLines={1}>{desc}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSoft} />
    </Pressable>
  </Animated.View>
);

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);
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
  const collectionRate = Math.round((feeSummary.collectionRate || 0) * 100);

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
        entering={FadeInDown.duration(300).springify()}
        style={styles.header}>
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        <View style={styles.headerTop}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons name="school" size={24} color={colors.white} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name || 'Principal'}
            </Text>
          </View>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.logoutBtn} hitSlop={6}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>
        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>Principal</Text>
        </View>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-IN', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
        </Text>
      </Animated.View>

      {/* ── KPI grid ── */}
      <SectionHeader title="Branch Overview" icon="office-building-outline" />
      <View style={styles.kpiGrid}>
        <StatCard
          title="Students"
          value={String(data?.totalStudents || 0)}
          icon="account-school"
          tone={colors.primary}
        />
        <StatCard
          title="Teachers"
          value={String(data?.totalTeachers || 0)}
          icon="account-tie"
          tone={colors.secondary}
        />
        <StatCard
          title="Sections"
          value={String(data?.totalSections || 0)}
          icon="google-classroom"
          tone={colors.info}
        />
        <StatCard
          title="Pending Promotions"
          value={String(data?.pendingPromotions || 0)}
          icon="alert-circle-outline"
          tone={colors.warning}
          onPress={() => navigation.navigate('PromotionManagement')}
        />
      </View>

      {/* ── Fee health ── */}
      <SectionHeader
        title="Fee Health"
        icon="cash-multiple"
        actionLabel="View Fees"
        onAction={() => navigation.navigate('FeeDashboard')}
      />
      <Animated.View
        entering={FadeInDown.delay(120).duration(320).springify()}
        style={styles.feeCard}>
        <View style={styles.feeTop}>
          <View style={styles.feeStat}>
            <Text style={[styles.feeVal, {color: colors.success}]}>
              {formatCurrency(feeSummary.paidAmount || 0)}
            </Text>
            <Text style={styles.feeLabel}>Collected</Text>
          </View>
          <View style={styles.feeDiv} />
          <View style={styles.feeStat}>
            <Text style={[styles.feeVal, {color: colors.danger}]}>
              {formatCurrency(feeSummary.dueAmount || 0)}
            </Text>
            <Text style={styles.feeLabel}>Pending</Text>
          </View>
          <View style={styles.feeDiv} />
          <View style={styles.feeStat}>
            <Text style={[styles.feeVal, {color: colors.info}]}>
              {formatCurrency(feeSummary.concessionAmount || 0)}
            </Text>
            <Text style={styles.feeLabel}>Concession</Text>
          </View>
        </View>
        <View style={styles.feeRateRow}>
          <Text style={styles.feeRateLabel}>Collection Rate</Text>
          <Text style={[styles.feeRatePct, {color: collectionRate >= 70 ? colors.success : colors.warning}]}>
            {collectionRate}%
          </Text>
        </View>
        <AnimatedProgressBar
          progress={collectionRate}
          color={collectionRate >= 70 ? colors.success : colors.warning}
          trackColor={colors.border}
          height={7}
        />
      </Animated.View>

      {/* ── Academic management ── */}
      <SectionHeader title="Academic" icon="school-outline" />
      <Animated.View
        entering={FadeInDown.delay(140).duration(320).springify()}
        style={styles.group}>
        <NavRow icon="account-plus-outline" label="Add Student" desc="Enrol new student" color={colors.success} onPress={() => navigation.navigate('AddStudent')} delay={0} />
        <View style={styles.div} />
        <NavRow icon="account-school-outline" label="Manage Students" desc="View and edit records" color={colors.primary} onPress={() => navigation.navigate('StudentManagement')} delay={40} />
        <View style={styles.div} />
        <NavRow icon="clipboard-text-clock" label="View Attendance" desc="Branch-wide attendance log" color={colors.info} onPress={() => navigation.navigate('ViewAllAttendance')} delay={80} />
        <View style={styles.div} />
        <NavRow icon="school-outline" label="Academic Structure" desc="Classes, sections, subjects" color={colors.secondary} onPress={() => navigation.navigate('AcademicStructure')} delay={120} />
        <View style={styles.div} />
        <NavRow icon="school-outline" label="Promotion Management" desc="Year-end student promotions" color={colors.warning} onPress={() => navigation.navigate('PromotionManagement')} delay={160} />
        <View style={styles.div} />
        <NavRow icon="calendar-clock" label="Timetable" desc="Set weekly class schedules" color={colors.secondary} onPress={() => navigation.navigate('Timetable')} delay={200} />
        <View style={styles.div} />
        <NavRow icon="bulletin-board" label="Notice Board" desc="Post notices for parents and staff" color={colors.primary} onPress={() => navigation.navigate('NoticeBoard')} delay={240} />
      </Animated.View>

      {/* ── Staff management ── */}
      <SectionHeader title="Staff" icon="account-tie-outline" />
      <Animated.View
        entering={FadeInDown.delay(180).duration(320).springify()}
        style={styles.group}>
        <NavRow icon="account-tie-outline" label="Teachers" desc="Roster, assignments, subjects" color={colors.purple} onPress={() => navigation.navigate('TeacherManagement')} delay={0} />
        <View style={styles.div} />
        <NavRow icon="account-supervisor" label="Coordinators" desc="Wing supervisors" color={colors.secondary} onPress={() => navigation.navigate('CoordinatorManagement')} delay={40} />
        <View style={styles.div} />
        <NavRow icon="cash-register" label="Accountants" desc="Fee desk operators" color={colors.accent} onPress={() => navigation.navigate('AccountantManagement')} delay={80} />
        <View style={styles.div} />
        <NavRow icon="teach" label="Assign Class Teacher" desc="Assign teacher to section" color={colors.info} onPress={() => navigation.navigate('AssignClassTeacher')} delay={120} />
      </Animated.View>

    </ScrollView>

    <UserMenuDrawer
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      navigation={navigation}
      profileRoute="PrincipalProfile"
    />
    </>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, paddingBottom: spacing.xxxl + spacing.xl},
  // Header
  header: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor1: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 150,
    position: 'absolute',
    right: -20,
    top: -50,
    width: 150,
  },
  headerDecor2: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 60,
    bottom: -20,
    height: 100,
    left: -10,
    position: 'absolute',
    width: 100,
  },
  headerTop: {alignItems: 'center', flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md},
  logoutBtn: {alignItems: 'center', height: 36, justifyContent: 'center', width: 36},
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
  roleBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  roleDot: {backgroundColor: colors.success, borderRadius: radius.pill, height: 6, width: 6},
  roleText: {color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600'},
  headerDate: {...typography.captionBold, color: 'rgba(255,255,255,0.55)'},
  // KPI grid
  kpiGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xs},
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
  feeTop: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg},
  feeStat: {alignItems: 'center', gap: spacing.xs},
  feeVal: {fontSize: 13, fontWeight: '800', lineHeight: 18},
  feeLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  feeDiv: {backgroundColor: colors.border, width: 1},
  feeRateRow: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  feeRateLabel: {...typography.captionBold, color: colors.text},
  feeRatePct: {fontSize: 13, fontWeight: '800'},
  // Nav groups
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navIcon: {alignItems: 'center', borderRadius: radius.md, height: 40, justifyContent: 'center', width: 40},
  navCopy: {flex: 1, minWidth: 0},
  navLabel: {...typography.bodyBold, color: colors.text},
  navDesc: {...typography.caption, color: colors.textMuted, marginTop: 1},
  div: {backgroundColor: colors.border, height: 1, marginLeft: 72},
});

export default DashboardScreen;
