import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View, ActivityIndicator} from 'react-native';
import {IconButton, Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import {AnimatedProgressBar, EmptyState} from '../../components';
import parentService from '../../services/parents/parentService';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay} from '../../utils/helpers/dateHelpers';
import {generateAndShareReceipt} from '../../utils/pdf/receiptGenerator';
import {colors, radius, shadows, spacing, typography} from '../../theme';

const isActivePayment = payment =>
  !['REVERSED', 'CANCELLED'].includes(
    String(payment.status || 'RECORDED').toUpperCase(),
  );

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const FeeBreakdownRow = ({label, value, icon, color = colors.text}) => (
  <View style={styles.breakRow}>
    <MaterialCommunityIcons name={icon} size={16} color={color} style={styles.breakIcon} />
    <Text style={styles.breakLabel}>{label}</Text>
    <Text style={[styles.breakValue, {color}]}>{formatCurrency(value)}</Text>
  </View>
);

const ReceiptItem = ({payment, child, index}) => {
  const isActive = isActivePayment(payment);
  const statusColor = isActive ? colors.success : colors.danger;
  const statusBg = isActive ? colors.successSoft : colors.dangerSoft;

  const handleShare = () => {
    generateAndShareReceipt({
      ...payment,
      studentName: child.fullName,
      className: child.academicClass?.name,
      sectionName: child.section?.name,
      admissionNumber: child.studentId,
      mode: payment.paymentMode,
      date: payment.paymentDate,
      receiptNo: payment.receiptNumber,
    });
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 40).duration(240).springify()}
      style={styles.receiptRow}>
      <View style={styles.receiptLeft}>
        <View style={styles.receiptDot} />
        <View style={styles.receiptLine} />
      </View>
      <View style={styles.receiptCard}>
        <View style={styles.receiptTop}>
          <View style={styles.receiptBadge}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={10}
              color={colors.primary}
            />
            <Text style={styles.receiptNo}>
              {payment.receiptNumber || 'Pending'}
            </Text>
          </View>
          <Text style={styles.receiptAmount}>{formatCurrency(payment.amount)}</Text>
        </View>
        <View style={styles.receiptMetaRow}>
          <View style={styles.receiptMetaCopy}>
            <Text style={styles.receiptDate}>
              {formatDateForDisplay(payment.paymentDate) || '—'}
            </Text>
            <Text style={styles.receiptMode}>{payment.paymentMode || '—'}</Text>
            <View style={[styles.receiptStatus, {backgroundColor: statusBg}]}>
              <Text style={[styles.receiptStatusText, {color: statusColor}]}>
                {payment.status || 'RECORDED'}
              </Text>
            </View>
          </View>
          {isActive ? (
            <IconButton
              icon="share-variant"
              iconColor={colors.primary}
              size={18}
              style={styles.receiptShareBtn}
              onPress={handleShare}
            />
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

const ChildFeeSection = ({child}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const feePlan = child.feePlan || {};
  const summary = child.feeSummary || {};
  const payments = (child.payments || []).filter(isActivePayment);
  const paid = summary.paid || 0;
  const total = summary.total || 0;
  const due = summary.due || 0;
  const collectionRate = total > 0 ? (paid / total) * 100 : 0;

  return (
    <Animated.View entering={FadeInDown.duration(280).springify()}>
      {/* ── Child header ── */}
      <View style={styles.childHeader}>
        <View style={styles.childAvatar}>
          <Text style={styles.childAvatarText}>{getInitials(child.fullName)}</Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.fullName}</Text>
          <Text style={styles.childMeta}>
            {child.academicClass?.name || '-'}–{child.section?.name || '-'}
            {feePlan.academicYear ? ` · AY ${feePlan.academicYear}` : ''}
          </Text>
        </View>
      </View>

      {/* ── Fee summary ── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryVal, {color: colors.text}]}>
              {formatCurrency(total)}
            </Text>
            <Text style={styles.summaryLabel}>Total Fee</Text>
          </View>
          <View style={styles.summarySep} />
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryVal, {color: colors.success}]}>
              {formatCurrency(paid)}
            </Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
          <View style={styles.summarySep} />
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryVal, {color: colors.danger}]}>
              {formatCurrency(due)}
            </Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Payment Progress</Text>
            <Text
              style={[
                styles.progressPct,
                {color: collectionRate >= 80 ? colors.success : colors.warning},
              ]}>
              {Math.round(collectionRate)}%
            </Text>
          </View>
          <AnimatedProgressBar
            progress={collectionRate}
            color={collectionRate >= 80 ? colors.success : colors.warning}
            trackColor={colors.border}
            height={6}
          />
        </View>
      </View>

      {/* ── Fee breakdown (collapsible) ── */}
      <Pressable
        onPress={() => setShowBreakdown(e => !e)}
        style={styles.breakdownToggle}>
        <MaterialCommunityIcons
          name="format-list-bulleted"
          size={14}
          color={colors.primary}
        />
        <Text style={styles.breakdownToggleText}>
          {showBreakdown ? 'Hide Breakdown' : 'View Fee Breakdown'}
        </Text>
        <MaterialCommunityIcons
          name={showBreakdown ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.primary}
        />
      </Pressable>

      {showBreakdown ? (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.breakdownCard}>
          {feePlan.term1Fee ? (
            <FeeBreakdownRow
              label="Term I"
              value={feePlan.term1Fee}
              icon="numeric-1-circle-outline"
              color={colors.primary}
            />
          ) : null}
          {feePlan.term2Fee ? (
            <FeeBreakdownRow
              label="Term II"
              value={feePlan.term2Fee}
              icon="numeric-2-circle-outline"
              color={colors.primary}
            />
          ) : null}
          {feePlan.term3Fee ? (
            <FeeBreakdownRow
              label="Term III"
              value={feePlan.term3Fee}
              icon="numeric-3-circle-outline"
              color={colors.primary}
            />
          ) : null}
          {feePlan.booksFee ? (
            <FeeBreakdownRow
              label="Books Fee"
              value={feePlan.booksFee}
              icon="book-open-page-variant-outline"
            />
          ) : null}
          {feePlan.transportFee ? (
            <FeeBreakdownRow
              label="Transport"
              value={feePlan.transportFee}
              icon="bus-school"
            />
          ) : null}
          {summary.concession ? (
            <FeeBreakdownRow
              label="Concession"
              value={-Math.abs(summary.concession)}
              icon="sale-outline"
              color={colors.success}
            />
          ) : null}
          {(feePlan.items || []).map(item => (
            <FeeBreakdownRow
              key={item.id}
              label={item.category?.name || 'Fee'}
              value={item.amount}
              icon="tag-outline"
            />
          ))}
        </Animated.View>
      ) : null}

      {/* ── Receipt history ── */}
      {payments.length > 0 ? (
        <View style={styles.receiptsSection}>
          <Text style={styles.sectionLabel}>Receipt History</Text>
          {payments.slice(0, 6).map((payment, i) => (
            <ReceiptItem key={payment.id} payment={payment} child={child} index={i} />
          ))}
          {payments.length > 6 ? (
            <Text style={styles.moreText}>
              +{payments.length - 6} more payments
            </Text>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
};

const FeeLedgerScreen = () => {
  const user = useSelector(state => state.auth.user);
  const parentId = user?.parentId;

  const {data: children = [], error, isLoading} = useQuery({
    queryKey: ['parentChildren', parentId],
    queryFn: () => parentService.getParentChildren(parentId),
    enabled: Boolean(parentId),
  });

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(260).springify()} style={styles.pageHeader}>
        <View style={styles.pageHeaderDecor} />
        <Text style={styles.pageHeaderOverline}>Parent Portal</Text>
        <Text style={styles.pageHeaderTitle}>Fee Ledger</Text>
        <Text style={styles.pageHeaderSub}>Complete fee record for your children</Text>
      </Animated.View>

      {error ? (
        <EmptyState title="Unable to load fees" message={error.message} />
      ) : isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : children.length ? (
        children.map(child => (
          <ChildFeeSection key={child.id} child={child} />
        ))
      ) : (
        <EmptyState
          title="No fee records"
          message="Fee records linked to your children will appear here."
        />
      )}
      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  scroll: {padding: spacing.lg},
  loadingWrap: {alignItems: 'center', paddingVertical: spacing.xxl},
  // Page header
  pageHeader: {
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  pageHeaderDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 130,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 130,
  },
  pageHeaderOverline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pageHeaderTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 2},
  pageHeaderSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  // Child header
  childHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  childAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  childAvatarText: {color: colors.primary, fontSize: 14, fontWeight: '800'},
  childInfo: {flex: 1},
  childName: {...typography.bodyBold, color: colors.text, fontSize: 16},
  childMeta: {...typography.caption, color: colors.textMuted, marginTop: 2},

  // Fee summary
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    ...shadows.soft,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  summaryStat: {alignItems: 'center', gap: 3},
  summaryVal: {fontSize: 15, fontWeight: '800'},
  summaryLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  summarySep: {backgroundColor: colors.border, width: 1},
  progressSection: {gap: spacing.xs},
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {...typography.captionBold, color: colors.text},
  progressPct: {fontSize: 13, fontWeight: '800'},

  // Breakdown toggle
  breakdownToggle: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  breakdownToggleText: {color: colors.primary, fontSize: 12, fontWeight: '700'},

  // Breakdown card
  breakdownCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.soft,
  },
  breakRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  breakIcon: {marginRight: spacing.sm},
  breakLabel: {flex: 1, ...typography.body, color: colors.text},
  breakValue: {fontSize: 13, fontWeight: '700'},

  // Receipts
  receiptsSection: {marginTop: spacing.sm},
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  receiptRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  receiptLeft: {
    alignItems: 'center',
    paddingTop: 6,
    width: 14,
  },
  receiptDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  receiptLine: {
    backgroundColor: colors.border,
    flex: 1,
    marginTop: 2,
    width: 1,
  },
  receiptCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
    ...shadows.soft,
  },
  receiptTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  receiptBadge: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  receiptNo: {color: colors.primary, fontSize: 9, fontWeight: '800'},
  receiptAmount: {color: colors.text, fontSize: 14, fontWeight: '800'},
  receiptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  receiptMetaCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  receiptDate: {color: colors.textMuted, fontSize: 11, fontWeight: '600'},
  receiptMode: {color: colors.textSoft, fontSize: 11, fontWeight: '600'},
  receiptStatus: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  receiptStatusText: {fontSize: 9, fontWeight: '800'},
  receiptShareBtn: {margin: 0, padding: 0},
  moreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});

export default FeeLedgerScreen;
