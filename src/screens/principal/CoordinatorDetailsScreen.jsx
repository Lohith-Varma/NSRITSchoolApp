import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {StyleSheet, View} from 'react-native';
import {DashboardCard, EmptyState, Header, ScreenContainer, StatusBadge} from '../../components';
import {WING_LABELS} from '../../config/academic';
import {ROLE_LABELS} from '../../config/constants';
import coordinatorService from '../../services/coordinators/coordinatorService';
import {spacing} from '../../theme';

const normalizeRole = role => String(role || '').toUpperCase();
const uniqueRoles = roles => [...new Set((roles || []).map(item => normalizeRole(item?.role || item)).filter(Boolean))];

const CoordinatorDetailsScreen = ({navigation, route}) => {
  const coordinatorId = route.params?.coordinatorId;
  const {data} = useQuery({
    queryKey: ['coordinator', coordinatorId],
    queryFn: () => coordinatorService.getCoordinatorDetails(coordinatorId),
    enabled: Boolean(coordinatorId),
  });

  if (!data) {
    return (
      <ScreenContainer>
        <EmptyState title="Coordinator not found" message="The selected coordinator could not be loaded." />
      </ScreenContainer>
    );
  }
  const roles = uniqueRoles([...(data.user?.roles || []), data.user?.role]);

  return (
    <ScreenContainer>
      <Header
        title={data.user?.fullName || 'Coordinator'}
        subtitle={WING_LABELS[data.wing] || data.wing}
        actionLabel="Edit"
        onAction={() => navigation.navigate('EditCoordinator', {coordinator: data})}
      />
      {roles.length ? (
        <View style={styles.roleRow}>
          {roles.map(role => (
            <StatusBadge key={role} status="info" label={ROLE_LABELS[role] || role} />
          ))}
        </View>
      ) : null}
      <DashboardCard title="Mobile" value={data.user?.phoneNumber || '-'} icon="phone" />
      <DashboardCard title="Email" value={data.email || '-'} icon="email-outline" />
      <DashboardCard title="Employee ID" value={data.employeeId || '-'} icon="badge-account-outline" />
      <DashboardCard title="Status" value={data.isActive ? 'Active' : 'Inactive'} icon="check-circle-outline" />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});

export default CoordinatorDetailsScreen;
