import React, {useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {EmptyState} from '../../components';
import {fetchAttendance} from '../../store/slices/attendanceSlice';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AttendanceBatch = ({item, index}) => (
  <Animated.View
    entering={FadeInRight.delay(index * 35).duration(230).springify()}
    style={styles.batchCard}>
    <View style={styles.batchLeft}>
      <View style={styles.batchIcon}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={colors.purple} />
      </View>
      <View style={styles.batchInfo}>
        <Text style={styles.batchTitle} numberOfLines={1}>
          {item.classId || '—'} / {item.sectionId || '—'}
        </Text>
        <Text style={styles.batchDate}>{item.date || '—'}</Text>
      </View>
    </View>
    <View style={styles.batchCount}>
      <Text style={styles.batchCountValue}>{item.records?.length || 0}</Text>
      <Text style={styles.batchCountLabel}>students</Text>
    </View>
  </Animated.View>
);

const AttendanceOverviewScreen = () => {
  const dispatch = useDispatch();
  const {items} = useSelector(state => state.attendance);

  useEffect(() => {
    dispatch(fetchAttendance({}));
  }, [dispatch]);

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id || `attendance-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View
            entering={FadeInDown.duration(280).springify()}
            style={styles.header}>
            <View style={styles.headerDecor} />
            <Text style={styles.headerOverline}>Branch Admin</Text>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Attendance Overview</Text>
              {items.length > 0 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{items.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.headerSub}>Branch-wide attendance submissions</Text>
          </Animated.View>
        }
        renderItem={({item, index}) => (
          <AttendanceBatch item={item} index={Math.min(index, 15)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No attendance records"
            message="Attendance entries will appear after teachers submit them."
          />
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
    backgroundColor: colors.purple,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.07)',
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
  headerRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm},
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800'},
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  countBadgeText: {color: colors.white, fontSize: 12, fontWeight: '800'},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 4},

  batchCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.soft,
  },
  batchLeft: {alignItems: 'center', flex: 1, flexDirection: 'row', gap: spacing.md},
  batchIcon: {
    alignItems: 'center',
    backgroundColor: `${colors.purple}15`,
    borderRadius: radius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  batchInfo: {flex: 1},
  batchTitle: {...typography.bodyBold, color: colors.text},
  batchDate: {color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2},
  batchCount: {alignItems: 'center'},
  batchCountValue: {color: colors.purple, fontSize: 18, fontWeight: '800'},
  batchCountLabel: {color: colors.textMuted, fontSize: 10, fontWeight: '600'},
});

export default AttendanceOverviewScreen;
