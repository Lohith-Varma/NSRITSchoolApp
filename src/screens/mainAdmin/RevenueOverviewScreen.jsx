import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const RevenueOverviewScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Revenue is out of scope"
      message="Payment and fee gateway work is intentionally excluded."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default RevenueOverviewScreen;
