import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const SettingsScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="No settings yet"
      message="Configuration screens can be expanded after core operations stabilize."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default SettingsScreen;
