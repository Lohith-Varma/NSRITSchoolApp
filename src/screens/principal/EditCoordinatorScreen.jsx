import React, {useState} from 'react';
import {HelperText, Switch, Text} from 'react-native-paper';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {StyleSheet, View} from 'react-native';
import {CustomButton, CustomInput, ScreenContainer, SectionHeader, SelectField} from '../../components';
import {WINGS, WING_LABELS} from '../../config/academic';
import coordinatorService from '../../services/coordinators/coordinatorService';
import {getAccessScope} from '../../services/rbacScope';
import {spacing} from '../../theme';

const wingOptions = Object.values(WINGS).map(value => ({label: WING_LABELS[value], value}));
const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const EditCoordinatorScreen = ({navigation, route}) => {
  const coordinator = route.params?.coordinator;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    coordinatorId: coordinator?.id,
    userId: coordinator?.userId,
    branchId: coordinator?.branchId,
    fullName: coordinator?.user?.fullName || '',
    phoneNumber: coordinator?.user?.phoneNumber || '',
    email: coordinator?.email || '',
    gender: coordinator?.gender || '',
    employeeId: coordinator?.employeeId || '',
    wing: coordinator?.wing || WINGS.PRE_PRIMARY,
    isActive: coordinator?.isActive ?? true,
  });

  const mutation = useMutation({
    mutationFn: payload => coordinatorService.updateCoordinator(payload, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['coordinators', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['coordinator', coordinator?.id]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  return (
    <ScreenContainer>
      <SectionHeader title="Edit Coordinator" subtitle="Update profile, wing, and active state" />
      <CustomInput label="Full Name" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <CustomInput label="Mobile Number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={value => updateField('phoneNumber', value)} />
      <CustomInput label="Email" keyboardType="email-address" value={form.email} onChangeText={value => updateField('email', value)} />
      <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <CustomInput label="Employee ID" value={form.employeeId} onChangeText={value => updateField('employeeId', value)} />
      <SelectField label="Wing Assignment" value={form.wing} options={wingOptions} onChange={value => updateField('wing', value)} />
      <View style={styles.row}>
        <Text>Active Coordinator</Text>
        <Switch value={form.isActive} onValueChange={value => updateField('isActive', value)} />
      </View>
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate(form)}>
        Save Coordinator
      </CustomButton>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});

export default EditCoordinatorScreen;
