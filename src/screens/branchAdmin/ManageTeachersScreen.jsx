import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {
  DashboardCard,
  EmptyState,
  FilterTabs,
  Header,
  SearchBar,
  SelectField,
  SkeletonLoader,
} from '../../components';
import {STAFF_TYPE_LABELS} from '../../config/constants';
import {getAccessScope} from '../../services/rbacScope';
import teacherService from '../../services/teachers/teacherService';
import {colors, spacing} from '../../theme';

const allOption = label => ({label, value: 'ALL'});

const ManageTeachersScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = useMemo(() => getAccessScope(user), [user]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [staffTypeFilter, setStaffTypeFilter] = useState('ALL');

  const teachersQuery = useQuery({
    queryKey: ['teachers', scope?.branchId, 'VIEW_ONLY'],
    queryFn: () => teacherService.getTeachersByBranch(scope.branchId, scope),
    enabled: Boolean(scope?.branchId),
  });

  const teachers = useMemo(() => teachersQuery.data || [], [teachersQuery.data]);
  const filterOptions = useMemo(() => {
    const subjects = new Map();
    const classes = new Map();
    const sections = new Map();
    const staffTypes = new Map();

    teachers.forEach(teacher => {
      if (teacher.staffType) {
        staffTypes.set(teacher.staffType, STAFF_TYPE_LABELS[teacher.staffType] || teacher.staffType);
      }
      (teacher.subjects || []).forEach(subject => {
        if (subject?.id) {
          subjects.set(subject.id, subject.name || subject.code || 'Subject');
        }
      });
      (teacher.assignments || []).forEach(assignment => {
        const section = assignment.section;
        const academicClass = section?.academicClass;
        if (academicClass?.id) {
          classes.set(academicClass.id, academicClass.name || 'Class');
        }
        if (section?.id) {
          sections.set(section.id, `${academicClass?.name || '-'}-${section.name || '-'}`);
        }
      });
    });

    const toOptions = map =>
      [...map.entries()]
        .sort((left, right) => String(left[1]).localeCompare(String(right[1]), undefined, {numeric: true}))
        .map(([value, label]) => ({label, value}));

    return {
      subjects: [allOption('All Subjects'), ...toOptions(subjects)],
      classes: [allOption('All Classes'), ...toOptions(classes)],
      sections: [allOption('All Sections'), ...toOptions(sections)],
      staffTypes: [allOption('All Staff Types'), ...toOptions(staffTypes)],
    };
  }, [teachers]);
  const filteredTeachers = useMemo(
    () =>
      teachers.filter(item => {
        const name = item.fullName || item.user?.fullName || '';
        const matchesQuery = `${name} ${item.employeeId || ''} ${item.phoneNumber || ''}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const itemStatus = item.isActive === false ? 'INACTIVE' : 'ACTIVE';
        const matchesStatus = status === 'ALL' || itemStatus === status;
        const matchesSubject =
          subjectFilter === 'ALL' || (item.subjects || []).some(subject => subject.id === subjectFilter);
        const matchesClass =
          classFilter === 'ALL' ||
          (item.assignments || []).some(assignment => assignment.section?.academicClass?.id === classFilter);
        const matchesSection =
          sectionFilter === 'ALL' ||
          (item.assignments || []).some(assignment => assignment.section?.id === sectionFilter);
        const matchesStaffType = staffTypeFilter === 'ALL' || item.staffType === staffTypeFilter;
        return matchesQuery && matchesStatus && matchesSubject && matchesClass && matchesSection && matchesStaffType;
      }),
    [classFilter, query, sectionFilter, staffTypeFilter, status, subjectFilter, teachers],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Teachers" subtitle="View-only branch teacher records" />
        <DashboardCard
          title="Teacher Records"
          value={String(teachers.length)}
          description="Principal and coordinators manage teacher changes."
          icon="account-tie-outline"
        />
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search teachers, employee ID, mobile"
        />
        <FilterTabs
          tabs={[
            {label: 'All', value: 'ALL'},
            {label: 'Active', value: 'ACTIVE'},
            {label: 'Inactive', value: 'INACTIVE'},
          ]}
          value={status}
          onChange={setStatus}
        />
        <SelectField label="Filter By Subject" value={subjectFilter} options={filterOptions.subjects} onChange={setSubjectFilter} />
        <SelectField label="Filter By Class" value={classFilter} options={filterOptions.classes} onChange={setClassFilter} />
        <SelectField label="Filter By Section" value={sectionFilter} options={filterOptions.sections} onChange={setSectionFilter} />
        <SelectField label="Filter By Staff Type" value={staffTypeFilter} options={filterOptions.staffTypes} onChange={setStaffTypeFilter} />
      </View>
      <FlatList
        data={filteredTeachers}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={teachersQuery.isFetching}
        renderItem={({item}) => {
          const assignedClasses = (item.assignments || [])
            .map(assignment => `${assignment.section?.academicClass?.name || '-'}-${assignment.section?.name || '-'}`)
            .join(', ');
          const subjects = (item.subjects || []).map(subject => subject.name).join(', ');
          return (
            <DashboardCard
              title={item.fullName || item.user?.fullName || 'Teacher'}
              value={item.employeeId || '-'}
              description={`${STAFF_TYPE_LABELS[item.staffType] || item.staffType || 'Staff'} | ${subjects || 'No subjects'} | ${assignedClasses || 'No sections'} | ${item.isActive === false ? 'Inactive' : 'Active'}`}
              icon="account-tie-outline"
            />
          );
        }}
        ListEmptyComponent={
          teachersQuery.isLoading ? (
            <SkeletonLoader rows={4} />
          ) : (
            <EmptyState title="No teachers" message="Teacher records will appear here." />
          )
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
  header: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
});

export default ManageTeachersScreen;
