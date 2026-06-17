import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const BranchSettingsScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Branch Settings"
      message="Branch settings can be expanded once master data is finalized."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default BranchSettingsScreen;
