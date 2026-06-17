import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const SummaryCard = ({title, value, subtitle, progress = 0, tone = colors.primary}) => {
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
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${safeProgress * 100}%`, backgroundColor: tone}]} />
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.soft,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  row: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  copy: {flex: 1, minWidth: 0, paddingRight: spacing.md},
  title: {...typography.caption, color: colors.textMuted, textTransform: 'uppercase'},
  value: {...typography.title, color: colors.text, marginTop: spacing.xs},
  percent: {...typography.subtitle},
  progressTrack: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    height: 8,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {borderRadius: radius.pill, height: 8},
  subtitle: {color: colors.textMuted, marginTop: spacing.sm},
});

export default SummaryCard;
