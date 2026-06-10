import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/accountant/DashboardScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();

const AccountantNavigator = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="AccountantDashboard"
      component={DashboardScreen}
      options={{title: 'Accountant'}}
    />
    {renderFeeStackScreens(Stack, {canUpload: true, reports: true})}
  </Stack.Navigator>
);

export default AccountantNavigator;
