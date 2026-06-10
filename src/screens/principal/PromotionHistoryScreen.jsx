import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import academicRepository from '../../repositories/academicRepository';

const PromotionHistoryScreen = () => {
  const {data = [], isLoading} = useQuery({
    queryKey: ['promotionHistory'],
    queryFn: () => academicRepository.getPromotionHistory(),
  });

  return (
    <ScreenContainer>
      <Header title="Promotion History" subtitle="Annual promotion audit trail" />
      {data.length ? (
        data.map(item => (
          <DashboardCard
            key={item.id}
            title={item.student?.fullName || item.student?.studentId || 'Student'}
            value={`${item.fromClass?.name || '-'} to ${item.toClass?.name || '-'}`}
            description={`${item.fromSection?.name || '-'} to ${item.toSection?.name || '-'} by ${item.promotedBy?.fullName || '-'}`}
            icon="history"
          />
        ))
      ) : (
        <EmptyState
          title={isLoading ? 'Loading history' : 'No promotions'}
          message="Promotion records appear after a principal promotes students."
        />
      )}
    </ScreenContainer>
  );
};

export default PromotionHistoryScreen;
