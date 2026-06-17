import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const WingFeesScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Wing Fees"
      message="Wing fee screens are intentionally deferred."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default WingFeesScreen;
