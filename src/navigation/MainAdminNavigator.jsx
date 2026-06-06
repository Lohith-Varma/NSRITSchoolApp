import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/mainAdmin/DashboardScreen';
import BranchDetailsScreen from '../screens/mainAdmin/BranchDetailsScreen';
import BranchListScreen from '../screens/mainAdmin/BranchListScreen';
import ManageBranchesScreen from '../screens/mainAdmin/ManageBranchesScreen';
import ClassDetailsScreen from '../screens/mainAdmin/ClassDetailsScreen';
import CreateBranchScreen from '../screens/mainAdmin/CreateBranchScreen';
import EditBranchScreen from '../screens/mainAdmin/EditBranchScreen';
import GlobalAnalyticsScreen from '../screens/mainAdmin/GlobalAnalyticsScreen';
import GlobalClassesScreen from '../screens/mainAdmin/GlobalClassesScreen';
import GlobalStudentsScreen from '../screens/mainAdmin/GlobalStudentsScreen';
import ManageUsersScreen from '../screens/mainAdmin/ManageUsersScreen';
import SettingsScreen from '../screens/mainAdmin/SettingsScreen';
import StudentProfileScreen from '../screens/mainAdmin/StudentProfileScreen';
import RevenueOverviewScreen from '../screens/mainAdmin/RevenueOverviewScreen';
import AuditLogsScreen from '../screens/mainAdmin/AuditLogsScreen';
import ProfileScreen from '../screens/mainAdmin/ProfileScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();

const MainAdminNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen
      name="MainAdminDashboard"
      component={DashboardScreen}
      options={{title: 'Main Admin'}}
    />
    <Stack.Screen
      name="BranchList"
      component={BranchListScreen}
      options={{title: 'Branches'}}
    />
    <Stack.Screen
      name="BranchDetails"
      component={BranchDetailsScreen}
      options={{title: 'Branch Details'}}
    />
    <Stack.Screen
      name="EditBranch"
      component={EditBranchScreen}
      options={{title: 'Edit Branch'}}
    />
    <Stack.Screen
      name="GlobalClasses"
      component={GlobalClassesScreen}
      options={{title: 'Global Classes'}}
    />
    <Stack.Screen
      name="ClassDetails"
      component={ClassDetailsScreen}
      options={{title: 'Class Details'}}
    />
    <Stack.Screen
      name="GlobalStudents"
      component={GlobalStudentsScreen}
      options={{title: 'Global Students'}}
    />
    <Stack.Screen
      name="StudentProfile"
      component={StudentProfileScreen}
      options={{title: 'Student Profile'}}
    />
    <Stack.Screen
      name="GlobalAnalytics"
      component={GlobalAnalyticsScreen}
      options={{title: 'Reports'}}
    />
    <Stack.Screen
      name="CreateBranch"
      component={CreateBranchScreen}
      options={{title: 'Create Branch'}}
    />
    <Stack.Screen
      name="ManageBranches"
      component={ManageBranchesScreen}
      options={{title: 'Branches'}}
    />
    <Stack.Screen
      name="ManageUsers"
      component={ManageUsersScreen}
      options={{title: 'Users'}}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{title: 'Settings'}}
    />
    <Stack.Screen
      name="RevenueOverview"
      component={RevenueOverviewScreen}
      options={{title: 'Revenue'}}
    />
    <Stack.Screen
      name="AuditLogs"
      component={AuditLogsScreen}
      options={{title: 'Audit Logs'}}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{title: 'Profile'}}
    />
    {renderFeeStackScreens(Stack, {reports: true})}
  </Stack.Navigator>
);

export default MainAdminNavigator;
