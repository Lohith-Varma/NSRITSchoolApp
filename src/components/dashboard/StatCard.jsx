import React, {useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedMetric from '../animated/AnimatedMetric';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const StatCard = ({
  title,
  value,
  icon = 'chart-box-outline',
  tone = colors.primary,
  description,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {damping: 20, stiffness: 300});
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 200});
  };

  // Determine if value looks numeric for AnimatedMetric
  const isNumeric = !isNaN(parseFloat(String(value))) && String(value).trim() !== '';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[styles.wrapper, animStyle]}>
      {/* Tinted top bar */}
      <View style={[styles.topBar, {backgroundColor: `${tone}18`}]}>
        <View style={[styles.iconWrap, {backgroundColor: `${tone}22`}]}>
          <MaterialCommunityIcons name={icon} size={20} color={tone} />
        </View>
        {onPress ? (
          <MaterialCommunityIcons
            name="arrow-right"
            size={14}
            color={`${tone}99`}
          />
        ) : null}
      </View>

      <View style={styles.body}>
        <AnimatedMetric
          value={value}
          isNumeric={isNumeric}
          style={[typography.metric, {color: colors.text}]}
        />
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    minWidth: '47%',
    overflow: 'hidden',
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  body: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  title: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  description: {
    ...typography.caption,
    color: colors.textSoft,
    marginTop: 2,
  },
});

export default StatCard;
