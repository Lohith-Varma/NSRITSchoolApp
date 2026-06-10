import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader} from '../../components';
import parentService from '../../services/parents/parentService';

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;

  const {data, error, isLoading} = useQuery({
    queryKey: ['parentDashboard', parentId],
    queryFn: () => parentService.getParentDashboard(parentId),
    enabled: Boolean(parentId),
  });

  const children = data?.children || [];
  const selectedChild = data?.selectedChild;

  return (
    <ScreenContainer>
      <Header title="Parent Dashboard" subtitle={isLoading ? 'Loading live child data' : user?.fullName || user?.name} />
      {error ? (
        <EmptyState title="Unable to load parent data" message={error.message} />
      ) : null}
      <DashboardCard title="Linked Children" value={String(children.length)} icon="account-child-outline" />
      <DashboardCard title="Fee Due" value={String(data?.totalDue || 0)} icon="cash-clock" />
      <DashboardCard
        title="Attendance"
        value={`${selectedChild?.attendanceSummary?.percentage || 0}%`}
        description={selectedChild ? selectedChild.fullName : 'No child selected'}
        icon="chart-donut"
        onPress={() => navigation.navigate('Attendance', selectedChild ? {studentId: selectedChild.id} : undefined)}
      />
      <SectionHeader title="Children" />
      {children.length ? (
        children.map(child => (
          <DashboardCard
            key={child.id}
            title={child.fullName}
            value={child.studentId}
            description={`${child.academicClass?.name || '-'}-${child.section?.name || '-'} | Attendance ${child.attendanceSummary?.percentage || 0}%`}
            icon="account-school-outline"
            onPress={() => navigation.navigate('Attendance', {studentId: child.id})}
          />
        ))
      ) : (
        <EmptyState title="No linked children" message="Linked child records will appear here after admission." />
      )}
    </ScreenContainer>
  );
};

export default DashboardScreen;
