import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import parentService from '../../services/parents/parentService';

const StudentSelectorScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;
  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });

  return (
    <ScreenContainer>
      <Header title="Select Student" subtitle={isLoading ? 'Loading linked children' : 'Linked children'} />
      {error ? <EmptyState title="Unable to load children" message={error.message} /> : null}
      {children.length ? (
        children.map(child => (
          <DashboardCard
            key={child.id}
            title={child.fullName}
            value={child.studentId}
            description={`${child.academicClass?.name || '-'}-${child.section?.name || '-'} | ${child.status || 'ACTIVE'}`}
            icon="account-school-outline"
            onPress={() => navigation.navigate('Attendance', {studentId: child.id})}
          />
        ))
      ) : (
        <EmptyState title="No linked children" message="Child records linked to this parent will appear here." />
      )}
    </ScreenContainer>
  );
};

export default StudentSelectorScreen;
