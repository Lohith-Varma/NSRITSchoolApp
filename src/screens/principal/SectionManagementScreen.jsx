import React, {useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import {getAccessScope} from '../../services/rbacScope';
import CreateSectionModal from './CreateSectionModal';

const SectionManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const academicYear = new Date().getFullYear();

  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses'],
    queryFn: () => academicRepository.getActiveAcademicClasses(),
  });
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });

  const mutation = useMutation({
    mutationFn: payload => sectionService.createSection(
      {
        branchId: user.branchId,
        academicClassId: payload.academicClassId,
        wingId: payload.wingId,
        name: payload.name,
        academicYear: Number(payload.academicYear),
        wing: payload.wing,
        className: payload.className,
      },
      scope,
    ),
    onSuccess: () => {
      setModalVisible(false);
      queryClient.invalidateQueries({queryKey: ['sections', user?.branchId, academicYear]});
    },
  });

  const studentCounts = useMemo(() => {
    const counts = {};
    (sectionsQuery.data?.students || []).forEach(student => {
      counts[student.sectionId] = (counts[student.sectionId] || 0) + 1;
    });
    return counts;
  }, [sectionsQuery.data?.students]);

  const sections = sectionsQuery.data?.sections || [];

  return (
    <ScreenContainer>
      <Header
        title="Sections"
        subtitle={`${academicYear} academic year`}
        actionLabel="Create"
        onAction={() => setModalVisible(true)}
      />
      {sections.length ? (
        sections.map(item => (
          <DashboardCard
            key={item.id}
            title={`${item.academicClass?.name || 'Class'}-${item.name}`}
            value={`${studentCounts[item.id] || 0}`}
            description={`Teacher: ${item.classTeacher?.fullName || 'Not assigned'}`}
            icon="google-classroom"
            onPress={() => navigation.navigate('SectionDetails', {section: item})}
          />
        ))
      ) : (
        <EmptyState title="No sections" message="Create yearly sections under the fixed class list." />
      )}
      <CreateSectionModal
        visible={modalVisible}
        classes={classesQuery.data || []}
        existingSections={sections}
        onDismiss={() => setModalVisible(false)}
        onSubmit={payload => mutation.mutate(payload)}
        loading={mutation.isPending}
      />
    </ScreenContainer>
  );
};

export default SectionManagementScreen;
