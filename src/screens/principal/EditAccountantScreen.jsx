import React, {useEffect, useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {CustomButton, CustomInput, DatePickerField, ScreenContainer, SectionHeader, SelectField} from '../../components';
import accountantService from '../../services/accountants/accountantService';
import {getAccessScope} from '../../services/rbacScope';
import {toISODate} from '../../utils/helpers/dateHelpers';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const EditAccountantScreen = ({navigation, route}) => {
  const accountantId = route.params?.accountantId;
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const {data: accountant} = useQuery({
    queryKey: ['accountantProfile', accountantId],
    queryFn: () => accountantService.getAccountantProfile(accountantId),
    enabled: Boolean(accountantId),
  });

  useEffect(() => {
    if (accountant) {
      setForm({
        ...accountant,
        accountantId: accountant.id,
        userId: accountant.userId,
        fullName: accountant.fullName || accountant.user?.fullName || '',
        phoneNumber: accountant.phoneNumber || accountant.user?.phoneNumber || '',
        countryCode: accountant.countryCode || '+91',
      });
    }
  }, [accountant]);

  const mutation = useMutation({
    mutationFn: () => accountantService.updateAccountant(form, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['accountants', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['accountantProfile', accountantId]});
      navigation.goBack();
    },
    onError: err => setError(err.message),
  });

  if (!form) {
    return <ScreenContainer><SectionHeader title="Loading Accountant" /></ScreenContainer>;
  }
  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));

  return (
    <ScreenContainer>
      <SectionHeader title="Edit Accountant" subtitle={form.employeeId} />
      <CustomInput label="Full Name" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <CustomInput label="Mobile Number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={value => updateField('phoneNumber', value)} />
      <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <DatePickerField label="Joining Date" value={form.joiningDate} maximumDate={toISODate(new Date())} onChange={value => updateField('joiningDate', value)} />
      <CustomInput label="Designation" value={form.designation} onChangeText={value => updateField('designation', value)} />
      <CustomInput label="Email" value={form.email || ''} onChangeText={value => updateField('email', value)} />
      <SelectField
        label="Status"
        value={form.isActive ? 'ACTIVE' : 'DISABLED'}
        options={[{label: 'Active', value: 'ACTIVE'}, {label: 'Disabled', value: 'DISABLED'}]}
        onChange={value => updateField('isActive', value === 'ACTIVE')}
      />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate()}>
        Save Accountant
      </CustomButton>
    </ScreenContainer>
  );
};

export default EditAccountantScreen;
