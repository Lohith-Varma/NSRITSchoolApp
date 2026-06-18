import React, {useMemo, useState} from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInUp} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {AttendanceRing, CalendarAttendance, EmptyState, SelectField} from '../../components';
import {ATTENDANCE_STATUS} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import parentService from '../../services/parents/parentService';
import {colors, radius, shadows, spacing} from '../../theme';
import {normalizeAttendanceStatus} from '../../utils/helpers/attendanceHelpers';

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(2, '0');
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getMonthRange = date => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  return {
    fromDate: `${y}-${pad(m + 1)}-01`,
    toDate:   `${y}-${pad(m + 1)}-${pad(lastDay)}`,
  };
};

const getAcademicYearRange = baseDate => {
  const now = baseDate || new Date();
  const m = now.getMonth(); // 0-indexed
  // Academic year: April → March
  const startYear = m >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    fromDate: `${startYear}-04-01`,
    toDate:   `${startYear + 1}-03-31`,
    label:    `${startYear}–${startYear + 1}`,
  };
};

const summarise = records => {
  const present = records.filter(r => normalizeAttendanceStatus(r.status) === ATTENDANCE_STATUS.PRESENT).length;
  const absent  = records.filter(r => normalizeAttendanceStatus(r.status) === ATTENDANCE_STATUS.ABSENT).length;
  const total   = present + absent;
  return {present, absent, total, pct: total ? Math.round((present / total) * 100) : 0};
};

// Group records by month → {0: [...], 3: [...], ...}
const groupByMonth = records => {
  const map = {};
  for (const rec of records) {
    const month = new Date(rec.attendanceDate + 'T00:00:00').getMonth();
    if (!map[month]) map[month] = [];
    map[month].push(rec);
  }
  return map;
};

// Build ordered list of months in an academic year (Apr→Mar = 3,4,...,11,0,1,2)
const AY_MONTH_ORDER = [3,4,5,6,7,8,9,10,11,0,1,2];

// ── Sub-components ────────────────────────────────────────────────────────────
const MonthNavBar = ({date, onChange}) => {
  const prev = () => {
    const d = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    onChange(d);
  };
  const next = () => {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const today = new Date();
    if (d <= today) onChange(d);
  };
  const isCurrentMonth =
    date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();

  return (
    <View style={styles.monthNav}>
      <Pressable onPress={prev} hitSlop={10} style={styles.navBtn}>
        <MaterialCommunityIcons name="chevron-left" size={22} color={colors.primary} />
      </Pressable>
      <Text style={styles.monthNavLabel}>
        {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
      </Text>
      <Pressable onPress={next} hitSlop={10} style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]} disabled={isCurrentMonth}>
        <MaterialCommunityIcons name="chevron-right" size={22} color={isCurrentMonth ? colors.border : colors.primary} />
      </Pressable>
    </View>
  );
};

const StatChip = ({icon, label, value, color}) => (
  <View style={[styles.statChip, {borderColor: `${color}30`}]}>
    <MaterialCommunityIcons name={icon} size={14} color={color} />
    <Text style={[styles.statChipValue, {color}]}>{value}</Text>
    <Text style={styles.statChipLabel}>{label}</Text>
  </View>
);

const MonthlyBar = ({month, present, absent, total, pct, isCurrentMonth}) => {
  const barPct = total ? pct / 100 : 0;
  return (
    <View style={[styles.monthlyBarRow, isCurrentMonth && styles.monthlyBarRowActive]}>
      <Text style={[styles.monthlyBarLabel, isCurrentMonth && {color: colors.primary, fontWeight: '800'}]}>
        {SHORT_MONTH[month]}
      </Text>
      <View style={styles.monthlyBarTrack}>
        <View style={[styles.monthlyBarFill, {flex: barPct, backgroundColor: pct >= 75 ? colors.success : colors.danger}]} />
        <View style={{flex: 1 - barPct}} />
      </View>
      <Text style={[styles.monthlyBarPct, {color: pct >= 75 ? colors.success : pct > 0 ? colors.danger : colors.textSoft}]}>
        {total > 0 ? `${pct}%` : '—'}
      </Text>
    </View>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const VIEW_MONTH = 'month';
const VIEW_YEAR  = 'year';

const AttendanceScreen = ({route}) => {
  const user = useSelector(s => s.auth.user);
  const parentId = user?.parentId;
  const initialStudentId = route?.params?.studentId;

  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '');
  const [viewMode, setViewMode] = useState(VIEW_MONTH);
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const ayRange = useMemo(() => getAcademicYearRange(), []);

  // ── Children ──
  const childrenQuery = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });
  const children = childrenQuery.data || [];
  const selectedChild = children.find(c => c.id === selectedStudentId) || children[0] || null;
  const resolvedStudentId = selectedChild?.id;

  // ── Month attendance ──
  const monthRange = useMemo(() => getMonthRange(monthDate), [monthDate]);
  const monthQuery = useQuery({
    queryKey: ['parentAttendance', resolvedStudentId, monthDate.getFullYear(), monthDate.getMonth()],
    queryFn: () => attendanceService.getAttendance({studentId: resolvedStudentId, ...monthRange}),
    enabled: Boolean(resolvedStudentId) && viewMode === VIEW_MONTH,
    staleTime: 5 * 60 * 1000,
  });

  // ── Academic year attendance ──
  const yearQuery = useQuery({
    queryKey: ['parentAttendanceYear', resolvedStudentId, ayRange.label],
    queryFn: () => attendanceService.getAttendance({studentId: resolvedStudentId, fromDate: ayRange.fromDate, toDate: ayRange.toDate}),
    enabled: Boolean(resolvedStudentId) && viewMode === VIEW_YEAR,
    staleTime: 5 * 60 * 1000,
  });

  const isRefreshing = viewMode === VIEW_MONTH ? monthQuery.isFetching : yearQuery.isFetching;
  const onRefresh = () => {
    if (viewMode === VIEW_MONTH) monthQuery.refetch();
    else yearQuery.refetch();
  };

  // ── Derived data ──
  const monthRecords = useMemo(() => (monthQuery.data || []).map(r => ({...r, status: normalizeAttendanceStatus(r.status) || r.status})), [monthQuery.data]);
  const yearRecords  = useMemo(() => (yearQuery.data  || []).map(r => ({...r, status: normalizeAttendanceStatus(r.status) || r.status})), [yearQuery.data]);

  const displayRecords = viewMode === VIEW_MONTH ? monthRecords : yearRecords;
  const stats = useMemo(() => summarise(displayRecords), [displayRecords]);

  const attendanceMap = useMemo(() =>
    monthRecords.reduce((acc, r) => ({...acc, [r.attendanceDate]: r.status}), {}),
  [monthRecords]);

  // Monthly breakdown for year view
  const monthlyData = useMemo(() => {
    if (viewMode !== VIEW_YEAR) return null;
    const grouped = groupByMonth(yearRecords);
    return AY_MONTH_ORDER.map(m => ({month: m, ...summarise(grouped[m] || [])}));
  }, [viewMode, yearRecords]);

  const hasError = childrenQuery.isError || monthQuery.isError || yearQuery.isError;

  if (hasError) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <EmptyState title="Unable to load attendance" message="Pull down to retry" />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />}>

      {/* ── Child selector ── */}
      {children.length > 1 && (
        <SelectField
          label="Child"
          value={selectedChild?.id}
          options={children.map(c => ({
            label: `${c.fullName} (${c.academicClass?.name || '-'}–${c.section?.name || '-'})`,
            value: c.id,
          }))}
          onChange={setSelectedStudentId}
        />
      )}

      {/* ── View mode tabs ── */}
      <Animated.View entering={FadeInDown.duration(240)} style={styles.tabRow}>
        <Pressable
          onPress={() => setViewMode(VIEW_MONTH)}
          style={[styles.tab, viewMode === VIEW_MONTH && styles.tabActive]}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={14}
            color={viewMode === VIEW_MONTH ? colors.white : colors.textMuted}
          />
          <Text style={[styles.tabText, viewMode === VIEW_MONTH && styles.tabTextActive]}>Month</Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode(VIEW_YEAR)}
          style={[styles.tab, viewMode === VIEW_YEAR && styles.tabActive]}>
          <MaterialCommunityIcons
            name="calendar-range-outline"
            size={14}
            color={viewMode === VIEW_YEAR ? colors.white : colors.textMuted}
          />
          <Text style={[styles.tabText, viewMode === VIEW_YEAR && styles.tabTextActive]}>Academic Year</Text>
        </Pressable>
      </Animated.View>

      {/* ── Month nav (month mode only) ── */}
      {viewMode === VIEW_MONTH && (
        <Animated.View entering={FadeInDown.duration(220)}>
          <MonthNavBar date={monthDate} onChange={setMonthDate} />
        </Animated.View>
      )}

      {/* ── Hero card ── */}
      <Animated.View entering={FadeInDown.delay(40).duration(300).springify()} style={styles.heroCard}>
        <View style={styles.heroDecor} />
        <View style={styles.heroDecor2} />

        <View style={styles.heroTop}>
          <Text style={styles.heroChildName} numberOfLines={1}>{selectedChild?.fullName || 'Child'}</Text>
          <Text style={styles.heroChildMeta}>
            {viewMode === VIEW_MONTH
              ? `${selectedChild?.academicClass?.name || '-'}–${selectedChild?.section?.name || '-'} · ${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`
              : `${selectedChild?.academicClass?.name || '-'}–${selectedChild?.section?.name || '-'} · AY ${ayRange.label}`}
          </Text>
        </View>

        <View style={styles.ringRow}>
          <AttendanceRing percentage={stats.pct} size={100} strokeWidth={10}>
            <Text style={styles.ringPct}>{stats.pct}%</Text>
            <Text style={styles.ringLabel}>Present</Text>
          </AttendanceRing>

          <View style={styles.statsCol}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, {backgroundColor: '#4ADE80'}]} />
              <View>
                <Text style={styles.statValue}>{stats.present}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statDot, {backgroundColor: colors.danger}]} />
              <View>
                <Text style={styles.statValue}>{stats.absent}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statDot, {backgroundColor: 'rgba(255,255,255,0.4)'}]} />
              <View>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Working Days</Text>
              </View>
            </View>
          </View>
        </View>

        {stats.pct < 75 && stats.total > 0 && (
          <View style={styles.warningStrip}>
            <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#FCD34D" />
            <Text style={styles.warningText}>
              Below 75% — academic eligibility at risk
            </Text>
          </View>
        )}
        {stats.pct >= 75 && stats.total > 0 && (
          <View style={styles.okStrip}>
            <MaterialCommunityIcons name="check-circle-outline" size={13} color="#4ADE80" />
            <Text style={styles.okText}>Attendance is satisfactory</Text>
          </View>
        )}
      </Animated.View>

      {/* ── Summary chips ── */}
      <Animated.View entering={FadeInDown.delay(80).duration(250)} style={styles.chipRow}>
        <StatChip icon="check-circle-outline" label="Present" value={stats.present} color={colors.success} />
        <StatChip icon="close-circle-outline" label="Absent"  value={stats.absent}  color={colors.danger} />
        <StatChip icon="calendar-blank-outline" label="Total" value={stats.total}   color={colors.primary} />
      </Animated.View>

      {/* ── Month view: calendar ── */}
      {viewMode === VIEW_MONTH && (
        <Animated.View entering={FadeInDown.delay(120).duration(280).springify()}>
          <CalendarAttendance monthDate={monthDate} records={attendanceMap} />
        </Animated.View>
      )}

      {/* ── Year view: monthly breakdown ── */}
      {viewMode === VIEW_YEAR && monthlyData && (
        <Animated.View entering={FadeInUp.delay(100).duration(280)} style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Monthly Breakdown — AY {ayRange.label}</Text>
          <Text style={styles.breakdownSub}>Academic year runs April to March</Text>
          <View style={styles.breakdownDivider} />
          {monthlyData.map(({month, present, absent, total, pct}) => {
            const isCur = month === new Date().getMonth() && new Date().getFullYear() === (month >= 3 ? parseInt(ayRange.label) : parseInt(ayRange.label) + 1);
            return (
              <MonthlyBar
                key={month}
                month={month}
                present={present}
                absent={absent}
                total={total}
                pct={pct}
                isCurrentMonth={isCur}
              />
            );
          })}
        </Animated.View>
      )}

      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},

  // Tabs
  tabRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: 3,
  },
  tab: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabActive: {backgroundColor: colors.primary},
  tabText: {color: colors.textMuted, fontSize: 12, fontWeight: '700'},
  tabTextActive: {color: colors.white},

  // Month nav
  monthNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  navBtn: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  navBtnDisabled: {backgroundColor: colors.background},
  monthNavLabel: {color: colors.text, fontSize: 15, fontWeight: '800'},

  // Hero card
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.medium,
  },
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 140,
  },
  heroDecor2: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 60,
    bottom: -30,
    height: 100,
    left: -10,
    position: 'absolute',
    width: 100,
  },
  heroTop: {marginBottom: spacing.md},
  heroChildName: {color: colors.white, fontSize: 17, fontWeight: '800'},
  heroChildMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 2},
  ringRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.xl},
  ringPct: {color: colors.white, fontSize: 22, fontWeight: '800'},
  ringLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600'},
  statsCol: {flex: 1, gap: spacing.sm},
  statItem: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  statDot: {borderRadius: radius.pill, height: 8, width: 8},
  statValue: {color: colors.white, fontSize: 16, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600'},
  statDivider: {backgroundColor: 'rgba(255,255,255,0.12)', height: 1},

  warningStrip: {
    alignItems: 'center',
    backgroundColor: 'rgba(252,211,77,0.15)',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  warningText: {color: '#FCD34D', flex: 1, fontSize: 11, fontWeight: '600'},
  okStrip: {
    alignItems: 'center',
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  okText: {color: '#4ADE80', fontSize: 11, fontWeight: '600'},

  // Stat chips
  chipRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md},
  statChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    paddingVertical: spacing.sm,
  },
  statChipValue: {fontSize: 18, fontWeight: '800'},
  statChipLabel: {color: colors.textSoft, fontSize: 9, fontWeight: '700', letterSpacing: 0.3},

  // Monthly breakdown
  breakdownCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.soft,
  },
  breakdownTitle: {color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 2},
  breakdownSub: {color: colors.textSoft, fontSize: 11, fontWeight: '500'},
  breakdownDivider: {backgroundColor: colors.border, height: 1, marginVertical: spacing.md},

  monthlyBarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  monthlyBarRowActive: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: radius.md,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  monthlyBarLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '700', width: 30},
  monthlyBarTrack: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    flex: 1,
    flexDirection: 'row',
    height: 6,
    overflow: 'hidden',
  },
  monthlyBarFill: {borderRadius: radius.pill},
  monthlyBarPct: {fontSize: 11, fontWeight: '800', textAlign: 'right', width: 36},
});

export default AttendanceScreen;
