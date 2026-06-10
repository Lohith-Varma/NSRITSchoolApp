import React, {useMemo, useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, ScreenContainer, SectionHeader, SelectField} from '../../components';
import sectionService from '../../services/sections/sectionService';
import teacherService from '../../services/teachers/teacherService';
import {getAccessScope} from '../../services/rbacScope';

const AssignClassTeacherScreen = ({navigation, route}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = route.params?.academicYear || new Date().getFullYear();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    sectionId: route.params?.sectionId || '',
    teacherId: '',
  });

  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });

  const teachersQuery = useQuery({
    queryKey: ['teachers', user?.branchId, user?.wing || 'ALL'],
    queryFn: () =>
      teacherService.getTeachers(
        {
          branchId: user.branchId,
          wing: user.role === 'COORDINATOR' ? user.wing : undefined,
          limit: 100,
          offset: 0,
        },
        scope,
      ),
    enabled: Boolean(user?.branchId),
  });

  const sections = useMemo(() => {
    const items = sectionsQuery.data?.sections || [];
    return user?.role === 'COORDINATOR'
      ? items.filter(item => item.academicClass?.wing?.code === user.wing)
      : items;
  }, [sectionsQuery.data?.sections, user?.role, user?.wing]);

  const sectionOptions = useMemo(
    () =>
      sections.map(item => ({
        label: `${item.academicClass?.name || ''}-${item.name}`,
        value: item.id,
      })),
    [sections],
  );

  const teacherOptions = useMemo(
    () =>
      (teachersQuery.data || []).map(item => ({
        label: `${item.fullName || item.user?.fullName} (${item.employeeId})`,
        value: item.id,
        item,
      })),
    [teachersQuery.data],
  );

  const selectedTeacher = useMemo(
    () => teacherOptions.find(item => item.value === form.teacherId)?.item,
    [teacherOptions, form.teacherId],
  );

  const mutation = useMutation({
    mutationFn: payload =>
      teacherService.assignClassTeacher(
        {
          teacher: selectedTeacher,
          sectionId: payload.sectionId,
          branchId: user.branchId,
        },
        scope,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['sections', user?.branchId, academicYear]});
      queryClient.invalidateQueries({queryKey: ['teachers', user?.branchId]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  return (
    <ScreenContainer>
      <SectionHeader title="Assign Class Teacher" subtitle="A teacher can be class teacher for one section only" />
      <SelectField label="Section" value={form.sectionId} options={sectionOptions} onChange={value => setForm(current => ({...current, sectionId: value}))} />
      <SelectField label="Teacher" value={form.teacherId} options={teacherOptions} onChange={value => setForm(current => ({...current, teacherId: value}))} />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton
        loading={mutation.isPending}
        disabled={mutation.isPending || !form.sectionId || !form.teacherId}
        onPress={() => mutation.mutate(form)}>
        Assign Class Teacher
      </CustomButton>
    </ScreenContainer>
  );
};

export default AssignClassTeacherScreen;
