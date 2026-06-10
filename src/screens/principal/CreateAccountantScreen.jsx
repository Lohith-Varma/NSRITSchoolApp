import React, {useState} from 'react';
import {HelperText} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {CustomButton, CustomInput, ScreenContainer, SectionHeader, SelectField} from '../../components';
import accountantService from '../../services/accountants/accountantService';
import {getAccessScope} from '../../services/rbacScope';

const genderOptions = ['Female', 'Male', 'Other'].map(value => ({label: value, value}));

const CreateAccountantScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    designation: 'Accountant',
    email: '',
    qualification: '',
    experience: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: '',
    bloodGroup: '',
    countryCode: '+91',
  });
  const [error, setError] = useState('');
  const updateField = (field, value) => setForm(current => ({...current, [field]: value}));
  const mutation = useMutation({
    mutationFn: () => accountantService.createAccountant(form, scope),
    onSuccess: accountant => {
      queryClient.invalidateQueries({queryKey: ['accountants', user?.branchId]});
      navigation.replace('AccountantProfile', {accountantId: accountant.id});
    },
    onError: err => setError(err.message),
  });

  return (
    <ScreenContainer>
      <SectionHeader title="Create Accountant" subtitle="Employee ID is generated automatically" />
      <CustomInput label="Full Name" value={form.fullName} onChangeText={value => updateField('fullName', value)} />
      <CustomInput label="Mobile Number" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={value => updateField('phoneNumber', value)} />
      <SelectField label="Gender" value={form.gender} options={genderOptions} onChange={value => updateField('gender', value)} />
      <CustomInput label="Joining Date (YYYY-MM-DD)" value={form.joiningDate} onChangeText={value => updateField('joiningDate', value)} />
      <CustomInput label="Designation" value={form.designation} onChangeText={value => updateField('designation', value)} />
      <CustomInput label="Email" value={form.email} onChangeText={value => updateField('email', value)} />
      <CustomInput label="Qualification" value={form.qualification} onChangeText={value => updateField('qualification', value)} />
      <CustomInput label="Experience" value={form.experience} onChangeText={value => updateField('experience', value)} />
      <CustomInput label="Address" value={form.address} multiline onChangeText={value => updateField('address', value)} />
      <CustomInput label="City" value={form.city} onChangeText={value => updateField('city', value)} />
      <CustomInput label="State" value={form.state} onChangeText={value => updateField('state', value)} />
      <CustomInput label="Pincode" keyboardType="number-pad" value={form.pincode} onChangeText={value => updateField('pincode', value)} />
      <CustomInput label="Emergency Contact" keyboardType="phone-pad" value={form.emergencyContact} onChangeText={value => updateField('emergencyContact', value)} />
      <CustomInput label="Blood Group" value={form.bloodGroup} onChangeText={value => updateField('bloodGroup', value)} />
      <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
      <CustomButton loading={mutation.isPending} disabled={mutation.isPending} onPress={() => mutation.mutate()}>
        Create Accountant
      </CustomButton>
    </ScreenContainer>
  );
};

export default CreateAccountantScreen;
