import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {DashboardCard, EmptyState, Header, SearchBar} from '../../components';
import attendanceService from '../../services/attendance/attendanceService';
import {colors, spacing} from '../../theme';
import {useQuery} from '@tanstack/react-query';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Wing Attendance" subtitle={isLoading ? 'Loading submitted records' : user?.wing} />
        <DashboardCard title="Present" value={String(summary.present)} icon="clipboard-check-outline" />
        <DashboardCard title="Absent" value={String(summary.absent)} icon="clipboard-alert-outline" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search submitted attendance" />
      </View>
      <FlatList
        data={wingRecords}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <DashboardCard
            title={item.student?.fullName || item.studentId}
            value={item.status}
            description={`${item.academicClass?.name || '-'}-${item.section?.name || '-'} | ${item.attendanceDate}`}
            icon="clipboard-text-outline"
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={error ? 'Unable to load attendance' : 'No attendance records'}
            message={error?.message || 'Submitted wing attendance will appear here.'}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
});

export default WingAttendanceScreen;
