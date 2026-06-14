import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ProgressBar, Text} from 'react-native-paper';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const SummaryCard = ({
  title,
  value,
  subtitle,
  progress = 0,
  tone = colors.primary,
}) => {
  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 1);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        <Text style={[styles.percent, {color: tone}]}>
          {Math.round(safeProgress * 100)}%
        </Text>
      </View>
      <ProgressBar
        progress={safeProgress}
        color={tone}
        style={styles.progress}
      />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.md,
  },
  title: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xs,
  },
  percent: {
    ...typography.subtitle,
  },
  progress: {
    borderRadius: radius.pill,
    height: 8,
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

export default SummaryCard;
