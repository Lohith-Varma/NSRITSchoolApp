import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, TouchableRipple} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const StatCard = ({
  title,
  value,
  icon = 'chart-box-outline',
  tone = colors.primary,
  description,
  onPress,
}) => (
  <TouchableRipple borderless onPress={onPress} style={styles.wrapper}>
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.icon, {backgroundColor: `${tone}14`}]}>
          <MaterialCommunityIcons name={icon} size={22} color={tone} />
        </View>
        {onPress ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={colors.textSoft}
          />
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  </TouchableRipple>
);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    flex: 1,
    minWidth: '47%',
  },
  card: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    minHeight: 128,
    padding: spacing.lg,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  value: {
    ...typography.metric,
    color: colors.text,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  description: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

export default StatCard;
