import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import {WING_LABELS} from '../../config/academic';
import coordinatorService from '../../services/coordinators/coordinatorService';
import {getAccessScope} from '../../services/rbacScope';

const CoordinatorManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const {data = [], isLoading} = useQuery({
    queryKey: ['coordinators', user?.branchId],
    queryFn: () => coordinatorService.getCoordinators(user.branchId, scope),
    enabled: Boolean(user?.branchId),
  });

  return (
    <ScreenContainer>
      <Header
        title="Coordinators"
        subtitle="One active coordinator per wing"
        actionLabel="Create"
        onAction={() => navigation.navigate('CreateCoordinator')}
      />
      {data.length ? (
        data.map(item => (
          <DashboardCard
            key={item.id}
            title={item.user?.fullName || 'Coordinator'}
            value={WING_LABELS[item.wing] || item.wing}
            description={`${item.user?.phoneNumber || ''} ${item.isActive ? 'Active' : 'Inactive'}`}
            icon="account-tie"
            onPress={() => navigation.navigate('CoordinatorDetails', {coordinatorId: item.id})}
          />
        ))
      ) : (
        <EmptyState
          title={isLoading ? 'Loading coordinators' : 'No coordinators'}
          message="Create pre-primary, primary, and higher coordinators for this branch."
        />
      )}
    </ScreenContainer>
  );
};

export default CoordinatorManagementScreen;
