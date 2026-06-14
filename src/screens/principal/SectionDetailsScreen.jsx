import React from 'react';
import {DashboardCard, Header, ScreenContainer} from '../../components';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const SectionDetailsScreen = ({navigation, route}) => {
  const section = route.params?.section || {};
  const classTeacherAssignment = section.classTeacherAssignments?.[0];
  const assignmentTeacher = classTeacherAssignment?.teacher;
  const classTeacher = section.classTeacher || assignmentTeacher?.user;

  return (
    <ScreenContainer>
      <Header
        title={`${section.academicClass?.name || 'Class'}-${section.name || ''}`}
        subtitle={`Academic year ${section.academicYear || '-'}`}
      />
      <DashboardCard title="Class" value={section.academicClass?.name || '-'} icon="book-education-outline" />
      <DashboardCard title="Section" value={section.name || '-'} icon="view-grid-outline" />
      <DashboardCard
        title="Assigned Class Teacher"
        value={classTeacher?.fullName || 'Not assigned'}
        description={`Employee ID: ${assignmentTeacher?.employeeId || classTeacher?.employeeId || '-'} | Mobile: ${classTeacher?.phoneNumber || '-'} | Assigned: ${formatDateForDisplay(classTeacherAssignment?.createdAt) || '-'} | By: ${classTeacherAssignment?.assignedBy?.fullName || '-'}`}
        icon="teach"
      />
      <DashboardCard title="Student Count" value={String(section.studentCount || 0)} icon="account-school" />
      <DashboardCard title="Attendance Summary" value={section.attendanceSummary || 'Use attendance reports'} icon="clipboard-text-clock" />
      <DashboardCard
        title="Assign Class Teacher"
        value="Assign"
        icon="account-switch-outline"
        onPress={() =>
          navigation.navigate('AssignClassTeacher', {
            sectionId: section.id,
            academicYear: section.academicYear,
          })
        }
      />
    </ScreenContainer>
  );
};

export default SectionDetailsScreen;
