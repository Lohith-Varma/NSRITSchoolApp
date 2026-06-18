import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TeacherDashboardScreen from '../screens/teachers/TeacherDashboardScreen';
import TakeAttendanceScreen from '../screens/teachers/TakeAttendanceScreen';
import StudentsListScreen from '../screens/teachers/StudentsListScreen';
import StudentProfileScreen from '../screens/students/StudentProfileScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import HomeworkScreen from '../screens/teachers/HomeworkScreen';
import TimetableScreen from '../screens/teachers/TimetableScreen';
import SharedNoticeBoardScreen from '../screens/shared/NoticeBoardScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import {renderFeeStackScreens} from './FeeStackScreens';
import {colors} from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TeacherHomeIcon = ({color, size}) => (
  <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
);

const TeacherStudentsIcon = ({color, size}) => (
  <MaterialCommunityIcons name="account-school-outline" size={size} color={color} />
);

const TeacherBellIcon = ({color, size}) => (
  <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
);

const TeacherHomeStack = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="TeacherDashboard"
      component={TeacherDashboardScreen}
      options={{title: 'Teacher'}}
    />
    <Stack.Screen
      name="TeacherProfile"
      component={TeacherProfileScreen}
      options={{title: 'Teacher Profile'}}
    />
    <Stack.Screen
      name="TakeAttendance"
      component={TakeAttendanceScreen}
      options={{title: 'Take Attendance'}}
    />
    <Stack.Screen
      name="StudentProfile"
      component={StudentProfileScreen}
      options={{title: 'Student'}}
    />
    <Stack.Screen
      name="Homework"
      component={HomeworkScreen}
      options={{title: 'Homework'}}
    />
    <Stack.Screen
      name="Timetable"
      component={TimetableScreen}
      options={{title: 'My Timetable'}}
    />
    <Stack.Screen
      name="NoticeBoard"
      component={SharedNoticeBoardScreen}
      options={{title: 'Notice Board'}}
      initialParams={{edition: 'Teacher Edition', canPost: false}}
    />
    <Stack.Screen
      name="NotificationCenter"
      component={NotificationCenterScreen}
      options={{title: 'Notifications'}}
    />
    {renderFeeStackScreens(Stack)}
  </Stack.Navigator>
);

const TeacherNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
    }}>
    <Tab.Screen
      name="Home"
      component={TeacherHomeStack}
      options={{tabBarIcon: TeacherHomeIcon}}
    />
    <Tab.Screen
      name="StudentsList"
      component={StudentsListScreen}
      options={{title: 'Students', tabBarIcon: TeacherStudentsIcon}}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationCenterScreen}
      options={{title: 'Notifications', tabBarIcon: TeacherBellIcon}}
    />
  </Tab.Navigator>
);

export default TeacherNavigator;
