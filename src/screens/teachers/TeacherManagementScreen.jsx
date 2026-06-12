import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header} from '../../components';
import {WING_LABELS} from '../../config/academic';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing} from '../../theme';

const TeacherManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);

  const {data = [], isLoading} = useQuery({
    queryKey: ['teachers', user?.branchId, user?.wing || 'ALL', 0],
    queryFn: () =>
      teacherService.getTeachers(
        {
          branchId: user.branchId,
          wing: user.role === 'COORDINATOR' ? user.wing : undefined,
          limit: 50,
          offset: 0,
        },
        scope,
      ),
    enabled: Boolean(user?.branchId),
  });

  const teachers = useMemo(() => data, [data]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header
          title="Teachers"
          subtitle="Staff profiles, subjects, and class teacher assignments"
          actionLabel="Create"
          onAction={() => navigation.navigate('CreateTeacher')}
        />
      </View>
      <FlatList
        data={teachers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? 'Loading teachers' : 'No teachers'}
            message="Teacher records created from Firebase Auth and Data Connect will appear here."
          />
        }
        renderItem={({item}) => (
          <DashboardCard
            title={item.fullName || item.user?.fullName || 'Teacher'}
            value={item.employeeId || '-'}
            description={`${WING_LABELS[item.wing] || item.wing} | ${item.designation || 'Teacher'}`}
            icon="account-tie-outline"
            onPress={() => navigation.navigate('TeacherDetails', {teacherId: item.id})}
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

export default TeacherManagementScreen;
