import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import feeService from '../../services/fees/feeService';
import {formatCurrency} from '../../utils/formatters/currency';

const SectionFeesScreen = () => {
  const access = useFeeAccess();
  const {data, error, isLoading} = useQuery({
    queryKey: ['teacherSectionFeeStatus', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });
  const summary = data?.summary || {};

  return (
    <ScreenContainer>
      <Header title="Fee Status" subtitle={isLoading ? 'Loading fee status' : 'Paid and due summary'} />
      {error ? <EmptyState title="Unable to load fee status" message={error.message} /> : null}
      <DashboardCard title="Collection Status" value={`${Math.round((summary.collectionRate || 0) * 100)}%`} icon="chart-line" />
      <DashboardCard title="Paid Amount" value={formatCurrency(summary.paidAmount)} icon="cash-check" />
      <DashboardCard title="Due Amount" value={formatCurrency(summary.dueAmount)} icon="cash-clock" />
    </ScreenContainer>
  );
};

export default SectionFeesScreen;
