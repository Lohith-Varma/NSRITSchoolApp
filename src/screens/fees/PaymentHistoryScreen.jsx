import React, {useEffect} from 'react';
import {FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  EmptyState,
  PaymentCard,
  ScreenContainer,
  SectionHeader,
} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import {fetchFees} from '../../store/slices/feeSlice';
import feeService from '../../services/fees/feeService';

const PaymentHistoryScreen = () => {
  const dispatch = useDispatch();
  const access = useFeeAccess();
  const canViewPaymentHistory = feeService.canRecordPayments(access.role);
  const {payments, loading} = useSelector(state => state.fees);

  useEffect(() => {
    if (canViewPaymentHistory) {
      dispatch(fetchFees(access));
    }
  }, [access, canViewPaymentHistory, dispatch]);

  if (!canViewPaymentHistory) {
    return (
      <ScreenContainer>
        <EmptyState title="Payment history access denied" message="Only accountants and principals can view payment history." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SectionHeader
        title="Payment History"
        subtitle="Cash, UPI, and ledger transactions"
      />
      <FlatList
        data={payments}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        refreshing={loading}
        renderItem={({item}) => <PaymentCard payment={item} />}
        ListEmptyComponent={
          <EmptyState
            title="No payments"
            message="Payment history will appear here."
          />
        }
      />
    </ScreenContainer>
  );
};

export default PaymentHistoryScreen;
