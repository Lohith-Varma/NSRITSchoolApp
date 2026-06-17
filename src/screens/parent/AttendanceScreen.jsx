import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  AttendanceRing,
  CalendarAttendance,
  EmptyState,
  SelectField,
} from '../../components';
import {ATTENDANCE_STATUS} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import parentService from '../../services/parents/parentService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {normalizeAttendanceStatus} from '../../utils/helpers/attendanceHelpers';

const getMonthRange = date => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    fromDate: start.toISOString().slice(0, 10),
    toDate: end.toISOString().slice(0, 10),
  };
};

const MONTH_LABEL = date =>
  date.toLocaleDateString('en-IN', {month: 'long', year: 'numeric'});

const AttendanceScreen = ({route}) => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;
  const initialStudentId = route?.params?.studentId;
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '');
  const monthDate = useMemo(() => new Date(), []);

  const childrenQuery = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });

  const children = childrenQuery.data || [];
  const selectedChild =
    children.find(child => child.id === selectedStudentId) || children[0] || null;
  const resolvedStudentId = selectedChild?.id;

  const attendanceQuery = useQuery({
    queryKey: [
      'parentAttendance',
      parentId,
      resolvedStudentId,
      monthDate.getFullYear(),
      monthDate.getMonth(),
    ],
    queryFn: () =>
      attendanceService.getAttendance({
        studentId: resolvedStudentId,
        ...getMonthRange(monthDate),
      }),
    enabled: Boolean(resolvedStudentId),
  });

  const records = useMemo(() => attendanceQuery.data || [], [attendanceQuery.data]);

  const normalizedRecords = useMemo(
    () =>
      records.map(item => ({
        ...item,
        status: normalizeAttendanceStatus(item.status) || item.status,
      })),
    [records],
  );

  const attendanceMap = useMemo(
    () =>
      normalizedRecords.reduce(
        (acc, item) => ({...acc, [item.attendanceDate]: item.status}),
        {},
      ),
    [normalizedRecords],
  );

  const present = normalizedRecords.filter(
    item => item.status === ATTENDANCE_STATUS.PRESENT,
  ).length;
  const absent = normalizedRecords.filter(
    item => item.status === ATTENDANCE_STATUS.ABSENT,
  ).length;
  const total = present + absent;
  const pct = total ? Math.round((present / total) * 100) : 0;

  if (childrenQuery.error || attendanceQuery.error) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
        <EmptyState
          title="Unable to load attendance"
          message={childrenQuery.error?.message || attendanceQuery.error?.message}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>
      {/* ── Child selector ── */}
      {children.length > 1 ? (
        <SelectField
          label="Child"
          value={selectedChild?.id}
          options={children.map(child => ({
            label: `${child.fullName} (${child.academicClass?.name || '-'}-${child.section?.name || '-'})`,
            value: child.id,
          }))}
          onChange={setSelectedStudentId}
        />
      ) : null}

      {/* ── Attendance ring hero ── */}
      <Animated.View
        entering={FadeInDown.duration(300).springify()}
        style={styles.heroCard}>
        <View style={styles.heroDecor} />

        <View style={styles.heroTop}>
          <Text style={styles.heroChildName} numberOfLines={1}>
            {selectedChild?.fullName || 'Child'}
          </Text>
          <Text style={styles.heroChildMeta}>
            {selectedChild?.academicClass?.name || '-'}–
            {selectedChild?.section?.name || '-'} · {MONTH_LABEL(monthDate)}
          </Text>
        </View>

        <View style={styles.ringRow}>
          <AttendanceRing percentage={pct} size={100} strokeWidth={10}>
            <Text style={styles.ringPct}>{pct}%</Text>
            <Text style={styles.ringLabel}>Present</Text>
          </AttendanceRing>

          <View style={styles.statsCol}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, {backgroundColor: colors.success}]} />
              <View style={styles.statCopy}>
                <Text style={styles.statValue}>{present}</Text>
                <Text style={styles.statLabel}>Days Present</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statDot, {backgroundColor: colors.danger}]} />
              <View style={styles.statCopy}>
                <Text style={styles.statValue}>{absent}</Text>
                <Text style={styles.statLabel}>Days Absent</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statDot, {backgroundColor: colors.textSoft}]} />
              <View style={styles.statCopy}>
                <Text style={styles.statValue}>{total}</Text>
                <Text style={styles.statLabel}>Working Days</Text>
              </View>
            </View>
          </View>
        </View>

        {pct < 75 ? (
          <View style={styles.warningStrip}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={13}
              color={colors.warning}
            />
            <Text style={styles.warningText}>
              Below 75% attendance — academic eligibility may be affected
            </Text>
          </View>
        ) : null}
      </Animated.View>

      {/* ── Calendar ── */}
      <Animated.View entering={FadeInDown.delay(80).duration(280).springify()}>
        <CalendarAttendance monthDate={monthDate} records={attendanceMap} />
      </Animated.View>
      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.medium,
  },
  heroDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 140,
  },
  heroTop: {marginBottom: spacing.lg},
  heroChildName: {color: colors.white, fontSize: 17, fontWeight: '800'},
  heroChildMeta: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 2},

  ringRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xl,
  },
  ringPct: {color: colors.white, fontSize: 22, fontWeight: '800'},
  ringLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600'},

  statsCol: {flex: 1, gap: spacing.sm},
  statItem: {alignItems: 'center', flexDirection: 'row', gap: spacing.md},
  statDot: {borderRadius: radius.pill, height: 8, width: 8},
  statCopy: {gap: 1},
  statValue: {color: colors.white, fontSize: 16, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600'},
  statDivider: {backgroundColor: 'rgba(255,255,255,0.12)', height: 1},

  warningStrip: {
    alignItems: 'center',
    backgroundColor: `${colors.warning}25`,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  warningText: {
    color: colors.warning,
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
});

export default AttendanceScreen;
