import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {ATTENDANCE_STATUS} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getToday = () => new Date().toISOString().slice(0, 10);

const getDayCfg = (status, isToday) => {
  if (isToday && !status) {
    return {bg: 'transparent', fg: colors.primary, ring: true};
  }
  if (status === ATTENDANCE_STATUS.PRESENT) {
    return {bg: colors.success, fg: colors.white, ring: false};
  }
  if (status === ATTENDANCE_STATUS.ABSENT) {
    return {bg: colors.danger, fg: colors.white, ring: false};
  }
  if (status === 'holiday') {
    return {bg: colors.surfaceAlt, fg: colors.textSoft, ring: false};
  }
  if (status === 'future') {
    return {bg: 'transparent', fg: colors.border, ring: false};
  }
  return {bg: 'transparent', fg: colors.textSoft, ring: false};
};

const LEGEND = [
  {label: 'Present', color: colors.success},
  {label: 'Absent', color: colors.danger},
  {label: 'Holiday', color: colors.surfaceAlt},
];

const CalendarAttendance = ({monthDate = new Date(), records = {}}) => {
  const todayStr = getToday();

  const {cells, monthLabel} = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const label = monthDate.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });

    const built = Array.from({length: firstDay}).map((_, i) => ({
      key: `blank-${i}`,
      blank: true,
    }));

    for (let day = 1; day <= dayCount; day++) {
      const current = new Date(year, month, day);
      const key = current.toISOString().slice(0, 10);
      const isFuture = current > today;
      built.push({
        key,
        day,
        isToday: key === todayStr,
        status: isFuture ? 'future' : records[key] || 'holiday',
      });
    }

    return {cells: built, monthLabel: label};
  }, [monthDate, records, todayStr]);

  return (
    <View style={styles.card}>
      {/* Month label */}
      <View style={styles.monthRow}>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
      </View>

      {/* Day header */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map(label => (
          <Text key={label} style={styles.weekLabel}>
            {label.slice(0, 1)}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map(cell => {
          if (cell.blank) {
            return <View key={cell.key} style={styles.cell} />;
          }
          const cfg = getDayCfg(cell.status, cell.isToday);
          return (
            <View key={cell.key} style={styles.cell}>
              <View
                style={[
                  styles.day,
                  {backgroundColor: cfg.bg},
                  cfg.ring && styles.dayRing,
                ]}>
                <Text style={[styles.dayText, {color: cfg.fg}]}>
                  {cell.day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {LEGEND.map(item => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: item.color}]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  monthRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  monthLabel: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekLabel: {
    color: colors.textMuted,
    flex: 1,
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  cell: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    padding: spacing.xxs,
    width: `${100 / 7}%`,
  },
  day: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  dayRing: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  dayText: {fontSize: 12, fontWeight: '700'},
  legend: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },
  legendItem: {alignItems: 'center', flexDirection: 'row', gap: 5},
  legendDot: {
    borderRadius: radius.pill,
    height: 9,
    width: 9,
  },
  legendText: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
});

export default CalendarAttendance;
