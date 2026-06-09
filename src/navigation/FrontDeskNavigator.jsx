import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../theme';

import FrontDeskDashboardScreen from '../screens/frontDesk/FrontDeskDashboardScreen';
import AdmissionsScreen from '../screens/frontDesk/AdmissionsScreen';
import VisitorsScreen from '../screens/frontDesk/VisitorsScreen';
// Front Desk reuses BranchAdmin's ManageStudentsScreen for student lookup
import ManageStudentsScreen from '../screens/branchAdmin/ManageStudentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Front Desk only) ──────────────────────────────────────────
const FrontDeskTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({color}) => {
        const icons = {
          Dashboard: 'view-dashboard',
          Admissions: 'account-plus',
          Visitors: 'card-account-details',
          Students: 'school',
          Profile: 'account-circle',
        };
        return (
          <MaterialCommunityIcons
            name={icons[route.name]}
            size={26}
            color={color}
          />
        );
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSoft,
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      },
      tabBarLabelStyle: {fontSize: 11, fontWeight: '700'},
    })}>
    <Tab.Screen name="Dashboard" component={FrontDeskDashboardScreen} />
    <Tab.Screen name="Admissions" component={AdmissionsScreen} />
    <Tab.Screen name="Visitors" component={VisitorsScreen} />
    <Tab.Screen name="Students" component={ManageStudentsScreen} />
    {/* Profile tab reuses the dashboard as fallback since Front Desk has no dedicated profile */}
    <Tab.Screen name="Profile" component={FrontDeskDashboardScreen} />
  </Tab.Navigator>
);

// ─── Stack wraps Tabs ───────────────────────────────────────────────────────
const FrontDeskNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="FrontDeskTabs" component={FrontDeskTabs} />
  </Stack.Navigator>
);

export default FrontDeskNavigator;
