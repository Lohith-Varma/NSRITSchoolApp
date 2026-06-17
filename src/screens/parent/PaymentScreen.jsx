import React from 'react';
import {StyleSheet, View} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const PaymentScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Payments are out of scope"
      message="Razorpay and payment gateway work are not implemented."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default PaymentScreen;
