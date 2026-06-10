import React, {useMemo, useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, ScreenContainer, SectionHeader, SelectField} from '../../components';
import {USER_ROLES} from '../../config/constants';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';

const TransferStudentScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = new Date().getFullYear();
  const [error, setError] = useState('');
  const [form, setForm] = useState({studentId: '', newSectionId: ''});

  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });

  const studentsQuery = useQuery({
    queryKey: ['transferStudents', user?.branchId, user?.wing],
    queryFn: () =>
      user.role === USER_ROLES.COORDINATOR
        ? studentService.getStudentsByWing({branchId: user.branchId, wing: user.wing}, scope)
        : studentService.getStudentsByBranch(user.branchId),
    enabled: Boolean(user?.branchId),
  });

  const students = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);
  const sections = useMemo(() => {
    const items = sectionsQuery.data?.sections || [];
    return user.role === USER_ROLES.COORDINATOR
      ? items.filter(section => section.academicClass?.wing?.code === user.wing)
      : items;
  }, [sectionsQuery.data?.sections, user.role, user.wing]);
  const selectedStudent = students.find(item => item.id === form.studentId);
  const targetSection = sections.find(item => item.id === form.newSectionId);

  const studentOptions = useMemo(
    () => students.map(item => ({label: `${item.studentId} - ${item.fullName}`, value: item.id})),
    [students],
  );
  const sectionOptions = useMemo(
    () => sections.map(item => ({label: `${item.academicClass?.name}-${item.name}`, value: item.id})),
    [sections],
  );

  const mutation = useMutation({
    mutationFn: () =>
      studentService.transferStudent(
        {
          branchId: user.branchId,
          studentId: selectedStudent.id,
          oldSectionId: selectedStudent.sectionId,
          newSectionId: targetSection.id,
          newClassId: targetSection.academicClassId,
          className: targetSection.academicClass?.name,
          targetWing: targetSection.academicClass?.wing?.code,
        },
        scope,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['transferStudents', user?.branchId, user?.wing]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  return (
    <ScreenContainer>
      <SectionHeader title="Transfer Student" subtitle="Move a student between permitted sections" />
      <SelectField label="Student" value={form.studentId} options={studentOptions} onChange={value => setForm(current => ({...current, studentId: value}))} />
      <SelectField label="New Section" value={form.newSectionId} options={sectionOptions} onChange={value => setForm(current => ({...current, newSectionId: value}))} />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton
        loading={mutation.isPending}
        disabled={mutation.isPending || !selectedStudent || !targetSection}
        onPress={() => mutation.mutate()}>
        Transfer Student
      </CustomButton>
    </ScreenContainer>
  );
};

export default TransferStudentScreen;
