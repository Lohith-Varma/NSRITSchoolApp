import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {colors, spacing} from '../../theme';

const ScreenContainer = ({children, scroll = true, style, contentContainerStyle}) => {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <Wrapper
      keyboardShouldPersistTaps={scroll ? 'handled' : undefined}
      contentContainerStyle={
        scroll ? [styles.scrollContent, contentContainerStyle] : undefined
      }
      style={[styles.container, style]}>
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + spacing.lg,
  },
});

export default ScreenContainer;
