import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../theme';

import DashboardScreen from '../screens/coordinator/DashboardScreen';
import WingAttendanceScreen from '../screens/coordinator/WingAttendanceScreen';
import EditAttendanceScreen from '../screens/coordinator/EditAttendanceScreen';
import WingStudentsScreen from '../screens/coordinator/WingStudentsScreen';
import EventsScreen from '../screens/coordinator/EventsScreen';
import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import AssignTeachersScreen from '../screens/coordinator/AssignTeachersScreen';

import AddStudentScreen from '../screens/students/AddStudentScreen';
import EditStudentScreen from '../screens/students/EditStudentScreen';
import StudentDetailsScreen from '../screens/students/StudentDetailsScreen';
import StudentManagementScreen from '../screens/students/StudentManagementScreen';
import BulkStudentImportScreen from '../screens/students/BulkStudentImportScreen';
import StudentSearchScreen from '../screens/students/StudentSearchScreen';
import TransferStudentScreen from '../screens/students/TransferStudentScreen';
import TeacherManagementScreen from '../screens/teachers/TeacherManagementScreen';
import CreateTeacherScreen from '../screens/teachers/CreateTeacherScreen';
import EditTeacherScreen from '../screens/teachers/EditTeacherScreen';
import TeacherDetailsScreen from '../screens/teachers/TeacherDetailsScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import AssignSubjectsScreen from '../screens/teachers/AssignSubjectsScreen';
import AssignClassTeacherScreen from '../screens/principal/AssignClassTeacherScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Coordinator only) ─────────────────────────────────────────
const CoordinatorTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({color}) => {
        const icons = {
          Dashboard: 'view-dashboard',
          Classes: 'google-classroom',
          Attendance: 'clipboard-check',
          Events: 'calendar-star',
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
    <Tab.Screen name="Classes" component={WingStudentsScreen} />
    <Tab.Screen name="Attendance" component={WingAttendanceScreen} />
    <Tab.Screen name="Events" component={EventsScreen} />
    {/* Profile tab — uses the DashboardScreen as a fallback since Coordinator has no dedicated profile screen */}
    <Tab.Screen name="Profile" component={DashboardScreen} />
  </Tab.Navigator>
);

const CoordinatorNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    {/* Root: the tab bar */}
    <Stack.Screen name="CoordinatorTabs" component={CoordinatorTabs} />

    {/* ── Alias routes so ERPLayout sidebar navigate() calls work ── */}
    {/* ERPLayout sidebar calls navigate('WingStudents') */}
    <Stack.Screen name="WingStudents" component={WingStudentsScreen} />
    {/* ERPLayout sidebar calls navigate('WingAttendance') */}
    <Stack.Screen name="WingAttendance" component={WingAttendanceScreen} />
    {/* ERPLayout sidebar calls navigate('FeeDashboard') */}
    <Stack.Screen name="FeeDashboard" component={FeeDashboardScreen} />

    {/* ── Push/Detail screens ── */}
    <Stack.Screen name="AssignTeachers" component={AssignTeachersScreen} />
    <Stack.Screen name="EditAttendance" component={EditAttendanceScreen} />
    <Stack.Screen name="TeacherManagement" component={TeacherManagementScreen} />
    <Stack.Screen name="CreateTeacher" component={CreateTeacherScreen} />
    <Stack.Screen name="EditTeacher" component={EditTeacherScreen} />
    <Stack.Screen name="TeacherDetails" component={TeacherDetailsScreen} />
    <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
    <Stack.Screen name="AssignSubjects" component={AssignSubjectsScreen} />
    <Stack.Screen name="AssignClassTeacher" component={AssignClassTeacherScreen} />
    <Stack.Screen name="Students" component={StudentManagementScreen} />
    <Stack.Screen name="StudentManagement" component={StudentManagementScreen} />
    <Stack.Screen name="StudentSearch" component={StudentSearchScreen} />
    <Stack.Screen name="CreateStudent" component={AddStudentScreen} />
    <Stack.Screen name="AddStudent" component={AddStudentScreen} />
    <Stack.Screen name="EditStudent" component={EditStudentScreen} />
    <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
    <Stack.Screen name="BulkStudentImport" component={BulkStudentImportScreen} />
    <Stack.Screen name="TransferStudent" component={TransferStudentScreen} />

    {/* ── Shared fee sub-screens ── */}
    {renderFeeStackScreens(Stack, {skipDashboard: true, reports: true})}
  </Stack.Navigator>
);

export default CoordinatorNavigator;
