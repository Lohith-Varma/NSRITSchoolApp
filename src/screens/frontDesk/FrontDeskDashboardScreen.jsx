import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Header,
  ScreenContainer,
  SectionHeader,
  DashboardCard,
} from '../../components';
import {logoutUser} from '../../store/slices/authSlice';
import {colors} from '../../theme';

const FrontDeskDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  return (
    <ScreenContainer>
      <Header
        title="Front Desk"
        subtitle={user?.fullName || 'Reception & Admissions'}
        actionLabel="Logout"
        onAction={() => dispatch(logoutUser())}
      />
      <SectionHeader title="Services" subtitle="Reception desk management" />
      <DashboardCard
        title="New Admissions"
        value="Manage"
        icon="account-plus"
        tone={colors.primary}
        onPress={() => navigation.navigate('Admissions')}
      />
      <DashboardCard
        title="Visitor Registration"
        value="Check-in"
        icon="card-account-details"
        tone={colors.success}
        onPress={() => navigation.navigate('Visitors')}
      />
      <DashboardCard
        title="Student Lookup"
        value="Search"
        icon="school"
        tone={colors.info}
        onPress={() => navigation.navigate('Students')}
      />
    </ScreenContainer>
  );
};

export default FrontDeskDashboardScreen;
