import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardScreen from '../screens/parent/DashboardScreen';
import AttendanceScreen from '../screens/parent/AttendanceScreen';
import ProfileScreen from '../screens/parent/ProfileScreen';
import StudentSelectorScreen from '../screens/parent/StudentSelectorScreen';
import NoticeBoardScreen from '../screens/parent/NoticeBoardScreen';
import SuggestionScreen from '../screens/parent/SuggestionScreen';
import SuggestionStatusScreen from '../screens/parent/SuggestionStatusScreen';
import FeeLedgerScreen from '../screens/parent/FeeLedgerScreen';
import PaymentScreen from '../screens/parent/PaymentScreen';
import {colors} from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ParentHomeStack = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="ParentDashboard"
      component={DashboardScreen}
      options={{title: 'Home'}}
    />
    <Stack.Screen
      name="ParentNotices"
      component={NoticeBoardScreen}
      options={{title: 'Notifications'}}
    />
    <Stack.Screen
      name="ParentSuggestions"
      component={SuggestionScreen}
      options={{title: 'Suggestions'}}
    />
    <Stack.Screen
      name="ParentSuggestionStatus"
      component={SuggestionStatusScreen}
      options={{title: 'Suggestion Status'}}
    />
    <Stack.Screen
      name="FeeLedger"
      component={FeeLedgerScreen}
      options={{title: 'Fee Ledger'}}
    />
    <Stack.Screen
      name="Payments"
      component={PaymentScreen}
      options={{title: 'Fee Payments'}}
    />
  </Stack.Navigator>
);

const HomeIcon = ({color, size}) => (
  <MaterialCommunityIcons name="home-outline" size={size} color={color} />
);

const AttendanceIcon = ({color, size}) => (
  <MaterialCommunityIcons
    name="calendar-check-outline"
    size={size}
    color={color}
  />
);

const ProfileIcon = ({color, size}) => (
  <MaterialCommunityIcons
    name="account-circle-outline"
    size={size}
    color={color}
  />
);

const StudentsIcon = ({color, size}) => (
  <MaterialCommunityIcons
    name="account-child-outline"
    size={size}
    color={color}
  />
);

const ParentNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerTitleAlign: 'center',
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
    }}>
    <Tab.Screen
      name="Home"
      component={ParentHomeStack}
      options={{headerShown: false, title: 'Home', tabBarIcon: HomeIcon}}
    />
    <Tab.Screen
      name="Attendance"
      component={AttendanceScreen}
      options={{tabBarIcon: AttendanceIcon}}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{tabBarIcon: ProfileIcon}}
    />
    <Tab.Screen
      name="Students"
      component={StudentSelectorScreen}
      options={{tabBarIcon: StudentsIcon}}
    />
  </Tab.Navigator>
);

export default ParentNavigator;
