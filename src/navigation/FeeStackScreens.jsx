import React from 'react';
import ClassWiseFeeReportScreen from '../screens/fees/ClassWiseFeeReportScreen';
import DueStudentsScreen from '../screens/fees/DueStudentsScreen';
import FeeDashboardScreen from '../screens/fees/FeeDashboardScreen';
import FeeLedgerScreen from '../screens/fees/FeeLedgerScreen';
import PaidStudentsScreen from '../screens/fees/PaidStudentsScreen';
import PaymentHistoryScreen from '../screens/fees/PaymentHistoryScreen';
import StudentFeeDetailsScreen from '../screens/fees/StudentFeeDetailsScreen';
import UploadOfflinePaymentScreen from '../screens/fees/UploadOfflinePaymentScreen';

export const renderFeeStackScreens = (Stack, options = {}) => (
  <>
    {/* FeeDashboard: include unless the caller already registers it (set skipDashboard: true) */}
    {!options.skipDashboard ? (
      <Stack.Screen
        name="FeeDashboard"
        component={FeeDashboardScreen}
        options={{title: 'Fees'}}
      />
    ) : null}
    <Stack.Screen
      name="StudentFeeDetails"
      component={StudentFeeDetailsScreen}
      options={{title: 'Student Fee'}}
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
      <Stack.Screen
        name="ClassWiseFeeReport"
        component={ClassWiseFeeReportScreen}
        options={{title: 'Class-wise Report'}}
      />
    ) : null}
  </>
);
