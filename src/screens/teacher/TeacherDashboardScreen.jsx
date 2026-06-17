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
import {ROLE_LABELS, USER_ROLES} from '../../config/constants';
import {colors} from '../../theme';

const TeacherDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const access = useFeeAccess();
  const teacherId = user?.teacherId;
  const role = String(user?.role || '').toUpperCase();
  const roleLabel = ROLE_LABELS[role] || 'Teacher';
  const isClassTeacherRole = role === USER_ROLES.CLASS_TEACHER;

  const {data, isLoading} = useQuery({
    queryKey: ['teacherDashboard', teacherId, role],
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
          title={roleLabel}
          subtitle={user?.fullName || 'Profile pending'}
          actionLabel="Logout"
          onAction={() => dispatch(logoutUser())}
        />
        <EmptyState title="Teacher profile pending" message="Ask the principal to complete your teacher profile." />
      </ScreenContainer>
    );
  }

  const allSections = data?.assignedSections || [];
  const subjects = data?.assignedSubjects || [];
  const classTeacherSections = data?.classTeacherAssignments || [];
  const sections = isClassTeacherRole
    ? classTeacherSections.map(item => item.section).filter(Boolean)
    : allSections;
  const sectionLabel = sections.map(item => `${item.academicClass?.name || '-'}-${item.name || '-'}`).join(', ');
  const totalStudents = sections.reduce(
    (sum, section) =>
      sum +
      (
        section.dashboardActiveStudents ||
        section.profileActiveStudents ||
        section.activeStudents ||
        section.students_on_section ||
        []
      ).filter(student => ['ACTIVE', undefined, null].includes(student.status)).length,
    0,
  );
  const todayDate = new Date().toISOString().slice(0, 10);
  const pendingAttendance = isClassTeacherRole
    ? sections.filter(section => {
        const students =
          section.dashboardActiveStudents ||
          section.profileActiveStudents ||
          section.activeStudents ||
          section.students_on_section ||
          [];
        const markedIds = new Set(
          (
            section.dashboardSectionAttendance ||
            section.profileSectionAttendance ||
            section.sectionAttendance ||
            section.attendances_on_section ||
            []
          )
            .filter(item => item.attendanceDate === todayDate)
            .map(item => item.studentId),
        );
        return students.some(student => !markedIds.has(student.id));
      }).length
    : data?.pendingAttendance || 0;
  const todaysAttendance = isClassTeacherRole
    ? sections.reduce(
        (sum, section) =>
          sum +
          (
            section.dashboardSectionAttendance ||
            section.profileSectionAttendance ||
            section.sectionAttendance ||
            section.attendances_on_section ||
            []
          ).filter(item => item.attendanceDate === todayDate).length,
        0,
      )
    : data?.todaysAttendance || 0;

  return (
    <ScreenContainer>
      <Header
        title={roleLabel}
        subtitle={isLoading ? 'Loading dashboard' : user?.fullName}
        actionLabel="Logout"
        onAction={() => dispatch(logoutUser())}
      />
      <SectionHeader
        title={isClassTeacherRole ? 'Class Teacher Actions' : 'Priority Actions'}
        subtitle={isClassTeacherRole ? 'Assigned section only' : 'Daily classroom work'}
      />
      <DashboardCard
        title={isClassTeacherRole ? 'Attendance' : 'Mark Attendance'}
        value={`${pendingAttendance} pending`}
        description={isClassTeacherRole ? 'Open attendance for assigned section' : 'Open attendance for assigned sections'}
        icon="clipboard-check-outline"
        tone={colors.success}
        onPress={() => navigation.navigate('TakeAttendance')}
      />
      <DashboardCard
        title={isClassTeacherRole ? 'Assigned Class' : "Today's Classes"}
        value={String(sections.length)}
        description={sectionLabel || 'No assigned sections'}
        icon="google-classroom"
        tone={colors.primary}
        onPress={() => navigation.navigate('StudentsList')}
      />
      <DashboardCard
        title={isClassTeacherRole ? 'Student List' : 'Students'}
        value={String(isClassTeacherRole ? totalStudents : data?.totalStudents || 0)}
        description={isClassTeacherRole ? 'Assigned class teacher section roster' : 'Assigned section roster'}
        icon="account-school-outline"
        onPress={() => navigation.navigate('StudentsList')}
      />
      {isClassTeacherRole ? (
        <>
          <DashboardCard
            title="Homework"
            value="Class"
            description="Assigned section homework"
            icon="book-check-outline"
            tone={colors.secondary}
          />
          <DashboardCard
            title="Parent Information"
            value="View"
            description="Open student profiles for parent contacts"
            icon="account-child-outline"
            onPress={() => navigation.navigate('StudentsList')}
          />
          <DashboardCard
            title="Class Reports"
            value="View"
            description="Attendance and fee reports for assigned section"
            icon="chart-box-outline"
          />
        </>
      ) : (
        <DashboardCard
          title="Subjects"
          value={String(data?.subjectsAssigned || 0)}
          description={subjects.map(item => item.name).join(', ') || 'No subjects assigned'}
          icon="book-open-page-variant-outline"
          tone={colors.secondary}
        />
      )}
      <DashboardCard
        title="Profile"
        value="Open"
        description="View teacher details and assignments"
        icon="account-details-outline"
        onPress={() => navigation.navigate('TeacherProfile', {teacherId})}
      />
      <SectionHeader title={isClassTeacherRole ? 'Assigned Section Snapshot' : 'Class Snapshot'} />
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
        value={String(todaysAttendance)}
        icon="clipboard-check-outline"
      />
      <SectionHeader title="Fee Visibility" />
      <DashboardCard title={isClassTeacherRole ? 'Fee Summary' : 'Fee Status'} value={`${Math.round((feeSummary.collectionRate || 0) * 100)}%`} description="View only" icon="cash-check" tone={colors.success} />
      <DashboardCard title="Paid Amount" value={formatCurrency(feeSummary.paidAmount)} icon="cash-check" tone={colors.success} />
      <DashboardCard title="Due Amount" value={formatCurrency(feeSummary.dueAmount)} icon="cash-clock" tone={colors.danger} />
    </ScreenContainer>
  );
};

export default TeacherDashboardScreen;
