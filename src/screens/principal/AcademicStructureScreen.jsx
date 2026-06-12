import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  DashboardCard,
  EmptyState,
  Header,
  ScreenContainer,
} from '../../components';
import {fetchClasses} from '../../store/slices/classSlice';

const AcademicStructureScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {items} = useSelector(state => state.classes);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  return (
    <ScreenContainer>
      <Header
        title="Academic Structure"
        subtitle="Classes, sections, and wings"
        actionLabel="Section"
        onAction={() => navigation.navigate('CreateSection')}
      />
      {items.length ? (
        items.map(item => (
          <DashboardCard
            key={item.id}
            title={item.name}
            value={item.wing?.name || item.wing || 'Wing'}
            description="Master class configuration"
          />
        ))
      ) : (
        <EmptyState
          title="No classes"
          message="Seed the fixed class catalog before adding sections or assigning teachers."
        />
      )}
    </ScreenContainer>
  );
};

export default AcademicStructureScreen;
