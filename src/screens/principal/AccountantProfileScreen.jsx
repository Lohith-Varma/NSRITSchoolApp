import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader} from '../../components';
import accountantService from '../../services/accountants/accountantService';

const AccountantProfileScreen = ({navigation, route}) => {
  const accountantId = route.params?.accountantId;
  const {data: accountant, isLoading} = useQuery({
    queryKey: ['accountantProfile', accountantId],
    queryFn: () => accountantService.getAccountantProfile(accountantId),
    enabled: Boolean(accountantId),
  });

  if (!accountant) {
    return (
      <ScreenContainer>
        <EmptyState title={isLoading ? 'Loading accountant' : 'Accountant unavailable'} message="The accountant profile could not be loaded." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title={accountant.fullName}
        subtitle={accountant.employeeId}
        actionLabel="Edit"
        onAction={() => navigation.navigate('EditAccountant', {accountantId})}
      />
      <SectionHeader title="Personal Information" />
      <DashboardCard title="Mobile" value={accountant.phoneNumber || '-'} icon="phone" />
      <DashboardCard title="Gender" value={accountant.gender || '-'} icon="account-outline" />
      <DashboardCard title="Email" value={accountant.email || '-'} icon="email-outline" />
      <SectionHeader title="Employment Information" />
      <DashboardCard title="Joining Date" value={accountant.joiningDate || '-'} icon="calendar-start" />
      <DashboardCard title="Designation" value={accountant.designation || '-'} icon="briefcase-outline" />
      <DashboardCard title="Status" value={accountant.isActive ? 'Active' : 'Disabled'} icon="check-circle-outline" />
      <DashboardCard title="Branch" value={accountant.branch?.name || '-'} icon="source-branch" />
    </ScreenContainer>
  );
};

export default AccountantProfileScreen;
