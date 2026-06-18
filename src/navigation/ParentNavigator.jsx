import React from 'react';
import {View, StyleSheet} from 'react-native';
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
import TimetableScreen from '../screens/parent/TimetableScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
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
      options={{title: 'Notice Board'}}
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
    <Stack.Screen
      name="Timetable"
      component={TimetableScreen}
      options={{title: 'Class Timetable'}}
    />
  </Stack.Navigator>
);

// Tab bar icons
const HomeIcon = ({color, size}) => (
  <MaterialCommunityIcons name="home-outline" size={size} color={color} />
);

const AttendanceIcon = ({color, size}) => (
  <MaterialCommunityIcons name="calendar-check-outline" size={size} color={color} />
);

const NotificationsIcon = ({color, size, unreadCount = 0}) => (
  <View>
    <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
    {unreadCount > 0 && (
      <View style={styles.badge}>
        {/* Badge dot only — count kept minimal */}
      </View>
    )}
  </View>
);

const ProfileIcon = ({color, size}) => (
  <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
);

const StudentsIcon = ({color, size}) => (
  <MaterialCommunityIcons name="account-child-outline" size={size} color={color} />
);

const ParentNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerTitleAlign: 'center',
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {
        borderTopColor: colors.border,
        backgroundColor: colors.white,
      },
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
      name="Notifications"
      component={NotificationCenterScreen}
      options={{
        title: 'Notifications',
        tabBarIcon: ({color, size}) => (
          <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
        ),
        tabBarBadgeStyle: {
          backgroundColor: colors.danger,
          fontSize: 10,
          minWidth: 16,
          height: 16,
        },
      }}
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

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.danger,
    borderRadius: 6,
    height: 8,
    position: 'absolute',
    right: -2,
    top: -1,
    width: 8,
  },
});

export default ParentNavigator;
