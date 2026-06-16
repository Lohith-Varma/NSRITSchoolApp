import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {colors, spacing} from '../../theme';

const ScreenContainer = ({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  animated = true,
}) => {
  const Wrapper = scroll ? ScrollView : View;

  const inner = (
    <Wrapper
      keyboardShouldPersistTaps={scroll ? 'handled' : undefined}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        scroll ? [styles.scrollContent, contentContainerStyle] : undefined
      }
      style={[styles.container, style]}>
      {children}
    </Wrapper>
  );

  if (!animated) {
    return inner;
  }

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.flex}>
      {inner}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + spacing.xl,
  },
});

export default ScreenContainer;
