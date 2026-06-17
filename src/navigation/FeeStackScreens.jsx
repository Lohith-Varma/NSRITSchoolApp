import React from 'react';
import ClassFeeManagementScreen from '../screens/fees/ClassFeeManagementScreen';
import ClassWiseFeeReportScreen from '../screens/fees/ClassWiseFeeReportScreen';
import CreateFeePlanScreen from '../screens/fees/CreateFeePlanScreen';
import DueStudentsScreen from '../screens/fees/DueStudentsScreen';
import FeeCategoryManagementScreen from '../screens/fees/FeeCategoryManagementScreen';
import FeeCollectionScreen from '../screens/fees/FeeCollectionScreen';
import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import FeeLedgerScreen from '../screens/fees/FeeLedgerScreen';
import FeePlanManagementScreen from '../screens/fees/FeePlanManagementScreen';
import FeeReportsScreen from '../screens/fees/FeeReportsScreen';
import PaidStudentsScreen from '../screens/fees/PaidStudentsScreen';
import PaymentHistoryScreen from '../screens/fees/PaymentHistoryScreen';
import StudentFeeDetailsScreen from '../screens/fees/StudentFeeDetailsScreen';
import StudentFeeProfileScreen from '../screens/fees/StudentFeeProfileScreen';
import UploadOfflinePaymentScreen from '../screens/fees/UploadOfflinePaymentScreen';

export const renderFeeStackScreens = (Stack, options = {}) => (
  <>
    {/* FeeDashboard: include unless the caller already registers it (set skipDashboard: true) */}
    {!options.skipDashboard ? (
      <Stack.Screen
        name="FeeDashboard"
        component={FeeDashboardScreen}
        options={{title: 'Fees', headerShown: true}}
      />
    ) : null}
    <Stack.Screen
      name="StudentFeeDetails"
      component={StudentFeeDetailsScreen}
      options={{title: 'Student Fee', headerShown: true}}
    />
    <Stack.Screen
      name="StudentFeeProfile"
      component={StudentFeeProfileScreen}
      options={{title: 'Student Fee Profile', headerShown: true}}
    />
    <Stack.Screen
      name="FeePlanManagement"
      component={FeePlanManagementScreen}
      options={{title: 'Fee Plans', headerShown: true}}
    />
    <Stack.Screen
      name="ClassFeeManagement"
      component={ClassFeeManagementScreen}
      options={{title: 'Class Fees', headerShown: true}}
    />
    <Stack.Screen
      name="CreateFeePlan"
      component={CreateFeePlanScreen}
      options={{title: 'Create Fee Plan', headerShown: true}}
    />
    <Stack.Screen
      name="FeeCollection"
      component={FeeCollectionScreen}
      options={{title: 'Fee Collection', headerShown: true}}
    />
    <Stack.Screen
      name="FeeCategoryManagement"
      component={FeeCategoryManagementScreen}
      options={{title: 'Fee Categories', headerShown: true}}
    />
    <Stack.Screen
      name="PaymentHistory"
      component={PaymentHistoryScreen}
      options={{title: 'Payments', headerShown: true}}
    />
    <Stack.Screen
      name="FeeLedger"
      component={FeeLedgerScreen}
      options={{title: 'Ledger', headerShown: true}}
    />
    <Stack.Screen
      name="DueStudents"
      component={DueStudentsScreen}
      options={{title: 'Due Students', headerShown: true}}
    />
    <Stack.Screen
      name="PaidStudents"
      component={PaidStudentsScreen}
      options={{title: 'Paid Students', headerShown: true}}
    />
    {options.canUpload ? (
      <Stack.Screen
        name="UploadOfflinePayment"
        component={UploadOfflinePaymentScreen}
        options={{title: 'Upload Payment', headerShown: true}}
      />
    ) : null}
    {options.reports ? (
      <>
        <Stack.Screen
          name="ClassWiseFeeReport"
          component={ClassWiseFeeReportScreen}
          options={{title: 'Class-wise Report', headerShown: true}}
        />
        <Stack.Screen
          name="FeeReports"
          component={FeeReportsScreen}
          options={{title: 'Fee Reports', headerShown: true}}
        />
      </>
    ) : null}
  </>
);
