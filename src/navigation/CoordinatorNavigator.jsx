import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/coordinator/DashboardScreen';
import WingAttendanceScreen from '../screens/coordinator/WingAttendanceScreen';
import EditAttendanceScreen from '../screens/coordinator/EditAttendanceScreen';
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

const CoordinatorNavigator = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="CoordinatorDashboard"
      component={DashboardScreen}
      options={{title: 'Coordinator'}}
    />
    <Stack.Screen
      name="AssignTeachers"
      component={TeacherManagementScreen}
      options={{title: 'Teachers'}}
    />
    <Stack.Screen
      name="TeacherManagement"
      component={TeacherManagementScreen}
      options={{title: 'Teachers'}}
    />
    <Stack.Screen
      name="CreateTeacher"
      component={CreateTeacherScreen}
      options={{title: 'Create Teacher'}}
    />
    <Stack.Screen
      name="EditTeacher"
      component={EditTeacherScreen}
      options={{title: 'Edit Teacher'}}
    />
    <Stack.Screen
      name="TeacherDetails"
      component={TeacherDetailsScreen}
      options={{title: 'Teacher Details'}}
    />
    <Stack.Screen
      name="TeacherProfile"
      component={TeacherProfileScreen}
      options={{title: 'Teacher Profile'}}
    />
    <Stack.Screen
      name="AssignSubjects"
      component={AssignSubjectsScreen}
      options={{title: 'Assign Subjects'}}
    />
    <Stack.Screen
      name="AssignClassTeacher"
      component={AssignClassTeacherScreen}
      options={{title: 'Assign Class Teacher'}}
    />
    <Stack.Screen
      name="WingAttendance"
      component={WingAttendanceScreen}
      options={{title: 'Wing Attendance'}}
    />
    <Stack.Screen
      name="EditAttendance"
      component={EditAttendanceScreen}
      options={{title: 'Correct Attendance'}}
    />
    <Stack.Screen
      name="WingStudents"
      component={StudentManagementScreen}
      options={{title: 'Wing Students'}}
    />
    <Stack.Screen
      name="Students"
      component={StudentManagementScreen}
      options={{title: 'Students'}}
    />
    <Stack.Screen
      name="StudentManagement"
      component={StudentManagementScreen}
      options={{title: 'Students'}}
    />
    <Stack.Screen
      name="StudentSearch"
      component={StudentSearchScreen}
      options={{title: 'Search Students'}}
    />
    <Stack.Screen
      name="CreateStudent"
      component={AddStudentScreen}
      options={{title: 'Add Student'}}
    />
    <Stack.Screen
      name="AddStudent"
      component={AddStudentScreen}
      options={{title: 'Add Student'}}
    />
    <Stack.Screen
      name="EditStudent"
      component={EditStudentScreen}
      options={{title: 'Edit Student'}}
    />
    <Stack.Screen
      name="StudentDetails"
      component={StudentDetailsScreen}
      options={{title: 'Student Details'}}
    />
    <Stack.Screen
      name="BulkStudentImport"
      component={BulkStudentImportScreen}
      options={{title: 'Bulk Import'}}
    />
    <Stack.Screen
      name="TransferStudent"
      component={TransferStudentScreen}
      options={{title: 'Transfer Student'}}
    />
    {renderFeeStackScreens(Stack, {reports: true})}
  </Stack.Navigator>
);

export default CoordinatorNavigator;
