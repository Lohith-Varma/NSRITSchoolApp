import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import BulkSectionAssignmentModal from '../students/BulkSectionAssignmentModal';
import UpdateStudentStatusModal from '../students/UpdateStudentStatusModal';

const WingStudentsScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkVisible, setBulkVisible] = useState(false);
  const [statusStudent, setStatusStudent] = useState(null);
  const academicYear = new Date().getFullYear();

  const studentsQuery = useQuery({
    queryKey: ['wingStudents', user?.branchId, user?.wing],
    queryFn: () => studentService.getStudentsByWing({branchId: user.branchId, wing: user.wing}, scope),
    enabled: Boolean(user?.branchId && user?.wing),
  });
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });

  const bulkMutation = useMutation({
    mutationFn: payload => studentService.bulkAssignStudents({...payload, branchId: user.branchId}, scope),
    onSuccess: () => {
      setSelectedStudents([]);
      setBulkVisible(false);
      queryClient.invalidateQueries({queryKey: ['wingStudents', user?.branchId, user?.wing]});
    },
  });
  const statusMutation = useMutation({
    mutationFn: status =>
      studentService.updateStudentStatus({studentId: statusStudent.id, status, branchId: user.branchId}, scope),
    onSuccess: () => {
      setStatusStudent(null);
      queryClient.invalidateQueries({queryKey: ['wingStudents', user?.branchId, user?.wing]});
    },
  });

  const students = studentsQuery.data || [];
  const sections = (sectionsQuery.data?.sections || []).filter(
    section => section.academicClass?.wing?.code === user?.wing,
  );

  const toggleSelected = studentId =>
    setSelectedStudents(current =>
      current.includes(studentId)
        ? current.filter(id => id !== studentId)
        : [...current, studentId],
    );

  return (
    <ScreenContainer>
      <Header
        title="Wing Students"
        subtitle="Students in your assigned wing"
        actionLabel="Add"
        onAction={() => navigation.navigate('AddStudent')}
      />
      <DashboardCard
        title="Bulk Assignment"
        value={String(selectedStudents.length)}
        description="Tap students below to select them"
        icon="select-group"
        onPress={() => setBulkVisible(true)}
      />
      <DashboardCard
        title="Transfer Student"
        value="Move"
        description="Change section with history tracking"
        icon="swap-horizontal"
        onPress={() => navigation.navigate('TransferStudent')}
      />
      <DashboardCard
        title="Update Status"
        value="Soft"
        description="Select one student, then change active status"
        icon="account-cancel-outline"
        onPress={() => {
          const student = students.find(item => item.id === selectedStudents[0]);
          if (student) {
            setStatusStudent(student);
          }
        }}
      />
      {students.length ? (
        students.map(item => (
          <DashboardCard
            key={item.id}
            title={item.fullName}
            value={selectedStudents.includes(item.id) ? 'Selected' : item.studentId}
            description={`${item.academicClass?.name || ''}-${item.section?.name || ''}`}
            icon="account-school"
            onPress={() => toggleSelected(item.id)}
          />
        ))
      ) : (
        <EmptyState title="No students" message="Students in your assigned wing will appear here." />
      )}
      <BulkSectionAssignmentModal
        visible={bulkVisible}
        sections={sections}
        selectedStudentIds={selectedStudents}
        onDismiss={() => setBulkVisible(false)}
        onSubmit={payload => bulkMutation.mutate(payload)}
        loading={bulkMutation.isPending}
      />
      <UpdateStudentStatusModal
        visible={Boolean(statusStudent)}
        student={statusStudent}
        onDismiss={() => setStatusStudent(null)}
        onSubmit={status => statusMutation.mutate(status)}
        loading={statusMutation.isPending}
      />
    </ScreenContainer>
  );
};

export default WingStudentsScreen;
