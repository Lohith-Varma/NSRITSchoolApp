import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  CustomButton,
  EmptyState,
  SearchBar,
  SectionHeader,
  StudentListItem,
} from '../../components';
import {ATTENDANCE_STATUS, USER_ROLES} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing} from '../../theme';

const EditAttendanceScreen = () => {
  const user = useSelector(state => state.auth.user);
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState('');
  const scope = useMemo(() => getAccessScope(user), [user]);
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['editableAttendance', scope.branchId],
    queryFn: () => attendanceService.getAttendance({branchId: scope.branchId, limit: 1000}),
    enabled: Boolean(scope.branchId),
  });

  const records = useMemo(() => {
    const allRecords = attendanceQuery.data || [];
    const scopedRecords =
      scope.role === USER_ROLES.COORDINATOR && scope.wing
        ? allRecords.filter(record => record.academicClass?.wing?.code === scope.wing)
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
        (acc, record) => ({...acc, [record.id]: record.status || ATTENDANCE_STATUS.PRESENT}),
        {},
      ),
    );
  }, [attendanceQuery.data]);

  const handleSearch = async value => {
    setQuery(value);
    setError('');
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const changedRecords = records.filter(record => statuses[record.id] && statuses[record.id] !== record.status);
      if (!changedRecords.length) {
        throw new Error('Change at least one attendance record before saving.');
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

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <SectionHeader
              title="Correct Attendance"
              subtitle="Submitted records only"
            />
            <SearchBar
              value={query}
              onChangeText={handleSearch}
              placeholder="Search attendance record"
            />
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
            message={attendanceQuery.error?.message || 'Submitted attendance records will appear here.'}
          />
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />
      <View style={styles.stickyFooter}>
        <HelperText type="error" visible={Boolean(error)}>
          {error}
        </HelperText>
        <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate()}>
          Save Corrections
        </CustomButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 148,
  },
  footerSpacer: {
    height: spacing.md,
  },
  stickyFooter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
});

export default EditAttendanceScreen;
