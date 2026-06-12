import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import TakeAttendanceScreen from '../screens/teacher/TakeAttendanceScreen';
import StudentsListScreen from '../screens/teacher/StudentsListScreen';
import StudentProfileScreen from '../screens/teacher/StudentProfileScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
    {renderFeeStackScreens(Stack)}
  </Stack.Navigator>
);

const TeacherNavigator = () => (
  <Tab.Navigator screenOptions={{headerShown: false}}>
    <Tab.Screen name="Home" component={TeacherHomeStack} />
    <Tab.Screen
      name="StudentsList"
      component={StudentsListScreen}
      options={{title: 'Students'}}
    />
  </Tab.Navigator>
);

export default TeacherNavigator;
