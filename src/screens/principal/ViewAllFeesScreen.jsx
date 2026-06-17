import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const ViewAllFeesScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Fees are out of scope"
      message="Fee views are intentionally deferred."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default ViewAllFeesScreen;
