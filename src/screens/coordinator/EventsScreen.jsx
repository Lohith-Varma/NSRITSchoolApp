import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const EventsScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Events (Coming Soon)"
      message="Event management is planned for a future phase."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default EventsScreen;
