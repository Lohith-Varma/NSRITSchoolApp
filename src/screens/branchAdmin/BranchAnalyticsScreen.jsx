import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const BranchAnalyticsScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Analytics are out of scope"
      message="Only operational branch views are implemented in the current phases."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default BranchAnalyticsScreen;
