import React from 'react';
import {StyleSheet, Text as RNText} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Pressable} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FloatingActionButton = ({
  onPress,
  icon = 'plus',
  label,
  color = colors.primary,
  style,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {damping: 15, stiffness: 300});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {backgroundColor: color},
        label ? styles.extended : styles.round,
        style,
        animStyle,
      ]}>
      <MaterialCommunityIcons name={icon} size={22} color={colors.white} />
      {label ? <RNText style={styles.label}>{label}</RNText> : null}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    ...shadows.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: {
    borderRadius: radius.pill,
    height: 56,
    width: 56,
  },
  extended: {
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 14,
  },
});

export default FloatingActionButton;
