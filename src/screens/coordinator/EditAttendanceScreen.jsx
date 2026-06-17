import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {EmptyState, SearchBar, StudentListItem} from '../../components';
import {ATTENDANCE_STATUS, USER_ROLES} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const EditAttendanceScreen = () => {
  const user = useSelector(state => state.auth.user);
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState('');
  const scope = useMemo(() => getAccessScope(user), [user]);
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['editableAttendance', scope.branchId],
    queryFn: () =>
      attendanceService.getAttendance({branchId: scope.branchId, limit: 1000}),
    enabled: Boolean(scope.branchId),
  });

  const records = useMemo(() => {
    const allRecords = attendanceQuery.data || [];
    const scopedRecords =
      scope.role === USER_ROLES.COORDINATOR && scope.wing
        ? allRecords.filter(
            record => record.academicClass?.wing?.code === scope.wing,
          )
        : allRecords;
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return scopedRecords;
    }
    return scopedRecords.filter(record =>
      [
        record.student?.fullName,
        record.student?.studentId,
        record.academicClass?.name,
        record.section?.name,
        record.attendanceDate,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [attendanceQuery.data, query, scope.role, scope.wing]);

  useEffect(() => {
    setStatuses(
      (attendanceQuery.data || []).reduce(
        (acc, record) => ({
          ...acc,
          [record.id]: record.status || ATTENDANCE_STATUS.PRESENT,
        }),
        {},
      ),
    );
  }, [attendanceQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const changedRecords = records.filter(
        record =>
          statuses[record.id] && statuses[record.id] !== record.status,
      );
      if (!changedRecords.length) {
        throw new Error('Change at least one record before saving.');
      }
      return Promise.all(
        changedRecords.map(record =>
          attendanceService.correctAttendance({
            attendanceId: record.id,
            actorRole: scope.role,
            scope,
            records: [
              {
                studentId: record.studentId,
                status: statuses[record.id],
                editedById: user.id,
                wingId: record.academicClass?.wing?.id,
                remarks: record.remarks || null,
              },
            ],
          }),
        ),
      );
    },
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({queryKey: ['editableAttendance', scope.branchId]});
      queryClient.invalidateQueries({queryKey: ['branchAttendance']});
    },
    onError: saveError => setError(saveError.message),
  });

  const changedCount = records.filter(
    r => statuses[r.id] && statuses[r.id] !== r.status,
  ).length;

  return (
    <View style={styles.root}>
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Animated.View
              entering={FadeInDown.duration(280).springify()}
              style={styles.header}>
              <View style={styles.headerDecor} />
              <Text style={styles.headerOverline}>Coordinator</Text>
              <Text style={styles.headerTitle}>Correct Attendance</Text>
              <Text style={styles.headerSub}>Toggle status on submitted records</Text>
            </Animated.View>
            <SearchBar
              value={query}
              onChangeText={v => {
                setQuery(v);
                setError('');
              }}
              placeholder="Search student, class, or date"
            />
            {records.length > 0 ? (
              <Text style={styles.resultMeta}>
                {records.length} record{records.length !== 1 ? 's' : ''}
                {changedCount > 0 ? ` · ${changedCount} changed` : ''}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({item}) => (
          <StudentListItem
            student={{
              id: item.id,
              name: item.student?.fullName,
              rollNo: item.student?.studentId,
              section: `${item.academicClass?.name || '-'}-${item.section?.name || '-'} | ${item.attendanceDate}`,
            }}
            checked={statuses[item.id] === ATTENDANCE_STATUS.PRESENT}
            status={statuses[item.id]}
            onToggle={() =>
              setStatuses(current => ({
                ...current,
                [item.id]:
                  current[item.id] === ATTENDANCE_STATUS.PRESENT
                    ? ATTENDANCE_STATUS.ABSENT
                    : ATTENDANCE_STATUS.PRESENT,
              }))
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={attendanceQuery.isLoading ? 'Loading records' : 'No records'}
            message={
              attendanceQuery.error?.message ||
              'Submitted attendance records will appear here.'
            }
          />
        }
        ListFooterComponent={<View style={{height: 120}} />}
      />

      {/* ── Sticky footer ── */}
      <View style={styles.footer}>
        {error ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={13}
              color={colors.danger}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
          style={({pressed}) => [
            styles.saveBtn,
            mutation.isPending && styles.saveBtnDisabled,
            pressed && !mutation.isPending && {opacity: 0.88},
          ]}>
          {mutation.isPending ? (
            <Text style={styles.saveBtnText}>Saving…</Text>
          ) : (
            <>
              <MaterialCommunityIcons
                name="content-save-outline"
                size={18}
                color={colors.white}
              />
              <Text style={styles.saveBtnText}>
                Save Corrections
                {changedCount > 0 ? ` (${changedCount})` : ''}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

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
    height: 120,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 120,
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

  resultMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },

  footer: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
    ...shadows.medium,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  saveBtnDisabled: {opacity: 0.55},
  saveBtnText: {color: colors.white, fontSize: 14, fontWeight: '700'},
});

export default EditAttendanceScreen;
