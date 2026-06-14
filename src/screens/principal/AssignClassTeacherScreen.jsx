import React, {useEffect, useMemo, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {HelperText, Text} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {
  CustomButton,
  DashboardCard,
  EmptyState,
  FilterTabs,
  ScreenContainer,
  SearchBar,
  SectionHeader,
  SelectField,
} from '../../components';
import {USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing, typography} from '../../theme';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const allOption = label => ({label, value: 'ALL'});
const normalizeRole = role => String(role || '').toUpperCase();

const AssignClassTeacherScreen = ({route}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = route.params?.academicYear || new Date().getFullYear();
  const effectiveBranchId = route.params?.branchId || user?.branchId;
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState(route.params?.sectionId || 'ALL');
  const [teacherFilter, setTeacherFilter] = useState('ALL');
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState({
    classId: '',
    sectionId: route.params?.sectionId || '',
    teacherId: '',
  });

  const role = normalizeRole(user?.role);
  const canModify = [USER_ROLES.COORDINATOR, USER_ROLES.PRINCIPAL, USER_ROLES.BRANCH_ADMIN, USER_ROLES.MAIN_ADMIN].includes(role);

  const assignmentsQuery = useQuery({
    queryKey: ['classTeacherAssignments', effectiveBranchId, academicYear, user?.wing || 'ALL'],
    queryFn: () =>
      teacherService.getClassTeacherAssignments(
        {branchId: effectiveBranchId, academicYear},
        scope,
      ),
    enabled: Boolean(effectiveBranchId),
  });

  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses', effectiveBranchId],
    queryFn: () => academicRepository.getActiveAcademicClasses(),
    enabled: Boolean(effectiveBranchId && canModify),
  });

  const pickerSectionsQuery = useQuery({
    queryKey: ['sections', effectiveBranchId, academicYear, 'CLASS_TEACHER_PICKER'],
    queryFn: () =>
      sectionService.getSections(
        {branchId: effectiveBranchId, academicYear, limit: 500},
        scope,
      ),
    enabled: Boolean(effectiveBranchId && canModify),
  });

  const teachersQuery = useQuery({
    queryKey: ['teachers', effectiveBranchId, 'CLASS_TEACHER_PICKER'],
    queryFn: () =>
      teacherService.getTeachers(
        {
          branchId: effectiveBranchId,
          limit: 300,
          offset: 0,
        },
        scope,
      ),
    enabled: Boolean(effectiveBranchId && canModify),
  });

  const classes = useMemo(() => {
    const items = (classesQuery.data || []).filter(item => item.branchId === effectiveBranchId);
    return role === USER_ROLES.COORDINATOR
      ? items.filter(item => item.wing?.code === user?.wing || item.wing === user?.wing)
      : items;
  }, [classesQuery.data, effectiveBranchId, role, user?.wing]);
  const sections = useMemo(() => assignmentsQuery.data?.sections || [], [assignmentsQuery.data?.sections]);
  const pickerSections = useMemo(() => {
    const items = pickerSectionsQuery.data?.sections || sections;
    return role === USER_ROLES.COORDINATOR
      ? items.filter(section => section.academicClass?.wing?.code === user?.wing || section.wing === user?.wing)
      : items;
  }, [pickerSectionsQuery.data?.sections, role, sections, user?.wing]);
  const assignments = useMemo(() => assignmentsQuery.data?.assignments || [], [assignmentsQuery.data?.assignments]);
  const students = useMemo(() => assignmentsQuery.data?.students || [], [assignmentsQuery.data?.students]);
  const coordinators = useMemo(() => assignmentsQuery.data?.coordinators || [], [assignmentsQuery.data?.coordinators]);
  const teachers = useMemo(() => teachersQuery.data || [], [teachersQuery.data]);

  const studentCounts = useMemo(() => {
    const counts = {};
    students.forEach(student => {
      counts[student.sectionId] = (counts[student.sectionId] || 0) + 1;
    });
    return counts;
  }, [students]);

  const activeAssignments = useMemo(
    () => assignments.filter(item => item.isActive !== false),
    [assignments],
  );
  const assignmentBySection = useMemo(() => {
    const map = {};
    activeAssignments.forEach(assignment => {
      map[assignment.sectionId] = assignment;
    });
    return map;
  }, [activeAssignments]);
  const coordinatorByWing = useMemo(() => {
    const map = {};
    coordinators.forEach(coordinator => {
      map[coordinator.wing] = coordinator;
    });
    return map;
  }, [coordinators]);

  const rows = useMemo(
    () =>
      sections.map(section => {
        const assignment = assignmentBySection[section.id];
        const teacher = assignment?.teacher;
        const wing = section.academicClass?.wing?.code || '';
        return {
          id: section.id,
          section,
          assignment,
          status: assignment ? 'ASSIGNED' : 'UNASSIGNED',
          className: section.academicClass?.name || '-',
          sectionName: section.name || '-',
          teacherId: assignment?.teacherId || section.classTeacherId || '',
          teacherName: assignment?.teacherName || section.classTeacher?.fullName || 'Not assigned',
          employeeId: assignment?.employeeId || teacher?.employeeId || section.classTeacher?.employeeId || '-',
          teacherPhoneNumber: assignment?.teacherPhoneNumber || section.classTeacher?.phoneNumber || '-',
          assignedDate: assignment?.createdAt,
          assignedBy: assignment?.assignedByName || assignment?.assignedBy?.fullName || '-',
          wing,
          coordinator: coordinatorByWing[wing]?.user?.fullName || '-',
          studentCount: studentCounts[section.id] || 0,
        };
      }),
    [assignmentBySection, coordinatorByWing, sections, studentCounts],
  );

  const filterOptions = useMemo(() => {
    const classMap = new Map();
    const sectionOptions = new Map();
    const teacherOptions = new Map();
    rows.forEach(row => {
      if (row.section.academicClass?.id) {
        classMap.set(row.section.academicClass.id, row.className);
      }
      sectionOptions.set(row.section.id, `${row.className}-${row.sectionName}`);
      if (row.assignment?.teacherId) {
        teacherOptions.set(row.assignment.teacherId, row.teacherName);
      }
    });
    const sorted = map =>
      [...map.entries()]
        .sort((left, right) => String(left[1]).localeCompare(String(right[1]), undefined, {numeric: true}))
        .map(([value, label]) => ({value, label}));
    return {
      classes: [allOption('All Classes'), ...sorted(classMap)],
      sections: [allOption('All Sections'), ...sorted(sectionOptions)],
      teachers: [allOption('All Teachers'), ...sorted(teacherOptions)],
    };
  }, [rows]);

  const classOptions = useMemo(
    () =>
      classes.map(item => ({
        label: item.name,
        value: item.id,
        item,
      })),
    [classes],
  );

  const sectionOptions = useMemo(
    () =>
      pickerSections
        .filter(section => !form.classId || section.academicClassId === form.classId || section.academicClass?.id === form.classId)
        .sort((left, right) => String(left.name).localeCompare(String(right.name), undefined, {numeric: true}))
        .map(section => ({
          label: section.name,
          value: section.id,
          item: section,
        })),
    [form.classId, pickerSections],
  );

  const teacherOptions = useMemo(
    () =>
      teachers.map(item => ({
        label: `${item.fullName || item.user?.fullName || 'Teacher'} (${item.employeeId || '-'})`,
        value: item.id,
        item,
      })),
    [teachers],
  );

  const selectedSection = useMemo(
    () => sectionOptions.find(item => item.value === form.sectionId)?.item,
    [form.sectionId, sectionOptions],
  );
  const selectedTeacher = useMemo(
    () => teacherOptions.find(item => item.value === form.teacherId)?.item,
    [form.teacherId, teacherOptions],
  );

  const initialRouteSection = useMemo(
    () => pickerSections.find(section => section.id === route.params?.sectionId),
    [route.params?.sectionId, pickerSections],
  );

  useEffect(() => {
    const routeClassId = initialRouteSection?.academicClass?.id || initialRouteSection?.academicClassId;
    if (!form.classId && form.sectionId && routeClassId) {
      setForm(current => ({
        ...current,
        classId: routeClassId,
      }));
    }
  }, [form.classId, form.sectionId, initialRouteSection]);

  const updateFormClass = value => {
    setForm(current => ({
      ...current,
      classId: value,
      sectionId: '',
    }));
  };

  const updateFormSection = value => {
    const section = pickerSections.find(item => item.id === value);
    setForm(current => ({
      ...current,
      classId: section?.academicClass?.id || section?.academicClassId || current.classId,
      sectionId: value,
    }));
  };

  const filteredRows = useMemo(
    () =>
      rows.filter(row => {
        const haystack = `${row.className} ${row.sectionName} ${row.teacherName} ${row.employeeId}`.toLowerCase();
        const matchesSearch = haystack.includes(query.trim().toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
        const matchesClass = classFilter === 'ALL' || row.section.academicClass?.id === classFilter;
        const matchesSection = sectionFilter === 'ALL' || row.section.id === sectionFilter;
        const matchesTeacher = teacherFilter === 'ALL' || row.teacherId === teacherFilter;
        return matchesSearch && matchesStatus && matchesClass && matchesSection && matchesTeacher;
      }),
    [classFilter, query, rows, sectionFilter, statusFilter, teacherFilter],
  );

  const resetForm = () => {
    setEditingAssignment(null);
    setForm({
      classId: initialRouteSection?.academicClass?.id || '',
      sectionId: route.params?.sectionId || '',
      teacherId: '',
    });
  };

  const invalidateAssignmentData = () => {
    queryClient.invalidateQueries({queryKey: ['classTeacherAssignments', effectiveBranchId]});
    queryClient.invalidateQueries({queryKey: ['sections', effectiveBranchId, academicYear]});
    queryClient.invalidateQueries({queryKey: ['teachers', effectiveBranchId]});
    queryClient.invalidateQueries({queryKey: ['principalDashboard', effectiveBranchId]});
    queryClient.invalidateQueries({queryKey: ['teacherDashboard']});
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const currentAssignment = editingAssignment || assignmentBySection[form.sectionId];
      if (currentAssignment) {
        return teacherService.updateClassTeacherAssignment(
          {
            assignmentId: currentAssignment.id,
            oldSectionId: currentAssignment.sectionId,
            oldTeacherId: currentAssignment.teacherId,
            teacher: selectedTeacher,
            sectionId: form.sectionId,
            section: selectedSection,
            oldSection: currentAssignment.section,
            branchId: effectiveBranchId,
          },
          scope,
        );
      }
      return teacherService.assignClassTeacher(
        {
          teacher: selectedTeacher,
          sectionId: form.sectionId,
          section: selectedSection,
          branchId: effectiveBranchId,
        },
        scope,
      );
    },
    onSuccess: () => {
      setError('');
      resetForm();
      invalidateAssignmentData();
    },
    onError: err => setError(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: row =>
      teacherService.removeClassTeacherAssignment(
        {
          assignmentId: row.assignment.id,
          sectionId: row.section.id,
          section: row.section,
          teacherId: row.assignment.teacherId,
          branchId: effectiveBranchId,
        },
        scope,
      ),
    onSuccess: () => {
      setError('');
      resetForm();
      invalidateAssignmentData();
    },
    onError: err => setError(err.message),
  });

  const startEdit = row => {
    setEditingAssignment(row.assignment);
    setForm({
      classId: row.section.academicClass?.id || '',
      sectionId: row.section.id,
      teacherId: row.assignment.teacherId,
    });
  };

  const confirmRemove = row => {
    Alert.alert(
      'Remove Class Teacher',
      `Remove ${row.teacherName} as Class Teacher of ${row.className}-${row.sectionName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', style: 'destructive', onPress: () => removeMutation.mutate(row)},
      ],
    );
  };

  return (
    <ScreenContainer>
      <SectionHeader
        title="Class Teacher Assignment"
        subtitle="View, assign, edit, and remove class teachers"
      />
      {canModify ? (
        <>
          <SelectField label="Class" value={form.classId} options={classOptions} onChange={updateFormClass} />
          <HelperText type="error" visible={!classesQuery.isLoading && !classesQuery.error && Boolean(effectiveBranchId) && !classOptions.length}>
            No active classes are available for this branch.
          </HelperText>
          <SelectField label="Section" value={form.sectionId} options={sectionOptions} onChange={updateFormSection} disabled={!form.classId || pickerSectionsQuery.isLoading} />
          <HelperText type="error" visible={Boolean(form.classId) && !pickerSectionsQuery.isLoading && !pickerSectionsQuery.error && !sectionOptions.length}>
            No active sections exist for this class.
          </HelperText>
          <SelectField label="Teacher" value={form.teacherId} options={teacherOptions} onChange={value => setForm(current => ({...current, teacherId: value}))} />
          <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
          <View style={styles.formActions}>
            {editingAssignment ? (
              <CustomButton mode="outlined" style={styles.actionButton} onPress={resetForm}>
                Cancel Edit
              </CustomButton>
            ) : null}
            <CustomButton
              style={styles.actionButton}
              loading={saveMutation.isPending}
              disabled={saveMutation.isPending || !form.sectionId || !form.teacherId}
              onPress={() => saveMutation.mutate()}>
              {editingAssignment || assignmentBySection[form.sectionId] ? 'Update Assignment' : 'Assign Class Teacher'}
            </CustomButton>
          </View>
        </>
      ) : (
        <HelperText type="info" visible>
          You can view class teacher assignments. Editing is restricted to coordinators and administrators.
        </HelperText>
      )}

      <SectionHeader title="Class Teacher Overview" subtitle={`${rows.length} sections`} />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search teacher, class, section" />
      <FilterTabs
        value={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          {label: 'All', value: 'ALL'},
          {label: 'Assigned', value: 'ASSIGNED'},
          {label: 'Unassigned', value: 'UNASSIGNED'},
        ]}
      />
      <SelectField label="Filter By Class" value={classFilter} options={filterOptions.classes} onChange={setClassFilter} />
      <SelectField label="Filter By Section" value={sectionFilter} options={filterOptions.sections} onChange={setSectionFilter} />
      <SelectField label="Filter By Teacher" value={teacherFilter} options={filterOptions.teachers} onChange={setTeacherFilter} />

      <SectionHeader title="Current Class Teacher Assignments" />
      {filteredRows.length ? (
        filteredRows.map(row => (
          <View key={row.id} style={styles.assignmentBlock}>
            <DashboardCard
              title={`${row.className}-${row.sectionName}`}
              value={row.teacherName}
              description={`Employee ID: ${row.employeeId} | Students: ${row.studentCount} | Coordinator: ${row.coordinator} | Wing: ${row.wing || '-'} | Assigned: ${formatDateForDisplay(row.assignedDate) || '-'} | By: ${row.assignedBy} | Status: ${row.status}`}
              icon={row.assignment ? 'account-tie-outline' : 'account-question-outline'}
              tone={row.assignment ? colors.success : colors.warning}
            />
            {canModify && row.assignment ? (
              <View style={styles.rowActions}>
                <CustomButton mode="outlined" style={styles.rowButton} onPress={() => startEdit(row)}>
                  Edit
                </CustomButton>
                <CustomButton
                  mode="outlined"
                  style={styles.rowButton}
                  loading={removeMutation.isPending}
                  disabled={removeMutation.isPending}
                  onPress={() => confirmRemove(row)}>
                  Remove Class Teacher
                </CustomButton>
              </View>
            ) : null}
            {!row.assignment ? (
              <Text style={styles.unassignedText}>No class teacher assigned.</Text>
            ) : null}
          </View>
        ))
      ) : (
        <EmptyState title="No assignments found" message="Adjust search or filters to view sections." />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  assignmentBlock: {
    marginBottom: spacing.md,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  rowButton: {
    flex: 1,
  },
  unassignedText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
});

export default AssignClassTeacherScreen;
