import React, {memo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ATTENDANCE_STATUS} from '../../config/constants';
import {colors, radius, spacing, typography} from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const StudentListItem = ({
  student,
  checked,
  status = ATTENDANCE_STATUS.PRESENT,
  onToggle,
  right,
}) => {
  const scale = useSharedValue(1);

  const isPresent = status === ATTENDANCE_STATUS.PRESENT;
  const accentColor = isPresent ? colors.success : colors.danger;
  const bgTint = isPresent ? `${colors.success}09` : `${colors.danger}07`;
  const avatarBg = isPresent ? `${colors.success}1F` : `${colors.danger}1C`;
  const badgeBg = isPresent ? `${colors.success}18` : `${colors.danger}15`;

  const animStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));

  const handlePress = () => {
    if (!onToggle) {return;}
    scale.value = withSpring(0.965, {damping: 14, stiffness: 300}, () => {
      scale.value = withSpring(1, {damping: 11, stiffness: 240});
    });
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={onToggle ? handlePress : undefined}
      style={[
        animStyle,
        styles.wrapper,
        {borderLeftColor: accentColor, backgroundColor: bgTint},
      ]}>
      <View style={styles.row}>
        <View style={[styles.avatar, {backgroundColor: avatarBg}]}>
          <Text style={[styles.avatarText, {color: accentColor}]}>
            {getInitials(student.name)}
          </Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {student.name}
          </Text>
          <Text style={styles.meta}>Roll {student.rollNo}</Text>
        </View>
        {right != null
          ? right
          : onToggle
          ? (
            <View style={[styles.badge, {backgroundColor: badgeBg}]}>
              <MaterialCommunityIcons
                name={isPresent ? 'check-circle' : 'close-circle'}
                size={14}
                color={accentColor}
              />
              <Text style={[styles.badgeLabel, {color: accentColor}]}>
                {isPresent ? 'Present' : 'Absent'}
              </Text>
            </View>
          )
          : null}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderLeftWidth: 3,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  avatarText: {fontSize: 13, fontWeight: '800'},
  copy: {flex: 1, minWidth: 0},
  name: {...typography.bodyBold, color: colors.text},
  meta: {...typography.caption, color: colors.textMuted, marginTop: 1},
  badge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeLabel: {fontSize: 11, fontWeight: '700'},
});

export default memo(StudentListItem);
