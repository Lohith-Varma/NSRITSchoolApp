import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer} from '../../components';
import teacherService from '../../services/teachers/teacherService';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {formatCurrency} from '../../utils/formatters/currency';
import {logoutUser} from '../../store/slices/authSlice';

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
      <DashboardCard
        title="Assigned Sections"
        value={String(sections.length)}
        description={sections.map(item => `${item.academicClass?.name}-${item.name}`).join(', ') || 'No assigned sections'}
        icon="google-classroom"
        onPress={() => navigation.navigate('StudentsList')}
      />
      <DashboardCard title="Total Students" value={String(data?.totalStudents || 0)} icon="account-school-outline" />
      <DashboardCard
        title="Today's Attendance"
        value={String(data?.todaysAttendance || 0)}
        description={`${data?.pendingAttendance || 0} section(s) pending`}
        icon="clipboard-check-outline"
        onPress={() => navigation.navigate('TakeAttendance')}
      />
      <DashboardCard
        title="Subjects Assigned"
        value={String(data?.subjectsAssigned || 0)}
        description={subjects.map(item => item.name).join(', ') || 'No subjects assigned'}
        icon="book-open-page-variant-outline"
      />
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
      <DashboardCard title="Fee Status" value={`${Math.round((feeSummary.collectionRate || 0) * 100)}%`} description="Collection status only" icon="cash-check" />
      <DashboardCard title="Paid Amount" value={formatCurrency(feeSummary.paidAmount)} icon="cash-check" />
      <DashboardCard title="Due Amount" value={formatCurrency(feeSummary.dueAmount)} icon="cash-clock" />
    </ScreenContainer>
  );
};

export default TeacherDashboardScreen;
