import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {CustomButton, DashboardCard, EmptyState, Header, PaymentCard, ScreenContainer, SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {colors} from '../../theme';

const StudentFeeProfileScreen = ({navigation, route}) => {
  const access = useFeeAccess();
  const studentId = route.params?.studentId;
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const canRecordPayments = feeService.canRecordPayments(access.role);
  const canViewTimeline = feeService.canViewPaymentTimeline(access.role);
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
        actionLabel={canManagePlans ? 'Edit Plan' : undefined}
        onAction={
          canManagePlans
            ? () => navigation.navigate('CreateFeePlan', {studentId: profile.studentId})
            : undefined
        }
      />
      <SectionHeader title="Student Details" />
      <DashboardCard title="Class" value={`${profile.className || '-'}-${profile.sectionName || '-'}`} icon="google-classroom" />
      <DashboardCard title="Parent Mobile" value={profile.parent?.phoneNumber || '-'} icon="phone-outline" />
      <SectionHeader title="Fee Summary" />
      <DashboardCard title="Total Fee" value={formatCurrency(profile.totalFee)} icon="cash-multiple" tone={colors.primary} />
      <DashboardCard title="Paid Fee" value={formatCurrency(profile.paidAmount)} icon="cash-check" tone={colors.success} />
      <DashboardCard title="Due Fee" value={formatCurrency(profile.dueAmount)} icon="cash-clock" tone={colors.danger} />
      <DashboardCard
        title="Concession"
        value={formatCurrency(profile.concessionAmount)}
        description={profile.concessionType ? `${profile.concessionType} ${profile.concessionValue}` : 'No concession'}
        icon="sale-outline"
        tone={colors.info}
      />
      <SectionHeader title="Fee Breakup" />
      <DashboardCard title="Tuition Total" value={formatCurrency(profile.term1Fee + profile.term2Fee + profile.term3Fee)} icon="school-outline" />
      <DashboardCard title="1st Term" value={formatCurrency(profile.term1Fee)} icon="numeric-1-circle-outline" />
      <DashboardCard title="2nd Term" value={formatCurrency(profile.term2Fee)} icon="numeric-2-circle-outline" />
      <DashboardCard title="3rd Term" value={formatCurrency(profile.term3Fee)} icon="numeric-3-circle-outline" />
      <DashboardCard title="Books Fee" value={formatCurrency(profile.booksFee)} icon="book-open-page-variant-outline" />
      <DashboardCard title="Transport Fee" value={formatCurrency(profile.transportFee)} icon="bus-school" />
      <DashboardCard title="Gross Fee" value={formatCurrency(profile.grossAmount)} icon="cash-multiple" />
      {canRecordPayments ? (
        <CustomButton onPress={() => navigation.navigate('FeeCollection', {studentId: profile.studentId})}>
          Record Payment
        </CustomButton>
      ) : null}
      <SectionHeader title="Fee Categories" />
      {profile.categories.length ? (
        profile.categories.map(item => (
          <DashboardCard key={item.id} title={item.category?.name || 'Fee'} value={formatCurrency(item.amount)} icon="tag-outline" />
        ))
      ) : (
        <EmptyState title="No fee plan" message="Create a fee plan before collecting payments." />
      )}
      {canViewTimeline ? (
        <>
          <SectionHeader title="Payment Timeline" />
          {profile.payments.length ? profile.payments.map(payment => <PaymentCard key={payment.id} payment={payment} />) : <EmptyState title="No payments" message="Recorded payments will appear here." />}
        </>
      ) : null}
    </ScreenContainer>
  );
};

export default StudentFeeProfileScreen;
