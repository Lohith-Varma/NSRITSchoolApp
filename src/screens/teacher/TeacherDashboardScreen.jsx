import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {
  DashboardCard,
  EmptyState,
  Header,
  ScreenContainer,
  SectionHeader,
} from '../../components';
import teacherService from '../../services/teachers/teacherService';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {logoutUser} from '../../store/slices/authSlice';
import {colors} from '../../theme';

const TeacherDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const access = useFeeAccess();
  const teacherId = user?.teacherId;

  const {data, isLoading} = useQuery({
    queryKey: ['teacherDashboard', teacherId],
    queryFn: () => teacherService.getTeacherDashboard(teacherId),
    enabled: Boolean(teacherId),
  });
  const {data: feeData} = useQuery({
    queryKey: ['teacherFeeStatus', access.branchId],
    queryFn: () => feeService.getFeeReports(access),
    enabled: Boolean(access.branchId),
  });
  const feeSummary = feeData?.summary || {};

  if (!teacherId) {
    return (
      <ScreenContainer>
        <Header
          title="Teacher"
          subtitle={user?.fullName || 'Profile pending'}
          actionLabel="Logout"
          onAction={() => dispatch(logoutUser())}
        />
        <EmptyState title="Teacher profile pending" message="Ask the principal to complete your teacher profile." />
      </ScreenContainer>
    );
  }

  const sections = data?.assignedSections || [];
  const subjects = data?.assignedSubjects || [];
  const classTeacherSections = data?.classTeacherAssignments || [];

  return (
    <ScreenContainer>
      <Header
        title="Teacher"
        subtitle={isLoading ? 'Loading dashboard' : user?.fullName}
        actionLabel="Logout"
        onAction={() => dispatch(logoutUser())}
      />
      <SectionHeader title="Priority Actions" subtitle="Daily classroom work" />
      <DashboardCard
        title="Mark Attendance"
        value={`${data?.pendingAttendance || 0} pending`}
        description="Open attendance for assigned sections"
        icon="clipboard-check-outline"
        tone={colors.success}
        onPress={() => navigation.navigate('TakeAttendance')}
      />
      <DashboardCard
        title="Today's Classes"
        value={String(sections.length)}
        description={sections.map(item => `${item.academicClass?.name}-${item.name}`).join(', ') || 'No assigned sections'}
        icon="google-classroom"
        tone={colors.primary}
        onPress={() => navigation.navigate('StudentsList')}
      />
      <DashboardCard
        title="Students"
        value={String(data?.totalStudents || 0)}
        description="Assigned section roster"
        icon="account-school-outline"
        onPress={() => navigation.navigate('StudentsList')}
      />
      <DashboardCard
        title="Subjects"
        value={String(data?.subjectsAssigned || 0)}
        description={subjects.map(item => item.name).join(', ') || 'No subjects assigned'}
        icon="book-open-page-variant-outline"
        tone={colors.secondary}
      />
      <DashboardCard
        title="Profile"
        value="Open"
        description="View teacher details and assignments"
        icon="account-details-outline"
        onPress={() => navigation.navigate('TeacherProfile', {teacherId})}
      />
      <SectionHeader title="Class Snapshot" />
      <DashboardCard
        title="Class Teacher"
        value={String(classTeacherSections.length)}
        description={
          classTeacherSections
            .map(item => `${item.section?.academicClass?.name || '-'}-${item.section?.name || '-'}`)
            .join(', ') || 'No class teacher section'
        }
        icon="account-tie-outline"
      />
      <DashboardCard
        title="Attendance Marked Today"
        value={String(data?.todaysAttendance || 0)}
        icon="clipboard-check-outline"
      />
      <SectionHeader title="Fee Visibility" />
      <DashboardCard title="Fee Status" value={`${Math.round((feeSummary.collectionRate || 0) * 100)}%`} description="Collection status only" icon="cash-check" tone={colors.success} />
      <DashboardCard title="Paid Amount" value={formatCurrency(feeSummary.paidAmount)} icon="cash-check" tone={colors.success} />
      <DashboardCard title="Due Amount" value={formatCurrency(feeSummary.dueAmount)} icon="cash-clock" tone={colors.danger} />
    </ScreenContainer>
  );
};

export default TeacherDashboardScreen;
