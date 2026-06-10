import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  CalendarAttendance,
  EmptyState,
  ScreenContainer,
  SelectField,
  SectionHeader,
  StatCard,
  SummaryCard,
} from '../../components';
import {ATTENDANCE_STATUS} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import parentService from '../../services/parents/parentService';
import {colors, spacing} from '../../theme';
import {normalizeAttendanceStatus} from '../../utils/helpers/attendanceHelpers';

const getMonthRange = date => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    fromDate: start.toISOString().slice(0, 10),
    toDate: end.toISOString().slice(0, 10),
  };
};

const AttendanceScreen = ({route}) => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;
  const initialStudentId = route?.params?.studentId;
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '');
  const monthDate = useMemo(() => new Date(), []);

  const childrenQuery = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });

  const children = childrenQuery.data || [];
  const selectedChild =
    children.find(child => child.id === selectedStudentId) || children[0] || null;
  const resolvedStudentId = selectedChild?.id;

  const attendanceQuery = useQuery({
    queryKey: ['parentAttendance', parentId, resolvedStudentId, monthDate.getFullYear(), monthDate.getMonth()],
    queryFn: () =>
      attendanceService.getAttendance({
        studentId: resolvedStudentId,
        ...getMonthRange(monthDate),
      }),
    enabled: Boolean(resolvedStudentId),
  });

  const records = useMemo(() => attendanceQuery.data || [], [attendanceQuery.data]);

  const normalizedRecords = useMemo(
    () =>
      records.map(item => ({
        ...item,
        status: normalizeAttendanceStatus(item.status) || item.status,
      })),
    [records],
  );

  const attendanceRecords = useMemo(
    () =>
      normalizedRecords.reduce(
        (acc, item) => ({
          ...acc,
          [item.attendanceDate]: item.status,
        }),
        {},
      ),
    [normalizedRecords],
  );

  const present = normalizedRecords.filter(item => item.status === ATTENDANCE_STATUS.PRESENT).length;
  const absent = normalizedRecords.filter(item => item.status === ATTENDANCE_STATUS.ABSENT).length;
  const total = present + absent;
  const progress = total ? present / total : 0;

  if (childrenQuery.error || attendanceQuery.error) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Unable to load attendance"
          message={childrenQuery.error?.message || attendanceQuery.error?.message}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SectionHeader
        title="Monthly Attendance"
        subtitle={selectedChild?.fullName || 'Child attendance calendar'}
      />
      {children.length > 1 ? (
        <SelectField
          label="Child"
          value={selectedChild?.id}
          options={children.map(child => ({
            label: `${child.fullName} (${child.academicClass?.name || '-'}-${child.section?.name || '-'})`,
            value: child.id,
          }))}
          onChange={setSelectedStudentId}
        />
      ) : null}
      <SummaryCard
        title="Attendance Percentage"
        value={`${Math.round(progress * 100)}%`}
        subtitle={`${present} present - ${absent} absent`}
        progress={progress}
        tone={colors.success}
      />
      <View style={styles.grid}>
        <StatCard title="Present" value={present} icon="check-circle-outline" tone={colors.success} />
        <StatCard title="Absent" value={absent} icon="close-circle-outline" tone={colors.danger} />
      </View>
      <CalendarAttendance monthDate={monthDate} records={attendanceRecords} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});

export default AttendanceScreen;
