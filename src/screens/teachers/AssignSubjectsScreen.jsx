import React, {useEffect, useMemo, useState} from 'react';
import {Checkbox, HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, EmptyState, Header, ScreenContainer} from '../../components';
import subjectService from '../../services/subjects/subjectService';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';

const AssignSubjectsScreen = ({navigation, route}) => {
  const teacherId = route.params?.teacherId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  const {data: teacher} = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId),
  });

  const {data: subjects = [], isLoading} = useQuery({
    queryKey: ['subjects', 0],
    queryFn: () => subjectService.getSubjects({limit: 100, offset: 0}),
  });

  useEffect(() => {
    if (teacher?.subjects) {
      setSelected(teacher.subjects.map(item => item.id));
    }
  }, [teacher]);

  const activeSubjects = useMemo(
    () => subjects.filter(item => item.status === 'ACTIVE'),
    [subjects],
  );

  const mutation = useMutation({
    mutationFn: () => teacherService.assignTeacherSubjects({teacher, subjectIds: selected}, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['teacher', teacherId]});
      queryClient.invalidateQueries({queryKey: ['teachers', user?.branchId]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  const toggle = subjectId =>
    setSelected(current =>
      current.includes(subjectId)
        ? current.filter(item => item !== subjectId)
        : [...current, subjectId],
    );

  return (
    <ScreenContainer>
      <Header
        title="Assign Subjects"
        subtitle={teacher?.fullName || teacher?.user?.fullName || 'Teacher'}
      />
      {activeSubjects.length ? (
        activeSubjects.map(subject => (
          <Checkbox.Item
            key={subject.id}
            label={`${subject.name} (${subject.code})`}
            status={selected.includes(subject.id) ? 'checked' : 'unchecked'}
            onPress={() => toggle(subject.id)}
          />
        ))
      ) : (
        <EmptyState
          title={isLoading ? 'Loading subjects' : 'No active subjects'}
          message="Create active master subjects before assigning them."
        />
      )}
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending || !teacher} onPress={() => mutation.mutate()}>
        Save Subject Assignments
      </CustomButton>
    </ScreenContainer>
  );
};

export default AssignSubjectsScreen;
