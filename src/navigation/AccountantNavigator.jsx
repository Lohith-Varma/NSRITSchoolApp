import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../theme';

import DashboardScreen from '../screens/accountant/DashboardScreen';
import ClassWiseFeeReportScreen from '../screens/fees/ClassWiseFeeReportScreen';
import DueStudentsScreen from '../screens/fees/DueStudentsScreen';
import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import FeeLedgerScreen from '../screens/fees/FeeLedgerScreen';
import PaidStudentsScreen from '../screens/fees/PaidStudentsScreen';
import PaymentHistoryScreen from '../screens/fees/PaymentHistoryScreen';
import StudentFeeDetailsScreen from '../screens/fees/StudentFeeDetailsScreen';
import UploadOfflinePaymentScreen from '../screens/fees/UploadOfflinePaymentScreen';

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
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="AccountantDashboard"
      component={DashboardScreen}
      options={{title: 'Accountant'}}
    />
    <Stack.Screen
      name="FeeDashboard"
      component={FeeDashboardScreen}
      options={{title: 'Fees'}}
    />
    <Stack.Screen
      name="StudentFeeDetails"
      component={StudentFeeDetailsScreen}
      options={{title: 'Student Fee'}}
    />
    <Stack.Screen
      name="PaymentHistory"
      component={PaymentHistoryScreen}
      options={{title: 'Payments'}}
    />
    <Stack.Screen
      name="FeeLedger"
      component={FeeLedgerScreen}
      options={{title: 'Ledger'}}
    />
    <Stack.Screen
      name="DueStudents"
      component={DueStudentsScreen}
      options={{title: 'Due Students'}}
    />
    <Stack.Screen
      name="PaidStudents"
      component={PaidStudentsScreen}
      options={{title: 'Paid Students'}}
    />
    <Stack.Screen
      name="UploadOfflinePayment"
      component={UploadOfflinePaymentScreen}
      options={{title: 'Upload Payment'}}
    />
    <Stack.Screen
      name="ClassWiseFeeReport"
      component={ClassWiseFeeReportScreen}
      options={{title: 'Class-wise Report'}}
    />
  </Stack.Navigator>
);

export default AccountantNavigator;
