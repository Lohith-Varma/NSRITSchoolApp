import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import {WING_LABELS} from '../../config/academic';
import teacherService from '../../services/teachers/teacherService';

const TeacherDetailsScreen = ({navigation, route}) => {
  const teacherId = route.params?.teacherId;
  const {data: teacher} = useQuery({
    queryKey: ['teacher', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId),
  });

  if (!teacher) {
    return (
      <ScreenContainer>
        <EmptyState title="Teacher not found" message="The selected teacher could not be loaded." />
      </ScreenContainer>
    );
  }

  const subjects = teacher.subjects?.map(item => item.name).join(', ') || 'No subjects assigned';
  const classTeacherSection = teacher.assignments?.find(item => item.isClassTeacher)?.section;

  return (
    <ScreenContainer>
      <Header
        title={teacher.fullName || teacher.user?.fullName || 'Teacher'}
        subtitle={`${teacher.employeeId || '-'} | ${WING_LABELS[teacher.wing] || teacher.wing}`}
        actionLabel="Edit"
        onAction={() => navigation.navigate('EditTeacher', {teacherId})}
      />
      <DashboardCard title="Mobile" value={teacher.phoneNumber || teacher.user?.phoneNumber || '-'} icon="phone" />
      <DashboardCard title="Designation" value={teacher.designation || '-'} icon="badge-account-outline" />
      <DashboardCard title="Joining Date" value={teacher.joiningDate || '-'} icon="calendar-start" />
      <DashboardCard title="Subjects" value={subjects} icon="book-open-page-variant-outline" onPress={() => navigation.navigate('AssignSubjects', {teacherId})} />
      <DashboardCard
        title="Class Teacher"
        value={
          classTeacherSection
            ? `${classTeacherSection.academicClass?.name || ''}-${classTeacherSection.name}`
            : 'Not assigned'
        }
        icon="google-classroom"
      />
      <DashboardCard title="Profile" value="Open" icon="account-details-outline" onPress={() => navigation.navigate('TeacherProfile', {teacherId})} />
      <DashboardCard title="Status" value={teacher.isActive ? 'Active' : 'Inactive'} icon="check-circle-outline" />
    </ScreenContainer>
  );
};

export default TeacherDetailsScreen;
