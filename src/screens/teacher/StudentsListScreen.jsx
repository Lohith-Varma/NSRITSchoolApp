import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {EmptyState, Header, StudentListItem} from '../../components';
import studentService from '../../services/students/studentService';
import teacherService from '../../services/teachers/teacherService';
import {colors, spacing} from '../../theme';

const StudentsListScreen = () => {
  const user = useSelector(state => state.auth.user);

  const assignmentsQuery = useQuery({
    queryKey: ['teacherAssignments', user?.teacherId],
    queryFn: () => teacherService.getAssignments({teacherId: user?.teacherId}),
    enabled: Boolean(user?.teacherId),
  });

  const assignments = assignmentsQuery.data || [];

  const studentsQuery = useQuery({
    queryKey: ['teacherAssignedStudents', user?.teacherId, assignments.map(item => item.sectionId).join(',')],
    queryFn: async () => {
      const rosters = await Promise.all(
        assignments.map(async assignment => {
          const students = await studentService.getStudentsBySection(assignment.sectionId);
          return students.map(student => ({
            ...student,
            assignmentSection: assignment.section,
          }));
        }),
      );
      return rosters.flat();
    },
    enabled: Boolean(assignments.length),
  });

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Students" subtitle="Assigned section roster" />
      </View>
      <FlatList
        data={students}
        keyExtractor={item => `${item.sectionId}-${item.id}`}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <StudentListItem
            student={{
              id: item.id,
              name: item.fullName,
              rollNo: item.studentId,
              section: `${item.academicClass?.name || item.assignmentSection?.academicClass?.name || ''}-${item.section?.name || item.assignmentSection?.name || ''}`,
            }}
            checked
            status="info"
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={assignmentsQuery.isLoading || studentsQuery.isLoading ? 'Loading students' : 'No students'}
            message={assignmentsQuery.error?.message || studentsQuery.error?.message || 'No assigned section roster found.'}
          />
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
  },
});

export default StudentsListScreen;
