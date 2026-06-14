import React, {useMemo} from 'react';
import {Image, Linking, StyleSheet, View} from 'react-native';
import {Avatar, Button, Card, List, Text} from 'react-native-paper';
import {
  EmptyState,
  Header,
  LoadingScreen,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
} from '../../components';
import useAsyncResource from '../../hooks/useAsyncResource';
import mainAdminService from '../../services/mainAdmin/mainAdminService';
import {colors, radius, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';

const monthLabel = value => {
  if (!value) {
    return 'Month';
  }
  const date = new Date(value);
  return date.toLocaleString('default', {month: 'short'});
};

const StudentProfileScreen = ({route}) => {
  const {studentId} = route.params || {};
  const {data, loading, error} = useAsyncResource(
    options => mainAdminService.getStudentProfile(studentId, options),
    [studentId],
  );

  const monthlyAttendance = useMemo(() => {
    const groups = {};
    (data?.attendance || []).forEach(record => {
      const key = String(record.attendanceDate || '').slice(0, 7);
      if (!groups[key]) {
        groups[key] = {month: record.attendanceDate, present: 0, total: 0};
      }
      const status = String(record.status || '').toUpperCase();
      if (status === 'PRESENT' || status === 'ABSENT') {
        groups[key].total += 1;
      }
      if (status === 'PRESENT') {
        groups[key].present += 1;
      }
    });

    return Object.values(groups)
      .slice(-6)
      .map(item => ({
        ...item,
        percent: item.total ? Math.round((item.present / item.total) * 100) : 0,
      }));
  }, [data]);

  if (loading && !data) {
    return <LoadingScreen message="Loading student profile" />;
  }

  if (!data?.student) {
    return (
      <ScreenContainer>
        <EmptyState title="Student unavailable" message={error || 'Unable to load profile.'} />
      </ScreenContainer>
    );
  }

  const {student, summary, payments, fees, feePlans, transferHistory, promotionHistory} = data;

  return (
    <ScreenContainer>
      <Header title={student.fullName} subtitle={student.studentId} />

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={styles.profileHeader}>
            {student.photoUrl ? (
              <Image source={{uri: student.photoUrl}} style={styles.photo} />
            ) : (
              <Avatar.Text size={72} label={(student.fullName || 'ST').slice(0, 2)} />
            )}
            <View style={styles.profileCopy}>
              <Text style={styles.title}>{student.fullName}</Text>
              <Text style={styles.subtitle}>{student.studentId}</Text>
              <StatusBadge
                status={student.isActive ? 'info' : 'holiday'}
                label={student.isActive ? 'Active' : 'Inactive'}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      <ProfileCard title="Personal Details">
        <Info label="DOB" value={formatDateForDisplay(student.dateOfBirth)} />
        <Info label="Gender" value={student.gender} />
        <Info label="Blood Group" value={student.bloodGroup} />
        <Info label="Phone" value={student.phoneNumber} />
        <Info label="Address" value={student.address} />
      </ProfileCard>

      <ProfileCard title="Parent Details">
        <Info label="Father" value={student.parent?.fatherName || student.parent?.fullName} />
        <Info label="Mother" value={student.parent?.motherName} />
        <Info label="Phone" value={student.parent?.phoneNumber} />
        <Info label="Email" value={student.parent?.email} />
      </ProfileCard>

      <ProfileCard title="Academic Details">
        <Info label="Branch" value={student.branch?.name} />
        <Info label="Class" value={student.academicClass?.name} />
        <Info label="Wing" value={student.academicClass?.wing?.name || student.academicClass?.wing?.code} />
        <Info label="Section" value={student.section?.name} />
        <Info label="Roll Number" value={student.rollNumber} />
        <Info label="Admission Date" value={formatDateForDisplay(student.admissionDate)} />
        <Info label="Class Teacher" value={student.section?.classTeacher?.fullName} />
        <Info label="Coordinator" value="All branch coordinators visible to Main Admin" />
      </ProfileCard>

      <ProfileCard title="Attendance Summary">
        <Info label="Present Days" value={summary.presentDays} />
        <Info label="Absent Days" value={summary.absentDays} />
        <Info label="Attendance" value={`${summary.attendancePercent}%`} />
        <View style={styles.chart}>
          {monthlyAttendance.length ? (
            monthlyAttendance.map(item => (
              <View key={item.month} style={styles.barItem}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {height: `${Math.max(item.percent, 4)}%`}]} />
                </View>
                <Text style={styles.barValue}>{item.percent}%</Text>
                <Text style={styles.barLabel}>{monthLabel(item.month)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No attendance records.</Text>
          )}
        </View>
      </ProfileCard>

      <ProfileCard title="Fee Information">
        <Info label="Total Fees" value={formatCurrency(summary.totalFees)} />
        <Info label="Paid Amount" value={formatCurrency(summary.paidAmount)} />
        <Info label="Pending Amount" value={formatCurrency(summary.pendingAmount)} />
        <Info label="Due Date" value={summary.nextDueDate} />
      </ProfileCard>

      <SectionHeader title="Fee Payment History" />
      {payments.length ? (
        payments.map(payment => (
          <List.Item
            key={payment.id}
            title={formatCurrency(payment.amount)}
            description={`${payment.paymentMode || 'Payment'} - ${payment.receiptNumber || 'No receipt'} - ${formatDateForDisplay(payment.paidAt || payment.paymentDate) || ''}`}
            left={props => <List.Icon {...props} icon="receipt" />}
          />
        ))
      ) : (
        <EmptyState title="No payments" message="Payment history will appear after collection." />
      )}

      <SectionHeader title="Fee Ledgers" />
      {fees.map(fee => (
        <List.Item
          key={fee.id}
          title={fee.status}
          description={`${formatCurrency(fee.paidAmount)} paid of ${formatCurrency(fee.totalFee)}`}
          left={props => <List.Icon {...props} icon="cash-clock" />}
        />
      ))}

      <SectionHeader title="Administrative Fee Plans" />
      {feePlans?.length ? (
        feePlans.map(plan => (
          <List.Item
            key={plan.id}
            title={`Academic Year ${plan.academicYear}`}
            description={`${formatCurrency(plan.totalAmount)} | ${plan.isActive ? 'Active' : 'Inactive'}`}
            left={props => <List.Icon {...props} icon="file-document-outline" />}
          />
        ))
      ) : (
        <EmptyState title="No fee plans" message="Fee plans will appear here once assigned." />
      )}

      <SectionHeader title="Transfer History" />
      {transferHistory?.length ? (
        transferHistory.map(item => (
          <List.Item
            key={item.id}
            title={`${item.oldSection?.academicClass?.name || ''}-${item.oldSection?.name || ''} to ${item.newSection?.academicClass?.name || ''}-${item.newSection?.name || ''}`}
            description={`${formatDateForDisplay(item.changedAt) || '-'} | By ${item.changedBy?.fullName || 'User'}`}
            left={props => <List.Icon {...props} icon="swap-horizontal" />}
          />
        ))
      ) : (
        <EmptyState title="No transfers" message="Section transfer history will appear here." />
      )}

      <SectionHeader title="Promotion History" />
      {promotionHistory?.length ? (
        promotionHistory.map(item => (
          <List.Item
            key={item.id}
            title={`${item.fromClass?.name || '-'} to ${item.toClass?.name || '-'}`}
            description={`${formatDateForDisplay(item.promotedAt) || '-'} | By ${item.promotedBy?.fullName || 'User'}`}
            left={props => <List.Icon {...props} icon="school-outline" />}
          />
        ))
      ) : (
        <EmptyState title="No promotions" message="Promotion history will appear here." />
      )}

      <ProfileCard title="Documents">
        <DocumentLink label="Aadhaar" url={student.aadhaarDocumentUrl} />
        <DocumentLink label="Transfer Certificate" url={student.transferCertificateUrl} />
        <DocumentLink label="Birth Certificate" url={student.birthCertificateUrl} />
      </ProfileCard>
    </ScreenContainer>
  );
};

const ProfileCard = ({title, children}) => (
  <Card mode="outlined" style={styles.card}>
    <Card.Content>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Card.Content>
  </Card>
);

const Info = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'Not set'}</Text>
  </View>
);

const DocumentLink = ({label, url}) => (
  <View style={styles.documentRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {url ? (
      <Button compact mode="outlined" onPress={() => Linking.openURL(url)}>
        Open
      </Button>
    ) : (
      <Text style={styles.infoValue}>Not uploaded</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  photo: {
    borderRadius: radius.lg,
    height: 72,
    width: 72,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    color: colors.textMuted,
    flex: 1,
  },
  infoValue: {
    color: colors.text,
    flex: 1.4,
    textAlign: 'right',
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 150,
    marginTop: spacing.md,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    height: 96,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    backgroundColor: colors.primary,
    width: '100%',
  },
  barValue: {
    color: colors.text,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  emptyText: {
    color: colors.textMuted,
  },
  documentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
});

export default StudentProfileScreen;
