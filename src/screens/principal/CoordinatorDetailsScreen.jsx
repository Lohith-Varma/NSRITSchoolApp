import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import {WING_LABELS} from '../../config/academic';
import coordinatorService from '../../services/coordinators/coordinatorService';

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

  return (
    <ScreenContainer>
      <Header
        title={data.user?.fullName || 'Coordinator'}
        subtitle={WING_LABELS[data.wing] || data.wing}
        actionLabel="Edit"
        onAction={() => navigation.navigate('EditCoordinator', {coordinator: data})}
      />
      <DashboardCard title="Mobile" value={data.user?.phoneNumber || '-'} icon="phone" />
      <DashboardCard title="Email" value={data.email || '-'} icon="email-outline" />
      <DashboardCard title="Employee ID" value={data.employeeId || '-'} icon="badge-account-outline" />
      <DashboardCard title="Status" value={data.isActive ? 'Active' : 'Inactive'} icon="check-circle-outline" />
    </ScreenContainer>
  );
};

export default CoordinatorDetailsScreen;
