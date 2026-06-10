import React, {useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, CustomInput, ScreenContainer, SectionHeader, SelectField} from '../../components';
import {WINGS, WING_LABELS} from '../../config/academic';
import coordinatorService from '../../services/coordinators/coordinatorService';
import {getAccessScope} from '../../services/rbacScope';

const wingOptions = Object.values(WINGS).map(value => ({label: WING_LABELS[value], value}));
const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const CreateCoordinatorScreen = ({navigation}) => {
  const queryClient = useQueryClient();
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    gender: '',
    wing: WINGS.PRE_PRIMARY,
    countryCode: '+91',
  });

  const mutation = useMutation({
    mutationFn: payload => coordinatorService.createCoordinator(payload, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['coordinators', user?.branchId]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  return (
    <ScreenContainer>
      <SectionHeader title="Create Coordinator" subtitle="Coordinator inherits your branch automatically" />
      <CustomInput label="Full Name" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <CustomInput label="Mobile Number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={value => updateField('phoneNumber', value)} />
      <CustomInput label="Email" keyboardType="email-address" value={form.email} onChangeText={value => updateField('email', value)} />
      <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <SelectField label="Wing Assignment" value={form.wing} options={wingOptions} onChange={value => updateField('wing', value)} />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate(form)}>
        Create Coordinator
      </CustomButton>
    </ScreenContainer>
  );
};

export default CreateCoordinatorScreen;
