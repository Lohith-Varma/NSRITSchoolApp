import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const FeeOverviewScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Fees are out of scope"
      message="Fee payment and gateway integrations are intentionally not implemented."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default FeeOverviewScreen;
