import React from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader} from '../../components';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';

const isActivePayment = payment =>
  !['REVERSED', 'CANCELLED'].includes(String(payment.status || 'RECORDED').toUpperCase());

const FeeLedgerScreen = () => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;
  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });

  return (
    <ScreenContainer>
      <Header title="Fee Ledger" subtitle={isLoading ? 'Loading fee records' : 'Linked student fee records'} />
      {error ? <EmptyState title="Unable to load fees" message={error.message} /> : null}
      {children.length ? (
        children.map(child => {
          const payments = (child.payments || []).filter(isActivePayment);
          return (
            <React.Fragment key={child.id}>
              <SectionHeader title={child.fullName} subtitle={`${child.academicClass?.name || '-'}-${child.section?.name || '-'}`} />
              <DashboardCard title="Fee Plan" value={child.feePlan ? `AY ${child.feePlan.academicYear || '-'}` : 'Not assigned'} icon="book-open-variant" />
              <DashboardCard title="Total Fee" value={formatCurrency(child.feeSummary?.total)} icon="cash-multiple" />
              <DashboardCard title="Paid Amount" value={formatCurrency(child.feeSummary?.paid)} icon="cash-check" />
              <DashboardCard title="Pending Amount" value={formatCurrency(child.feeSummary?.due)} icon="cash-clock" />
              <DashboardCard title="Outstanding Balance" value={formatCurrency(child.feeSummary?.due)} icon="alert-circle-outline" />
              <SectionHeader title="Fee Categories" />
              {(child.feePlan?.items || []).map(item => (
                <DashboardCard
                  key={item.id}
                  title={item.category?.name || 'Fee'}
                  value={formatCurrency(item.amount)}
                  icon="tag-outline"
                />
              ))}
              <SectionHeader title="Receipt History" subtitle="Recent payments and payment dates" />
              {payments.slice(0, 5).map(payment => (
                <DashboardCard
                  key={payment.id}
                  title={payment.receiptNumber || 'Receipt pending'}
                  value={formatCurrency(payment.amount)}
                  description={`${payment.paymentDate || '-'} | ${payment.paymentMode || '-'}`}
                  icon="receipt"
                />
              ))}
            </React.Fragment>
          );
        })
      ) : (
        <EmptyState title="No fee records" message="Fee records linked to your children will appear here." />
      )}
    </ScreenContainer>
  );
};

export default FeeLedgerScreen;
