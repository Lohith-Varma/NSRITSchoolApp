import React from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, SkeletonLoader} from '../../components';
import attendanceService from '../../services/attendance/attendanceService';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const STATUS_META = {
  PRESENT: {color: colors.success, bg: colors.successSoft, icon: 'check-circle-outline'},
  ABSENT: {color: colors.danger, bg: colors.dangerSoft, icon: 'close-circle-outline'},
  HOLIDAY: {color: colors.textMuted, bg: colors.background, icon: 'calendar-remove-outline'},
};

const AttendanceRow = ({item, index, onPress}) => {
  const status = String(item.status || 'PRESENT').toUpperCase();
  const meta = STATUS_META[status] || STATUS_META.PRESENT;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 30).duration(220).springify()}>
      <Pressable
        onPress={() => onPress(item)}
        style={({pressed}) => [styles.row, pressed && {opacity: 0.85}]}>
        <View style={[styles.statusIcon, {backgroundColor: meta.bg}]}>
          <MaterialCommunityIcons name={meta.icon} size={18} color={meta.color} />
        </View>
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
      </Pressable>
    </Animated.View>
  );
};

const ViewAllAttendanceScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const {data: items = [], error, isLoading} = useQuery({
    queryKey: ['branchAttendance', user?.branchId],
    queryFn: () => attendanceService.getAttendance({branchId: user.branchId}),
    enabled: Boolean(user?.branchId),
  });

  const present = items.filter(i => String(i.status).toUpperCase() === 'PRESENT').length;
  const absent = items.filter(i => String(i.status).toUpperCase() === 'ABSENT').length;

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View
              entering={FadeInDown.duration(280).springify()}
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Principal</Text>
              <Text style={styles.headerTitle}>All Attendance</Text>
              <Text style={styles.headerSub}>
                {isLoading
                  ? 'Loading submitted records…'
                  : 'Review and correct teacher submissions'}
              </Text>
            </Animated.View>

            {error ? (
              <EmptyState title="Unable to load attendance" message={error.message} />
            ) : items.length > 0 ? (
              <Animated.View
                entering={FadeInDown.delay(60).duration(260).springify()}
                style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, {color: colors.success}]}>{present}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, {color: colors.danger}]}>{absent}</Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statSep} />
                <View style={styles.stat}>
                  <Text style={[styles.statValue, {color: colors.text}]}>{items.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </Animated.View>
            ) : null}
          </View>
        }
        renderItem={({item, index}) => (
          <AttendanceRow
            item={item}
            index={Math.min(index, 20)}
            onPress={() => navigation.navigate('EditAttendance')}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonLoader rows={5} />
          ) : error ? null : (
            <EmptyState
              title="No attendance submitted"
              message="Teacher submissions will appear here."
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
    backgroundColor: colors.primary,
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
  statusIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
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

export default ViewAllAttendanceScreen;
