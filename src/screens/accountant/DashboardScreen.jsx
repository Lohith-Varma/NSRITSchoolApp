import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {useDispatch, useSelector} from 'react-redux';
import {
  DashboardCard,
  EmptyState,
  Header,
  PaymentCard,
  ScreenContainer,
  SectionHeader,
} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {toISODate} from '../../utils/helpers/dateHelpers';
import {logoutUser} from '../../store/slices/authSlice';
import {colors} from '../../theme';

const isSameMonth = date => {
  const value = new Date(date);
  const now = new Date();
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
};

const DashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const access = useFeeAccess();
  const {data} = useQuery({
    queryKey: ['accountantFeeDashboard', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });
  const records = data?.records || [];
  const payments = data?.payments || [];
  const today = toISODate(new Date());
  const todaysCollections = payments
    .filter(item => item.paymentDate === today)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const monthlyCollections = payments
    .filter(item => isSameMonth(item.paymentDate))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const summary = data?.summary || feeService.getFeeSummary(records);

  return (
    <ScreenContainer>
      <Header
        title="Accountant"
        subtitle={user?.fullName || 'Fee collection desk'}
        actionLabel="Logout"
        onAction={() => dispatch(logoutUser())}
      />
      <SectionHeader title="Priority Actions" subtitle="Fast fee desk workflows" />
      <DashboardCard title="Record Payment" value="Collect" icon="cash-plus" tone={colors.success} onPress={() => navigation.navigate('FeeCollection')} />
      <DashboardCard title="Outstanding Fees" value="Follow up" icon="account-alert-outline" tone={colors.danger} onPress={() => navigation.navigate('DueStudents')} />
      <DashboardCard title="Payment History" value="Receipts" icon="receipt-text-clock" tone={colors.info} onPress={() => navigation.navigate('PaymentHistory')} />
      <DashboardCard title="Reports" value="View" icon="file-chart-outline" tone={colors.accent} onPress={() => navigation.navigate('FeeReports')} />
      <SectionHeader title="Collection Summary" />
      <DashboardCard title="Today's Collections" value={formatCurrency(todaysCollections)} icon="cash-check" tone={colors.success} />
      <DashboardCard title="Monthly Collections" value={formatCurrency(monthlyCollections)} icon="calendar-month-outline" tone={colors.primary} />
      <DashboardCard title="Pending Amount" value={formatCurrency(summary.dueAmount)} icon="cash-clock" tone={colors.danger} />
      <DashboardCard title="Students with Dues" value={String(summary.dueStudents)} icon="account-alert-outline" tone={colors.warning} />
      <SectionHeader title="Recent Payments" />
      {payments.length ? (
        payments.slice(0, 5).map(payment => <PaymentCard key={payment.id} payment={payment} />)
      ) : (
        <EmptyState title="No recent payments" message="Recorded payments will appear here." />
      )}
    </ScreenContainer>
  );
};

export default DashboardScreen;
