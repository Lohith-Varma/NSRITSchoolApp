import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../theme';

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
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Main Admin only) ──────────────────────────────────────────
const MainAdminTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({color}) => {
        const icons = {
          Dashboard: 'view-dashboard',
          Schools: 'office-building',
          Users: 'account-group',
          Reports: 'chart-line',
          Settings: 'cog',
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
    <Tab.Screen name="Schools" component={BranchListScreen} />
    <Tab.Screen name="Users" component={ManageUsersScreen} />
    <Tab.Screen name="Reports" component={GlobalAnalyticsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// ─── Stack wraps Tabs + all push-navigable routes ───────────────────────────
const MainAdminNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    {/* Root: the tab bar */}
    <Stack.Screen name="MainAdminTabs" component={MainAdminTabs} />

    {/* ── Alias routes so existing navigate() calls still work ── */}
    {/* DashboardScreen calls navigate('ManageBranches') */}
    <Stack.Screen name="ManageBranches" component={ManageBranchesScreen} />
    {/* DashboardScreen calls navigate('ManageUsers') — but Users tab is only accessible as a Tab.
        We register ManageUsers as a stack screen so navigate('ManageUsers') works from any screen. */}
    <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
    {/* DashboardScreen calls navigate('GlobalAnalytics') */}
    <Stack.Screen name="GlobalAnalytics" component={GlobalAnalyticsScreen} />

    {/* ── Detail/push screens ── */}
    <Stack.Screen name="BranchDetails" component={BranchDetailsScreen} />
    <Stack.Screen name="EditBranch" component={EditBranchScreen} />
    <Stack.Screen name="GlobalClasses" component={GlobalClassesScreen} />
    <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
    <Stack.Screen name="GlobalStudents" component={GlobalStudentsScreen} />
    <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
    <Stack.Screen name="CreateBranch" component={CreateBranchScreen} />
    <Stack.Screen name="RevenueOverview" component={RevenueOverviewScreen} />
    <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />

    {/* ── Shared fee screens ── */}
    {renderFeeStackScreens(Stack, {reports: true})}
  </Stack.Navigator>
);

export default MainAdminNavigator;
