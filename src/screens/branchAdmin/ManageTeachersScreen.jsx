import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {DashboardCard, EmptyState, Header} from '../../components';
import {WING_LABELS} from '../../config/academic';
import {getAccessScope} from '../../services/rbacScope';
import teacherService from '../../services/teachers/teacherService';
import {colors, spacing, typography} from '../../theme';

const ManageTeachersScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = useMemo(() => getAccessScope(user), [user]);

  const teachersQuery = useQuery({
    queryKey: ['teachers', scope?.branchId, 'VIEW_ONLY'],
    queryFn: () => teacherService.getTeachersByBranch(scope.branchId, scope),
    enabled: Boolean(scope?.branchId),
  });

  const teachers = teachersQuery.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Teachers" subtitle="View-only branch teacher records" />
        <DashboardCard
          title="Teacher Records"
          value={String(teachers.length)}
          description="Principal and coordinators manage teacher changes."
          icon="account-tie-outline"
        />
      </View>
      <FlatList
        data={teachers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={teachersQuery.isFetching}
        renderItem={({item}) => (
          <View style={styles.teacherRow}>
            <View>
              <Text style={styles.teacherName}>{item.fullName || item.user?.fullName}</Text>
              <Text style={styles.teacherMeta}>
                {WING_LABELS[item.wing] || item.wing} | {item.designation || '-'}
              </Text>
            </View>
            <Text style={styles.employeeId}>{item.employeeId || '-'}</Text>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="No teachers" message="Teacher records will appear here." />}
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
  teacherRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  teacherName: {
    ...typography.subtitle,
    color: colors.text,
  },
  teacherMeta: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  employeeId: {
    color: colors.secondary,
    fontWeight: '700',
  },
});

export default ManageTeachersScreen;
