import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CustomButton, CustomInput, DashboardCard, EmptyState, Header, SearchBar, SectionHeader, SelectField} from '../../components';
import feeService from '../../services/fees/feeService';
import studentService from '../../services/students/studentService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, spacing} from '../../theme';
import {formatCurrency} from '../../utils/formatters/currency';

const CreateFeePlanScreen = ({navigation, route}) => {
  const access = useFeeAccess();
  const queryClient = useQueryClient();
  const routeStudentId = route.params?.studentId;
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [feeFields, setFeeFields] = useState({
    term1Fee: '',
    term2Fee: '',
    term3Fee: '',
    booksFee: '',
    transportFee: '',
    concessionType: '',
    concessionValue: '',
  });
  const [itemDraft, setItemDraft] = useState({categoryId: '', amount: ''});
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const categoriesQuery = useQuery({
    queryKey: ['feeCategories', access.role],
    queryFn: () => feeService.ensureDefaultFeeCategories(access),
  });
  const profileQuery = useQuery({
    queryKey: ['studentFeeProfile', routeStudentId, access.role, access.wing],
    queryFn: () => feeService.getStudentFeeProfile(routeStudentId, access),
    enabled: Boolean(routeStudentId),
  });
  const studentsQuery = useQuery({
    queryKey: ['feePlanStudentSearch', access.branchId, searchText],
    queryFn: () => studentService.searchStudents({branchId: access.branchId, searchText, limit: 20}, access),
    enabled: Boolean(access.branchId && searchText.trim().length >= 2 && !selectedStudent),
  });

  const categoryOptions = (categoriesQuery.data || [])
    .filter(item => String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE')
    .map(item => ({label: item.name, value: item.id, item}));
  const concessionOptions = [
    {label: 'No Concession', value: ''},
    {label: 'Amount', value: 'AMOUNT'},
    {label: 'Percentage', value: 'PERCENTAGE'},
  ];
  const total = useMemo(() => {
    const standardTotal =
      Number(feeFields.term1Fee || 0) +
      Number(feeFields.term2Fee || 0) +
      Number(feeFields.term3Fee || 0) +
      Number(feeFields.booksFee || 0) +
      Number(feeFields.transportFee || 0);
    const extraTotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const concessionValue = Number(feeFields.concessionValue || 0);
    const concession =
      feeFields.concessionType === 'PERCENTAGE'
        ? (standardTotal * concessionValue) / 100
        : feeFields.concessionType === 'AMOUNT'
          ? concessionValue
          : 0;
    return Math.max(standardTotal + extraTotal - concession, 0);
  }, [feeFields, items]);

  useEffect(() => {
    if (!profileQuery.data || selectedStudent) {
      return;
    }

    const profile = profileQuery.data;
    setSelectedStudent({
      id: profile.studentId,
      fullName: profile.studentName,
      studentId: profile.admissionNumber,
      academicClass: {name: profile.className},
      section: {name: profile.sectionName},
    });
    setAcademicYear(String(profile.academicYear || new Date().getFullYear()));
    setItems(
      (profile.categories || []).map(item => ({
        categoryId: item.category?.id,
        categoryName: item.category?.name || 'Fee',
        amount: Number(item.amount || 0),
      })),
    );
    setFeeFields({
      term1Fee: String(profile.term1Fee || ''),
      term2Fee: String(profile.term2Fee || ''),
      term3Fee: String(profile.term3Fee || ''),
      booksFee: String(profile.booksFee || ''),
      transportFee: String(profile.transportFee || ''),
      concessionType: profile.concessionType || '',
      concessionValue: String(profile.concessionValue || ''),
    });
  }, [profileQuery.data, selectedStudent]);

  const addItem = () => {
    const category = categoryOptions.find(option => option.value === itemDraft.categoryId);
    if (!category || Number(itemDraft.amount) <= 0) {
      setError('Select a category and enter a valid amount.');
      return;
    }
    setItems(current => [
      ...current.filter(item => item.categoryId !== itemDraft.categoryId),
      {categoryId: itemDraft.categoryId, categoryName: category.label, amount: Number(itemDraft.amount)},
    ]);
    setItemDraft({categoryId: '', amount: ''});
    setError('');
  };

  const mutation = useMutation({
    mutationFn: () =>
      feeService.saveFeePlan(
        {
          studentId: selectedStudent?.id,
          academicYear: Number(academicYear),
          items,
          term1Fee: Number(feeFields.term1Fee || 0),
          term2Fee: Number(feeFields.term2Fee || 0),
          term3Fee: Number(feeFields.term3Fee || 0),
          booksFee: Number(feeFields.booksFee || 0),
          transportFee: Number(feeFields.transportFee || 0),
          concessionType: feeFields.concessionType || null,
          concessionValue: Number(feeFields.concessionValue || 0),
        },
        access,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['feeRecords']});
      queryClient.invalidateQueries({queryKey: ['studentFeeProfile', selectedStudent?.id]});
      queryClient.invalidateQueries({queryKey: ['feeReports']});
      queryClient.invalidateQueries({queryKey: ['coordinatorFeeDashboard']});
      queryClient.invalidateQueries({queryKey: ['principalFeeSummary']});
      queryClient.invalidateQueries({queryKey: ['accountantFeeDashboard']});
      queryClient.invalidateQueries({queryKey: ['parentChildren']});
      queryClient.invalidateQueries({queryKey: ['parentDashboard']});
      queryClient.invalidateQueries({queryKey: ['studentDetails', selectedStudent?.id]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });
  const updateFeeField = (field, value) => setFeeFields(current => ({...current, [field]: value}));

  if (!canManagePlans) {
    return (
      <View style={styles.container}>
        <EmptyState title="Fee plan access denied" message="Only coordinators, principals, branch admins, and main admins can create or edit fee plans." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.categoryId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Header title={routeStudentId ? 'Edit Fee Plan' : 'Create Fee Plan'} subtitle="Assign category-wise fees to a student" />
            {!selectedStudent ? <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search student" /> : null}
            {selectedStudent ? (
              <DashboardCard
                title={selectedStudent.fullName}
                value={selectedStudent.studentId}
                description={`${selectedStudent.academicClass?.name || '-'}-${selectedStudent.section?.name || '-'}`}
                icon="account-school-outline"
              />
            ) : (
              (studentsQuery.data || []).map(student => (
                <DashboardCard
                  key={student.id}
                  title={student.fullName}
                  value={student.studentId}
                  description={`${student.academicClass?.name || '-'}-${student.section?.name || '-'}`}
                  icon="account-school-outline"
                  onPress={() => setSelectedStudent(student)}
                />
              ))
            )}
            <CustomInput label="Academic Year" keyboardType="number-pad" value={academicYear} onChangeText={setAcademicYear} />
            <SectionHeader title="Tuition Structure" />
            <CustomInput label="1st Term Fee" keyboardType="numeric" value={feeFields.term1Fee} onChangeText={value => updateFeeField('term1Fee', value)} />
            <CustomInput label="2nd Term Fee" keyboardType="numeric" value={feeFields.term2Fee} onChangeText={value => updateFeeField('term2Fee', value)} />
            <CustomInput label="3rd Term Fee" keyboardType="numeric" value={feeFields.term3Fee} onChangeText={value => updateFeeField('term3Fee', value)} />
            <SectionHeader title="Student Custom Fees" />
            <CustomInput label="Books Fee" keyboardType="numeric" value={feeFields.booksFee} onChangeText={value => updateFeeField('booksFee', value)} />
            <CustomInput label="Transport Fee" keyboardType="numeric" value={feeFields.transportFee} onChangeText={value => updateFeeField('transportFee', value)} />
            <SelectField label="Concession Type" value={feeFields.concessionType} options={concessionOptions} onChange={value => updateFeeField('concessionType', value)} />
            <CustomInput label="Concession Value" keyboardType="numeric" value={feeFields.concessionValue} onChangeText={value => updateFeeField('concessionValue', value)} />
            <SectionHeader title="Additional Fee Categories" />
            <SelectField
              label="Fee Category"
              value={itemDraft.categoryId}
              options={categoryOptions}
              onChange={value => setItemDraft(current => ({...current, categoryId: value}))}
            />
            <CustomInput label="Amount" keyboardType="numeric" value={itemDraft.amount} onChangeText={value => setItemDraft(current => ({...current, amount: value}))} />
            <CustomButton mode="outlined" onPress={addItem}>Add Fee Item</CustomButton>
            <DashboardCard title="Final Payable" value={formatCurrency(total)} icon="cash-multiple" />
          </>
        }
        renderItem={({item}) => (
          <DashboardCard
            title={item.categoryName}
            value={formatCurrency(item.amount)}
            icon="tag-outline"
            onPress={() => setItems(current => current.filter(row => row.categoryId !== item.categoryId))}
          />
        )}
        ListEmptyComponent={<EmptyState title="No fee items" message="Add fee categories and amounts." />}
        ListFooterComponent={
          <View style={styles.footer}>
            <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
            <CustomButton loading={mutation.isPending} disabled={mutation.isPending || !selectedStudent} onPress={() => mutation.mutate()}>
              Save Fee Plan
            </CustomButton>
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

export default CreateFeePlanScreen;
