import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {USER_ROLES} from '../config/constants';
import SplashScreen from '../screens/auth/SplashScreen';
import {bootstrapAuth} from '../store/slices/authSlice';
import AccountantNavigator from './AccountantNavigator';
import AuthNavigator from './AuthNavigator';
import BranchAdminNavigator from './BranchAdminNavigator';
import CoordinatorNavigator from './CoordinatorNavigator';
import FrontDeskNavigator from './FrontDeskNavigator';
import MainAdminNavigator from './MainAdminNavigator';
import ParentNavigator from './ParentNavigator';
import PrincipalNavigator from './PrincipalNavigator';
import TeacherNavigator from './TeacherNavigator';

const getRoleNavigator = role => {
  switch (role) {
    case USER_ROLES.MAIN_ADMIN:
      return <MainAdminNavigator />;
    case USER_ROLES.BRANCH_ADMIN:
      return <BranchAdminNavigator />;
    case USER_ROLES.PRINCIPAL:
      return <PrincipalNavigator />;
    case USER_ROLES.COORDINATOR:
      return <CoordinatorNavigator />;
    case USER_ROLES.TEACHER:
      return <TeacherNavigator />;
    case USER_ROLES.PARENT:
      return <ParentNavigator />;
    case USER_ROLES.ACCOUNTANT:
      return <AccountantNavigator />;
    case USER_ROLES.FRONT_DESK:
      return <FrontDeskNavigator />;
    default:
      return <AuthNavigator />;
  }
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const {isBootstrapping, isAuthenticated, role} = useSelector(
    state => state.auth,
  );

  console.log('AppNavigator render state:', {isBootstrapping, isAuthenticated, role});

  useEffect(() => {
    console.log('AppNavigator dispatching bootstrapAuth...');
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <NavigationContainer>
      {isBootstrapping ? (
        <SplashScreen />
      ) : isAuthenticated ? (
        getRoleNavigator(role)
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
