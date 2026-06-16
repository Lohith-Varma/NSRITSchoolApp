import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  AnimatedProgressBar,
  EmptyState,
  SearchBar,
  SelectField,
  StudentListItem,
} from '../../components';
import {ATTENDANCE_STATUS} from '../../config/constants';
import attendanceService from '../../services/attendance/attendanceService';
import classService from '../../services/classes/classService';
import {getAccessScope} from '../../services/rbacScope';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {colors, radius, shadows, spacing, typography} from '../../theme';
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
    () =>
      (classesQuery.data || []).filter(
        item => !item.branchId || item.branchId === user?.branchId,
      ),
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
    queryFn: () =>
      attendanceService.getSectionAttendanceMap({
        sectionId: resolvedSectionId,
        attendanceDate: today,
      }),
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
        `${student.fullName} ${student.studentId}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, students],
  );

  const presentCount = students.filter(
    s => statuses[s.id] === ATTENDANCE_STATUS.PRESENT,
  ).length;
  const absentCount = students.filter(
    s => statuses[s.id] === ATTENDANCE_STATUS.ABSENT,
  ).length;
  const progressPct = students.length ? (presentCount / students.length) * 100 : 0;

  const setAll = status => {
    setStatuses(students.reduce((acc, s) => ({...acc, [s.id]: status}), {}));
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
        throw new Error('Select a class and section before submitting.');
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
      setError(saveError.message || 'Unable to save attendance.');
    },
  });

  const classOptions = classes.map(item => ({label: item.name, value: item.id}));
  const sectionOptions = sections.map(item => ({label: item.name, value: item.id}));

  const isLoading =
    classesQuery.isLoading || sectionsQuery.isLoading || studentsQuery.isLoading;

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* ── Summary card ── */}
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryDate}>{today}</Text>
            <Text style={styles.summaryTitle}>Today's Attendance</Text>
          </View>
          {selectedClass && selectedSection ? (
            <View style={styles.contextChip}>
              <Text style={styles.contextChipText}>
                {selectedClass.name}–{selectedSection.name}
              </Text>
            </View>
          ) : null}
        </View>
        {students.length > 0 ? (
          <View style={styles.progressWrap}>
            <View style={styles.progressMeta}>
              <View style={styles.countPill}>
                <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
                <Text style={[styles.countNum, {color: colors.success}]}>{presentCount}</Text>
                <Text style={styles.countLabel}>Present</Text>
              </View>
              <View style={styles.countSep} />
              <View style={styles.countPill}>
                <MaterialCommunityIcons name="close-circle" size={12} color={colors.danger} />
                <Text style={[styles.countNum, {color: colors.danger}]}>{absentCount}</Text>
                <Text style={styles.countLabel}>Absent</Text>
              </View>
              <Text style={styles.totalLabel}>of {students.length}</Text>
            </View>
            <AnimatedProgressBar
              progress={progressPct}
              color={progressPct >= 80 ? colors.success : progressPct >= 60 ? colors.warning : colors.danger}
              trackColor={colors.border}
              height={6}
            />
          </View>
        ) : null}
      </Animated.View>

      {/* ── Class / Section selectors ── */}
      <Animated.View
        entering={FadeInDown.delay(60).duration(280).springify()}
        style={styles.selectorCard}>
        <View style={styles.selectorRow}>
          <View style={styles.selectorHalf}>
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
          </View>
          <View style={styles.selectorHalf}>
            <SelectField
              label="Section"
              value={resolvedSectionId}
              options={sectionOptions}
              disabled={!sectionOptions.length}
              onChange={setSelectedSectionId}
            />
          </View>
        </View>
      </Animated.View>

      {/* ── Search ── */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search student name or roll number"
      />

      {/* ── Bulk actions ── */}
      <View style={styles.bulkRow}>
        <Pressable
          onPress={() => setAll(ATTENDANCE_STATUS.PRESENT)}
          style={styles.bulkPresent}>
          <MaterialCommunityIcons name="check-all" size={14} color={colors.success} />
          <Text style={[styles.bulkLabel, {color: colors.success}]}>All Present</Text>
        </Pressable>
        <Pressable
          onPress={() => setAll(ATTENDANCE_STATUS.ABSENT)}
          style={styles.bulkAbsent}>
          <MaterialCommunityIcons name="close-circle-multiple-outline" size={14} color={colors.danger} />
          <Text style={[styles.bulkLabel, {color: colors.danger}]}>All Absent</Text>
        </Pressable>
      </View>

      {visibleStudents.length > 0 ? (
        <Text style={styles.rosterLabel}>
          Roster — {visibleStudents.length} student{visibleStudents.length !== 1 ? 's' : ''}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={visibleStudents}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
            title={isLoading ? 'Loading roster…' : 'No students'}
            message={
              classesQuery.error?.message ||
              sectionsQuery.error?.message ||
              studentsQuery.error?.message ||
              'Select a class and section with active students.'
            }
          />
        }
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />

      {/* ── Sticky footer ── */}
      <View style={styles.footer}>
        {Boolean(error) ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        <Pressable
          onPress={() => mutation.mutate()}
          disabled={
            mutation.isPending ||
            !selectedClass ||
            !selectedSection ||
            !students.length
          }
          style={[
            styles.saveBtn,
            (mutation.isPending || !selectedClass || !selectedSection || !students.length) &&
              styles.saveBtnDisabled,
          ]}>
          <MaterialCommunityIcons
            name={mutation.isPending ? 'loading' : 'content-save-check-outline'}
            size={18}
            color={colors.white}
          />
          <Text style={styles.saveBtnText}>
            {mutation.isPending ? 'Saving…' : 'Save Attendance'}
          </Text>
          {students.length > 0 && !mutation.isPending ? (
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>
                {presentCount}/{students.length}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: 8},
  listHeader: {marginBottom: spacing.sm},
  footerSpacer: {height: spacing.xxxl + spacing.xl},

  // Summary card
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    ...shadows.medium,
  },
  summaryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryLeft: {gap: 2},
  summaryDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  summaryTitle: {color: colors.white, fontSize: 17, fontWeight: '800'},
  contextChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  contextChipText: {color: colors.white, fontSize: 12, fontWeight: '700'},
  progressWrap: {gap: spacing.sm},
  progressMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  countPill: {alignItems: 'center', flexDirection: 'row', gap: 4},
  countNum: {fontSize: 15, fontWeight: '800'},
  countLabel: {color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600'},
  countSep: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 14,
    width: 1,
  },
  totalLabel: {color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600'},

  // Selector
  selectorCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  selectorRow: {flexDirection: 'row', gap: spacing.md},
  selectorHalf: {flex: 1},

  // Bulk
  bulkRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bulkPresent: {
    alignItems: 'center',
    backgroundColor: `${colors.success}12`,
    borderColor: `${colors.success}30`,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  bulkAbsent: {
    alignItems: 'center',
    backgroundColor: `${colors.danger}10`,
    borderColor: `${colors.danger}2E`,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  bulkLabel: {fontSize: 13, fontWeight: '700'},
  rosterLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
    ...shadows.medium,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  saveBtnDisabled: {backgroundColor: colors.border},
  saveBtnText: {color: colors.white, fontSize: 15, fontWeight: '700'},
  saveBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  saveBadgeText: {color: colors.white, fontSize: 11, fontWeight: '800'},
});

export default TakeAttendanceScreen;
