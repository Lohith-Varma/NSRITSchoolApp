import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/mainAdmin/DashboardScreen';
import AuditLogsScreen from '../screens/mainAdmin/AuditLogsScreen';
import BranchDetailsScreen from '../screens/mainAdmin/BranchDetailsScreen';
import BranchContextScreen from '../screens/mainAdmin/BranchContextScreen';
import BranchListScreen from '../screens/mainAdmin/BranchListScreen';
import BranchOperationsDashboard from '../screens/mainAdmin/BranchOperationsDashboard';
import ClassDetailsScreen from '../screens/mainAdmin/ClassDetailsScreen';
import CreateBranchScreen from '../screens/mainAdmin/CreateBranchScreen';
import EditBranchScreen from '../screens/mainAdmin/EditBranchScreen';
import GlobalAnalyticsScreen from '../screens/mainAdmin/GlobalAnalyticsScreen';
import GlobalClassesScreen from '../screens/mainAdmin/GlobalClassesScreen';
import GlobalReportsScreen from '../screens/mainAdmin/GlobalReportsScreen';
import GlobalStudentsScreen from '../screens/mainAdmin/GlobalStudentsScreen';
import GlobalStudentProfileScreen from '../screens/mainAdmin/GlobalStudentProfileScreen';
import ManageUsersScreen from '../screens/mainAdmin/ManageUsersScreen';
import SettingsScreen from '../screens/mainAdmin/SettingsScreen';
import StudentProfileScreen from '../screens/mainAdmin/StudentProfileScreen';
import BranchSettingsScreen from '../screens/branchAdmin/BranchSettingsScreen';
import ViewAllAttendanceScreen from '../screens/principal/ViewAllAttendanceScreen';
import CoordinatorManagementScreen from '../screens/principal/CoordinatorManagementScreen';
import CreateCoordinatorScreen from '../screens/principal/CreateCoordinatorScreen';
import EditCoordinatorScreen from '../screens/principal/EditCoordinatorScreen';
import CoordinatorDetailsScreen from '../screens/principal/CoordinatorDetailsScreen';
import ClassManagementScreen from '../screens/principal/ClassManagementScreen';
import SectionManagementScreen from '../screens/principal/SectionManagementScreen';
import SectionDetailsScreen from '../screens/principal/SectionDetailsScreen';
import CreateSectionScreen from '../screens/principal/CreateSectionScreen';
import AssignClassTeacherScreen from '../screens/principal/AssignClassTeacherScreen';
import AccountantManagementScreen from '../screens/principal/AccountantManagementScreen';
import CreateAccountantScreen from '../screens/principal/CreateAccountantScreen';
import EditAccountantScreen from '../screens/principal/EditAccountantScreen';
import AccountantProfileScreen from '../screens/principal/AccountantProfileScreen';
import PromotionManagementScreen from '../screens/principal/PromotionManagementScreen';
import PromotionHistoryScreen from '../screens/principal/PromotionHistoryScreen';
import TeacherManagementScreen from '../screens/teachers/TeacherManagementScreen';
import CreateTeacherScreen from '../screens/teachers/CreateTeacherScreen';
import EditTeacherScreen from '../screens/teachers/EditTeacherScreen';
import TeacherDetailsScreen from '../screens/teachers/TeacherDetailsScreen';
import TeacherProfileScreen from '../screens/teachers/TeacherProfileScreen';
import SubjectManagementScreen from '../screens/teachers/SubjectManagementScreen';
import AssignSubjectsScreen from '../screens/teachers/AssignSubjectsScreen';
import StudentManagementScreen from '../screens/students/StudentManagementScreen';
import StudentSearchScreen from '../screens/students/StudentSearchScreen';
import AddStudentScreen from '../screens/students/AddStudentScreen';
import EditStudentScreen from '../screens/students/EditStudentScreen';
import StudentDetailsScreen from '../screens/students/StudentDetailsScreen';
import BulkStudentImportScreen from '../screens/students/BulkStudentImportScreen';
import TransferStudentScreen from '../screens/students/TransferStudentScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();

const MainAdminNavigator = () => (
  <Stack.Navigator screenOptions={{headerTitleAlign: 'center'}}>
    <Stack.Screen
      name="MainAdminDashboard"
      component={DashboardScreen}
      options={{title: 'Main Admin'}}
    />
    <Stack.Screen
      name="BranchList"
      component={BranchListScreen}
      options={{title: 'Branches'}}
    />
    <Stack.Screen
      name="BranchContext"
      component={BranchContextScreen}
      options={{title: 'Branch Context'}}
    />
    <Stack.Screen
      name="BranchOperationsDashboard"
      component={BranchOperationsDashboard}
      options={{title: 'Branch Operations'}}
    />
    <Stack.Screen
      name="BranchDetails"
      component={BranchDetailsScreen}
      options={{title: 'Branch Details'}}
    />
    <Stack.Screen
      name="EditBranch"
      component={EditBranchScreen}
      options={{title: 'Edit Branch'}}
    />
    <Stack.Screen
      name="GlobalClasses"
      component={GlobalClassesScreen}
      options={{title: 'Global Classes'}}
    />
    <Stack.Screen
      name="ClassDetails"
      component={ClassDetailsScreen}
      options={{title: 'Class Details'}}
    />
    <Stack.Screen
      name="GlobalStudents"
      component={GlobalStudentsScreen}
      options={{title: 'Global Students'}}
    />
    <Stack.Screen
      name="GlobalStudentProfile"
      component={GlobalStudentProfileScreen}
      options={{title: 'Global Student Profile'}}
    />
    <Stack.Screen
      name="StudentProfile"
      component={StudentProfileScreen}
      options={{title: 'Student Profile'}}
    />
    <Stack.Screen
      name="GlobalReports"
      component={GlobalReportsScreen}
      options={{title: 'Global Reports'}}
    />
    <Stack.Screen
      name="GlobalAnalytics"
      component={GlobalAnalyticsScreen}
      options={{title: 'Reports'}}
    />
    <Stack.Screen
      name="CreateBranch"
      component={CreateBranchScreen}
      options={{title: 'Create Branch'}}
    />
    <Stack.Screen
      name="ManageBranches"
      component={BranchListScreen}
      options={{title: 'Branches'}}
    />
    <Stack.Screen
      name="ManageUsers"
      component={ManageUsersScreen}
      options={{title: 'Users'}}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{title: 'Settings'}}
    />
    <Stack.Screen name="AuditLogs" component={AuditLogsScreen} options={{title: 'Audit Logs'}} />
    <Stack.Screen name="BranchSettings" component={BranchSettingsScreen} options={{title: 'Branch Settings'}} />
    <Stack.Screen name="ViewAllAttendance" component={ViewAllAttendanceScreen} options={{title: 'Attendance'}} />
    <Stack.Screen name="CoordinatorManagement" component={CoordinatorManagementScreen} options={{title: 'Coordinators'}} />
    <Stack.Screen name="CreateCoordinator" component={CreateCoordinatorScreen} options={{title: 'Create Coordinator'}} />
    <Stack.Screen name="EditCoordinator" component={EditCoordinatorScreen} options={{title: 'Edit Coordinator'}} />
    <Stack.Screen name="CoordinatorDetails" component={CoordinatorDetailsScreen} options={{title: 'Coordinator Details'}} />
    <Stack.Screen name="ClassManagement" component={ClassManagementScreen} options={{title: 'Classes'}} />
    <Stack.Screen name="SectionManagement" component={SectionManagementScreen} options={{title: 'Sections'}} />
    <Stack.Screen name="SectionDetails" component={SectionDetailsScreen} options={{title: 'Section Details'}} />
    <Stack.Screen name="CreateSection" component={CreateSectionScreen} options={{title: 'Create Section'}} />
    <Stack.Screen name="AssignClassTeacher" component={AssignClassTeacherScreen} options={{title: 'Assign Class Teacher'}} />
    <Stack.Screen name="AccountantManagement" component={AccountantManagementScreen} options={{title: 'Accountants'}} />
    <Stack.Screen name="CreateAccountant" component={CreateAccountantScreen} options={{title: 'Create Accountant'}} />
    <Stack.Screen name="EditAccountant" component={EditAccountantScreen} options={{title: 'Edit Accountant'}} />
    <Stack.Screen name="AccountantProfile" component={AccountantProfileScreen} options={{title: 'Accountant Profile'}} />
    <Stack.Screen name="PromotionManagement" component={PromotionManagementScreen} options={{title: 'Promotions'}} />
    <Stack.Screen name="PromotionHistory" component={PromotionHistoryScreen} options={{title: 'Promotion History'}} />
    <Stack.Screen name="TeacherManagement" component={TeacherManagementScreen} options={{title: 'Teachers'}} />
    <Stack.Screen name="CreateTeacher" component={CreateTeacherScreen} options={{title: 'Create Teacher'}} />
    <Stack.Screen name="EditTeacher" component={EditTeacherScreen} options={{title: 'Edit Teacher'}} />
    <Stack.Screen name="TeacherDetails" component={TeacherDetailsScreen} options={{title: 'Teacher Details'}} />
    <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} options={{title: 'Teacher Profile'}} />
    <Stack.Screen name="SubjectManagement" component={SubjectManagementScreen} options={{title: 'Subjects'}} />
    <Stack.Screen name="AssignSubjects" component={AssignSubjectsScreen} options={{title: 'Assign Subjects'}} />
    <Stack.Screen name="StudentManagement" component={StudentManagementScreen} options={{title: 'Students'}} />
    <Stack.Screen name="StudentSearch" component={StudentSearchScreen} options={{title: 'Search Students'}} />
    <Stack.Screen name="AddStudent" component={AddStudentScreen} options={{title: 'Add Student'}} />
    <Stack.Screen name="CreateStudent" component={AddStudentScreen} options={{title: 'Add Student'}} />
    <Stack.Screen name="EditStudent" component={EditStudentScreen} options={{title: 'Edit Student'}} />
    <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} options={{title: 'Student Details'}} />
    <Stack.Screen name="BulkStudentImport" component={BulkStudentImportScreen} options={{title: 'Bulk Import'}} />
    <Stack.Screen name="TransferStudent" component={TransferStudentScreen} options={{title: 'Transfer Student'}} />
    {renderFeeStackScreens(Stack, {canUpload: true, reports: true})}
  </Stack.Navigator>
);

export default MainAdminNavigator;
