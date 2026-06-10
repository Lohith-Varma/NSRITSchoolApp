import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CustomButton, CustomInput, DashboardCard, EmptyState, Header, SearchBar, SelectField} from '../../components';
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
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.amount || 0), 0), [items]);

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
        {studentId: selectedStudent?.id, academicYear: Number(academicYear), items},
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

  if (!canManagePlans) {
    return (
      <View style={styles.container}>
        <EmptyState title="Fee plan access denied" message="Only coordinators and principals can create or edit fee plans." />
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
            <SelectField
              label="Fee Category"
              value={itemDraft.categoryId}
              options={categoryOptions}
              onChange={value => setItemDraft(current => ({...current, categoryId: value}))}
            />
            <CustomInput label="Amount" keyboardType="numeric" value={itemDraft.amount} onChangeText={value => setItemDraft(current => ({...current, amount: value}))} />
            <CustomButton mode="outlined" onPress={addItem}>Add Fee Item</CustomButton>
            <DashboardCard title="Total" value={formatCurrency(total)} icon="cash-multiple" />
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
            <CustomButton loading={mutation.isPending} disabled={mutation.isPending || !selectedStudent || !items.length} onPress={() => mutation.mutate()}>
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
