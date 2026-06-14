import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {ATTENDANCE_STATUS} from '../../config/constants';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getDayStyle = status => {
  if (status === ATTENDANCE_STATUS.PRESENT) {
    return {backgroundColor: colors.success, color: colors.white};
  }
  if (status === ATTENDANCE_STATUS.ABSENT) {
    return {backgroundColor: colors.danger, color: colors.white};
  }
  if (status === 'holiday') {
    return {backgroundColor: colors.surfaceAlt, color: colors.textMuted};
  }
  if (status === 'future') {
    return {backgroundColor: colors.white, color: colors.textSoft};
  }
  return {backgroundColor: colors.white, color: colors.text};
};

const CalendarAttendance = ({monthDate = new Date(), records = {}}) => {
  const days = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const cells = Array.from({length: firstDay}).map((_, index) => ({
      key: `blank-${index}`,
      blank: true,
    }));

    for (let day = 1; day <= dayCount; day += 1) {
      const current = new Date(year, month, day);
      const key = current.toISOString().slice(0, 10);
      const isFuture = current > today;
      cells.push({
        key,
        day,
        status: isFuture ? 'future' : records[key] || 'holiday',
      });
    }

    return cells;
  }, [monthDate, records]);

  return (
    <View style={styles.card}>
      <View style={styles.weekRow}>
        {dayLabels.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map(day => {
          const dayTheme = getDayStyle(day.status);

          return (
            <View key={day.key} style={styles.cell}>
              {day.blank ? null : (
                <View
                  style={[
                    styles.day,
                    {backgroundColor: dayTheme.backgroundColor},
                  ]}>
                  <Text style={[styles.dayText, {color: dayTheme.color}]}>
                    {day.day}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.soft,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekLabel: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  dayText: {
    fontWeight: '800',
  },
});

export default CalendarAttendance;
