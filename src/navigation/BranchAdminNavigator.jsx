import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../theme';

import DashboardScreen from '../screens/branchAdmin/DashboardScreen';
import ManageTeachersScreen from '../screens/branchAdmin/ManageTeachersScreen';
import ManageStudentsScreen from '../screens/branchAdmin/ManageStudentsScreen';
import CreateStudentScreen from '../screens/branchAdmin/CreateStudentScreen';
import BulkStudentUploadScreen from '../screens/branchAdmin/BulkStudentUploadScreen';
import AttendanceOverviewScreen from '../screens/branchAdmin/AttendanceOverviewScreen';
import BranchSettingsScreen from '../screens/branchAdmin/BranchSettingsScreen';
import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Branch Admin only) ────────────────────────────────────────
const BranchAdminTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({color}) => {
        const icons = {
          Dashboard: 'view-dashboard',
          Students: 'school',
          Staff: 'account-tie',
          Finance: 'cash-multiple',
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
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Students" component={ManageStudentsScreen} />
    <Tab.Screen name="Staff" component={ManageTeachersScreen} />
    <Tab.Screen name="Finance" component={FeeDashboardScreen} />
    <Tab.Screen name="Profile" component={BranchSettingsScreen} />
  </Tab.Navigator>
);

// ─── Stack wraps Tabs + all push-navigable routes ───────────────────────────
const BranchAdminNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    {/* Root: the tab bar */}
    <Stack.Screen name="BranchAdminTabs" component={BranchAdminTabs} />

    {/* ── Alias routes so RoleDashboard navigate() calls work ── */}
    {/* RoleDashboard calls navigate('ManageTeachers') */}
    <Stack.Screen name="ManageTeachers" component={ManageTeachersScreen} />
    {/* RoleDashboard calls navigate('ManageStudents') */}
    <Stack.Screen name="ManageStudents" component={ManageStudentsScreen} />
    {/* RoleDashboard calls navigate('AttendanceOverview') */}
    <Stack.Screen name="AttendanceOverview" component={AttendanceOverviewScreen} />
    {/* RoleDashboard & ERPLayout sidebar call navigate('FeeDashboard') */}
    <Stack.Screen name="FeeDashboard" component={FeeDashboardScreen} />

    {/* ── Detail/push screens ── */}
    <Stack.Screen name="CreateStudent" component={CreateStudentScreen} />
    <Stack.Screen name="BulkStudentUpload" component={BulkStudentUploadScreen} />
    <Stack.Screen name="BranchSettings" component={BranchSettingsScreen} />

    {/* ── Shared fee sub-screens (StudentFeeDetails, PaymentHistory, etc.) ── */}
    {renderFeeStackScreens(Stack, {skipDashboard: true})}
  </Stack.Navigator>
);

export default BranchAdminNavigator;
