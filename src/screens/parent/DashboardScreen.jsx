import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader} from '../../components';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
import {logoutUser} from '../../store/slices/authSlice';
import {colors} from '../../theme';

const DashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;

  const {data, error, isLoading} = useQuery({
    queryKey: ['parentDashboard', parentId],
    queryFn: () => parentService.getParentDashboard(parentId),
    enabled: Boolean(parentId),
  });

  const children = data?.children || [];
  const selectedChild = data?.selectedChild;

  return (
    <ScreenContainer>
      <Header
        title="Parent Dashboard"
        subtitle={isLoading ? 'Loading live child data' : user?.fullName || user?.name}
        actionLabel="Logout"
        onAction={() => dispatch(logoutUser())}
      />
      {error ? (
        <EmptyState title="Unable to load parent data" message={error.message} />
      ) : null}
      <SectionHeader title="Child" subtitle="Choose a child before checking details" />
      <DashboardCard
        title={selectedChild?.fullName || 'Select Child'}
        value={selectedChild?.studentId || `${children.length} linked`}
        description={
          selectedChild
            ? `${selectedChild.academicClass?.name || '-'}-${selectedChild.section?.name || '-'}`
            : 'Linked child records will appear after admission'
        }
        icon="account-child-outline"
        tone={colors.primary}
        onPress={() => navigation.navigate('Students')}
      />
      <SectionHeader title="Priority Actions" subtitle="Attendance, fees, homework, and messages" />
      <DashboardCard
        title="Attendance"
        value={`${selectedChild?.attendanceSummary?.percentage || 0}%`}
        description={selectedChild ? selectedChild.fullName : 'Select a child to view attendance'}
        icon="chart-donut"
        tone={colors.success}
        onPress={() => navigation.navigate('Attendance', selectedChild ? {studentId: selectedChild.id} : undefined)}
      />
      <DashboardCard
        title="Fees"
        value={formatCurrency(data?.totalDue || 0)}
        description="View paid and pending school fees"
        icon="cash-clock"
        tone={colors.danger}
        onPress={() => navigation.navigate('FeeLedger')}
      />
      <DashboardCard
        title="Homework"
        value="View"
        description="Homework updates appear when enabled by school"
        icon="book-open-page-variant-outline"
        tone={colors.secondary}
      />
      <DashboardCard
        title="Notifications"
        value="Open"
        description="School notices and announcements"
        icon="bell-outline"
        tone={colors.info}
        onPress={() => navigation.navigate('ParentNotices')}
      />
      <DashboardCard
        title="Suggestions"
        value="Send"
        description="Share feedback with the school"
        icon="message-text-outline"
        tone={colors.accent}
        onPress={() => navigation.navigate('ParentSuggestions')}
      />
      <DashboardCard
        title="Profile"
        value="Open"
        description="Parent account and linked children"
        icon="account-circle-outline"
        onPress={() => navigation.navigate('Profile')}
      />
      <SectionHeader title="Children" />
      {children.length ? (
        children.map(child => (
          <React.Fragment key={child.id}>
            <DashboardCard
              title={child.fullName}
              value={child.studentId}
              description={`${child.academicClass?.name || '-'}-${child.section?.name || '-'} | Attendance ${child.attendanceSummary?.percentage || 0}%`}
              icon="account-school-outline"
              onPress={() => navigation.navigate('Attendance', {studentId: child.id})}
            />
            <DashboardCard
              title={`${child.fullName} Fees`}
              value={formatCurrency(child.feeSummary?.due || 0)}
              description={`${child.academicClass?.name || '-'}-${child.section?.name || '-'} | Paid ${formatCurrency(child.feeSummary?.paid || 0)}`}
              icon="cash-clock"
              onPress={() => navigation.navigate('FeeLedger')}
            />
          </React.Fragment>
        ))
      ) : (
        <EmptyState title="No linked children" message="Linked child records will appear here after admission." />
      )}
    </ScreenContainer>
  );
};

export default DashboardScreen;
