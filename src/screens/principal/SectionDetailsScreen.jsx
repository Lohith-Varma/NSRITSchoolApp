import React from 'react';
import {DashboardCard, Header, ScreenContainer} from '../../components';

const SectionDetailsScreen = ({navigation, route}) => {
  const section = route.params?.section || {};

  return (
    <ScreenContainer>
      <Header
        title={`${section.academicClass?.name || 'Class'}-${section.name || ''}`}
        subtitle={`Academic year ${section.academicYear || '-'}`}
      />
      <DashboardCard title="Class" value={section.academicClass?.name || '-'} icon="book-education-outline" />
      <DashboardCard title="Section" value={section.name || '-'} icon="view-grid-outline" />
      <DashboardCard title="Teacher" value={section.classTeacher?.fullName || 'Not assigned'} icon="teach" />
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
