import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const SuggestionStatusScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Suggestion Status"
      message="This workflow is intentionally deferred."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default SuggestionStatusScreen;
