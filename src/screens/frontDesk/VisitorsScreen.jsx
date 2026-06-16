import React from 'react';
import {useDispatch} from 'react-redux';
import {
  Header,
  ScreenContainer,
  SectionHeader,
  EmptyState,
} from '../../components';
import {logoutUser} from '../../store/slices/authSlice';

const VisitorsScreen = () => {
  const dispatch = useDispatch();

  return (
    <ScreenContainer>
      <Header
        title="Visitors"
        subtitle="Manage visitor check-in"
        actionLabel="Logout"
        onAction={() => dispatch(logoutUser())}
      />
      <SectionHeader title="Visitor Logs" />
      <EmptyState
        title="No Visitor Logs"
        message="Visitor tracking features are not fully configured yet."
      />
    </ScreenContainer>
  );
};

export default VisitorsScreen;
