import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SearchBar, SkeletonLoader} from '../../components';
import attendanceService from '../../services/attendance/attendanceService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const STATUS_META = {
  PRESENT: {color: colors.success, bg: colors.successSoft},
  ABSENT: {color: colors.danger, bg: colors.dangerSoft},
};

const AttendanceRow = ({item, index}) => {
  const status = String(item.status || 'PRESENT').toUpperCase();
  const meta = STATUS_META[status] || STATUS_META.PRESENT;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 25).duration(200).springify()}
      style={styles.row}>
      <View style={[styles.statusDot, {backgroundColor: meta.color}]} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.student?.fullName || item.studentId || 'Student'}
        </Text>
        <Text style={styles.rowMeta}>
          {item.academicClass?.name || '—'}–{item.section?.name || '—'} ·{' '}
          {item.attendanceDate || '—'}
        </Text>
      </View>
      <View style={[styles.statusBadge, {backgroundColor: meta.bg}]}>
        <Text style={[styles.statusText, {color: meta.color}]}>{status}</Text>
      </View>
    </Animated.View>
  );
};

const WingAttendanceScreen = () => {
  const user = useSelector(state => state.auth.user);
  const [query, setQuery] = useState('');

  const {data: records = [], error, isLoading} = useQuery({
    queryKey: ['branchAttendance', user?.branchId, user?.wing],
    queryFn: () => attendanceService.getAttendance({branchId: user.branchId}),
    enabled: Boolean(user?.branchId && user?.wing),
  });

  const wingRecords = useMemo(
    () =>
      records.filter(item => {
        const inWing = item.academicClass?.wing?.code === user?.wing;
        const searchText = `${item.student?.fullName || ''} ${item.student?.studentId || ''} ${item.academicClass?.name || ''}-${item.section?.name || ''}`.toLowerCase();
        return inWing && (!query.trim() || searchText.includes(query.toLowerCase()));
      }),
    [query, records, user?.wing],
  );

  const summary = attendanceService.getAttendanceSummary(wingRecords);

  return (
    <View style={styles.root}>
      <FlatList
        data={wingRecords}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <Animated.View
              entering={FadeInDown.duration(280).springify()}
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>
                Coordinator · {user?.wing || 'Wing'}
              </Text>
              <Text style={styles.headerTitle}>Wing Attendance</Text>
              <Text style={styles.headerSub}>
                {isLoading
                  ? 'Loading submitted records…'
                  : 'Submitted attendance for your wing'}
              </Text>
            </Animated.View>

            {/* ── Stats ── */}
            {!isLoading && wingRecords.length > 0 ? (
              <Animated.View
                entering={FadeInDown.delay(60).duration(260).springify()}
                style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, {color: colors.success}]}>
                    {summary.present || 0}
                  </Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, {color: colors.danger}]}>
                    {summary.absent || 0}
                  </Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, {color: colors.text}]}>
                    {wingRecords.length}
                  </Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </Animated.View>
            ) : null}

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search student, class, or section"
            />

            {wingRecords.length > 0 && !isLoading ? (
              <Text style={styles.resultMeta}>
                {wingRecords.length} record{wingRecords.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <AttendanceRow item={item} index={Math.min(index, 20)} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={5} />
          ) : (
            <EmptyState
              title={error ? 'Unable to load attendance' : 'No attendance records'}
              message={
                error?.message ||
                (query.trim()
                  ? 'No records match your search.'
                  : 'Submitted wing attendance will appear here.')
              }
            />
          )
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg},

  header: {
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130,
  },
  headerOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  statsRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
    ...shadows.soft,
  },
  stat: {alignItems: 'center', gap: 3},
  statValue: {fontSize: 22, fontWeight: '800'},
  statLabel: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  statSep: {backgroundColor: colors.border, width: 1},

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },

  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
    padding: spacing.md,
    ...shadows.soft,
  },
  statusDot: {borderRadius: radius.pill, height: 10, width: 10},
  rowInfo: {flex: 1, minWidth: 0},
  rowName: {...typography.bodyBold, color: colors.text},
  rowMeta: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  statusBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusText: {fontSize: 10, fontWeight: '800'},
});

export default WingAttendanceScreen;
