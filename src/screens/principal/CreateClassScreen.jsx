import React from 'react';
import {EmptyState, ScreenContainer} from '../../components';

const CreateClassScreen = () => (
  <ScreenContainer>
    <EmptyState
      title="Classes are system-managed"
      message="Nursery through 12 are seeded automatically. Principals can create sections only."
    />
  </ScreenContainer>
);

export default CreateClassScreen;
