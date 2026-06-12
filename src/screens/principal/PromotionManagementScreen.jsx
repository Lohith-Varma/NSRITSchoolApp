import React, {useMemo, useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, Header, ScreenContainer, SelectField} from '../../components';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {getNextClassName} from '../../config/academic';

const PromotionManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const academicYear = new Date().getFullYear();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({fromSectionId: '', toSectionId: ''});

  const classesQuery = useQuery({queryKey: ['academicClasses'], queryFn: () => academicRepository.getAcademicClasses()});
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });
  const studentsQuery = useQuery({
    queryKey: ['studentsByBranch', user?.branchId],
    queryFn: () => studentService.getStudentsByBranch(user.branchId, {limit: 1000}),
    enabled: Boolean(user?.branchId),
  });

  const sections = useMemo(() => sectionsQuery.data?.sections || [], [sectionsQuery.data?.sections]);
  const classes = useMemo(() => classesQuery.data || [], [classesQuery.data]);
  const source = sections.find(item => item.id === form.fromSectionId);
  const target = sections.find(item => item.id === form.toSectionId);
  const nextClassName = getNextClassName(source?.academicClass?.name);
  const sourceStudents = (studentsQuery.data || []).filter(item => item.sectionId === source?.id);

  const fromOptions = useMemo(
    () => sections.map(item => ({label: `${item.academicClass?.name}-${item.name}`, value: item.id})),
    [sections],
  );
  const toOptions = useMemo(
    () =>
      sections
        .filter(item => !nextClassName || item.academicClass?.name === nextClassName)
        .map(item => ({label: `${item.academicClass?.name}-${item.name}`, value: item.id})),
    [nextClassName, sections],
  );

  const mutation = useMutation({
    mutationFn: () =>
      studentService.promoteStudents(
        {
          branchId: user.branchId,
          studentIds: sourceStudents.map(item => item.id),
          fromClassId: source.academicClassId,
          toClassId: target.academicClassId,
          fromSectionId: source.id,
          toSectionId: target.id,
        },
        scope,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['studentsByBranch', user?.branchId]});
      navigation.navigate('PromotionHistory');
    },
    onError: err => setError(err.message),
  });

  const classExists = classes.some(item => item.name === nextClassName);

  return (
    <ScreenContainer>
      <Header title="Promotions" subtitle="Promote a full section to the next class" actionLabel="History" onAction={() => navigation.navigate('PromotionHistory')} />
      <SelectField label="From Section" value={form.fromSectionId} options={fromOptions} onChange={value => setForm(current => ({...current, fromSectionId: value, toSectionId: ''}))} />
      <SelectField label="Target Section" value={form.toSectionId} options={toOptions} disabled={!source || !classExists} onChange={value => setForm(current => ({...current, toSectionId: value}))} />
      <HelperText type="info" visible={Boolean(source)}>
        {sourceStudents.length} students selected for promotion.
      </HelperText>
      <HelperText type="error" visible={Boolean(error || (source && !nextClassName))}>
        {error || (source && !nextClassName ? 'Class 12 has no automatic promotion target.' : '')}
      </HelperText>
      <CustomButton
        loading={mutation.isPending}
        disabled={mutation.isPending || !source || !target || !sourceStudents.length}
        onPress={() => mutation.mutate()}>
        Promote Section
      </CustomButton>
    </ScreenContainer>
  );
};

export default PromotionManagementScreen;
