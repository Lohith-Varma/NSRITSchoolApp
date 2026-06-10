import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {DashboardCard, Header, PaymentCard, ScreenContainer, SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';

const isSameMonth = date => {
  const value = new Date(date);
  const now = new Date();
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
};

const DashboardScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const access = useFeeAccess();
  const {data} = useQuery({
    queryKey: ['accountantFeeDashboard', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });
  const records = data?.records || [];
  const payments = data?.payments || [];
  const today = new Date().toISOString().slice(0, 10);
  const todaysCollections = payments
    .filter(item => item.paymentDate === today)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const monthlyCollections = payments
    .filter(item => isSameMonth(item.paymentDate))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const summary = data?.summary || feeService.getFeeSummary(records);

  return (
    <ScreenContainer>
      <Header title="Accountant" subtitle={user?.fullName || 'Fee collection desk'} />
      <DashboardCard title="Today's Collections" value={formatCurrency(todaysCollections)} icon="cash-check" />
      <DashboardCard title="Monthly Collections" value={formatCurrency(monthlyCollections)} icon="calendar-month-outline" />
      <DashboardCard title="Pending Amount" value={formatCurrency(summary.dueAmount)} icon="cash-clock" />
      <DashboardCard title="Students with Dues" value={String(summary.dueStudents)} icon="account-alert-outline" />
      <SectionHeader title="Quick Actions" />
      <DashboardCard title="Fee Collection" value="Record" icon="cash-plus" onPress={() => navigation.navigate('FeeCollection')} />
      <DashboardCard title="Outstanding Fees" value="View" icon="account-alert-outline" onPress={() => navigation.navigate('DueStudents')} />
      <DashboardCard title="Payment History" value="Receipts" icon="receipt-text-clock" onPress={() => navigation.navigate('PaymentHistory')} />
      <DashboardCard title="Reports" value="View" icon="file-chart-outline" onPress={() => navigation.navigate('FeeReports')} />
      <SectionHeader title="Recent Payments" />
      {payments.slice(0, 5).map(payment => <PaymentCard key={payment.id} payment={payment} />)}
    </ScreenContainer>
  );
};

export default DashboardScreen;
