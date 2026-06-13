import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../theme';

import DashboardScreen from '../screens/accountant/DashboardScreen';
import ExpensesScreen from '../screens/accountant/ExpensesScreen';
import AccountantProfileScreen from '../screens/accountant/AccountantProfileScreen';
import RecordPaymentScreen from '../screens/accountant/RecordPaymentScreen';
import ResultPostingScreen from '../screens/accountant/ResultPostingScreen';
import CreateNotificationScreen from '../screens/accountant/CreateNotificationScreen';
import AuditLogsScreen from '../screens/accountant/AuditLogsScreen';

import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import ClassWiseFeeReportScreen from '../screens/fees/ClassWiseFeeReportScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Accountant only) ──────────────────────────────────────────
const AccountantTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({color}) => {
        const icons = {
          Dashboard: 'view-dashboard',
          'Fee Collection': 'cash-register',
          Expenses: 'currency-usd',
          Reports: 'chart-line',
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
    <Tab.Screen name="Fee Collection" component={FeeDashboardScreen} />
    <Tab.Screen name="Expenses" component={ExpensesScreen} />
    <Tab.Screen name="Reports" component={ClassWiseFeeReportScreen} />
    <Tab.Screen name="Profile" component={AccountantProfileScreen} />
  </Tab.Navigator>
);

// ─── Stack wraps Tabs + all push-navigable routes ───────────────────────────
const AccountantNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    {/* Root: the tab bar */}
    <Stack.Screen name="AccountantTabs" component={AccountantTabs} />

    {/* ── Alias routes so DashboardScreen navigate() calls work ── */}
    <Stack.Screen name="FeeDashboard" component={FeeDashboardScreen} />
    <Stack.Screen name="ClassWiseFeeReport" component={ClassWiseFeeReportScreen} />

    {/* ── Accountant-specific push screens ── */}
    <Stack.Screen name="RecordPayment" component={RecordPaymentScreen} />
    <Stack.Screen name="ResultPosting" component={ResultPostingScreen} />
    <Stack.Screen name="CreateNotification" component={CreateNotificationScreen} />
    <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
    <Stack.Screen name="AccountantProfile" component={AccountantProfileScreen} />

    {/* ── Shared fee sub-screens (StudentFeeDetails, PaymentHistory, etc.) ── */}
    {renderFeeStackScreens(Stack, {skipDashboard: true, canUpload: true, reports: true})}
  </Stack.Navigator>
);

export default AccountantNavigator;
