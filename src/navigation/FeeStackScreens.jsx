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
    <Stack.Screen
      name="FeeDashboard"
      component={FeeDashboardScreen}
      options={{title: 'Fees'}}
    />
    <Stack.Screen
      name="StudentFeeDetails"
      component={StudentFeeDetailsScreen}
      options={{title: 'Student Fee'}}
    />
    <Stack.Screen
      name="StudentFeeProfile"
      component={StudentFeeProfileScreen}
      options={{title: 'Student Fee Profile'}}
    />
    <Stack.Screen
      name="FeePlanManagement"
      component={FeePlanManagementScreen}
      options={{title: 'Fee Plans'}}
    />
    <Stack.Screen
      name="ClassFeeManagement"
      component={ClassFeeManagementScreen}
      options={{title: 'Class Fees'}}
    />
    <Stack.Screen
      name="CreateFeePlan"
      component={CreateFeePlanScreen}
      options={{title: 'Create Fee Plan'}}
    />
    <Stack.Screen
      name="FeeCollection"
      component={FeeCollectionScreen}
      options={{title: 'Fee Collection'}}
    />
    <Stack.Screen
      name="FeeCategoryManagement"
      component={FeeCategoryManagementScreen}
      options={{title: 'Fee Categories'}}
    />
    <Stack.Screen
      name="PaymentHistory"
      component={PaymentHistoryScreen}
      options={{title: 'Payments'}}
    />
    <Stack.Screen
      name="FeeLedger"
      component={FeeLedgerScreen}
      options={{title: 'Ledger'}}
    />
    <Stack.Screen
      name="DueStudents"
      component={DueStudentsScreen}
      options={{title: 'Due Students'}}
    />
    <Stack.Screen
      name="PaidStudents"
      component={PaidStudentsScreen}
      options={{title: 'Paid Students'}}
    />
    {options.canUpload ? (
      <Stack.Screen
        name="UploadOfflinePayment"
        component={UploadOfflinePaymentScreen}
        options={{title: 'Upload Payment'}}
      />
    ) : null}
    {options.reports ? (
      <>
        <Stack.Screen
          name="ClassWiseFeeReport"
          component={ClassWiseFeeReportScreen}
          options={{title: 'Class-wise Report'}}
        />
        <Stack.Screen
          name="FeeReports"
          component={FeeReportsScreen}
          options={{title: 'Fee Reports'}}
        />
      </>
    ) : null}
  </>
);
