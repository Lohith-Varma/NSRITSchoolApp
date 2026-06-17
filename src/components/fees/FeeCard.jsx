import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import StatusBadge from '../common/StatusBadge';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const money = value => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const FeeCard = ({student, onPress}) => {
  const paidRatio = student.totalFee ? student.paidAmount / student.totalFee : 0;
  const clampedRatio = Math.min(1, Math.max(0, paidRatio));
  const barColor = student.dueAmount > 0 ? colors.warning : colors.success;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed && {opacity: 0.9}]}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.name}>{student.studentName}</Text>
          <Text style={styles.meta}>
            {student.className} - {student.sectionName}
          </Text>
        </View>
        <StatusBadge status={student.status} />
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${Math.round(clampedRatio * 100)}%`, backgroundColor: barColor}]} />
      </View>
      <View style={styles.amountRow}>
        <View>
          <Text style={styles.amountLabel}>Paid</Text>
          <Text style={[styles.amount, styles.paid]}>{money(student.paidAmount)}</Text>
        </View>
        <View>
          <Text style={styles.amountLabel}>Due</Text>
          <Text style={[styles.amount, student.dueAmount > 0 && styles.due]}>{money(student.dueAmount)}</Text>
        </View>
      </View>
    </Pressable>
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {flex: 1, minWidth: 0, paddingRight: spacing.md},
  name: {...typography.sectionTitle, color: colors.text},
  meta: {color: colors.textMuted, marginTop: spacing.xxs},
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 9,
    marginVertical: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {borderRadius: radius.pill, height: '100%'},
  amountRow: {flexDirection: 'row', justifyContent: 'space-between'},
  amountLabel: {...typography.caption, color: colors.textMuted, textTransform: 'uppercase'},
  amount: {...typography.subtitle, color: colors.text, marginTop: spacing.xs},
  paid: {color: colors.success},
  due: {color: colors.danger},
});

export default FeeCard;
