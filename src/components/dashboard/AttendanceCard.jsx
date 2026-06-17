import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import StatusBadge from '../common/StatusBadge';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const AttendanceCard = ({title, date, present, absent, late, status, onPress}) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [styles.card, pressed && {opacity: 0.88}]}>
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <StatusBadge status={status || 'info'} label={status ? undefined : 'Today'} />
    </View>
    <View style={styles.metrics}>
      <View style={[styles.metricPill, styles.present]}>
        <Text style={styles.metric}>{present} Present</Text>
      </View>
      <View style={[styles.metricPill, styles.absent]}>
        <Text style={styles.metric}>{absent} Absent</Text>
      </View>
      <View style={[styles.metricPill, styles.late]}>
        <Text style={styles.metric}>{late} Late</Text>
      </View>
    </View>
  </Pressable>
);

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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {flex: 1, minWidth: 0, paddingRight: spacing.md},
  title: {...typography.sectionTitle, color: colors.text},
  date: {color: colors.textMuted, marginTop: spacing.xxs},
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  metric: {color: colors.text, fontWeight: '700'},
  metricPill: {borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  present: {backgroundColor: colors.successSoft},
  absent: {backgroundColor: colors.dangerSoft},
  late: {backgroundColor: colors.warningSoft},
});

export default AttendanceCard;
