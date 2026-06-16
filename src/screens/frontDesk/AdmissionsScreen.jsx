import React from 'react';
import {useDispatch} from 'react-redux';
import {
  Header,
  ScreenContainer,
  SectionHeader,
  EmptyState,
} from '../../components';
import {logoutUser} from '../../store/slices/authSlice';

const AdmissionsScreen = () => {
  const dispatch = useDispatch();

  return (
    <ScreenContainer>
      <Header
        title="Admissions"
        subtitle="Manage student admissions"
        actionLabel="Logout"
        onAction={() => dispatch(logoutUser())}
      />
      <SectionHeader title="Student Admissions" />
      <EmptyState
        title="No Admissions Data"
        message="Admission workflows are not fully configured yet."
      />
    </ScreenContainer>
  );
};

export default AdmissionsScreen;
