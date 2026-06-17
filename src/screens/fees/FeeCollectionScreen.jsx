import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CustomButton, CustomInput, DashboardCard, DatePickerField, EmptyState, Header, SearchBar, SelectField, SectionHeader} from '../../components';
import feeService from '../../services/fees/feeService';
import studentService from '../../services/students/studentService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';
import {formatDateForDisplay, toISODate} from '../../utils/helpers/dateHelpers';

const paymentModes = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(value => ({label: value, value}));
const today = () => toISODate(new Date());

const installmentOptions = [
  {label: '1st Term Tuition', value: '1st Term Tuition'},
  {label: '2nd Term Tuition', value: '2nd Term Tuition'},
  {label: '3rd Term Tuition', value: '3rd Term Tuition'},
  {label: 'Books Fee', value: 'Books Fee'},
  {label: 'Transport Fee', value: 'Transport Fee'},
  {label: 'Admission Fee', value: 'Admission Fee'},
  {label: 'Uniform Fee', value: 'Uniform Fee'},
  {label: 'Exam Fee', value: 'Exam Fee'},
  {label: 'Other / Combined', value: 'Other / Combined'},
];

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
    receiptNumber: '',
    installment: '1st Term Tuition',
    paidBy: '',
  });
  const [error, setError] = useState('');

  const studentsQuery = useQuery({
    queryKey: ['feeCollectionStudentSearch', access.branchId, searchText],
    queryFn: () => studentService.searchStudents({branchId: access.branchId, searchText, limit: 20}, access),
    enabled: Boolean(canRecordPayments && access.branchId && searchText.trim().length >= 2 && !selectedStudentId),
  });
  const profileQuery = useQuery({
    queryKey: ['studentFeeProfile', selectedStudentId],
    queryFn: () => feeService.getStudentFeeProfile(selectedStudentId, access),
    enabled: Boolean(canRecordPayments && selectedStudentId),
  });
  const profile = profileQuery.data;

  React.useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        paidBy: prev.paidBy || profile.studentName || '',
      }));
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => {
      const remarksPayload = JSON.stringify({
        installment: form.installment,
        paidBy: form.paidBy,
        remarks: form.remarks,
      });

      return editingPayment
        ? feeService.updatePayment(
            {
              ...editingPayment,
              ...form,
              remarks: remarksPayload,
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
              remarks: remarksPayload,
              studentId: profile.studentId,
              feePlanId: profile.feePlanId,
              branchId: profile.branchId,
              branchCode: profile.branchCode || access.branchCode,
              amount: Number(form.amount),
            },
            access,
          );
    },
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
        receiptNumber: '',
        installment: '1st Term Tuition',
        paidBy: profile?.studentName || '',
      });
      navigation.navigate('StudentFeeProfile', {studentId: selectedStudentId, receiptNumber: payment?.receiptNumber});
    },
    onError: err => setError(err.message),
  });

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));
  const searchResults = useMemo(() => studentsQuery.data || [], [studentsQuery.data]);
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
    
    let parsedRemarks = { installment: '1st Term Tuition', paidBy: profile?.studentName || '', remarks: '' };
    try {
      if (payment.remarks && payment.remarks.trim().startsWith('{')) {
        const parsed = JSON.parse(payment.remarks);
        parsedRemarks = {
          installment: parsed.installment || '1st Term Tuition',
          paidBy: parsed.paidBy || profile?.studentName || '',
          remarks: parsed.remarks || '',
        };
      } else if (payment.remarks) {
        parsedRemarks = {
          installment: payment.remarks,
          paidBy: profile?.studentName || '',
          remarks: '',
        };
      }
    } catch (e) {
      if (payment.remarks) {
        parsedRemarks.installment = payment.remarks;
      }
    }

    setForm({
      paymentDate: payment.paymentDate || today(),
      amount: String(payment.amount || ''),
      paymentMode: payment.paymentMode || 'Cash',
      referenceNumber: payment.referenceNumber || '',
      remarks: parsedRemarks.remarks,
      receiptNumber: payment.receiptNumber || '',
      installment: parsedRemarks.installment,
      paidBy: parsedRemarks.paidBy,
    });
    setError('');
  };

  if (!canRecordPayments) {
    return (
      <View style={styles.container}>
        <EmptyState title="Payment access denied" message="Only accountants and principals can record fee payments." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={selectedStudentId ? [] : searchResults}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Header title="Fee Collection" subtitle="Search student and record payment" />
            {!selectedStudentId ? <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search student" /> : null}
            {profile ? (
              <>
                <DashboardCard
                  title={profile.studentName}
                  value={profile.admissionNumber}
                  description={`${profile.className}-${profile.sectionName}`}
                  icon="account-school-outline"
                  onPress={() => setSelectedStudentId('')}
                />
                <DashboardCard title="Pending Amount" value={formatCurrency(profile.dueAmount)} icon="cash-clock" />
                <CustomInput label="Receipt Number (Optional)" value={form.receiptNumber} onChangeText={value => updateField('receiptNumber', value)} />
                <DatePickerField label="Payment Date" value={form.paymentDate} maximumDate={toISODate(new Date())} onChange={value => updateField('paymentDate', value)} />
                <CustomInput label="Amount" keyboardType="numeric" value={form.amount} onChangeText={value => updateField('amount', value)} />
                <SelectField label="Payment Mode" value={form.paymentMode} options={paymentModes} onChange={value => updateField('paymentMode', value)} />
                <SelectField label="Installment" value={form.installment} options={installmentOptions} onChange={value => updateField('installment', value)} />
                <CustomInput label="Received From / Paid By" value={form.paidBy} onChangeText={value => updateField('paidBy', value)} />
                <CustomInput label="Reference Number" value={form.referenceNumber} onChangeText={value => updateField('referenceNumber', value)} />
                <CustomInput label="Remarks" value={form.remarks} multiline onChangeText={value => updateField('remarks', value)} />
                <SectionHeader title="Payment History" />
                {(profile.payments || []).map(payment => (
                  <DashboardCard
                    key={payment.id}
                    title={payment.receiptNumber || 'Receipt'}
                    value={formatCurrency(payment.amount)}
                    description={`${formatDateForDisplay(payment.paymentDate) || '-'} | ${payment.paymentMode || '-'} | ${payment.status || 'RECORDED'}`}
                    icon="receipt-text-outline"
                    onPress={() => startEditPayment(payment)}
                  />
                ))}
                {editingPayment ? <CustomButton mode="text" onPress={() => setEditingPayment(null)}>Cancel Edit</CustomButton> : null}
                {feeService.canReversePayments(access.role) && editingPayment ? (
                  <CustomButton mode="outlined" loading={reverseMutation.isPending} onPress={() => reverseMutation.mutate(editingPayment)}>
                    Reverse Payment
                  </CustomButton>
                ) : null}
              </>
            ) : null}
          </>
        }
        renderItem={({item}) => (
          <DashboardCard
            title={item.fullName}
            value={item.studentId}
            description={`${item.academicClass?.name || '-'}-${item.section?.name || '-'}`}
            icon="account-school-outline"
            onPress={() => setSelectedStudentId(item.id)}
          />
        )}
        ListEmptyComponent={!selectedStudentId ? <EmptyState title="Search student" message="Enter at least two characters." /> : null}
        ListFooterComponent={
          <View style={styles.footer}>
            <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
            {profile ? (
              <CustomButton loading={mutation.isPending} disabled={mutation.isPending || !form.amount || !profile.feePlanId} onPress={() => mutation.mutate()}>
                {editingPayment ? 'Update Same Day Payment' : 'Record Payment'}
              </CustomButton>
            ) : null}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxxl},
  footer: {marginTop: spacing.md},
});

export default FeeCollectionScreen;
