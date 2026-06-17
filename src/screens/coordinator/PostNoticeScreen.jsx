import React from 'react';
import {View, StyleSheet} from 'react-native';
import {EmptyState} from '../../components';
import {colors} from '../../theme';

const PostNoticeScreen = () => (
  <View style={styles.root}>
    <EmptyState
      title="Notices are out of scope"
      message="Notice posting is not part of phases 1-4."
    />
  </View>
);

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
});

export default PostNoticeScreen;
