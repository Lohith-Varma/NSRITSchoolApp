import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Text, TouchableRipple} from 'react-native-paper';
import Avatar from '../common/Avatar';
import StatusBadge from '../common/StatusBadge';
import {ATTENDANCE_STATUS} from '../../config/constants';
import {colors, radius, spacing, typography} from '../../theme';

const StudentListItem = ({
  student,
  checked,
  status = ATTENDANCE_STATUS.PRESENT,
  onToggle,
  right,
}) => (
  <TouchableRipple borderless onPress={onToggle} style={styles.wrapper}>
    <View style={styles.row}>
      <Avatar name={student.name} />
      <View style={styles.copy}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.meta}>
          Roll {student.rollNo} - {student.section}
        </Text>
        <StatusBadge status={status} />
      </View>
      {right || (onToggle ? (
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={onToggle}
          color={colors.success}
        />
      ) : null)}
    </View>
  </TouchableRipple>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  copy: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.xxs,
  },
});

export default memo(StudentListItem);
