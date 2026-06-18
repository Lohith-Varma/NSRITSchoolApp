import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../theme';

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
import RevenueOverviewScreen from '../screens/mainAdmin/RevenueOverviewScreen';
import ProfileScreen from '../screens/mainAdmin/ProfileScreen';
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
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import CreateNotificationScreen from '../screens/accountant/CreateNotificationScreen';
import {renderFeeStackScreens} from './FeeStackScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tabs (Main Admin only) ──────────────────────────────────────────
const MainAdminTabs = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({color}) => {
        const icons = {
          Dashboard: 'view-dashboard',
          Schools: 'office-building',
          Users: 'account-group',
          Reports: 'chart-line',
          Settings: 'cog',
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
    <Tab.Screen name="Schools" component={BranchListScreen} />
    <Tab.Screen name="Users" component={ManageUsersScreen} />
    <Tab.Screen name="Reports" component={GlobalAnalyticsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// ─── Stack wraps Tabs + all push-navigable routes ───────────────────────────
const MainAdminNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    {/* Root: the tab bar */}
    <Stack.Screen name="MainAdminTabs" component={MainAdminTabs} />

    {/* ── Alias routes so existing navigate() calls still work ── */}
    <Stack.Screen name="ManageBranches" component={BranchListScreen} />
    <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
    <Stack.Screen name="GlobalAnalytics" component={GlobalAnalyticsScreen} />

    {/* ── Detail/push screens ── */}
    <Stack.Screen name="BranchList" component={BranchListScreen} />
    <Stack.Screen name="BranchContext" component={BranchContextScreen} />
    <Stack.Screen name="BranchOperationsDashboard" component={BranchOperationsDashboard} />
    <Stack.Screen name="BranchDetails" component={BranchDetailsScreen} />
    <Stack.Screen name="EditBranch" component={EditBranchScreen} />
    <Stack.Screen name="GlobalClasses" component={GlobalClassesScreen} />
    <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
    <Stack.Screen name="GlobalStudents" component={GlobalStudentsScreen} />
    <Stack.Screen name="GlobalStudentProfile" component={GlobalStudentProfileScreen} />
    <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
    <Stack.Screen name="GlobalReports" component={GlobalReportsScreen} />
    <Stack.Screen name="CreateBranch" component={CreateBranchScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
    <Stack.Screen name="BranchSettings" component={BranchSettingsScreen} />
    <Stack.Screen name="ViewAllAttendance" component={ViewAllAttendanceScreen} />
    <Stack.Screen name="CoordinatorManagement" component={CoordinatorManagementScreen} />
    <Stack.Screen name="CreateCoordinator" component={CreateCoordinatorScreen} />
    <Stack.Screen name="EditCoordinator" component={EditCoordinatorScreen} />
    <Stack.Screen name="CoordinatorDetails" component={CoordinatorDetailsScreen} />
    <Stack.Screen name="ClassManagement" component={ClassManagementScreen} />
    <Stack.Screen name="SectionManagement" component={SectionManagementScreen} />
    <Stack.Screen name="SectionDetails" component={SectionDetailsScreen} />
    <Stack.Screen name="CreateSection" component={CreateSectionScreen} />
    <Stack.Screen name="AssignClassTeacher" component={AssignClassTeacherScreen} />
    <Stack.Screen name="AccountantManagement" component={AccountantManagementScreen} />
    <Stack.Screen name="CreateAccountant" component={CreateAccountantScreen} />
    <Stack.Screen name="EditAccountant" component={EditAccountantScreen} />
    <Stack.Screen name="AccountantProfile" component={AccountantProfileScreen} />
    <Stack.Screen name="PromotionManagement" component={PromotionManagementScreen} />
    <Stack.Screen name="PromotionHistory" component={PromotionHistoryScreen} />
    <Stack.Screen name="TeacherManagement" component={TeacherManagementScreen} />
    <Stack.Screen name="CreateTeacher" component={CreateTeacherScreen} />
    <Stack.Screen name="EditTeacher" component={EditTeacherScreen} />
    <Stack.Screen name="TeacherDetails" component={TeacherDetailsScreen} />
    <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
    <Stack.Screen name="SubjectManagement" component={SubjectManagementScreen} />
    <Stack.Screen name="AssignSubjects" component={AssignSubjectsScreen} />
    <Stack.Screen name="StudentManagement" component={StudentManagementScreen} />
    <Stack.Screen name="StudentSearch" component={StudentSearchScreen} />
    <Stack.Screen name="AddStudent" component={AddStudentScreen} />
    <Stack.Screen name="CreateStudent" component={AddStudentScreen} />
    <Stack.Screen name="EditStudent" component={EditStudentScreen} />
    <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
    <Stack.Screen name="BulkStudentImport" component={BulkStudentImportScreen} />
    <Stack.Screen name="TransferStudent" component={TransferStudentScreen} />
    <Stack.Screen name="RevenueOverview" component={RevenueOverviewScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{headerShown: true, title: 'Notifications'}} />
    <Stack.Screen name="CreateNotification" component={CreateNotificationScreen} options={{headerShown: false}} />
    {renderFeeStackScreens(Stack, {canUpload: true, reports: true})}
  </Stack.Navigator>
);

export default MainAdminNavigator;
