import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, CustomInput, DashboardCard, EmptyState, Header, SelectField} from '../../components';
import subjectService from '../../services/subjects/subjectService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing} from '../../theme';

const statusOptions = ['ACTIVE', 'INACTIVE'].map(value => ({label: value, value}));

const SubjectManagementScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({id: null, name: '', code: '', status: 'ACTIVE'});
  const [error, setError] = useState('');

  const {data = [], isLoading} = useQuery({
    queryKey: ['subjects', 0],
    queryFn: () => subjectService.getSubjects({limit: 100, offset: 0}),
  });

  const subjects = useMemo(() => data, [data]);

  const mutation = useMutation({
    mutationFn: payload =>
      payload.id
        ? subjectService.updateSubject({...payload, subjectId: payload.id}, scope)
        : subjectService.createSubject(payload, scope),
    onSuccess: () => {
      setForm({id: null, name: '', code: '', status: 'ACTIVE'});
      setError('');
      queryClient.invalidateQueries({queryKey: ['subjects']});
    },
    onError: err => setError(err.message),
  });

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header title="Subjects" subtitle="Reusable master subjects" />
        <CustomInput label="Subject Name" value={form.name} onChangeText={value => updateField('name', value)} />
        <CustomInput label="Subject Code" value={form.code} onChangeText={value => updateField('code', value)} />
        <SelectField label="Status" value={form.status} options={statusOptions} onChange={value => updateField('status', value)} />
        <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
        <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate(form)}>
          {form.id ? 'Update Subject' : 'Create Subject'}
        </CustomButton>
      </View>
      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title={isLoading ? 'Loading subjects' : 'No subjects'} message="Create reusable master subjects for assignments." />}
        renderItem={({item}) => (
          <DashboardCard
            title={item.name}
            value={item.code}
            description={item.status}
            icon="book-open-page-variant-outline"
            onPress={() => setForm(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: 0,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
});

export default SubjectManagementScreen;
