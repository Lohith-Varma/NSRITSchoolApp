import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, PaymentCard, ScreenContainer, SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';

const StudentFeeProfileScreen = ({navigation, route}) => {
  const access = useFeeAccess();
  const studentId = route.params?.studentId;
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const canRecordPayments = feeService.canRecordPayments(access.role);
  const {data: profile, error, isLoading} = useQuery({
    queryKey: ['studentFeeProfile', studentId, access.role, access.wing],
    queryFn: () => feeService.getStudentFeeProfile(studentId, access),
    enabled: Boolean(studentId),
  });

  if (!profile) {
    return (
      <ScreenContainer>
        <EmptyState title={isLoading ? 'Loading fee profile' : 'Fee profile unavailable'} message={error?.message || 'Open a student fee profile from the fee dashboard.'} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title={profile.studentName}
        subtitle={profile.admissionNumber}
        actionLabel={canManagePlans ? 'Edit Plan' : canRecordPayments ? 'Record' : undefined}
        onAction={
          canManagePlans
            ? () => navigation.navigate('CreateFeePlan', {studentId: profile.studentId})
            : canRecordPayments
              ? () => navigation.navigate('FeeCollection', {studentId: profile.studentId})
              : undefined
        }
      />
      <SectionHeader title="Student Details" />
      <DashboardCard title="Class" value={`${profile.className || '-'}-${profile.sectionName || '-'}`} icon="google-classroom" />
      <DashboardCard title="Parent Mobile" value={profile.parent?.phoneNumber || '-'} icon="phone-outline" />
      <SectionHeader title="Fee Summary" />
      <DashboardCard title="Total Fee" value={formatCurrency(profile.totalFee)} icon="cash-multiple" />
      <DashboardCard title="Paid Amount" value={formatCurrency(profile.paidAmount)} icon="cash-check" />
      <DashboardCard title="Pending Amount" value={formatCurrency(profile.dueAmount)} icon="cash-clock" />
      <SectionHeader title="Fee Categories" />
      {profile.categories.length ? (
        profile.categories.map(item => (
          <DashboardCard key={item.id} title={item.category?.name || 'Fee'} value={formatCurrency(item.amount)} icon="tag-outline" />
        ))
      ) : (
        <EmptyState title="No fee plan" message="Create a fee plan before collecting payments." />
      )}
      <SectionHeader title="Payment History" />
      {profile.payments.length ? profile.payments.map(payment => <PaymentCard key={payment.id} payment={payment} />) : <EmptyState title="No payments" message="Recorded payments will appear here." />}
    </ScreenContainer>
  );
};

export default StudentFeeProfileScreen;
