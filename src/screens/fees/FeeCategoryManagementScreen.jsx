import React, {useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CustomButton, CustomInput, DashboardCard, EmptyState, Header, SelectField} from '../../components';
import feeService from '../../services/fees/feeService';
import useFeeAccess from '../../hooks/useFeeAccess';
import {colors, spacing} from '../../theme';

const FeeCategoryManagementScreen = () => {
  const access = useFeeAccess();
  const queryClient = useQueryClient();
  const canManagePlans = feeService.canManageFeePlans(access.role);
  const [form, setForm] = useState({name: '', status: 'ACTIVE'});
  const [error, setError] = useState('');
  const {data: categories = [], isLoading} = useQuery({
    queryKey: ['feeCategories', access.role],
    queryFn: () =>
      canManagePlans ? feeService.ensureDefaultFeeCategories(access) : feeService.getFeeCategories(),
  });
  const mutation = useMutation({
    mutationFn: () => feeService.saveFeeCategory(form, access),
    onSuccess: () => {
      setForm({name: '', status: 'ACTIVE'});
      queryClient.invalidateQueries({queryKey: ['feeCategories']});
    },
    onError: err => setError(err.message),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Fee Categories" subtitle="Reusable master categories" />
        {canManagePlans ? (
          <>
            <CustomInput label="Category Name" value={form.name} onChangeText={value => setForm(current => ({...current, name: value}))} />
            <SelectField
              label="Status"
              value={form.status}
              options={[{label: 'Active', value: 'ACTIVE'}, {label: 'Inactive', value: 'INACTIVE'}]}
              onChange={value => setForm(current => ({...current, status: value}))}
            />
            <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
            <CustomButton loading={mutation.isPending} disabled={!form.name || mutation.isPending} onPress={() => mutation.mutate()}>
              {form.id ? 'Update Category' : 'Create Category'}
            </CustomButton>
          </>
        ) : null}
      </View>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <DashboardCard
            title={item.name}
            value={item.status}
            icon="tag-outline"
            onPress={canManagePlans ? () => setForm({id: item.id, name: item.name, status: item.status}) : undefined}
          />
        )}
        ListEmptyComponent={<EmptyState title={isLoading ? 'Loading categories' : 'No categories'} message="Create fee categories to reuse in fee plans." />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: colors.background, flex: 1},
  header: {padding: spacing.lg, paddingBottom: 0},
  list: {padding: spacing.lg, paddingTop: spacing.sm},
});

export default FeeCategoryManagementScreen;
