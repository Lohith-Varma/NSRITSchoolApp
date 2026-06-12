import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  CustomButton,
  EmptyState,
  SearchBar,
  SelectField,
  SectionHeader,
  StudentListItem,
} from '../../components';
import {ATTENDANCE_STATUS} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import classService from '../../services/classes/classService';
import {getAccessScope} from '../../services/rbacScope';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {colors, spacing} from '../../theme';
import {toISODate} from '../../utils/helpers/dateHelpers';

const TakeAttendanceScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = useMemo(() => getAccessScope(user), [user]);
  const queryClient = useQueryClient();
  const today = toISODate();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [statuses, setStatuses] = useState({});
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const classesQuery = useQuery({
    queryKey: ['attendanceClasses', user?.branchId],
    queryFn: () => classService.getClasses(),
    enabled: Boolean(user?.branchId),
  });

  const classes = useMemo(
    () => (classesQuery.data || []).filter(item => !item.branchId || item.branchId === user?.branchId),
    [classesQuery.data, user?.branchId],
  );

  useEffect(() => {
    if (!selectedClassId && classes[0]?.id) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const sectionsQuery = useQuery({
    queryKey: ['attendanceSections', selectedClassId],
    queryFn: () => sectionService.getSectionsByClass(selectedClassId),
    enabled: Boolean(selectedClassId),
  });

  const sections = useMemo(
    () => (sectionsQuery.data || []).filter(item => item.isActive !== false),
    [sectionsQuery.data],
  );

  useEffect(() => {
    if (!sections.some(item => item.id === selectedSectionId)) {
      setSelectedSectionId(sections[0]?.id || '');
    }
  }, [sections, selectedSectionId]);

  const selectedClass = classes.find(item => item.id === selectedClassId) || null;
  const selectedSection = sections.find(item => item.id === selectedSectionId) || null;
  const resolvedSectionId = selectedSection?.id;

  const studentsQuery = useQuery({
    queryKey: ['sectionStudents', resolvedSectionId],
    queryFn: () => studentService.getStudentsBySection(resolvedSectionId),
    enabled: Boolean(resolvedSectionId),
  });

  const attendanceQuery = useQuery({
    queryKey: ['sectionAttendance', resolvedSectionId, today],
    queryFn: () => attendanceService.getSectionAttendanceMap({sectionId: resolvedSectionId, attendanceDate: today}),
    enabled: Boolean(resolvedSectionId),
  });

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);

  useEffect(() => {
    if (!students.length) {
      setStatuses({});
      return;
    }

    const existing = attendanceQuery.data || {};
    setStatuses(
      students.reduce(
        (acc, student) => ({
          ...acc,
          [student.id]: existing[student.id]?.status || ATTENDANCE_STATUS.PRESENT,
        }),
        {},
      ),
    );
  }, [attendanceQuery.data, students]);

  const visibleStudents = useMemo(
    () =>
      students.filter(student =>
        `${student.fullName} ${student.studentId}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, students],
  );

  const setAll = status => {
    setStatuses(students.reduce((acc, student) => ({...acc, [student.id]: status}), {}));
  };

  const toggleStudent = studentId => {
    setStatuses(current => ({
      ...current,
      [studentId]:
        current[studentId] === ATTENDANCE_STATUS.PRESENT
          ? ATTENDANCE_STATUS.ABSENT
          : ATTENDANCE_STATUS.PRESENT,
    }));
  };

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedClass || !selectedSection) {
        throw new Error('Select a class and section before submitting attendance.');
      }

      const records = students.map(student => ({
        studentId: student.id,
        academicClassId: selectedClass.id || student.academicClassId,
        sectionId: selectedSection.id,
        attendanceDate: today,
        status: statuses[student.id] || ATTENDANCE_STATUS.PRESENT,
        markedById: user.id,
      }));

      return attendanceService.saveAttendanceBatch({records}, scope);
    },
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({queryKey: ['sectionAttendance', resolvedSectionId, today]});
      queryClient.invalidateQueries({queryKey: ['teacherDashboard', user?.teacherId]});
      queryClient.invalidateQueries({queryKey: ['teacherProfile', user?.teacherId]});
      queryClient.invalidateQueries({queryKey: ['studentDetails']});
      queryClient.invalidateQueries({queryKey: ['parentChildren']});
      queryClient.invalidateQueries({queryKey: ['parentDashboard']});
      queryClient.invalidateQueries({queryKey: ['branchAttendance']});
    },
    onError: saveError => {
      console.log('[Attendance] UI save failed:', saveError);
      setError(saveError.message || 'Unable to save attendance.');
    },
  });

  const classOptions = classes.map(item => ({
    label: item.name,
    value: item.id,
  }));

  const sectionOptions = sections.map(item => ({
    label: item.name,
    value: item.id,
  }));

  const renderHeader = () => (
    <View style={styles.header}>
      <SectionHeader title="Take Attendance" subtitle="Select class and section" />
      <SelectField
        label="Class"
        value={selectedClassId}
        options={classOptions}
        disabled={!classOptions.length}
        onChange={value => {
          setSelectedClassId(value);
          setSelectedSectionId('');
        }}
      />
      <SelectField
        label="Section"
        value={resolvedSectionId}
        options={sectionOptions}
        disabled={!sectionOptions.length}
        onChange={setSelectedSectionId}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search assigned students" />
      <View style={styles.bulkRow}>
        <CustomButton mode="outlined" onPress={() => setAll(ATTENDANCE_STATUS.PRESENT)}>
          All Present
        </CustomButton>
        <CustomButton mode="outlined" onPress={() => setAll(ATTENDANCE_STATUS.ABSENT)}>
          All Absent
        </CustomButton>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleStudents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        renderItem={({item}) => (
          <StudentListItem
            student={{
              id: item.id,
              name: item.fullName,
              rollNo: item.studentId,
              section: `${item.academicClass?.name || ''}-${item.section?.name || ''}`,
            }}
            checked={statuses[item.id] === ATTENDANCE_STATUS.PRESENT}
            status={statuses[item.id]}
            onToggle={() => toggleStudent(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={classesQuery.isLoading || sectionsQuery.isLoading || studentsQuery.isLoading ? 'Loading roster' : 'No students'}
            message={classesQuery.error?.message || sectionsQuery.error?.message || studentsQuery.error?.message || 'Select a class and section with active students.'}
          />
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <HelperText type="error" visible={Boolean(error)}>
              {error}
            </HelperText>
            <CustomButton
              loading={mutation.isPending}
              disabled={mutation.isPending || !selectedClass || !selectedSection || !students.length}
              onPress={() => mutation.mutate()}>
              Submit Attendance
            </CustomButton>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  bulkRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.md,
  },
});

export default TakeAttendanceScreen;
