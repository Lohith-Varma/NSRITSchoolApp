import React, {useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {HelperText, Switch, Text} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CustomButton, CustomInput, DashboardCard, EmptyState, Header, SelectField, SectionHeader} from '../../components';
import useFeeAccess from '../../hooks/useFeeAccess';
import academicRepository from '../../repositories/academicRepository';
import feeService from '../../services/fees/feeService';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const currentYear = () => new Date().getFullYear();
const academicYearOptions = () => {
  const year = currentYear();
  return [year - 1, year, year + 1].map(value => ({label: `${value}-${String(value + 1).slice(-2)}`, value: String(value)}));
};

const statusOptions = [
  {label: 'Active', value: 'ACTIVE'},
  {label: 'Inactive', value: 'INACTIVE'},
];

const applyOptions = [
  {label: 'Existing Students', value: 'EXISTING'},
  {label: 'Future Students', value: 'FUTURE'},
  {label: 'Both', value: 'BOTH'},
];

const emptyForm = {
  id: '',
  academicClassId: '',
  academicYear: String(currentYear()),
  term1Fee: '',
  term2Fee: '',
  term3Fee: '',
  applyToFuture: true,
  status: 'ACTIVE',
};

const ClassFeeManagementScreen = () => {
  const access = useFeeAccess();
  const queryClient = useQueryClient();
  const canManage = feeService.canManageFeePlans(access.role);
  const [form, setForm] = useState(emptyForm);
  const [applyTo, setApplyTo] = useState('BOTH');
  const [error, setError] = useState('');

  const classesQuery = useQuery({
    queryKey: ['activeAcademicClasses', access.branchId],
    queryFn: () => academicRepository.getActiveAcademicClasses({limit: 300}),
    enabled: Boolean(canManage),
  });
  const classFeesQuery = useQuery({
    queryKey: ['classFees', access.branchId, form.academicYear],
    queryFn: () => feeService.getClassFees(access, {academicYear: Number(form.academicYear)}),
    enabled: Boolean(canManage && access.branchId),
  });

  const classes = useMemo(
    () => (classesQuery.data || []).filter(item => !access.branchId || item.branchId === access.branchId),
    [access.branchId, classesQuery.data],
  );
  const classOptions = classes.map(item => ({label: `${item.name} (${item.wing?.code || '-'})`, value: item.id, item}));
  const total = Number(form.term1Fee || 0) + Number(form.term2Fee || 0) + Number(form.term3Fee || 0);

  const resetForm = () => {
    setForm(emptyForm);
    setApplyTo('BOTH');
    setError('');
  };
  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  const mutation = useMutation({
    mutationFn: async () => {
      const saved = await feeService.saveClassFee(
        {
          ...form,
          branchId: access.branchId,
          term1Fee: Number(form.term1Fee || 0),
          term2Fee: Number(form.term2Fee || 0),
          term3Fee: Number(form.term3Fee || 0),
          applyToFuture: ['FUTURE', 'BOTH'].includes(applyTo),
        },
        access,
      );
      const classFee = {
        ...saved,
        id: saved.id || form.id,
        branchId: access.branchId,
        academicClassId: form.academicClassId,
        academicYear: Number(form.academicYear),
        term1Fee: Number(form.term1Fee || 0),
        term2Fee: Number(form.term2Fee || 0),
        term3Fee: Number(form.term3Fee || 0),
      };
      if (['EXISTING', 'BOTH'].includes(applyTo)) {
        await feeService.applyClassFee(classFee, access, applyTo);
      }
      return classFee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['classFees']});
      queryClient.invalidateQueries({queryKey: ['feeRecords']});
      queryClient.invalidateQueries({queryKey: ['feeReports']});
      queryClient.invalidateQueries({queryKey: ['parentChildren']});
      queryClient.invalidateQueries({queryKey: ['parentDashboard']});
      resetForm();
    },
    onError: err => setError(err.message),
  });

  const editTemplate = item => {
    setForm({
      id: item.id,
      academicClassId: item.academicClassId,
      academicYear: String(item.academicYear),
      term1Fee: String(item.term1Fee || ''),
      term2Fee: String(item.term2Fee || ''),
      term3Fee: String(item.term3Fee || ''),
      applyToFuture: item.applyToFuture !== false,
      status: item.status || 'ACTIVE',
    });
    setApplyTo(item.applyToFuture ? 'BOTH' : 'EXISTING');
  };

  const confirmSave = () => {
    if (!form.academicClassId || !form.academicYear || total <= 0) {
      setError('Select class, academic year, and enter at least one term fee.');
      return;
    }
    Alert.alert('Apply Class Fee', 'Apply this class fee to existing students, future students, or both?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Save', onPress: () => mutation.mutate()},
    ]);
  };

  if (!canManage) {
    return (
      <View style={styles.container}>
        <EmptyState title="Class fee access denied" message="Only coordinators, principals, branch admins, and main admins can manage class fees." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={classFeesQuery.data || []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Header title="Class Fee Management" subtitle="Academic year tuition templates by class" />
            <SelectField label="Academic Year" value={form.academicYear} options={academicYearOptions()} onChange={value => updateField('academicYear', value)} />
            <SelectField label="Class" value={form.academicClassId} options={classOptions} onChange={value => updateField('academicClassId', value)} />
            <CustomInput label="1st Term Fee" keyboardType="numeric" value={form.term1Fee} onChangeText={value => updateField('term1Fee', value)} />
            <CustomInput label="2nd Term Fee" keyboardType="numeric" value={form.term2Fee} onChangeText={value => updateField('term2Fee', value)} />
            <CustomInput label="3rd Term Fee" keyboardType="numeric" value={form.term3Fee} onChangeText={value => updateField('term3Fee', value)} />
            <DashboardCard title="Total Tuition" value={formatCurrency(total)} icon="cash-multiple" />
            <SelectField label="Apply To" value={applyTo} options={applyOptions} onChange={setApplyTo} />
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.switchTitle}>Future Students</Text>
                <Text style={styles.switchMeta}>New students inherit this class fee automatically.</Text>
              </View>
              <Switch value={form.applyToFuture} onValueChange={value => updateField('applyToFuture', value)} />
            </View>
            <SelectField label="Status" value={form.status} options={statusOptions} onChange={value => updateField('status', value)} />
            <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
            <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={confirmSave}>
              {form.id ? 'Update Class Fee' : 'Create Class Fee'}
            </CustomButton>
            {form.id ? <CustomButton mode="text" onPress={resetForm}>Cancel Edit</CustomButton> : null}
            <SectionHeader title="Existing Class Fees" />
          </>
        }
        renderItem={({item}) => (
          <DashboardCard
            title={`${item.academicClass?.name || 'Class'} - ${item.academicYear}-${String(Number(item.academicYear || 0) + 1).slice(-2)}`}
            value={formatCurrency(item.totalTuitionFee)}
            description={`Term 1 ${formatCurrency(item.term1Fee)} | Term 2 ${formatCurrency(item.term2Fee)} | Term 3 ${formatCurrency(item.term3Fee)}`}
            icon="google-classroom"
            onPress={() => editTemplate(item)}
          />
        )}
        ListEmptyComponent={<EmptyState title={classFeesQuery.isLoading ? 'Loading class fees' : 'No class fees'} message={classFeesQuery.error?.message || 'Create class fee templates for the academic year.'} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.background, flex: 1},
  list: {padding: spacing.lg, paddingBottom: spacing.xxxl},
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  switchCopy: {flex: 1, marginRight: spacing.md},
  switchTitle: {color: colors.text, fontWeight: '700'},
  switchMeta: {color: colors.textMuted, marginTop: spacing.xxs},
});

export default ClassFeeManagementScreen;
