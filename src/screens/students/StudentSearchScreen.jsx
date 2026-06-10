import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {CustomButton, DashboardCard, EmptyState, SearchBar, SelectField} from '../../components';
import {STUDENT_STATUS} from '../../config/academic';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing} from '../../theme';

const statusOptions = [{label: 'Any', value: ''}].concat(
  Object.values(STUDENT_STATUS).map(value => ({label: value, value})),
);

const StudentSearchScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const academicYear = new Date().getFullYear();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({classId: '', sectionId: '', status: ''});
  const [submittedQuery, setSubmittedQuery] = useState('');

  const classesQuery = useQuery({
    queryKey: ['academicClasses', user?.branchId],
    queryFn: () => academicRepository.getAcademicClasses(),
  });
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });
  const resultsQuery = useQuery({
    queryKey: ['studentSearch', user?.branchId, submittedQuery, filters],
    queryFn: () =>
      studentService.searchStudents(
        {
          branchId: user.branchId,
          searchText: submittedQuery,
          classId: filters.classId,
          sectionId: filters.sectionId,
          status: filters.status,
        },
        scope,
      ),
    enabled: Boolean(user?.branchId && submittedQuery),
  });

  const classes = useMemo(
    () =>
      (classesQuery.data || []).filter(
        item =>
          item.branchId === user?.branchId &&
          (!user?.wing || user?.role !== 'COORDINATOR' || item.wing?.code === user.wing),
      ),
    [classesQuery.data, user?.branchId, user?.role, user?.wing],
  );
  const sections = useMemo(
    () =>
      (sectionsQuery.data?.sections || []).filter(
        section => !filters.classId || section.academicClassId === filters.classId,
      ),
    [sectionsQuery.data?.sections, filters.classId],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={resultsQuery.data || []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Name, admission number, or parent mobile" />
            <SelectField
              label="Class"
              value={filters.classId}
              options={[{label: 'Any', value: ''}].concat(classes.map(item => ({label: item.name, value: item.id})))}
              onChange={value => setFilters(current => ({...current, classId: value, sectionId: ''}))}
            />
            <SelectField
              label="Section"
              value={filters.sectionId}
              options={[{label: 'Any', value: ''}].concat(sections.map(item => ({label: `${item.academicClass?.name}-${item.name}`, value: item.id})))}
              onChange={value => setFilters(current => ({...current, sectionId: value}))}
            />
            <SelectField label="Status" value={filters.status} options={statusOptions} onChange={value => setFilters(current => ({...current, status: value}))} />
            <CustomButton style={styles.button} onPress={() => setSubmittedQuery(query.trim())}>Search</CustomButton>
          </View>
        }
        renderItem={({item}) => (
          <DashboardCard
            title={item.fullName}
            value={item.studentId}
            description={`${item.academicClass?.name || ''}-${item.section?.name || ''}`}
            icon="account-school-outline"
            onPress={() => navigation.navigate('StudentDetails', {studentId: item.id})}
          />
        )}
        ListEmptyComponent={
          <EmptyState title="No results" message={submittedQuery ? 'Try another search or filter.' : 'Search students by name, admission number, or parent mobile.'} />
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
  button: {
    marginBottom: spacing.md,
  },
});

export default StudentSearchScreen;
