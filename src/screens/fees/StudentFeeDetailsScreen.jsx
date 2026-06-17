import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ProgressBar, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {
  EmptyState,
  PaymentCard,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
} from '../../components';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const StudentFeeDetailsScreen = () => {
  const studentFee = useSelector(state => state.fees.selectedStudentFee);
  const payments = useSelector(state =>
    state.fees.payments.filter(
      item => item.studentId === studentFee?.studentId,
    ),
  );

  if (!studentFee) {
    return (
      <ScreenContainer>
        <EmptyState
          title="No student selected"
          message="Open a student from the fee dashboard."
        />
      </ScreenContainer>
    );
  }

  const progress = studentFee.totalFee
    ? studentFee.paidAmount / studentFee.totalFee
    : 0;

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.name}>{studentFee.studentName}</Text>
            <Text style={styles.meta}>
              {studentFee.className} - Section {studentFee.sectionName}
            </Text>
          </View>
          <StatusBadge status={studentFee.status} />
        </View>
        <ProgressBar
          progress={progress}
          color={colors.success}
          style={styles.progress}
        />
        <View style={styles.amountRow}>
          <Text style={styles.amount}>
            {formatCurrency(studentFee.paidAmount)} paid
          </Text>
          <Text style={[styles.amount, styles.due]}>
            {formatCurrency(studentFee.dueAmount)} due
          </Text>
        </View>
      </View>

      <SectionHeader
        title="Ledger"
        subtitle={`Due date ${studentFee.dueDate}`}
      />
      <View style={styles.ledger}>
        <Text style={styles.ledgerText}>Total Fee</Text>
        <Text style={styles.ledgerValue}>
          {formatCurrency(studentFee.totalFee)}
        </Text>
      </View>
      <View style={styles.ledger}>
        <Text style={styles.ledgerText}>Paid Amount</Text>
        <Text style={styles.ledgerValue}>
          {formatCurrency(studentFee.paidAmount)}
        </Text>
      </View>
      <View style={styles.ledger}>
        <Text style={styles.ledgerText}>Remaining Balance</Text>
        <Text style={[styles.ledgerValue, styles.due]}>
          {formatCurrency(studentFee.dueAmount)}
        </Text>
      </View>

      <SectionHeader
        title="Transactions"
        subtitle="Expandable history-ready payment list"
      />
      {payments.length ? (
        payments.map(payment => (
          <PaymentCard
            key={payment.id}
            payment={{
              ...payment,
              studentName: studentFee.studentName,
              className: studentFee.className,
              sectionName: studentFee.sectionName,
              admissionNumber: studentFee.admissionNumber,
            }}
          />
        ))
      ) : (
        <EmptyState
          title="No payments yet"
          message="Payments will appear after upload or online capture."
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hero: {
    ...shadows.medium,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  progress: {
    borderRadius: radius.pill,
    height: 10,
    marginVertical: spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    ...typography.sectionTitle,
    color: colors.success,
  },
  due: {
    color: colors.danger,
  },
  ledger: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.lg,
  },
  ledgerText: {
    color: colors.textMuted,
  },
  ledgerValue: {
    ...typography.sectionTitle,
    color: colors.text,
  },
});

export default StudentFeeDetailsScreen;
