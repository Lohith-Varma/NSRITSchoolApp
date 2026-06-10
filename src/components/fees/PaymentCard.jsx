import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing, typography} from '../../theme';

const PaymentCard = ({payment}) => (
  <View style={styles.card}>
    <View style={styles.icon}>
      <MaterialCommunityIcons
        name="receipt-text-check-outline"
        size={22}
        color={colors.success}
      />
    </View>
    <View style={styles.copy}>
      <Text style={styles.title}>
        Rs {Number(payment.amount || 0).toLocaleString('en-IN')}
      </Text>
      <Text style={styles.meta}>
        {payment.studentName || payment.student?.fullName || 'Student'} - {payment.mode || payment.paymentMode || '-'}
      </Text>
      <Text style={styles.date}>
        {payment.date || payment.paymentDate || '-'} {payment.receiptNumber ? `| ${payment.receiptNumber}` : ''}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  copy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  meta: {
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  date: {
    ...typography.caption,
    color: colors.textSoft,
    marginTop: spacing.xxs,
  },
});

export default PaymentCard;
