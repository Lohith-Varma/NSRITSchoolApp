import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {
  AnimatedMetric,
  AnimatedProgressBar,
  SectionHeader,
  StatCard,
} from '../../components';
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
    queryKey: ['coordinatorFeeDashboard', access.branchId, access.wing],
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

  const wingName = user?.wing || user?.wingName || 'Wing';

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
        <View style={styles.headerDecor1} />
        <View style={styles.headerDecor2} />
        <View style={styles.headerTop}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons name="account-supervisor" size={24} color={colors.white} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name || 'Coordinator'}
            </Text>
          </View>
          <Pressable onPress={() => setMenuOpen(true)} style={styles.logoutBtn} hitSlop={6}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>
        {/* Wing badge */}
        <View style={styles.wingBadge}>
          <MaterialCommunityIcons name="view-module-outline" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={styles.wingText}>{wingName} Coordinator</Text>
        </View>
      </Animated.View>

      {/* ── Wing KPI ── */}
      <SectionHeader title="Wing Overview" icon="view-module-outline" />
      <View style={styles.kpiGrid}>
        <StatCard
          title="Wing Students"
          value={String(summary.studentsWithFeePlans || 0)}
          icon="account-school-outline"
          tone={colors.primary}
          onPress={() => navigation.navigate('WingStudents')}
        />
        <StatCard
          title="Fee Collected"
          value={formatCurrency(summary.paidAmount || 0)}
          icon="cash-check"
          tone={colors.success}
        />
        <StatCard
          title="Fee Pending"
          value={formatCurrency(summary.dueAmount || 0)}
          icon="cash-clock"
          tone={colors.danger}
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          icon="chart-line"
          tone={collectionRate >= 70 ? colors.success : colors.warning}
        />
      </View>

      {/* ── Collection progress ── */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(320).springify()}
        style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Wing Fee Collection</Text>
          <Text style={[styles.progressPct, {color: collectionRate >= 70 ? colors.success : colors.warning}]}>
            {collectionRate}%
          </Text>
        </View>
        <AnimatedProgressBar
          progress={collectionRate}
          color={collectionRate >= 70 ? colors.success : colors.warning}
          trackColor={colors.border}
          height={7}
        />
        <Text style={styles.progressMeta}>
          {formatCurrency(summary.paidAmount || 0)} of {formatCurrency(summary.totalFee || 0)} collected
        </Text>
      </Animated.View>

      {/* ── Primary workflows ── */}
      <SectionHeader title="Wing Operations" icon="lightning-bolt" />
      <Animated.View
        entering={FadeInDown.delay(120).duration(320).springify()}
        style={styles.group}>
        <NavRow
          icon="clipboard-check-outline"
          label="Wing Attendance"
          desc="View and mark wing attendance"
          color={colors.primary}
          onPress={() => navigation.navigate('WingAttendance')}
          delay={0}
        />
        <View style={styles.div} />
        <NavRow
          icon="playlist-edit"
          label="Correct Attendance"
          desc="Edit past attendance records"
          color={colors.warning}
          onPress={() => navigation.navigate('EditAttendance')}
          delay={40}
        />
        <View style={styles.div} />
        <NavRow
          icon="account-school-outline"
          label="Wing Students"
          desc="View students in this wing"
          color={colors.secondary}
          onPress={() => navigation.navigate('WingStudents')}
          delay={80}
        />
        <View style={styles.div} />
        <NavRow
          icon="account-switch-outline"
          label="Assign Teachers"
          desc="Assign teachers to sections"
          color={colors.info}
          onPress={() => navigation.navigate('AssignTeachers')}
          delay={120}
        />
      </Animated.View>

      <SectionHeader title="Management" icon="cog-outline" />
      <Animated.View
        entering={FadeInDown.delay(160).duration(320).springify()}
        style={styles.group}>
        <NavRow
          icon="account-plus-outline"
          label="Add Student"
          desc="Enrol a new student"
          color={colors.success}
          onPress={() => navigation.navigate('AddStudent')}
          delay={0}
        />
        <View style={styles.div} />
        <NavRow
          icon="account-school"
          label="Student Management"
          desc="Full student roster"
          color={colors.primary}
          onPress={() => navigation.navigate('StudentManagement')}
          delay={40}
        />
        <View style={styles.div} />
        <NavRow
          icon="account-tie-outline"
          label="Teacher Management"
          desc="Teacher roster and assignments"
          color={colors.purple}
          onPress={() => navigation.navigate('TeacherManagement')}
          delay={80}
        />
        <View style={styles.div} />
        <NavRow
          icon="finance"
          label="Wing Fees"
          desc="Fee collection desk"
          color={colors.accent}
          onPress={() => navigation.navigate('FeeDashboard')}
          delay={120}
        />
        <View style={styles.div} />
        <NavRow
          icon="bulletin-board"
          label="Post Notice"
          desc="Publish announcements for parents"
          color={colors.primary}
          onPress={() => navigation.navigate('PostNotice')}
          delay={160}
        />
        <View style={styles.div} />
        <NavRow
          icon="bell-ring-outline"
          label="View Notices"
          desc="All school announcements"
          color={colors.info}
          onPress={() => navigation.navigate('NoticeBoard')}
          delay={200}
        />
      </Animated.View>

    </ScrollView>

    <UserMenuDrawer
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      navigation={navigation}
      profileRoute="CoordinatorProfile"
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
    backgroundColor: colors.info,
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
    height: 90,
    left: -10,
    position: 'absolute',
    width: 90,
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
  wingBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  wingText: {color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600'},
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
  progressMeta: {...typography.caption, color: colors.textMuted, marginTop: spacing.sm},
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
