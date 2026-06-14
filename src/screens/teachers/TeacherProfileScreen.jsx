import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader} from '../../components';
import teacherService from '../../services/teachers/teacherService';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const TeacherProfileScreen = ({route}) => {
  const teacherId = route.params?.teacherId;
  const {data: teacher} = useQuery({
    queryKey: ['teacherProfile', teacherId],
    queryFn: () => teacherService.getTeacherProfile(teacherId),
    enabled: Boolean(teacherId),
  });

  if (!teacher) {
    return (
      <ScreenContainer>
        <EmptyState title="Teacher profile unavailable" message="Profile data could not be loaded." />
      </ScreenContainer>
    );
  }

  const assignments = teacher.assignments || [];
  const assignedSection = assignments.find(item => item.isClassTeacher)?.section;
  const activeAssignments = assignments.filter(item => item.isActive !== false);
  const studentCount = assignments.reduce(
    (sum, item) =>
      sum +
      (
        item.section?.profileActiveStudents ||
        item.section?.dashboardActiveStudents ||
        item.section?.activeStudents ||
        item.section?.students_on_section ||
        []
      ).length,
    0,
  );
  const attendanceRecordsMarked = teacher.attendanceMarked?.length || 0;

  return (
    <ScreenContainer>
      <Header
        title={teacher.fullName || teacher.user?.fullName || 'Teacher'}
        subtitle={`${teacher.designation || 'Teacher'} | ${teacher.branch?.name || 'Branch resource'}`}
      />
      <SectionHeader title="Personal Information" />
      <DashboardCard title="Mobile" value={teacher.phoneNumber || teacher.user?.phoneNumber || '-'} icon="phone" />
      <DashboardCard title="Gender" value={teacher.gender || '-'} icon="account-outline" />
      <DashboardCard title="Email" value={teacher.email || '-'} icon="email-outline" />
      <DashboardCard title="Date of Birth" value={formatDateForDisplay(teacher.dateOfBirth) || '-'} icon="calendar-account-outline" />
      <DashboardCard title="Blood Group" value={teacher.bloodGroup || '-'} icon="water-outline" />
      <SectionHeader title="Employment Information" />
      <DashboardCard title="Employee ID" value={teacher.employeeId || '-'} icon="identifier" />
      <DashboardCard title="Joining Date" value={formatDateForDisplay(teacher.joiningDate) || '-'} icon="calendar-start" />
      <DashboardCard title="Designation" value={teacher.designation || '-'} icon="briefcase-account-outline" />
      <DashboardCard title="Qualification" value={teacher.qualification || '-'} icon="school-outline" />
      <DashboardCard title="Experience" value={teacher.experience || '-'} icon="briefcase-outline" />
      <DashboardCard title="Status" value={teacher.isActive === false ? 'Inactive' : 'Active'} icon="check-circle-outline" />
      <SectionHeader title="Academic Assignments" />
      <DashboardCard title="Assigned Subjects" value={teacher.subjects?.map(item => item.name).join(', ') || 'None'} icon="book-open-outline" />
      <DashboardCard
        title="Class Teacher Assignment"
        value={assignedSection ? `${assignedSection.academicClass?.name}-${assignedSection.name}` : 'None'}
        description={assignedSection ? 'Assigned as class teacher' : 'No class teacher assignment'}
        icon="google-classroom"
      />
      <DashboardCard
        title="Assigned Sections"
        value={String(activeAssignments.length)}
        description={activeAssignments.map(item => `${item.section?.academicClass?.name || '-'}-${item.section?.name || '-'}`).join(', ') || 'None'}
        icon="view-grid-outline"
      />
      <DashboardCard title="Students Count" value={String(studentCount)} icon="account-school-outline" />
      <DashboardCard title="Attendance Records Marked" value={String(attendanceRecordsMarked)} icon="clipboard-text-clock-outline" />
    </ScreenContainer>
  );
};

export default TeacherProfileScreen;
