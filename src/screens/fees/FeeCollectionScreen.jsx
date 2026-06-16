import React, {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Text} from 'react-native-paper';
import Animated, {FadeInDown, FadeInRight} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  CustomButton,
  CustomInput,
  DatePickerField,
  EmptyState,
  SelectField,
  SectionHeader,
  SkeletonLoader,
} from '../../components';
import feeService from '../../services/fees/feeService';
import studentService from '../../services/students/studentService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, radius, shadows, spacing, typography} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay, toISODate} from '../../utils/helpers/dateHelpers';

const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(value => ({
  label: value,
  value,
}));
const today = () => toISODate(new Date());

const getInitials = name =>
  name
    ? name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    : '?';

const PaymentHistoryRow = ({payment, onEdit, delay = 0}) => (
  <Animated.View
    entering={FadeInRight.delay(delay).duration(240).springify()}
    style={styles.historyRow}>
    <View style={styles.historyLeft}>
      <View style={styles.historyDot} />
      <View style={styles.historyLine} />
    </View>
    <View style={styles.historyCard}>
      <View style={styles.historyTop}>
        <View style={styles.historyBadge}>
          <Text style={styles.historyReceipt}>{payment.receiptNumber || 'Receipt pending'}</Text>
        </View>
        <Text style={styles.historyAmount}>{formatCurrency(payment.amount)}</Text>
      </View>
      <Text style={styles.historyMeta}>
        {formatDateForDisplay(payment.paymentDate) || '—'} · {payment.paymentMode || '—'} ·{' '}
        <Text
          style={[
            styles.historyStatus,
            {
              color:
                payment.status === 'REVERSED'
                  ? colors.danger
                  : payment.status === 'RECORDED'
                  ? colors.success
                  : colors.textMuted,
            },
          ]}>
          {payment.status || 'RECORDED'}
        </Text>
      </Text>
      {onEdit ? (
        <Pressable onPress={onEdit} style={styles.editHint}>
          <MaterialCommunityIcons name="pencil-outline" size={12} color={colors.primary} />
          <Text style={styles.editHintText}>Edit same-day</Text>
        </Pressable>
      ) : null}
    </View>
  </Animated.View>
);

const FeeCollectionScreen = ({navigation, route}) => {
  const access = useFeeAccess();
  const queryClient = useQueryClient();
  const canRecordPayments = feeService.canRecordPayments(access.role);
  const [searchText, setSearchText] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(route.params?.studentId || '');
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm] = useState({
    paymentDate: today(),
    amount: '',
    paymentMode: 'Cash',
    referenceNumber: '',
    remarks: '',
  });
  const [error, setError] = useState('');

  const studentsQuery = useQuery({
    queryKey: ['feeCollectionStudentSearch', access.branchId, searchText],
    queryFn: () =>
      studentService.searchStudents(
        {branchId: access.branchId, searchText, limit: 20},
        access,
      ),
    enabled: Boolean(
      canRecordPayments &&
        access.branchId &&
        searchText.trim().length >= 2 &&
        !selectedStudentId,
    ),
  });

  const profileQuery = useQuery({
    queryKey: ['studentFeeProfile', selectedStudentId],
    queryFn: () => feeService.getStudentFeeProfile(selectedStudentId, access),
    enabled: Boolean(canRecordPayments && selectedStudentId),
  });
  const profile = profileQuery.data;

  const updateField = (field, value) =>
    setForm(current => ({...current, [field]: value}));

  const searchResults = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);

  const mutation = useMutation({
    mutationFn: () =>
      editingPayment
        ? feeService.updatePayment(
            {
              ...editingPayment,
              ...form,
              paymentId: editingPayment.id,
              studentId: profile.studentId,
              feePlanId: profile.feePlanId,
              branchId: profile.branchId,
              amount: Number(form.amount),
              original: editingPayment,
            },
            access,
          )
        : feeService.recordPayment(
            {
              ...form,
              studentId: profile.studentId,
              feePlanId: profile.feePlanId,
              branchId: profile.branchId,
              branchCode: profile.branchCode || access.branchCode,
              amount: Number(form.amount),
            },
            access,
          ),
    onSuccess: payment => {
      queryClient.invalidateQueries({queryKey: ['feeRecords']});
      queryClient.invalidateQueries({queryKey: ['studentFeeProfile', selectedStudentId]});
      queryClient.invalidateQueries({queryKey: ['paymentHistory']});
      queryClient.invalidateQueries({queryKey: ['feeReports']});
      queryClient.invalidateQueries({queryKey: ['coordinatorFeeDashboard']});
      queryClient.invalidateQueries({queryKey: ['accountantFeeDashboard']});
      queryClient.invalidateQueries({queryKey: ['principalFeeSummary']});
      queryClient.invalidateQueries({queryKey: ['parentChildren']});
      queryClient.invalidateQueries({queryKey: ['parentDashboard']});
      queryClient.invalidateQueries({queryKey: ['studentDetails', selectedStudentId]});
      setEditingPayment(null);
      setForm({
        paymentDate: today(),
        amount: '',
        paymentMode: 'Cash',
        referenceNumber: '',
        remarks: '',
      });
      navigation.navigate('StudentFeeProfile', {
        studentId: selectedStudentId,
        receiptNumber: payment?.receiptNumber,
      });
    },
    onError: err => setError(err.message),
  });

  const reverseMutation = useMutation({
    mutationFn: payment =>
      feeService.reversePayment(
        {
          ...payment,
          paymentId: payment.id,
          studentId: profile.studentId,
          branchId: profile.branchId,
          reason: 'Reversed from fee collection screen',
        },
        access,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['feeRecords']});
      queryClient.invalidateQueries({queryKey: ['studentFeeProfile', selectedStudentId]});
      queryClient.invalidateQueries({queryKey: ['paymentHistory']});
      queryClient.invalidateQueries({queryKey: ['feeReports']});
      queryClient.invalidateQueries({queryKey: ['parentChildren']});
      queryClient.invalidateQueries({queryKey: ['parentDashboard']});
    },
    onError: err => setError(err.message),
  });

  const startEditPayment = payment => {
    if (payment.paymentDate !== today()) {
      setError('Only same-day payments can be edited.');
      return;
    }
    setEditingPayment(payment);
    setForm({
      paymentDate: payment.paymentDate || today(),
      amount: String(payment.amount || ''),
      paymentMode: payment.paymentMode || 'Cash',
      referenceNumber: payment.referenceNumber || '',
      remarks: payment.remarks || '',
    });
    setError('');
  };

  if (!canRecordPayments) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Access denied"
          message="Only accountants and principals can record fee payments."
        />
      </View>
    );
  }

  const activePayments = (profile?.payments || []).filter(
    p => !['REVERSED', 'CANCELLED'].includes(String(p.status || '').toUpperCase()),
  );

  const renderHeader = () => (
    <View>
      {/* ── Page header ── */}
      <Animated.View
        entering={FadeInDown.duration(280).springify()}
        style={styles.pageHeader}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerOverline}>Fee Desk</Text>
        <Text style={styles.headerTitle}>Fee Collection</Text>
        <Text style={styles.headerSub}>Search student → Review fee → Record payment</Text>
      </Animated.View>

      {/* ── Step 1: Search ── */}
      {!selectedStudentId ? (
        <Animated.View
          entering={FadeInDown.delay(60).duration(280).springify()}
          style={styles.searchCard}>
          <SectionHeader title="Find Student" icon="account-search-outline" />
          <View style={styles.searchRow}>
            <MaterialCommunityIcons
              name="magnify"
              size={18}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Name, admission number…"
              placeholderTextColor={colors.textSoft}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
            />
            {searchText.length > 0 ? (
              <Pressable onPress={() => setSearchText('')}>
                <MaterialCommunityIcons name="close-circle" size={16} color={colors.textSoft} />
              </Pressable>
            ) : null}
          </View>
          {studentsQuery.isLoading ? <SkeletonLoader rows={3} /> : null}
        </Animated.View>
      ) : null}

      {/* ── Student profile (when selected) ── */}
      {profile ? (
        <Animated.View
          entering={FadeInDown.delay(40).duration(280).springify()}
          style={styles.profileCard}>
          <Pressable
            onPress={() => {
              setSelectedStudentId('');
              setEditingPayment(null);
            }}
            style={styles.changeStudentBtn}>
            <MaterialCommunityIcons name="swap-horizontal" size={14} color={colors.primary} />
            <Text style={styles.changeStudentText}>Change student</Text>
          </Pressable>
          <View style={styles.profileRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {getInitials(profile.studentName)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.studentName}</Text>
              <Text style={styles.profileMeta}>
                {profile.admissionNumber} · {profile.className}-{profile.sectionName}
              </Text>
            </View>
          </View>
          <View style={styles.feeSummaryRow}>
            <View style={styles.feeStat}>
              <Text style={[styles.feeStatVal, {color: colors.danger}]}>
                {formatCurrency(profile.dueAmount)}
              </Text>
              <Text style={styles.feeStatLabel}>Pending</Text>
            </View>
            <View style={styles.feeSep} />
            <View style={styles.feeStat}>
              <Text style={[styles.feeStatVal, {color: colors.success}]}>
                {formatCurrency(profile.paidAmount)}
              </Text>
              <Text style={styles.feeStatLabel}>Paid</Text>
            </View>
            <View style={styles.feeSep} />
            <View style={styles.feeStat}>
              <Text style={[styles.feeStatVal, {color: colors.text}]}>
                {formatCurrency(profile.totalFee)}
              </Text>
              <Text style={styles.feeStatLabel}>Total</Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {/* ── Payment form ── */}
      {profile ? (
        <Animated.View
          entering={FadeInDown.delay(80).duration(280).springify()}
          style={styles.formCard}>
          <View style={styles.formHeader}>
            <MaterialCommunityIcons name="cash-plus" size={16} color={colors.secondary} />
            <Text style={styles.formTitle}>
              {editingPayment ? 'Edit Payment' : 'Record Payment'}
            </Text>
            {editingPayment ? (
              <Pressable
                onPress={() => setEditingPayment(null)}
                style={styles.cancelEditBtn}>
                <Text style={styles.cancelEditText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>

          <DatePickerField
            label="Payment Date"
            value={form.paymentDate}
            maximumDate={toISODate(new Date())}
            onChange={value => updateField('paymentDate', value)}
          />
          <CustomInput
            label="Amount (₹)"
            keyboardType="numeric"
            value={form.amount}
            onChangeText={value => updateField('amount', value)}
          />
          <SelectField
            label="Payment Mode"
            value={form.paymentMode}
            options={paymentModes}
            onChange={value => updateField('paymentMode', value)}
          />
          <CustomInput
            label="Reference Number"
            value={form.referenceNumber}
            onChangeText={value => updateField('referenceNumber', value)}
          />
          <CustomInput
            label="Remarks (optional)"
            value={form.remarks}
            multiline
            onChangeText={value => updateField('remarks', value)}
          />

          {Boolean(error) ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {feeService.canReversePayments(access.role) && editingPayment ? (
            <CustomButton
              mode="outlined"
              loading={reverseMutation.isPending}
              onPress={() => reverseMutation.mutate(editingPayment)}>
              Reverse Payment
            </CustomButton>
          ) : null}

          <Pressable
            onPress={() => mutation.mutate()}
            disabled={mutation.isPending || !form.amount || !profile.feePlanId}
            style={[
              styles.submitBtn,
              (mutation.isPending || !form.amount || !profile.feePlanId) &&
                styles.submitBtnDisabled,
            ]}>
            <MaterialCommunityIcons name="cash-register" size={16} color={colors.white} />
            <Text style={styles.submitBtnText}>
              {mutation.isPending
                ? 'Recording…'
                : editingPayment
                ? 'Update Payment'
                : 'Record Payment'}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}

      {/* ── Payment history ── */}
      {activePayments.length > 0 ? (
        <View style={styles.historySection}>
          <SectionHeader title="Receipt History" icon="receipt-text-outline" />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={selectedStudentId ? activePayments : searchResults}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({item, index}) =>
          selectedStudentId ? (
            <PaymentHistoryRow
              key={item.id}
              payment={item}
              onEdit={
                item.paymentDate === today() ? () => startEditPayment(item) : undefined
              }
              delay={index * 40}
            />
          ) : (
            <Animated.View entering={FadeInDown.delay(index * 30).duration(220).springify()}>
              <Pressable
                onPress={() => setSelectedStudentId(item.id)}
                style={styles.resultRow}>
                <View style={styles.resultAvatar}>
                  <Text style={styles.resultAvatarText}>{getInitials(item.fullName)}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{item.fullName}</Text>
                  <Text style={styles.resultMeta}>
                    {item.studentId} · {item.academicClass?.name || '-'}-
                    {item.section?.name || '-'}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color={colors.textSoft}
                />
              </Pressable>
            </Animated.View>
          )
        }
        ListEmptyComponent={
          !selectedStudentId ? (
            <EmptyState
              compact
              title={
                searchText.trim().length < 2
                  ? 'Search for student'
                  : studentsQuery.isLoading
                  ? 'Searching…'
                  : 'No students found'
              }
              message={
                searchText.trim().length < 2
                  ? 'Enter at least 2 characters to search'
                  : 'Check spelling or try student ID'
              }
            />
          ) : null
        }
        ListFooterComponent={<View style={{height: spacing.xxxl}} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxl},

  // Page header
  pageHeader: {
    backgroundColor: colors.secondary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.medium,
  },
  headerDecor: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    height: 140,
    position: 'absolute',
    right: -20,
    top: -40,
    width: 140,
  },
  headerOverline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 4},
  headerSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500'},

  // Search card
  searchCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.soft,
  },
  searchRow: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  searchIcon: {},
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Profile card
  profileCard: {
    backgroundColor: colors.surface,
    borderColor: colors.secondary,
    borderRadius: radius.card,
    borderWidth: 1.5,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.soft,
  },
  changeStudentBtn: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.md,
  },
  changeStudentText: {color: colors.primary, fontSize: 12, fontWeight: '600'},
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  profileAvatarText: {color: colors.primary, fontSize: 15, fontWeight: '800'},
  profileInfo: {flex: 1},
  profileName: {...typography.bodyBold, color: colors.text, fontSize: 16},
  profileMeta: {...typography.caption, color: colors.textMuted, marginTop: 2},
  feeSummaryRow: {
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  feeStat: {alignItems: 'center', gap: 3},
  feeStatVal: {fontSize: 14, fontWeight: '800'},
  feeStatLabel: {...typography.overline, color: colors.textMuted, fontSize: 9},
  feeSep: {backgroundColor: colors.border, width: 1},

  // Form card
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.soft,
  },
  formHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  formTitle: {...typography.bodyBold, color: colors.text},
  cancelEditBtn: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.pill,
    marginLeft: 'auto',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  cancelEditText: {color: colors.danger, fontSize: 12, fontWeight: '700'},
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorText: {color: colors.danger, flex: 1, fontSize: 12, fontWeight: '600'},
  submitBtn: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {backgroundColor: colors.border},
  submitBtnText: {color: colors.white, fontSize: 15, fontWeight: '700'},

  // History
  historySection: {marginBottom: spacing.sm},
  historyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  historyLeft: {alignItems: 'center', paddingTop: 6, width: 18},
  historyDot: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  historyLine: {
    backgroundColor: colors.border,
    flex: 1,
    marginTop: 2,
    width: 1,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
    ...shadows.soft,
  },
  historyTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  historyBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  historyReceipt: {color: colors.primary, fontSize: 10, fontWeight: '800'},
  historyAmount: {fontSize: 14, fontWeight: '800', color: colors.text},
  historyMeta: {...typography.caption, color: colors.textMuted},
  historyStatus: {fontWeight: '700'},
  editHint: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.xs,
  },
  editHintText: {color: colors.primary, fontSize: 11, fontWeight: '600'},

  // Search results
  resultRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.soft,
  },
  resultAvatar: {
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  resultAvatarText: {color: colors.secondary, fontSize: 13, fontWeight: '800'},
  resultInfo: {flex: 1},
  resultName: {...typography.bodyBold, color: colors.text},
  resultMeta: {...typography.caption, color: colors.textMuted, marginTop: 2},
});

export default FeeCollectionScreen;
