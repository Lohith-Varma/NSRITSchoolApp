import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader} from '../../components';
import parentService from '../../services/parents/parentService';

const ProfileScreen = () => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;
  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });
  const parent = children[0]?.parent;

  return (
    <ScreenContainer>
      <Header title="Profile" subtitle={isLoading ? 'Loading parent profile' : 'Parent account details'} />
      <DashboardCard
        title={parent?.fullName || user?.name || 'Parent'}
        value="PARENT"
        description={parent?.phoneNumber || user?.phoneNumber || 'Phone number not available'}
      />
      <DashboardCard title="Father" value={parent?.fatherName || '-'} icon="account-outline" />
      <DashboardCard title="Mother" value={parent?.motherName || '-'} icon="account-outline" />
      {error ? <EmptyState title="Unable to load linked children" message={error.message} /> : null}
      <SectionHeader title="Linked Children" />
      {children.length ? (
        children.map(child => (
          <DashboardCard
            key={child.id}
            title={child.fullName}
            value={child.studentId}
            description={`${child.academicClass?.name || '-'}-${child.section?.name || '-'} | Attendance ${child.attendanceSummary?.percentage || 0}% | Due ${child.feeSummary?.due || 0}`}
            icon="account-school-outline"
          />
        ))
      ) : (
        <EmptyState title="No linked children" message="Child linkage is read-only for parent accounts." />
      )}
    </ScreenContainer>
  );
};

export default ProfileScreen;
