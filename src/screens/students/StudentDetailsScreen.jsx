import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {DashboardCard, EmptyState, Header, ScreenContainer, SectionHeader} from '../../components';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const countStatus = (records, status) =>
  records.filter(item => String(item.status).toUpperCase() === status).length;
const getFeePlans = data => data?.feePlans || data?.studentDetailFeePlans || [];
const getFeeItems = plan => plan?.items || plan?.detailFeeItems || [];
const getFeePayments = plan => plan?.payments || plan?.detailFeePayments || [];
const isActivePayment = payment =>
  !['REVERSED', 'CANCELLED'].includes(String(payment.status || 'RECORDED').toUpperCase());
const getRoleList = user => {
  const roles = [...(user?.roles || []).map(item => item.role), user?.role].filter(Boolean);
  return [...new Set(roles.map(role => String(role).toUpperCase()))].join(', ');
};

const StudentDetailsScreen = ({navigation, route}) => {
  const studentId = route.params?.studentId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const {data} = useQuery({
    queryKey: ['studentDetails', studentId],
    queryFn: () => studentService.getStudentDetails(studentId, scope),
    enabled: Boolean(studentId),
  });

  const attendance = data?.attendances || [];
  const presentCount = countStatus(attendance, 'PRESENT');
  const absentCount = countStatus(attendance, 'ABSENT');
  const totalAttendance = presentCount + absentCount;
  const attendancePercentage = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0;
  const feePlans = getFeePlans(data);
  const activeFeePlan = feePlans.find(plan => plan.isActive !== false) || feePlans[0];
  const activeFeeItems = getFeeItems(activeFeePlan);
  const activeFeePayments = getFeePayments(activeFeePlan).filter(isActivePayment);
  const feeSummary = useMemo(() => {
    if (activeFeePlan) {
      const total =
        Number(activeFeePlan.totalAmount || 0) ||
        activeFeeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const paid = activeFeePayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );
      return {total, paid, due: Math.max(total - paid, 0)};
    }
    const fees = data?.studentFees || [];
    return fees.reduce(
      (summary, fee) => ({
        total: summary.total + Number(fee.totalFee || 0),
        paid: summary.paid + Number(fee.paidAmount || 0),
        due: summary.due + Number(fee.remainingAmount || 0),
      }),
      {total: 0, paid: 0, due: 0},
    );
  }, [activeFeeItems, activeFeePayments, activeFeePlan, data]);

  const student = data?.student;
  const linkedParents = student?.linkedParents || [];
  if (!student) {
    return (
      <ScreenContainer>
        <EmptyState title="Student unavailable" message="The student record could not be loaded." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title={student.fullName}
        subtitle={student.studentId}
        actionLabel="Edit"
        onAction={() => navigation.navigate('EditStudent', {studentId: student.id})}
      />
      <SectionHeader title="Personal Details" />
      <DashboardCard title="Gender" value={student.gender || '-'} icon="account-outline" />
      <DashboardCard title="Date of Birth" value={formatDateForDisplay(student.dateOfBirth) || '-'} icon="calendar-account-outline" />
      <DashboardCard title="Blood Group" value={student.bloodGroup || '-'} icon="water-outline" />
      <DashboardCard title="Address" value={[student.address, student.city, student.state, student.pincode].filter(Boolean).join(', ') || '-'} icon="map-marker-outline" />
      <SectionHeader title="Parent Details" />
      {linkedParents.length ? (
        linkedParents.map(link => (
          <DashboardCard
            key={link.id}
            title={link.relationship}
            value={link.user?.phoneNumber || '-'}
            description={`${link.user?.fullName || 'Parent'} | Roles: ${getRoleList(link.user) || '-'}`}
            icon="account-outline"
          />
        ))
      ) : (
        <>
          <DashboardCard title="Father" value={student.parent?.fatherName || student.parent?.fullName || '-'} icon="account-outline" />
          <DashboardCard title="Mother" value={student.parent?.motherName || '-'} icon="account-outline" />
          <DashboardCard title="Parent Mobile" value={student.parent?.phoneNumber || student.phoneNumber || '-'} icon="phone-outline" />
        </>
      )}
      <SectionHeader title="Academic Details" />
      <DashboardCard title="Class" value={student.academicClass?.name || '-'} icon="book-education-outline" />
      <DashboardCard title="Section" value={student.section?.name || '-'} icon="google-classroom" />
      <DashboardCard title="Class Teacher" value={student.section?.classTeacher?.fullName || '-'} icon="account-tie-outline" />
      <DashboardCard title="Admission Date" value={formatDateForDisplay(student.admissionDate) || '-'} icon="calendar-start" />
      <DashboardCard title="Status" value={student.status || '-'} icon="check-circle-outline" />
      <SectionHeader title="Attendance Summary" />
      <DashboardCard title="Attendance Percentage" value={`${attendancePercentage}%`} icon="chart-donut" />
      <DashboardCard title="Present" value={String(presentCount)} icon="clipboard-check-outline" />
      <DashboardCard title="Absent" value={String(absentCount)} icon="clipboard-alert-outline" />
      <SectionHeader title="Fee Summary" />
      <DashboardCard title="Fee Plan" value={activeFeePlan ? `AY ${activeFeePlan.academicYear || '-'}` : 'Not assigned'} icon="book-open-variant" />
      <DashboardCard title="Total Fee" value={formatCurrency(feeSummary.total)} icon="cash-multiple" />
      <DashboardCard title="Paid Amount" value={formatCurrency(feeSummary.paid)} icon="cash-check" />
      <DashboardCard title="Pending Amount" value={formatCurrency(feeSummary.due)} icon="cash-clock" />
      <DashboardCard title="Outstanding Amount" value={formatCurrency(feeSummary.due)} icon="alert-circle-outline" />
      <SectionHeader title="Fee Categories" />
      {activeFeeItems.length ? (
        activeFeeItems.map(item => (
          <DashboardCard
            key={item.id}
            title={item.category?.name || 'Fee'}
            value={formatCurrency(item.amount)}
            icon="tag-outline"
          />
        ))
      ) : (
        <EmptyState title="No fee categories" message="Fee plan categories will appear here once assigned." />
      )}
      <SectionHeader title="Payment History" subtitle="Receipts and payment dates" />
      {activeFeePayments.length ? (
        activeFeePayments.map(payment => (
          <DashboardCard
            key={payment.id}
            title={payment.receiptNumber || 'Receipt pending'}
            value={formatCurrency(payment.amount)}
            description={`${formatDateForDisplay(payment.paymentDate) || '-'} | ${payment.paymentMode || '-'}`}
            icon="receipt"
          />
        ))
      ) : (
        <EmptyState title="No payments" message="Recorded payments and receipts will appear here." />
      )}
      <SectionHeader title="Documents" />
      <DashboardCard title="Aadhaar" value={student.aadhaarNumber || student.aadhaarDocumentUrl || 'Not uploaded'} icon="card-account-details-outline" />
      <DashboardCard title="Transfer Certificate" value={student.transferCertificateUrl || 'Not uploaded'} icon="file-document-outline" />
      <DashboardCard title="Birth Certificate" value={student.birthCertificateUrl || 'Not uploaded'} icon="file-certificate-outline" />
      <SectionHeader title="Transfer History" />
      {(data.studentSectionHistories || []).length ? (
        data.studentSectionHistories.map(item => (
          <DashboardCard
            key={item.id}
            title={`${item.oldSection?.academicClass?.name || ''}-${item.oldSection?.name || ''} to ${item.newSection?.academicClass?.name || ''}-${item.newSection?.name || ''}`}
            value={formatDateForDisplay(item.changedAt) || '-'}
            description={item.changedBy?.fullName}
            icon="swap-horizontal"
          />
        ))
      ) : (
        <EmptyState title="No transfer history" message="Section moves will appear here." />
      )}
      <SectionHeader title="Promotion History" />
      {(data.studentPromotionHistories || []).length ? (
        data.studentPromotionHistories.map(item => (
          <DashboardCard
            key={item.id}
            title={`${item.fromClass?.name || ''} to ${item.toClass?.name || ''}`}
            value={formatDateForDisplay(item.promotedAt) || '-'}
            description={item.promotedBy?.fullName}
            icon="school-outline"
          />
        ))
      ) : (
        <EmptyState title="No promotion history" message="Promotions will appear here." />
      )}
    </ScreenContainer>
  );
};

export default StudentDetailsScreen;
