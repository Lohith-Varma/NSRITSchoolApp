import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/branchAdmin/DashboardScreen';
import ManageTeachersScreen from '../screens/branchAdmin/ManageTeachersScreen';
import ManageStudentsScreen from '../screens/branchAdmin/ManageStudentsScreen';
import CreateStudentScreen from '../screens/branchAdmin/CreateStudentScreen';
import BulkStudentUploadScreen from '../screens/branchAdmin/BulkStudentUploadScreen';
import AttendanceOverviewScreen from '../screens/branchAdmin/AttendanceOverviewScreen';
import BranchSettingsScreen from '../screens/branchAdmin/BranchSettingsScreen';
import AssignClassTeacherScreen from '../screens/principal/AssignClassTeacherScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();

const BranchAdminNavigator = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="BranchAdminDashboard"
      component={DashboardScreen}
      options={{title: 'Branch Admin'}}
    />
    <Stack.Screen
      name="ManageTeachers"
      component={ManageTeachersScreen}
      options={{title: 'Teachers'}}
    />
    <Stack.Screen
      name="ManageStudents"
      component={ManageStudentsScreen}
      options={{title: 'Students'}}
    />
    <Stack.Screen
      name="CreateStudent"
      component={CreateStudentScreen}
      options={{title: 'Create Student'}}
    />
    <Stack.Screen
      name="BulkStudentUpload"
      component={BulkStudentUploadScreen}
      options={{title: 'Bulk Upload'}}
    />
    <Stack.Screen
      name="AttendanceOverview"
      component={AttendanceOverviewScreen}
      options={{title: 'Attendance'}}
    />
    <Stack.Screen
      name="AssignClassTeacher"
      component={AssignClassTeacherScreen}
      options={{title: 'Class Teachers'}}
    />
    <Stack.Screen
      name="BranchSettings"
      component={BranchSettingsScreen}
      options={{title: 'Settings'}}
    />
    {renderFeeStackScreens(Stack, {reports: true})}
  </Stack.Navigator>
);

export default BranchAdminNavigator;
