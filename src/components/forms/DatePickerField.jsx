import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Button, IconButton, Modal, Portal, Text, TextInput} from 'react-native-paper';
import {colors, radius, spacing, typography} from '../../theme';
import {formatDateForDisplay, parseDateString, toISODate} from '../../utils/helpers/dateHelpers';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const sameDay = (left, right) =>
  left &&
  right &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const clampDate = (date, minDate, maxDate) => {
  if (minDate && date < minDate) {
    return minDate;
  }
  if (maxDate && date > maxDate) {
    return maxDate;
  }
  return date;
};

const buildCalendarDays = date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({length: first.getDay()}, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

const buildYearOptions = (viewDate, selectedDate, minDate, maxDate) => {
  const currentYear = new Date().getFullYear();
  const selectedYear = selectedDate?.getFullYear();
  const viewYear = viewDate.getFullYear();
  const upperYear = maxDate?.getFullYear() || Math.max(currentYear, selectedYear || currentYear, viewYear);
  const lowerYear = minDate?.getFullYear() || Math.min(upperYear - 25, selectedYear || upperYear - 25, viewYear);
  const years = [];
  for (let year = upperYear; year >= lowerYear; year -= 1) {
    years.push(year);
  }
  return years;
};

const DatePickerField = ({
  label,
  value,
  onChange,
  placeholder = 'DD-MM-YYYY',
  minimumDate,
  maximumDate,
  disabled,
  required,
}) => {
  const selectedDate = parseDateString(value);
  const minDate = parseDateString(minimumDate);
  const maxDate = parseDateString(maximumDate);
  const initialDate = clampDate(selectedDate || maxDate || new Date(), minDate, maxDate);
  const [visible, setVisible] = useState(false);
  const [viewDate, setViewDate] = useState(initialDate);
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const yearOptions = useMemo(
    () => buildYearOptions(viewDate, selectedDate, minDate, maxDate),
    [maxDate, minDate, selectedDate, viewDate],
  );

  const open = () => {
    setViewDate(initialDate);
    setVisible(true);
  };
  const moveMonth = delta => setViewDate(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  const moveYear = delta => setViewDate(current => new Date(current.getFullYear() + delta, current.getMonth(), 1));
  const selectYear = year =>
    setViewDate(current => clampDate(new Date(year, current.getMonth(), 1), minDate, maxDate));
  const selectMonth = month =>
    setViewDate(current => clampDate(new Date(current.getFullYear(), month, 1), minDate, maxDate));
  const selectDate = date => {
    onChange(toISODate(date));
    setVisible(false);
  };
  const isDisabledDate = date =>
    !date ||
    (minDate && date < minDate) ||
    (maxDate && date > maxDate);
  const isDisabledMonth = month => {
    const start = new Date(viewDate.getFullYear(), month, 1);
    const end = new Date(viewDate.getFullYear(), month + 1, 0);
    return Boolean((minDate && end < minDate) || (maxDate && start > maxDate));
  };

  return (
    <>
      <Pressable disabled={disabled} onPress={open}>
        <TextInput
          mode="outlined"
          label={`${label}${required ? ' *' : ''}`}
          value={formatDateForDisplay(value)}
          placeholder={placeholder}
          editable={false}
          disabled={disabled}
          right={<TextInput.Icon icon="calendar-month-outline" onPress={open} />}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          textColor={colors.text}
          placeholderTextColor={colors.textSoft}
          outlineStyle={styles.outline}
          style={styles.input}
          onPressIn={open}
        />
      </Pressable>
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <View style={styles.headerRow}>
            <IconButton icon="chevron-double-left" onPress={() => moveYear(-1)} />
            <IconButton icon="chevron-left" onPress={() => moveMonth(-1)} />
            <View style={styles.monthCopy}>
              <Text style={styles.monthTitle}>{monthNames[viewDate.getMonth()]}</Text>
              <Text style={styles.yearTitle}>{viewDate.getFullYear()}</Text>
            </View>
            <IconButton icon="chevron-right" onPress={() => moveMonth(1)} />
            <IconButton icon="chevron-double-right" onPress={() => moveYear(1)} />
          </View>
          <View style={styles.selectorBlock}>
            <Text style={styles.selectorLabel}>Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearList}>
              {yearOptions.map(year => {
                const selectedYear = year === viewDate.getFullYear();
                return (
                  <Pressable
                    key={year}
                    style={[styles.yearChip, selectedYear && styles.selectedChip]}
                    onPress={() => selectYear(year)}>
                    <Text style={[styles.chipText, selectedYear && styles.selectedText]}>{year}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <View style={styles.selectorBlock}>
            <Text style={styles.selectorLabel}>Month</Text>
            <View style={styles.monthGrid}>
              {monthNames.map((month, index) => {
                const disabledMonth = isDisabledMonth(index);
                const selectedMonth = index === viewDate.getMonth();
                return (
                  <Pressable
                    key={month}
                    disabled={disabledMonth}
                    style={[
                      styles.monthChip,
                      selectedMonth && styles.selectedChip,
                      disabledMonth && styles.disabledDay,
                    ]}
                    onPress={() => selectMonth(index)}>
                    <Text style={[styles.chipText, selectedMonth && styles.selectedText, disabledMonth && styles.disabledText]}>
                      {month.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.weekRow}>
            {weekDays.map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekLabel}>{day}</Text>
            ))}
          </View>
          <View style={styles.grid}>
            {days.map((date, index) => {
              const disabledDate = isDisabledDate(date);
              const selected = sameDay(date, selectedDate);
              return (
                <Pressable
                  key={date ? toISODate(date) : `blank-${index}`}
                  disabled={disabledDate}
                  style={[
                    styles.dayCell,
                    selected && styles.selectedDay,
                    disabledDate && styles.disabledDay,
                  ]}
                  onPress={() => date && selectDate(date)}>
                  <Text style={[styles.dayText, selected && styles.selectedText, disabledDate && styles.disabledText]}>
                    {date ? date.getDate() : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.footer}>
            <Button mode="text" onPress={() => setVisible(false)}>Cancel</Button>
            <Button mode="outlined" onPress={() => setViewDate(clampDate(new Date(), minDate, maxDate))}>Today</Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  outline: {
    borderRadius: radius.sm,
  },
  modal: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    margin: spacing.lg,
    maxWidth: 420,
    padding: spacing.lg,
    width: '92%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  monthCopy: {
    alignItems: 'center',
    flex: 1,
  },
  monthTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  yearTitle: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  selectorBlock: {
    marginBottom: spacing.md,
  },
  selectorLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  yearList: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  yearChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  monthChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    width: `${(100 - 3) / 4}%`,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLabel: {
    color: colors.textMuted,
    flex: 1,
    fontWeight: '700',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: radius.pill,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  disabledDay: {
    opacity: 0.32,
  },
  dayText: {
    color: colors.text,
  },
  selectedText: {
    color: colors.white,
    fontWeight: '700',
  },
  disabledText: {
    color: colors.textSoft,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
});

export default DatePickerField;
