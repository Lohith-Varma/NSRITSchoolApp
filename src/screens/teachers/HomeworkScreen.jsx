import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const HomeworkScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Homework is out of scope"
      message="Homework workflows are reserved for a later phase."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default HomeworkScreen;
