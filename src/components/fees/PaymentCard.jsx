import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {generateAndShareReceipt} from '../../utils/pdf/receiptGenerator';

const PaymentCard = ({payment}) => {
  const handleShare = () => {
    generateAndShareReceipt(payment);
  };

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name="receipt-text-check-outline"
          size={22}
          color={colors.success}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{formatCurrency(payment.amount)}</Text>
        <Text style={styles.meta}>
          {payment.studentName || payment.student?.fullName || 'Student'} - {payment.mode || payment.paymentMode || '-'}
        </Text>
        <Text style={styles.date}>
          {formatDateForDisplay(payment.date || payment.paymentDate) || '-'} {payment.receiptNo || payment.receiptNumber ? `| ${payment.receiptNo || payment.receiptNumber}` : ''}
        </Text>
      </View>
      <IconButton
        icon="share-variant"
        iconColor={colors.primary}
        size={20}
        onPress={handleShare}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...shadows.soft,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
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
