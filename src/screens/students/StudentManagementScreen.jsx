import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header} from '../../components';
import {USER_ROLES} from '../../config/constants';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing} from '../../theme';

const StudentManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const [offset] = useState(0);

  const studentsQuery = useQuery({
    queryKey: ['students', user?.branchId, user?.wing || 'ALL', offset],
    queryFn: () =>
      user?.role === USER_ROLES.COORDINATOR
        ? studentService.getStudentsByWing({branchId: user.branchId, wing: user.wing, offset}, scope)
        : studentService.getStudents({branchId: user.branchId, offset}, scope),
    enabled: Boolean(user?.branchId || user?.role === USER_ROLES.MAIN_ADMIN),
  });

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header
          title="Students"
          subtitle="Admissions, profiles, status, and section transfers"
          actionLabel="Add"
          onAction={() => navigation.navigate('AddStudent')}
        />
        <DashboardCard title="Search" value="Find" icon="account-search-outline" onPress={() => navigation.navigate('StudentSearch')} />
        <DashboardCard title="Bulk Import" value="CSV" icon="file-upload-outline" onPress={() => navigation.navigate('BulkStudentImport')} />
        <DashboardCard title="Transfer" value="Move" icon="swap-horizontal" onPress={() => navigation.navigate('TransferStudent')} />
      </View>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title={studentsQuery.isLoading ? 'Loading students' : 'No students'} message={studentsQuery.error?.message || 'Admissions will appear here.'} />}
        renderItem={({item}) => (
          <DashboardCard
            title={item.fullName}
            value={item.studentId}
            description={`${item.academicClass?.name || ''}-${item.section?.name || ''} | ${item.status || 'ACTIVE'}`}
            icon="account-school-outline"
            onPress={() => navigation.navigate('StudentDetails', {studentId: item.id})}
          />
        )}
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

export default StudentManagementScreen;
